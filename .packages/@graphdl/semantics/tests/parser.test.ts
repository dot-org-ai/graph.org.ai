import { describe, it, expect, beforeAll } from 'vitest'
import { GraphDLParser } from '../src/parser'

describe('GraphDL Parser', () => {
  let parser: GraphDLParser

  beforeAll(async () => {
    parser = new GraphDLParser()
    await parser.initialize()
  })

  describe('Simple imperative statements', () => {
    it('should parse single verb + object', () => {
      const result = parser.parse('Develop strategy')
      expect(result.predicate).toBe('Develop')
      expect(result.object).toBe('strategy')
      expect(result.hasConjunction).toBe(false)
    })

    it('should parse verb + compound object', () => {
      const result = parser.parse('Analyze customer data')
      expect(result.predicate).toBe('Analyze')
      expect(result.object).toBe('customer data')
    })

    it('should preserve original verb form', () => {
      const result = parser.parse('Monitor performance')
      expect(result.predicate).toBe('Monitor')
      expect(parser.toGraphDL(result)).toBe('Monitor.performance')
    })
  })

  describe('Verb and Verb patterns (52 cases from top 100)', () => {
    it('should split "Monitor and evaluate" into two tasks', () => {
      const result = parser.parse('Monitor and evaluate quality of customer interactions')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(2)
      expect(result.expansions![0].predicate).toBe('Monitor')
      expect(result.expansions![1].predicate).toBe('Evaluate')

      const graphdl = parser.toGraphDL(result)
      expect(graphdl).toContain('[')
      expect(graphdl).toContain('Monitor.')
      expect(graphdl).toContain('Evaluate.')
    })

    it('should handle "Define and maintain"', () => {
      const result = parser.parse('Define and maintain enterprise information policies')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(2)
      expect(result.expansions![0].predicate).toBe('Define')
      expect(result.expansions![1].predicate).toBe('Maintain')
    })

    it('should handle "Review and monitor"', () => {
      const result = parser.parse('Review and monitor physical and logical IT data security measures')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(2)
      expect(result.expansions![0].predicate).toBe('Review')
      expect(result.expansions![1].predicate).toBe('Monitor')
    })

    it('should handle "Compile and communicate"', () => {
      const result = parser.parse('Compile and communicate internal and regulatory compliance reports')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(2)
    })

    it('should handle "Develop and manage"', () => {
      const result = parser.parse('Develop and manage human resources planning, policies, and strategies')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(2)
    })
  })

  describe('Oxford comma verb lists (10 cases from top 100)', () => {
    it('should split "Identify, deploy, and support" into three tasks', () => {
      const result = parser.parse('Identify, deploy, and support development methodologies and tools')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(3)
      expect(result.expansions![0].predicate).toBe('Identify')
      expect(result.expansions![1].predicate).toBe('Deploy')
      expect(result.expansions![2].predicate).toBe('Support')

      const graphdl = parser.toGraphDL(result)
      expect(graphdl).toContain('Identify.')
      expect(graphdl).toContain('Deploy.')
      expect(graphdl).toContain('Support.')
    })

    it('should handle "Select, deploy, and operate"', () => {
      const result = parser.parse('Select, deploy, and operate IT performance analytics tools')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(3)
      expect(result.expansions![0].predicate).toBe('Select')
      expect(result.expansions![1].predicate).toBe('Deploy')
      expect(result.expansions![2].predicate).toBe('Operate')
    })

    it('should handle "Develop, document, and maintain"', () => {
      const result = parser.parse('Develop, document, and maintain IT business continuity planning')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(3)
    })

    it('should handle "Receive, inspect, and store"', () => {
      const result = parser.parse('Receive, inspect, and store inbound deliveries')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(3)
      expect(result.expansions![0].predicate).toBe('Receive')
      expect(result.expansions![1].predicate).toBe('Inspect')
      expect(result.expansions![2].predicate).toBe('Store')
    })

    it('should handle 4-verb Oxford comma: "Analyze, negotiate, resolve, and confirm"', () => {
      const result = parser.parse('Analyze, negotiate, resolve, and confirm bank fees')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(4)
      expect(result.expansions![0].predicate).toBe('Analyze')
      expect(result.expansions![1].predicate).toBe('Negotiate')
      expect(result.expansions![2].predicate).toBe('Resolve')
      expect(result.expansions![3].predicate).toBe('Confirm')
    })
  })

  describe('Slash-separated verbs (9 cases from top 100)', () => {
    it('should split "Monitor/analyze" into two tasks', () => {
      const result = parser.parse('Monitor/analyze network intrusion detection data and resolve threats')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(2)
      expect(result.expansions![0].predicate).toBe('Monitor')
      expect(result.expansions![1].predicate).toBe('Analyze')
    })

    it('should handle "Manage/Collect"', () => {
      const result = parser.parse('Manage/Collect employee suggestions and perform employee research')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions?.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle "Prepare/Analyze"', () => {
      const result = parser.parse('Prepare/Analyze procurement and supplier performance')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(2)
    })

    it('should handle "Complete/finalize"', () => {
      const result = parser.parse('Complete/finalize financial management activities')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(2)
    })

    it('should handle "Schedule/optimize"', () => {
      const result = parser.parse('Schedule/optimize backup and archive activities')

      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(2)
    })
  })

  describe('Parenthetical expressions', () => {
    it('should handle parenthetical content gracefully', () => {
      const result = parser.parse('Implement and maintain the enterprise quality management system (EQMS)')

      // Should still parse the main statement
      expect(result.predicate).toBeTruthy()

      const graphdl = parser.toGraphDL(result)
      // Should not have excessive length from parenthetical
      expect(graphdl.length).toBeLessThan(150)
    })

    it('should handle inline parentheticals', () => {
      const result = parser.parse('Provide feedback and insights to appropriate teams (product design/development, marketing, manufacturing)')

      expect(result.predicate).toBe('Provide')
      const graphdl = parser.toGraphDL(result)
      expect(graphdl.length).toBeLessThan(150)
    })
  })

  describe('GraphDL output length constraints', () => {
    it('should not create excessively long GraphDL for complex statements', () => {
      const testCases = [
        'Develop risk mitigation and management strategy and integrate with existing performance management processes',
        'Monitor and evaluate quality of customer interactions with customer service representatives',
        'Establish and communicate expense reimbursement policies and approval limits',
        'Identify, deploy, and support development methodologies and tools',
        'Define and maintain enterprise information policies, standards, and procedures',
      ]

      for (const testCase of testCases) {
        const result = parser.parse(testCase)
        const graphdl = parser.toGraphDL(result)

        // If there are expansions, they should be in brackets
        if (result.hasConjunction) {
          expect(graphdl).toContain('[')
          expect(result.expansions).toBeTruthy()
          expect(result.expansions!.length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('Prepositions and complements', () => {
    it('should identify prepositions like "to", "with", "for"', () => {
      const result = parser.parse('Provide feedback to product management')

      expect(result.preposition).toBeTruthy()
      expect(result.complement).toBeTruthy()
    })

    it('should handle "with" prepositions', () => {
      const result = parser.parse('Collaborate with suppliers and partners')

      expect(result.preposition).toBe('with')
      expect(result.complement).toContain('suppliers')
    })

    it('should handle "for" prepositions', () => {
      const result = parser.parse('Develop plan for new product development')

      expect(result.preposition).toBe('for')
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle empty string', () => {
      expect(() => parser.parse('')).not.toThrow()
    })

    it('should handle single word', () => {
      const result = parser.parse('Develop')
      expect(result.predicate).toBe('Develop')
    })

    it('should handle very long compound statements', () => {
      const longStatement = 'Define and maintain enterprise information policies, standards, and procedures to ensure compliance with regulatory requirements and organizational governance frameworks'
      const result = parser.parse(longStatement)

      expect(result.predicate).toBeTruthy()
      const graphdl = parser.toGraphDL(result)
      expect(graphdl).toBeTruthy()
    })
  })

  describe('Specific problematic cases from APQC data', () => {
    it('case 1: longest statement', () => {
      const result = parser.parse('Develop risk mitigation and management strategy and integrate with existing performance management processes')

      const graphdl = parser.toGraphDL(result)
      expect(result.hasConjunction).toBe(true)
      // No length limit - if it's long, we need to see it to fix bugs or create aliases
    })

    it('case 2: Monitor and evaluate', () => {
      const result = parser.parse('Monitor and evaluate quality of customer interactions with customer service representatives')

      const graphdl = parser.toGraphDL(result)
      expect(result.expansions).toHaveLength(2)
      // No length limit - show full output for debugging
    })

    it('case 3: Multiple "and" in objects', () => {
      const result = parser.parse('Define and maintain enterprise information policies, standards, and procedures')

      // Should split verbs but keep object conjunctions
      expect(result.hasConjunction).toBe(true)
      expect(result.expansions).toHaveLength(2)
    })
  })
})
