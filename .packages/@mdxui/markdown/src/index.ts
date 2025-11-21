import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { toMdast } from 'hast-util-to-mdast';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { toHtml } from 'hast-util-to-html';

// Custom Async Renderer
// ... (renderToHtml function is same, omitting for brevity if possible, but need to keep file valid)
async function renderToHtml(element: any): Promise<string> {
  if (element === null || element === undefined || element === false || element === true) {
    return '';
  }
  
  if (typeof element === 'string' || typeof element === 'number') {
    return String(element)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  
  if (Array.isArray(element)) {
    const results = await Promise.all(element.map(renderToHtml));
    return results.join('');
  }
  
  if (typeof element === 'object') {
    // Check for React Element
    if (element['$$typeof'] === Symbol.for('react.element') || element.type) { 
       const { type, props } = element;
       
       if (typeof type === 'function') {
           // Component (could be async)
           const result = await type(props);
           return renderToHtml(result);
       }
       
       if (typeof type === 'string') {
           // Intrinsic tag
           const { children, ...attrs } = props || {};
           const attrString = Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join('');
           
           // Void elements
           const voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
           const hasChildren = children !== undefined && children !== null && (Array.isArray(children) ? children.length > 0 : true);

           if (voidTags.includes(type)) {
               return `<${type}${attrString} />`;
           }
           
           // For Capitalized components (stubs), if no children, use explicit closing tag 
           // because HTML parsers (rehypeParse) treat <Component /> as start tag <Component>
           if (!hasChildren && /^[A-Z]/.test(type)) {
               return `<${type}${attrString}></${type}>`;
           }
           
           const childHtml = await renderToHtml(children);
           return `<${type}${attrString}>${childHtml}</${type}>`;
       }
       
       // Fragments
       if (type === runtime.Fragment) {
           return renderToHtml(props.children);
       }
    }
  }
  
  // Fallback
  return '';
}

export interface RenderOptions {
    context?: any;
    keepTags?: string[];
}

export async function renderToMarkdown(mdxContent: string, options: any = {}): Promise<string> {
  // Backward compatibility for second argument being context
  const context = options.context || (options.keepTags ? {} : options);
  const keepTags = options.keepTags || [];

  // 1. Evaluate MDX
  const { default: Content } = await evaluate(mdxContent, {
    ...runtime,
    useDynamicImport: true,
    baseUrl: import.meta.url,
  } as any);

  // 2. Render to HTML (async)
  const element = Content({ components: context });
  const html = await renderToHtml(element);

  // 3. HTML -> Markdown
  const hast = unified().use(rehypeParse, { fragment: true }).parse(html);
  
  const handlers: Record<string, any> = {};
  for (const tag of keepTags) {
      // Register handler for the lowercase tag name (what rehype produces)
      handlers[tag.toLowerCase()] = (h: any, node: any) => {
          // Restore original tag name for serialization
          // We create a shallow copy to avoid mutating the tree unexpectedly if that matters,
          // but for this purpose mutating the node being serialized is fine or we copy.
          const originalNameNode = { ...node, tagName: tag };
          // Serialize the HAST node back to HTML string
          const htmlString = toHtml(originalNameNode);
          return { type: 'html', value: htmlString };
      };
  }

  const mdast = toMdast(hast, { handlers });
  
  const markdown = toMarkdown(mdast, {
    extensions: [gfmToMarkdown()]
  });

  return markdown;
}