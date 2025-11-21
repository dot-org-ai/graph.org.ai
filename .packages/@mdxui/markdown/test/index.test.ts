import { describe, it, expect } from 'vitest';
import { renderToMarkdown } from '../src/index.js';

describe('renderToMarkdown', () => {
  it('should render basic MDX', async () => {
    const mdx = '# Hello\n\nWorld';
    const result = await renderToMarkdown(mdx);
    // result should be roughly "# Hello\n\nWorld\n"
    expect(result).toContain('# Hello');
    expect(result).toContain('World');
  });

  it('should render components returning strings', async () => {
    const mdx = '# Title\n\n<Greeting name="User" />';
    const Greeting = ({ name }: { name: string }) => `Hello, ${name}!`;
    
    const result = await renderToMarkdown(mdx, { Greeting });
    expect(result).toContain('Hello, User!');
  });

  it('should render structural components', async () => {
    const mdx = '<Tasks />';
    // Mocking a component that returns a React Element structure
    const Tasks = () => ({
        type: 'h2',
        props: { children: 'Task List' }
    });
    
    const result = await renderToMarkdown(mdx, { Tasks });
    expect(result).toContain('## Task List');
  });

  it('should render async components', async () => {
    const mdx = '<AsyncData />';
    const AsyncData = async () => {
        await new Promise(r => setTimeout(r, 10));
        return 'Fetched Data';
    };
    
    const result = await renderToMarkdown(mdx, { AsyncData });
    expect(result).toContain('Fetched Data');
  });
});
