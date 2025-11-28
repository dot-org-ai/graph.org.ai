/**
 * Maritime Industry Types
 *
 * @see https://maritime.org.ai
 */

export type Maritime = {
  '@context': string
  '@id': string
  '@type': string
  name: string
  description: string
  naicsCode?: string
  apqcCode?: string
  [key: string]: any
}
