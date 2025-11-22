# @mdxui/api

Unified API for rendering MDX to JSON and Markdown formats.

## Installation

```bash
npm install @mdxui/api
```

## Usage

### Basic Rendering

```typescript
import { render, toJson, toMarkdown } from '@mdxui/api';

// Render to JSON
const json = await toJson('# Hello World');

// Render to Markdown
const markdown = await toMarkdown('# Hello {name}', {
  context: { name: 'World' }
});

// Render to both formats
const result = await render('# Title\n\nContent', 'both');
// { json: {...}, markdown: '...' }
```

### With Frontmatter

```typescript
const mdx = `---
title: My Doc
author: John
---

# Content`;

const result = await render(mdx, 'both', {
  includeFrontmatter: true
});
// {
//   frontmatter: { title: 'My Doc', author: 'John' },
//   json: {...},
//   markdown: '...'
// }
```

### Format Conversion

```typescript
import { convert } from '@mdxui/api';

// MDX to JSON
const json = await convert(mdxContent, 'mdx', 'json');

// MDX to Markdown
const md = await convert(mdxContent, 'mdx', 'markdown');

// Markdown to JSON
const json2 = await convert(markdownContent, 'markdown', 'json');
```

## API

### `render(mdxContent, format, options?)`

Unified rendering API.

**Parameters:**
- `mdxContent: string` - The MDX content
- `format: 'json' | 'markdown' | 'both'` - Output format
- `options?: RenderOptions` - Rendering options

**Returns:** `Promise<RenderResult>`

### `toJson(mdxContent, options?)`

Render MDX to JSON.

### `toMarkdown(mdxContent, options?)`

Render MDX to Markdown.

### `convert(content, from, to, options?)`

Convert between formats.

## Options

```typescript
interface RenderOptions {
  context?: any;              // Context variables
  flatten?: boolean;          // Flatten JSON arrays (default: false)
  keepTags?: string[];        // Preserve HTML tags in Markdown
  includeFrontmatter?: boolean; // Extract frontmatter (default: false)
}
```
