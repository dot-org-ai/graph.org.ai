import { GraphDLParser } from './graphdl-parser.js'

async function main() {
  const parser = new GraphDLParser()
  await parser.initialize()

  const test = "Define the business concept and long-term vision"

  console.log('Testing:', test)
  console.log()

  const result = parser.parse(test)

  console.log('Parsed:', JSON.stringify(result, null, 2))
  console.log()
  console.log('GraphDL:', parser.toGraphDL(result))
}

main().catch(console.error)
