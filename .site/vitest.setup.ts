import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js modules
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn((key: string) => {
      if (key === 'host') return 'localhost:3000';
      return null;
    }),
  })),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    // Simple mock that returns children
    return children;
  },
}));
