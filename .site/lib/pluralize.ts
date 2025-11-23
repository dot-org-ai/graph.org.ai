/**
 * Pluralize a word based on English grammar rules
 */
export function pluralize(word: string): string {
  // Handle irregular plurals
  const irregulars: Record<string, string> = {
    'Ability': 'Abilities',
    'Activity': 'Activities',
    'Category': 'Categories',
    'City': 'Cities',
    'Company': 'Companies',
    'Country': 'Countries',
    'Currency': 'Currencies',
    'Delivery': 'Deliveries',
    'Entity': 'Entities',
    'Facility': 'Facilities',
    'Family': 'Families',
    'Industry': 'Industries',
    'Library': 'Libraries',
    'Party': 'Parties',
    'Policy': 'Policies',
    'Priority': 'Priorities',
    'Property': 'Properties',
    'Quantity': 'Quantities',
    'Security': 'Securities',
    'Story': 'Stories',
    'Strategy': 'Strategies',
    'Technology': 'Technologies',
    'Territory': 'Territories',
    'Warranty': 'Warranties',
  };

  // Check for exact match first
  if (irregulars[word]) {
    return irregulars[word];
  }

  // Words ending in 'y' preceded by a consonant -> 'ies'
  if (/[^aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  }

  // Words ending in 's', 'x', 'z', 'ch', 'sh' -> 'es'
  if (/(s|x|z|ch|sh)$/i.test(word)) {
    return word + 'es';
  }

  // Words ending in 'f' or 'fe' -> 'ves'
  if (/fe?$/i.test(word)) {
    return word.replace(/fe?$/i, 'ves');
  }

  // Words ending in consonant + 'o' -> 'es'
  if (/[^aeiou]o$/i.test(word)) {
    return word + 'es';
  }

  // Default: just add 's'
  return word + 's';
}
