import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';

/**
 * Converts React elements to JSON representation
 */
async function elementToJson(element: any): Promise<any> {
  if (element === null || element === undefined || element === false || element === true) {
    return null;
  }

  if (typeof element === 'string' || typeof element === 'number') {
    return element;
  }

  if (Array.isArray(element)) {
    const results = await Promise.all(element.map(elementToJson));
    return results.filter(r => r !== null);
  }

  if (typeof element === 'object') {
    // Check for React Element
    if (element['$$typeof'] === Symbol.for('react.element') || element.type) {
      const { type, props } = element;

      if (typeof type === 'function') {
        // Component (could be async)
        const result = await type(props);
        return elementToJson(result);
      }

      if (typeof type === 'string') {
        // Intrinsic tag
        const { children, ...attrs } = props || {};

        const jsonNode: any = {
          type,
          props: Object.keys(attrs).length > 0 ? attrs : undefined,
        };

        if (children !== undefined && children !== null) {
          const childJson = await elementToJson(children);
          if (childJson !== null) {
            if (Array.isArray(childJson) && childJson.length === 1) {
              jsonNode.children = childJson[0];
            } else if (Array.isArray(childJson) && childJson.length > 1) {
              jsonNode.children = childJson;
            } else if (!Array.isArray(childJson)) {
              jsonNode.children = childJson;
            }
          }
        }

        return jsonNode;
      }

      // Fragments
      if (type === runtime.Fragment) {
        return elementToJson(props.children);
      }
    }
  }

  // Fallback
  return null;
}

export interface RenderOptions {
  context?: any;
  flatten?: boolean;
}

/**
 * Renders MDX content to JSON representation
 * @param mdxContent - The MDX content string
 * @param options - Rendering options
 * @returns JSON representation of the rendered MDX
 */
export async function renderToJson(mdxContent: string, options: RenderOptions = {}): Promise<any> {
  const context = options.context || {};
  const flatten = options.flatten ?? false;

  // 1. Evaluate MDX
  const evaluationContext = { ...context, ...runtime };
  const { default: Content } = await evaluate(mdxContent, {
    ...evaluationContext,
    useDynamicImport: true,
    baseUrl: import.meta.url,
  } as any);

  // 2. Render to JSON
  const element = Content(context);
  const json = await elementToJson(element);

  // 3. Optionally flatten single-element arrays and root structure
  if (flatten && Array.isArray(json) && json.length === 1) {
    return json[0];
  }

  return json;
}

/**
 * Extracts frontmatter and content from MDX
 * @param mdxContent - The MDX content string
 * @returns Object with frontmatter and content
 */
export function extractFrontmatter(mdxContent: string): { frontmatter: any; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = mdxContent.match(frontmatterRegex);

  if (match) {
    const frontmatterYaml = match[1];
    const content = mdxContent.slice(match[0].length);

    // Simple YAML parser for common cases
    const frontmatter: any = {};
    frontmatterYaml.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value: any = line.slice(colonIndex + 1).trim();

        // Handle quoted strings
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        // Handle numbers
        else if (!isNaN(Number(value))) {
          value = Number(value);
        }
        // Handle booleans
        else if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (value === 'null') value = null;

        frontmatter[key] = value;
      }
    });

    return { frontmatter, content };
  }

  return { frontmatter: {}, content: mdxContent };
}

/**
 * Renders MDX to JSON with frontmatter extracted
 * @param mdxContent - The MDX content string
 * @param options - Rendering options
 * @returns Object with frontmatter and rendered JSON
 */
export async function renderToJsonWithMatter(
  mdxContent: string,
  options: RenderOptions = {}
): Promise<{ frontmatter: any; json: any }> {
  const { frontmatter, content } = extractFrontmatter(mdxContent);
  const json = await renderToJson(content, options);

  return { frontmatter, json };
}
