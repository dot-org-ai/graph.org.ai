import { describe, it, expect } from 'vitest';
import { renderToJson, renderToJsonWithMatter, extractFrontmatter } from '../src/index';

describe('renderToJson', () => {
  it('should render simple MDX to JSON', async () => {
    const mdx = '# Hello World';
    const result = await renderToJson(mdx);

    expect(result).toEqual({
      type: 'h1',
      children: 'Hello World'
    });
  });

  it('should render MDX with multiple elements', async () => {
    const mdx = `
# Title

This is a paragraph.
    `;
    const result = await renderToJson(mdx);

    expect(Array.isArray(result)).toBe(true);
    expect(result[0].type).toBe('h1');
    expect(result[1].type).toBe('p');
  });

  it('should handle MDX with props', async () => {
    const mdx = '<div className="test">Content</div>';
    const result = await renderToJson(mdx);

    expect(result).toEqual({
      type: 'div',
      props: { className: 'test' },
      children: 'Content'
    });
  });

  it('should handle context variables', async () => {
    const mdx = 'Hello {name}!';
    const result = await renderToJson(mdx, { context: { name: 'World' } });

    expect(result).toEqual({
      type: 'p',
      children: ['Hello ', 'World', '!']
    });
  });

  it('should flatten single element arrays when flatten option is true', async () => {
    const mdx = '# Hello';
    const result = await renderToJson(mdx, { flatten: true });

    expect(result).toEqual({
      type: 'h1',
      children: 'Hello'
    });
  });
});

describe('extractFrontmatter', () => {
  it('should extract YAML frontmatter', () => {
    const mdx = `---
title: Test Title
author: John Doe
count: 42
published: true
---

# Content`;

    const { frontmatter, content } = extractFrontmatter(mdx);

    expect(frontmatter).toEqual({
      title: 'Test Title',
      author: 'John Doe',
      count: 42,
      published: true
    });
    expect(content).toBe('\n# Content');
  });

  it('should handle MDX without frontmatter', () => {
    const mdx = '# Just Content';
    const { frontmatter, content } = extractFrontmatter(mdx);

    expect(frontmatter).toEqual({});
    expect(content).toBe(mdx);
  });
});

describe('renderToJsonWithMatter', () => {
  it('should render MDX with frontmatter', async () => {
    const mdx = `---
title: Test
---

# Hello`;

    const { frontmatter, json } = await renderToJsonWithMatter(mdx);

    expect(frontmatter).toEqual({ title: 'Test' });
    expect(json).toEqual({
      type: 'h1',
      children: 'Hello'
    });
  });
});
