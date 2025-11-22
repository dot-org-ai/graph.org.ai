import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// @ts-expect-error - Custom source implementation missing some optional properties
export const { GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});
