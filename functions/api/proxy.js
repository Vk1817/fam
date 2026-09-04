const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
  'Access-Control-Allow-Headers': 'Range,Origin,Accept,Content-Type',
  'Access-Control-Expose-Headers': 'Content-Length,Content-Range,Accept-Ranges,Content-Type',
};

function proxyUrl(url) {
  return `/api/proxy?u=${encodeURIComponent(url)}`;
}

function rewritePlaylist(text, baseUrl) {
  const lines = text.split(/\r?\n/);
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#EXTM3U') || trimmed.startsWith('#EXT-X-')) {
      if (trimmed.startsWith('#EXT-X-KEY:') || trimmed.startsWith('#EXT-X-MAP:') || trimmed.startsWith('#EXT-X-MEDIA:')) {
        return line.replace(/URI="([^"]+)"/g, (_, uri) => {
          try { return `URI="${proxyUrl(new URL(uri, baseUrl).href)}"`; } catch { return `URI="${uri}"`; }
        });
      }
      return line;
    }
    try {
      return proxyUrl(new URL(trimmed, baseUrl).href);
    } catch {
      return line;
    }
  }).join('\n');
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const requestUrl = new URL(context.request.url);
  const target = requestUrl.searchParams.get('u');
  if (!target) return new Response('Missing stream URL', { status: 400, headers: CORS });

  let upstream;
  try { upstream = new URL(target); } catch {
    return new Response('Invalid stream URL', { status: 400, headers: CORS });
  }

  if (!['http:', 'https:'].includes(upstream.protocol)) {
    return new Response('Unsupported protocol', { status: 400, headers: CORS });
  }

  const headers = new Headers();
  const range = context.request.headers.get('Range');
  if (range) headers.set('Range', range);
  headers.set('User-Agent', context.request.headers.get('User-Agent') || 'Mozilla/5.0');
  headers.set('Accept', '*/*');

  try {
    const response = await fetch(upstream.href, {
      method: context.request.method === 'HEAD' ? 'HEAD' : 'GET',
      headers,
      redirect: 'follow',
    });

    const outHeaders = new Headers(CORS);
    for (const name of ['content-type','content-length','content-range','accept-ranges','cache-control','etag','last-modified']) {
      const value = response.headers.get(name);
      if (value) outHeaders.set(name, value);
    }

    const type = response.headers.get('content-type') || '';
    const isPlaylist = upstream.pathname.toLowerCase().endsWith('.m3u8') || type.includes('mpegurl') || type.includes('vnd.apple.mpegurl');

    if (isPlaylist && response.ok && context.request.method !== 'HEAD') {
      const text = await response.text();
      outHeaders.set('content-type', 'application/vnd.apple.mpegurl');
      outHeaders.delete('content-length');
      return new Response(rewritePlaylist(text, upstream.href), { status: response.status, headers: outHeaders });
    }

    return new Response(context.request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      headers: outHeaders,
    });
  } catch (error) {
    return new Response(`Upstream request failed: ${error.message}`, { status: 502, headers: CORS });
  }
}
