import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

// Configure allowed development origins
function getAllowedDevOrigins() {
  const origins = new Set();

  const envOrigins = process.env.ALLOWED_DEV_ORIGINS || "";

  envOrigins
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      try {
        origins.add(
          new URL(
            entry.includes("://")
              ? entry
              : `https://${entry}`
          ).hostname
        );
      } catch {
        console.warn("Invalid development origin:", entry);
      }
    });

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || ""
  ).trim();

  if (appUrl) {
    try {
      const { hostname } = new URL(appUrl);

      if (hostname) {
        origins.add(hostname);
      }
    } catch {
      console.warn("Invalid NEXT_PUBLIC_APP_URL");
    }
  }

  return [...origins];
}

// Configure backend origin
function getBackendOrigin() {
  const rawUrl = (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000"
  ).trim();

  return rawUrl
    .replace(/\/api\/v1\/?$/i, "")
    .replace(/\/+$/, "");
}

const allowedDevOrigins = getAllowedDevOrigins();
const backendOrigin = getBackendOrigin();

// Development configuration logs
console.log("[Next.js] Allowed Dev Origins:", allowedDevOrigins);
console.log("[Next.js] Backend Origin:", backendOrigin);

const nextConfig = {
  cacheComponents: true,

  // Allow configured Cloudflare development origins
  allowedDevOrigins,

  // Backend API and asset proxy
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
      {
        source: "/assets/:path*",
        destination: `${backendOrigin}/assets/:path*`,
      },
    ];
  },

  // Prevent incorrect workspace root detection
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;