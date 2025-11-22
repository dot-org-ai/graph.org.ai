import { renderToJson, renderToJsonWithMatter, extractFrontmatter } from '@mdxui/json';
import { renderToMarkdown } from '@mdxui/markdown';

/**
 * Output format for MDX rendering
 */
export type OutputFormat = 'json' | 'markdown' | 'both';

/**
 * Options for MDX rendering
 */
export interface RenderOptions {
  /** Context variables to pass to MDX evaluation */
  context?: any;
  /** For JSON: flatten single-element arrays */
  flatten?: boolean;
  /** For Markdown: tags to preserve as HTML */
  keepTags?: string[];
  /** Include frontmatter in output */
  includeFrontmatter?: boolean;
}

/**
 * Result of rendering MDX
 */
export interface RenderResult {
  frontmatter?: any;
  json?: any;
  markdown?: string;
}

/**
 * Unified API to render MDX to JSON, Markdown, or both
 * @param mdxContent - The MDX content string
 * @param format - Output format: 'json', 'markdown', or 'both'
 * @param options - Rendering options
 * @returns Rendered output in specified format(s)
 */
export async function render(
  mdxContent: string,
  format: OutputFormat = 'json',
  options: RenderOptions = {}
): Promise<RenderResult> {
  const { includeFrontmatter = false } = options;
  const result: RenderResult = {};

  // Extract frontmatter if requested
  let contentToRender = mdxContent;
  if (includeFrontmatter) {
    const { frontmatter, content } = extractFrontmatter(mdxContent);
    result.frontmatter = frontmatter;
    contentToRender = content;
  }

  // Render based on format
  if (format === 'json' || format === 'both') {
    result.json = await renderToJson(contentToRender, {
      context: options.context,
      flatten: options.flatten,
    });
  }

  if (format === 'markdown' || format === 'both') {
    result.markdown = await renderToMarkdown(contentToRender, {
      context: options.context,
      keepTags: options.keepTags,
    });
  }

  return result;
}

/**
 * Render MDX to JSON
 */
export async function toJson(mdxContent: string, options: RenderOptions = {}): Promise<any> {
  if (options.includeFrontmatter) {
    return renderToJsonWithMatter(mdxContent, options);
  }
  return renderToJson(mdxContent, options);
}

/**
 * Render MDX to Markdown
 */
export async function toMarkdown(mdxContent: string, options: RenderOptions = {}): Promise<string> {
  let contentToRender = mdxContent;

  if (options.includeFrontmatter) {
    const { content } = extractFrontmatter(mdxContent);
    contentToRender = content;
  }

  return renderToMarkdown(contentToRender, options);
}

/**
 * Convert between JSON and Markdown representations
 */
export async function convert(
  content: string,
  from: 'json' | 'markdown' | 'mdx',
  to: 'json' | 'markdown',
  options: RenderOptions = {}
): Promise<any> {
  if (from === 'mdx') {
    return render(content, to, options);
  }

  if (from === 'json' && to === 'markdown') {
    // Parse JSON and convert to MDX, then to Markdown
    // This is a simplified implementation
    throw new Error('JSON to Markdown conversion not yet implemented');
  }

  if (from === 'markdown' && to === 'json') {
    // Parse Markdown as MDX, then to JSON
    return toJson(content, options);
  }

  throw new Error(`Unsupported conversion: ${from} to ${to}`);
}

// Re-export utilities
export { extractFrontmatter } from '@mdxui/json';
export type { RenderOptions as MarkdownRenderOptions } from '@mdxui/markdown';
