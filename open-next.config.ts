// OpenNext configuration for the Cloudflare Workers deployment.
// See https://opennext.js.org/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({
	// The site is fully prerendered, so no incremental cache is needed.
	// For best results with ISR consider enabling R2 caching
	// See https://opennext.js.org/cloudflare/caching for more details
	// incrementalCache: r2IncrementalCache,
});

// The `build` script runs `opennextjs-cloudflare build`, which in turn builds the
// Next.js app. Point it straight at `next build` so it does not re-enter
// `npm run build` and recurse.
config.buildCommand = "next build";

export default config;
