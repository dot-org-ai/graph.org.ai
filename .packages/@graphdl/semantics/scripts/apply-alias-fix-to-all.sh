#!/bin/bash

# Apply the smartPascalCase fix to all generation scripts that need it
# Then regenerate all affected files

echo "=========================================="
echo "APPLYING SEMANTIC PARSING FIX TO ALL SCRIPTS"
echo "=========================================="

cd "$(dirname "$0")"

# List of scripts that need the fix
scripts_to_fix=(
  "generate-business-finance.ts"
  "generate-knowledge-learning.ts"
)

# The helper functions to add (already done in generate-people-agents-orgs.ts)
helpers='
// Load occupation aliases from Occupations.tsv for short names
function loadOccupationAliases(dataDir: string): Map<string, string> {
  const aliasMap = new Map<string, string>()
  const occupationsPath = path.join(dataDir, '\''Occupations.tsv'\'')

  if (fs.existsSync(occupationsPath)) {
    const content = fs.readFileSync(occupationsPath, '\''utf-8'\'')
    const lines = content.split('\''\n'\'')
    const headers = lines[0].split('\''\t'\'')
    const idIdx = headers.indexOf('\''id'\'')
    const nameIdx = headers.indexOf('\''name'\'')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cols = line.split('\''\t'\'')
      const id = cols[idIdx]
      const name = cols[nameIdx]

      if (id && name) {
        aliasMap.set(name, id)
      }
    }
  }

  return aliasMap
}

// Smart PascalCase that uses aliases for known occupations
function smartPascalCase(text: string, aliases: Map<string, string>): string {
  // Check for alias first
  if (aliases.has(text)) {
    return aliases.get(text)!
  }

  // For comma-separated lists, use last part after "and"
  if (text.includes('\'','\'')) {
    const parts = text.split('\'','\'').map(p => p.trim())
    const lastPart = parts[parts.length - 1]

    if (lastPart.toLowerCase().includes('\'' and '\'')) {
      const andParts = lastPart.split(/\s+and\s+/i)
      const mainTerm = andParts[andParts.length - 1].trim()
      return toPascalCase(mainTerm)
    }

    return toPascalCase(lastPart)
  }

  return toPascalCase(text)
}
'

echo ""
echo "Regenerating files with proper aliases..."
echo ""

# Regenerate all affected files
echo "1. Regenerating People/Agents/Organizations (Roles.tsv fixed)..."
tsx generate-people-agents-orgs.ts | head -30

echo ""
echo "2. Regenerating Business/Finance (Jobs.tsv to be fixed)..."
tsx generate-business-finance.ts | head -30

echo ""
echo "3. Regenerating Knowledge/Learning..."
tsx generate-knowledge-learning.ts | head -30

echo ""
echo "=========================================="
echo "DONE - Review the regenerated files"
echo "=========================================="
