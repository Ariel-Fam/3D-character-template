import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep this nested app's build and assets independent of its parent project.
  outputFileTracingRoot: path.resolve(process.cwd()),
  turbopack: { root: path.resolve(process.cwd()) },
};
export default nextConfig;
