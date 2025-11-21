import { describe, it, expect } from 'vitest';
import { parse, stringify, validate } from '../src/index.js';
import * as fs from 'fs';
import * as path from 'path';

const SAMPLE_OCCUPATION = `--- 
$id: https://graph.org.ai/occupations/11-1011.00
$type: Occupation
code: 11-1011.00
title: Chief Executives
---

# Chief Executives

<Tasks occupation="11-1011.00" />
<Skills occupation="11-1011.00" />
`;

describe('mdxld', () => {
  it('should parse a flat MDX-LD file', () => {
    const result = parse(SAMPLE_OCCUPATION, 'flat');
    expect(result).toEqual({
      $id: 'https://graph.org.ai/occupations/11-1011.00',
      $type: 'Occupation',
      code: '11-1011.00',
      title: 'Chief Executives',
      $content: '# Chief Executives\n\n<Tasks occupation="11-1011.00" />\n<Skills occupation="11-1011.00" />'
    });
  });

  it('should parse an expanded MDX-LD file', () => {
    const result = parse(SAMPLE_OCCUPATION, 'expanded');
    expect(result).toEqual({
      id: 'https://graph.org.ai/occupations/11-1011.00',
      type: 'Occupation',
      context: undefined,
      code: undefined,
      content: '# Chief Executives\n\n<Tasks occupation="11-1011.00" />\n<Skills occupation="11-1011.00" />',
      data: {
        code: '11-1011.00',
        title: 'Chief Executives'
      }
    });
  });

  it('should validate a valid document', () => {
    const doc = parse(SAMPLE_OCCUPATION, 'flat');
    const result = validate(doc, 'flat');
    expect(result.success).toBe(true);
  });

  it('should stringify back to valid MDX-LD', () => {
    const doc = parse(SAMPLE_OCCUPATION, 'flat');
    const str = stringify(doc, 'flat');
    const roundTripDoc = parse(str, 'flat');
    expect(roundTripDoc).toEqual(doc);
  });
});
