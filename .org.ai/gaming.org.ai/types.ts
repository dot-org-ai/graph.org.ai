export interface GamingCategory {
  '@type': 'GamingCategory'
  '@id': string
  '@context': 'https://gaming.org.ai'
  name: string
  naicsCode: string
  description: string
  parent?: string
  related?: string[]
}

export interface GamingCompany {
  '@type': 'Organization'
  '@context': 'https://schema.org'
  name: string
  industry: string
  foundingDate?: string
  headquarters?: string
}

export interface Game {
  '@type': 'VideoGame'
  '@context': 'https://schema.org'
  name: string
  genre?: string[]
  platform?: string[]
  publisher?: string
  developer?: string
  releaseDate?: string
}
