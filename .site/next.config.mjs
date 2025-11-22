import { createMDX } from 'fumadocs-mdx/next';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  // Set Turbopack root to workspace root
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },

  // Optimize for static generation with large datasets
  experimental: {
    // Use streaming for better performance
    ppr: false,
  },

  // Configure static generation
  output: 'standalone',

  // No rewrites needed - domains are handled directly at root
};

export default withMDX(config);
