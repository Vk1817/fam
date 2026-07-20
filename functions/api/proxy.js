// functions/api/proxy.js
// Cloudflare Pages Function — CORS + HLS-manifest-rewriting proxy for FanCode streams.
//
// Why this exists:
// FanCode's .m3u8 manifests (master + variant playlists) reference segment (.ts / .m4s)
// and key URLs that ALSO need to be fetched through this proxy (for CORS + Referer/UA
// spoofing). A proxy that only forwards the master playlist as-is will "load" in Shaka
// Player but never actually play, because the browser then tries to fetch segments
// directly from fancode.com / dai.google.com and gets blocked. This proxy rewrites
// every URI inside the manifest so ALL downstream requests also route back through here.

const UPSTREAM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://fancode.com/",
  "Origin": "https://fancode.com",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

function isManifest(url, contentType) {
  if (contentType && contentType.toLowerCase().includes("mpegurl")) return true;
  return /\.m3u8(\?|$)/i.test(url);
}

// Resolve a URI found inside a manifest against the manifest's own URL,
// then wrap it so it comes back through this same proxy.
function proxifyUri(uri, baseUrl, proxyOrigin) {
  if (!uri) return uri;
  // Already absolute or relative — resolve against the manifest's real URL.
  const absolute = new URL(uri, baseUrl).toString();
  return `${proxyOrigin}/api/proxy?u=${encodeURIComponent(absolute)}`;
}

function rewriteManifest(text, baseUrl, proxyOrigin) {
  const lines = text.split(/\r?\n/);
  const out = lines.map((line) => {
    const trimmed = line.trim();

    // Rewrite key/map URIs, e.g. #EXT-X-KEY:METHOD=AES-128,URI="...."
    if (trimmed.startsWith("#EXT-X-KEY") || trimmed.startsWith("#EXT-X-MAP")) {
      return line.replace(/URI="([^"]+)"/, (_, uri) => {
        return `URI="${proxifyUri(uri, baseUrl, proxyOrigin)}"`;
      });
    }

    // Skip other comment/tag lines untouched.
    if (trimmed.startsWith("#") || trimmed === "") {
      return line;
    }

    // A bare line that isn't a comment is a segment or a variant-playlist URI.
    return proxifyUri(trimmed, baseUrl, proxyOrigin);
  });
  return out.join("\n");
}

export async function onRequest(context) {
  const { request } = context;
  const reqUrl = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const target = reqUrl.searchParams.get("u");
  if (!target) {
    return new Response("Missing ?u= target URL", {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch (e) {
    return new Response("Invalid target URL", {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  let upstreamResp;
  try {
    upstreamResp = await fetch(targetUrl.toString(), {
      headers: UPSTREAM_HEADERS,
      redirect: "follow",
      cf: { cacheTtl: 0, cacheEverything: false },
    });
  } catch (e) {
    return new Response(`Upstream fetch failed: ${e.message}`, {
      status: 502,
      headers: CORS_HEADERS,
    });
  }

  if (!upstreamResp.ok) {
    return new Response(`Upstream returned ${upstreamResp.status}`, {
      status: upstreamResp.status,
      headers: CORS_HEADERS,
    });
  }

  const contentType = upstreamResp.headers.get("content-type") || "";

  // Manifest → rewrite every referenced URI to route back through this proxy.
  if (isManifest(targetUrl.toString(), contentType)) {
    const text = await upstreamResp.text();
    const proxyOrigin = reqUrl.origin;
    const rewritten = rewriteManifest(text, targetUrl.toString(), proxyOrigin);

    return new Response(rewritten, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-cache",
      },
    });
  }

  // Segment / key / init-map — stream through as raw binary, unchanged.
  const passthroughHeaders = {
    ...CORS_HEADERS,
    "Content-Type": contentType || "application/octet-stream",
    "Cache-Control": "public, max-age=15",
  };
  const contentLength = upstreamResp.headers.get("content-length");
  if (contentLength) passthroughHeaders["Content-Length"] = contentLength;

  return new Response(upstreamResp.body, {
    status: 200,
    headers: passthroughHeaders,
  });
}
