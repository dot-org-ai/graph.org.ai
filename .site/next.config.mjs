import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite domain-based routes to [domain]/[...slug] pattern
        // This captures requests like /schema/Thing and routes to /docs/schema.org.ai/Thing
        {
          source: '/:domain((?!_next|api|docs|og).*?)/:path*',
          destination: '/docs/:domain.org.ai/:path*',
          has: [
            {
              type: 'host',
              value: '(?<host>.*)',
            },
          ],
        },
      ],
    };
  },
};

export default withMDX(config);
