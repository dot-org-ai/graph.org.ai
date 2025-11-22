# @mdxui/json

Render and evaluate MDX to JSON representation.

## Installation

```bash
npm install @mdxui/json
```

## Usage

### Basic Rendering

```typescript
import { renderToJson } from '@mdxui/json';

const mdx = '# Hello World';
const json = await renderToJson(mdx);
// { type: 'h1', children: 'Hello World' }
```

### With Context

```typescript
const mdx = 'Hello {name}!';
const json = await renderToJson(mdx, {
  context: { name: 'World' }
});
```

### With Frontmatter

```typescript
import { renderToJsonWithMatter } from '@mdxui/json';

const mdx = `---
title: My Document
---

# Content`;

const { frontmatter, json } = await renderToJsonWithMatter(mdx);
// frontmatter: { title: 'My Document' }
// json: { type: 'h1', children: 'Content' }
```

## API

### `renderToJson(mdxContent, options?)`

Renders MDX content to JSON representation.

**Options:**
- `context?: any` - Context variables to pass to MDX evaluation
- `flatten?: boolean` - Flatten single-element arrays (default: false)

### `renderToJsonWithMatter(mdxContent, options?)`

Renders MDX with frontmatter extraction.

Returns: `{ frontmatter: any, json: any }`

### `extractFrontmatter(mdxContent)`

Extracts YAML frontmatter from MDX content.

Returns: `{ frontmatter: any, content: string }`
