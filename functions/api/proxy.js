export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('u');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing "u" query parameter' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  try {
    const decodedUrl = decodeURIComponent(targetUrl);

    const originResponse = await fetch(decodedUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.fancode.com',
        'Referer': 'https://www.fancode.com/',
      },
      redirect: 'follow',
    });

    const contentType = originResponse.headers.get('Content-Type') || 'application/octet-stream';
    let body = await originResponse.arrayBuffer();

    // Rewrite HLS manifests so all segment URLs also go through proxy
    if (decodedUrl.includes('.m3u8') || contentType.includes('mpegurl') || contentType.includes('m3u8')) {
      const text = new TextDecoder().decode(body);
      const baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf('/') + 1);
      const proxyBase = url.origin + url.pathname;

      const rewritten = text.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          // Rewrite URI= attributes inside tags (encryption key URLs, etc.)
          if (trimmed.includes('URI="')) {
            return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
              const absoluteUri = uri.startsWith('http') ? uri : baseUrl + uri;
              return `URI="${proxyBase}?u=${encodeURIComponent(absoluteUri)}"`;
            });
          }
          return line;
        }
        if (trimmed.startsWith('http')) {
          return `${proxyBase}?u=${encodeURIComponent(trimmed)}`;
        }
        const absoluteUrl = baseUrl + trimmed;
        return `${proxyBase}?u=${encodeURIComponent(absoluteUrl)}`;
      }).join('\n');

      body = new TextEncoder().encode(rewritten);
    }

    const responseHeaders = {
      ...corsHeaders(),
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    };

    if (!decodedUrl.includes('.m3u8') && !contentType.includes('mpegurl')) {
      responseHeaders['Content-Length'] = body.byteLength.toString();
    }

    return new Response(body, { status: originResponse.status, headers: responseHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy fetch failed', details: err.message }), {
      status: 502,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*',
    'Access-Control-Max-Age': '86400',
  };
}
