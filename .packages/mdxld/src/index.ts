import { z } from 'zod';
import YAML from 'yaml';

// --- Types ---

export type MdxLdShape = 'flat' | 'expanded';

export interface MdxLdFlat {
  $id?: string;
  $type?: string | string[];
  $context?: string | Record<string, any> | (string | Record<string, any>)[];
  $code?: string;
  $content?: string;
  [key: string]: any;
}

export interface MdxLdExpanded {
  id?: string;
  type?: string | string[];
  context?: string | Record<string, any> | (string | Record<string, any>)[];
  code?: string;
  content?: string;
  data?: Record<string, any>;
}

export type MdxLdDocument = MdxLdFlat | MdxLdExpanded;

// --- Parsing ---

const FRONTMATTER_REGEX = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[ \t]*(\r?\n)([\s\S]*)$/;

export function parse(text: string, shape: MdxLdShape = 'flat'): MdxLdDocument {
  const match = text.match(FRONTMATTER_REGEX);
  let frontmatterRaw = '';
  let content = text;

  if (match) {
    frontmatterRaw = match[1];
    content = match[3]; // Content is now in the 3rd capture group
  }

  // Parse YAML frontmatter
  const data = YAML.parse(frontmatterRaw) || {};

  if (shape === 'expanded') {
    const { $id, $type, $context, $code, ...rest } = data;
    return {
      id: $id,
      type: $type,
      context: $context,
      code: $code, // Assuming code might be in frontmatter or inferred
      content: content.trim(),
      data: rest
    };
  } else {
    // Flat shape
    return {
      ...data,
      $content: content.trim()
    };
  }
}

// --- Stringify ---

export function stringify(doc: MdxLdDocument, shape: MdxLdShape = 'flat'): string {
  let data: Record<string, any> = {};
  let content = '';

  if (shape === 'expanded') {
    const d = doc as MdxLdExpanded;
    data = { ...d.data };
    if (d.id) data.$id = d.id;
    if (d.type) data.$type = d.type;
    if (d.context) data.$context = d.context;
    if (d.code) data.$code = d.code;
    content = d.content || '';
  } else {
    const d = doc as MdxLdFlat;
    const { $content, ...rest } = d;
    data = rest;
    content = $content || '';
  }

  const yamlStr = Object.keys(data).length > 0 ? YAML.stringify(data).trim() : '';
  
  if (yamlStr) {
    return `---\n${yamlStr}\n---\n\n${content.trim()}`;
  } else {
    return content;
  }
}

// --- Validation ---

// Simple schema for now, can be expanded based on specific JSON-LD requirements
const FlatSchema = z.object({
  $id: z.string().optional(),
  $type: z.union([z.string(), z.array(z.string())]).optional(),
  $context: z.any().optional(),
  $code: z.string().optional(),
  $content: z.string().optional()
}).passthrough();

const ExpandedSchema = z.object({
  id: z.string().optional(),
  type: z.union([z.string(), z.array(z.string())]).optional(),
  context: z.any().optional(),
  code: z.string().optional(),
  content: z.string().optional(),
  data: z.record(z.any()).optional()
});

export function validate(doc: MdxLdDocument, shape: MdxLdShape = 'flat'): { success: boolean; error?: any } {
  const schema = shape === 'expanded' ? ExpandedSchema : FlatSchema;
  const result = schema.safeParse(doc);
  if (result.success) {
    return { success: true };
  } else {
    return { success: false, error: result.error };
  }
}
