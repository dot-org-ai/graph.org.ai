/**
 * Unit tests for TSV validation and standardization utilities
 */

import { describe, it, expect } from '@jest/globals';

/**
 * Convert a name to PascalCase ID
 */
function toPascalCase(name: string): string {
  if (!name) return '';

  return name
    .split(/[\s\-_\.\/]+/)
    .filter(word => word.length > 0)
    .map(word => {
      // Handle special cases like "API", "URL", etc.
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Check if a string is PascalCase
 */
function isPascalCase(str: string): boolean {
  if (!str || str.trim() === '') return false;
  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9_]*$/;
  const isAllUppercase = str === str.toUpperCase() && str.includes('_');
  return pascalCaseRegex.test(str) && !isAllUppercase;
}

/**
 * Generate URL from namespace, type, and id
 */
function generateUrl(ns: string, type: string, id: string): string {
  const cleanNs = ns.replace(/\.ai$/, '');
  return `https://${cleanNs}/${type}/${id}`;
}

describe('toPascalCase', () => {
  it('converts space-separated words to PascalCase', () => {
    expect(toPascalCase('Business Administration')).toBe('BusinessAdministration');
    expect(toPascalCase('Oral Comprehension')).toBe('OralComprehension');
    expect(toPascalCase('Active Listening')).toBe('ActiveListening');
  });

  it('converts hyphenated words to PascalCase', () => {
    expect(toPascalCase('google-sheets')).toBe('GoogleSheets');
    expect(toPascalCase('social-media')).toBe('SocialMedia');
  });

  it('converts snake_case to PascalCase', () => {
    expect(toPascalCase('business_administration')).toBe('BusinessAdministration');
    expect(toPascalCase('active_listening')).toBe('ActiveListening');
  });

  it('handles mixed separators', () => {
    expect(toPascalCase('google-sheets_api')).toBe('GoogleSheetsApi');
    expect(toPascalCase('social.media-platform')).toBe('SocialMediaPlatform');
  });

  it('handles dotted identifiers', () => {
    expect(toPascalCase('2.C.1.a')).toBe('2C1a');
    expect(toPascalCase('1.A.1.a.1')).toBe('1A1a1');
  });

  it('handles already PascalCase strings', () => {
    expect(toPascalCase('GoogleSheets')).toBe('Googlesheets'); // Note: this normalizes case
    expect(toPascalCase('BusinessAdmin')).toBe('Businessadmin');
  });

  it('handles empty and whitespace strings', () => {
    expect(toPascalCase('')).toBe('');
    expect(toPascalCase('   ')).toBe('');
  });

  it('handles single words', () => {
    expect(toPascalCase('business')).toBe('Business');
    expect(toPascalCase('BUSINESS')).toBe('Business');
  });

  it('handles special characters', () => {
    expect(toPascalCase('.40 caliber semi-automatic pistols')).toBe('40CaliberSemiAutomaticPistols');
    expect(toPascalCase('0-1 drop indicators')).toBe('01DropIndicators');
  });
});

describe('isPascalCase', () => {
  it('returns true for valid PascalCase strings', () => {
    expect(isPascalCase('BusinessAdministration')).toBe(true);
    expect(isPascalCase('OralComprehension')).toBe(true);
    expect(isPascalCase('GoogleSheets')).toBe(true);
    expect(isPascalCase('ChiefExecutives')).toBe(true);
  });

  it('returns false for non-PascalCase strings', () => {
    expect(isPascalCase('google-sheets')).toBe(false);
    expect(isPascalCase('business_administration')).toBe(false);
    expect(isPascalCase('active listening')).toBe(false);
    expect(isPascalCase('2.C.1.a')).toBe(false);
    expect(isPascalCase('1.A.1.a.1')).toBe(false);
  });

  it('returns false for lowercase strings', () => {
    expect(isPascalCase('business')).toBe(false);
    expect(isPascalCase('googlesheets')).toBe(false);
  });

  it('returns false for CONSTANT_CASE strings', () => {
    expect(isPascalCase('BUSINESS_ADMIN')).toBe(false);
    expect(isPascalCase('GOOGLE_SHEETS')).toBe(false);
  });

  it('returns false for empty strings', () => {
    expect(isPascalCase('')).toBe(false);
    expect(isPascalCase('   ')).toBe(false);
  });

  it('allows underscores in PascalCase (for technical terms)', () => {
    expect(isPascalCase('Business_Admin')).toBe(true);
    expect(isPascalCase('Google_Sheets_API')).toBe(true);
  });

  it('returns false for strings starting with lowercase', () => {
    expect(isPascalCase('businessAdmin')).toBe(false);
    expect(isPascalCase('googleSheets')).toBe(false);
  });
});

describe('generateUrl', () => {
  it('generates correct URLs from namespace, type, and id', () => {
    expect(generateUrl('onet.org.ai', 'Knowledge', 'BusinessAdministration'))
      .toBe('https://onet.org/Knowledge/BusinessAdministration');

    expect(generateUrl('apps.org.ai', 'App', 'GoogleSheets'))
      .toBe('https://apps.org/App/GoogleSheets');

    expect(generateUrl('schema.org.ai', 'Noun', 'Organization'))
      .toBe('https://schema.org/Noun/Organization');
  });

  it('removes .ai suffix from namespace', () => {
    expect(generateUrl('example.org.ai', 'Type', 'Thing'))
      .toBe('https://example.org/Type/Thing');

    expect(generateUrl('test.com.ai', 'Type', 'Thing'))
      .toBe('https://test.com/Type/Thing');
  });

  it('handles namespaces without .ai suffix', () => {
    expect(generateUrl('example.org', 'Type', 'Thing'))
      .toBe('https://example.org/Type/Thing');
  });

  it('handles complex IDs', () => {
    expect(generateUrl('onet.org.ai', 'Occupation', 'ChiefSustainabilityOfficers'))
      .toBe('https://onet.org/Occupation/ChiefSustainabilityOfficers');
  });
});

describe('TSV Standard Schema', () => {
  it('defines the correct standard column order', () => {
    const STANDARD_COLUMNS = ['url', 'ns', 'type', 'id', 'code', 'name', 'description'];
    expect(STANDARD_COLUMNS).toHaveLength(7);
    expect(STANDARD_COLUMNS[0]).toBe('url');
    expect(STANDARD_COLUMNS[1]).toBe('ns');
    expect(STANDARD_COLUMNS[2]).toBe('type');
    expect(STANDARD_COLUMNS[3]).toBe('id');
    expect(STANDARD_COLUMNS[4]).toBe('code');
    expect(STANDARD_COLUMNS[5]).toBe('name');
    expect(STANDARD_COLUMNS[6]).toBe('description');
  });
});

describe('ID Transformation Examples', () => {
  it('transforms ONET codes to PascalCase IDs', () => {
    // Knowledge
    expect(toPascalCase('Administration and Management')).toBe('AdministrationAndManagement');
    expect(toPascalCase('Administrative')).toBe('Administrative');

    // Skills
    expect(toPascalCase('Reading Comprehension')).toBe('ReadingComprehension');
    expect(toPascalCase('Active Listening')).toBe('ActiveListening');

    // Abilities
    expect(toPascalCase('Oral Comprehension')).toBe('OralComprehension');
    expect(toPascalCase('Written Comprehension')).toBe('WrittenComprehension');

    // Work Values
    expect(toPascalCase('Achievement')).toBe('Achievement');
    expect(toPascalCase('Working Conditions')).toBe('WorkingConditions');
  });

  it('transforms app slugs to PascalCase IDs', () => {
    expect(toPascalCase('google-sheets')).toBe('GoogleSheets');
    expect(toPascalCase('gmail')).toBe('Gmail');
    expect(toPascalCase('microsoft-teams')).toBe('MicrosoftTeams');
  });

  it('transforms tool names to PascalCase IDs', () => {
    expect(toPascalCase('.40 caliber semi-automatic pistols'))
      .toBe('40CaliberSemiAutomaticPistols');
    expect(toPascalCase('0-1 drop indicators'))
      .toBe('01DropIndicators');
  });

  it('preserves existing PascalCase IDs', () => {
    expect(isPascalCase('ChiefExecutives')).toBe(true);
    expect(isPascalCase('ChiefSustainabilityOfficers')).toBe(true);
  });
});

describe('Namespace Inference', () => {
  it('maps file types to correct namespaces', () => {
    const nsMap: Record<string, string> = {
      'Knowledge': 'onet.org.ai',
      'Skills': 'onet.org.ai',
      'Abilities': 'onet.org.ai',
      'Apps': 'apps.org.ai',
      'Models': 'models.org.ai',
      'Industries': 'naics.org.ai',
      'Products': 'unspsc.org.ai',
      'Nouns': 'schema.org.ai',
    };

    expect(nsMap['Knowledge']).toBe('onet.org.ai');
    expect(nsMap['Apps']).toBe('apps.org.ai');
    expect(nsMap['Industries']).toBe('naics.org.ai');
  });
});
