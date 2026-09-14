import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Makes the Cloudflare bindings declared in wrangler.jsonc available during `next dev`.
// See https://opennext.js.org/cloudflare/bindings
import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
