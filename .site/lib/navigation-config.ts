/**
 * Navigation Configuration Parser
 * Provides navigation structure for virtual taxonomies
 * TODO: Load from graph.org.ai.mdx frontmatter once MDX parsing is working
 */

export interface TaxonomyConfig {
  domain: string;
  title: string;
  icon?: string;
  category?: 'industry-vertical' | 'functional-domain' | 'thematic-area' | 'reference';
  color?: string;
  url?: string;
  description?: string;
}

export interface EntityTypeConfig {
  name: string;
  plural: string;
  icon?: string;
  source: string;
  description?: string;
}

export interface NavigationConfig {
  domain: string;
  title: string;
  description: string;
  taxonomies: TaxonomyConfig[];
  entity_types: EntityTypeConfig[];
  sidebar: {
    root: {
      tabs: string[];
    };
    taxonomy: {
      tabs: string[];
      sidebar: string[];
    };
    type: {
      tabs: string[];
      sidebar: string[];
    };
  };
  urls: {
    root: string;
    taxonomy: string;
    type_list: string;
    entity: string;
    search: string;
  };
  navigation: {
    max_tabs: number;
    show_counts: boolean;
    default_open_level: number;
    breadcrumbs: boolean;
  };
  implementation?: {
    pilot_taxonomies?: string[];
    query_strategy?: string;
    cache_enabled?: boolean;
    cache_ttl?: number;
  };
}

let cachedConfig: NavigationConfig | null = null;

/**
 * Load and parse the navigation configuration
 * For now, returns hardcoded config. TODO: Load from MDX frontmatter
 */
export function loadNavigationConfig(): NavigationConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  // Hardcoded config for Phase 2
  // TODO: Load from graph.org.ai.mdx frontmatter once MDX parsing is working
  cachedConfig = {
    domain: 'graph.org.ai',
    title: 'Graph.org.ai',
    description: 'Universal knowledge graph',
    taxonomies: [
      { domain: 'graph.org.ai', title: '.org.ai', url: '/', description: 'Home' },
      // Existing data source domains (these actually exist in the database)
      { domain: 'onet', title: 'O*NET', category: 'reference', description: 'Occupations, tasks, skills' },
      { domain: 'apqc', title: 'APQC', category: 'reference', description: 'Business processes' },
      { domain: 'unspsc', title: 'UNSPSC', category: 'reference', description: 'Products and services' },
      { domain: 'schema.org', title: 'Schema.org', category: 'reference', description: 'Schema.org vocabulary' },
      { domain: 'model', title: 'Models', category: 'reference', description: 'AI models' },
      // Virtual taxonomies (will be implemented in Phase 3)
      // { domain: 'retail', title: 'Retail', category: 'industry-vertical', description: 'Retail industry' },
      // { domain: 'healthcare', title: 'Healthcare', category: 'industry-vertical', description: 'Healthcare' },
      // { domain: 'technology', title: 'Technology', category: 'industry-vertical', description: 'Technology' },
      // { domain: 'law', title: 'Law', category: 'functional-domain', description: 'Legal and compliance' },
      // { domain: 'marketing', title: 'Marketing', category: 'functional-domain', description: 'Marketing' },
      // { domain: 'sustainability', title: 'Sustainability', category: 'thematic-area', description: 'Environmental' },
      // { domain: 'digital', title: 'Digital', category: 'thematic-area', description: 'Digital transformation' },
    ],
    entity_types: [],
    sidebar: {
      root: { tabs: ['.org.ai'] },
      taxonomy: { tabs: ['.org.ai', '{current}'], sidebar: ['Overview'] },
      type: { tabs: ['.org.ai', '{taxonomy}', '{type}'], sidebar: ['{hierarchy}'] },
    },
    urls: {
      root: '/',
      taxonomy: '/{taxonomy}',
      type_list: '/{taxonomy}/{type}',
      entity: '/{taxonomy}/{type}/{id}',
      search: '/{taxonomy}/search',
    },
    navigation: {
      max_tabs: 12,
      show_counts: true,
      default_open_level: 1,
      breadcrumbs: true,
    },
  };

  return cachedConfig;
}

/**
 * Get default configuration if MDX file doesn't exist
 */
function getDefaultConfig(): NavigationConfig {
  return {
    domain: 'graph.org.ai',
    title: 'Graph.org.ai',
    description: 'Knowledge graph',
    taxonomies: [
      {
        domain: 'graph.org.ai',
        title: '.org.ai',
        url: '/',
        description: 'Home',
      },
    ],
    entity_types: [],
    sidebar: {
      root: {
        tabs: ['.org.ai'],
      },
      taxonomy: {
        tabs: ['.org.ai', '{current}'],
        sidebar: ['Overview'],
      },
      type: {
        tabs: ['.org.ai', '{taxonomy}', '{type}'],
        sidebar: ['{hierarchy}'],
      },
    },
    urls: {
      root: '/',
      taxonomy: '/{taxonomy}',
      type_list: '/{taxonomy}/{type}',
      entity: '/{taxonomy}/{type}/{id}',
      search: '/{taxonomy}/search',
    },
    navigation: {
      max_tabs: 12,
      show_counts: true,
      default_open_level: 1,
      breadcrumbs: true,
    },
  };
}

/**
 * Get taxonomies for root level
 */
export function getRootTaxonomies(): TaxonomyConfig[] {
  const config = loadNavigationConfig();
  return config.taxonomies;
}

/**
 * Get taxonomy by domain
 */
export function getTaxonomyByDomain(domain: string): TaxonomyConfig | undefined {
  const config = loadNavigationConfig();
  return config.taxonomies.find(t => t.domain === domain);
}

/**
 * Get related taxonomies for a given taxonomy
 * This would be extended to read from individual taxonomy YAML files
 */
export function getRelatedTaxonomies(domain: string): TaxonomyConfig[] {
  // For now, return empty array
  // TODO: Read from .taxonomies/configs/{domain}.yaml
  return [];
}

/**
 * Get entity types
 */
export function getEntityTypes(): EntityTypeConfig[] {
  const config = loadNavigationConfig();
  return config.entity_types || [];
}

/**
 * Get navigation config for current path
 */
export function getNavigationForPath(pathname: string): {
  level: 'root' | 'taxonomy' | 'type';
  taxonomy?: string;
  type?: string;
  tabs: TaxonomyConfig[];
} {
  const config = loadNavigationConfig();
  const parts = pathname.split('/').filter(Boolean);

  // Root level
  if (parts.length === 0) {
    const tabs = config.taxonomies.slice(0, config.navigation.max_tabs);
    return {
      level: 'root',
      tabs,
    };
  }

  // Check if first part matches a taxonomy domain
  const taxonomyDomain = parts[0];
  const taxonomy = config.taxonomies.find(t =>
    t.domain === `${taxonomyDomain}.org.ai` ||
    t.domain === taxonomyDomain
  );

  if (!taxonomy) {
    // Not a taxonomy, return root
    const tabs = config.taxonomies.slice(0, config.navigation.max_tabs);
    return {
      level: 'root',
      tabs,
    };
  }

  // Taxonomy level (e.g., /retail)
  if (parts.length === 1) {
    const rootTab = config.taxonomies[0]; // .org.ai
    const relatedTabs = getRelatedTaxonomies(taxonomy.domain);
    const tabs = [rootTab, taxonomy, ...relatedTabs].slice(0, config.navigation.max_tabs);

    return {
      level: 'taxonomy',
      taxonomy: taxonomyDomain,
      tabs,
    };
  }

  // Type level (e.g., /retail/Occupation or deeper)
  const typeName = parts[1];
  const rootTab = config.taxonomies[0];
  const relatedTabs = getRelatedTaxonomies(taxonomy.domain);
  const tabs = [rootTab, taxonomy, ...relatedTabs].slice(0, config.navigation.max_tabs);

  return {
    level: 'type',
    taxonomy: taxonomyDomain,
    type: typeName,
    tabs,
  };
}

/**
 * Clear cache (for testing)
 */
export function clearNavigationCache() {
  cachedConfig = null;
}
