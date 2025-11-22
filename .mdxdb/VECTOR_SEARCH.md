# Vector Search with AI Embeddings

This directory includes vector search capabilities using Google's Gemini embeddings for semantic search across the knowledge graph.

## Setup

1. **Get a Google API Key**
   - Visit https://aistudio.google.com/app/apikey
   - Create a new API key
   - Copy it to your `.env` file

2. **Optional: Set up Cloudflare AI Gateway**
   - Visit https://dash.cloudflare.com/ai/ai-gateway
   - Create a new gateway
   - Copy the gateway URL to your `.env` file

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   CLOUDFLARE_AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/...
   ```

## Generate Embeddings

Generate embeddings for all things in the database:

```bash
tsx .scripts/generate-embeddings.ts
```

This will:
- Read all 164,204 things from `things.db`
- Generate embeddings using `gemini-embedding-001`
- Store embeddings in the `searches` table
- Process in batches of 100 to avoid rate limits
- Take approximately 30-40 minutes to complete

## Usage

### Semantic Search

```typescript
import { semanticSearch } from './.mdxdb/vector-search.js'

// Search across all things
const results = await semanticSearch('leadership and management', {
  limit: 10,
  threshold: 0.6
})

// Search within a specific namespace
const occupations = await semanticSearch('software development', {
  limit: 5,
  namespace: 'onet',
  type: 'Occupation'
})

// Search for products
const products = await semanticSearch('pets and animals', {
  limit: 10,
  namespace: 'unspsc',
  type: 'Commodity'
})
```

### Find Similar Things

```typescript
import { findSimilar } from './.mdxdb/vector-search.js'

// Find similar things (any type)
const similar = await findSimilar('https://occupations.org.ai/ChiefExecutives', {
  limit: 10,
  threshold: 0.7
})

// Find similar things of a specific type
const similarOccupations = await findSimilar('https://occupations.org.ai/ChiefExecutives', {
  limit: 5,
  type: 'Occupation',
  threshold: 0.7
})

// Find similar things across multiple types
const skillsAndKnowledge = await findSimilar('https://occupations.org.ai/ChiefExecutives', {
  limit: 10,
  types: ['Skill', 'Knowledge'],
  threshold: 0.6
})
```

### Find Similar by Type

Get the top N most similar things for each specified type:

```typescript
import { findSimilarByType } from './.mdxdb/vector-search.js'

// Get top 5 similar things for each type
const byType = await findSimilarByType('https://occupations.org.ai/ChiefExecutives', {
  types: ['Occupation', 'Skill', 'Knowledge', 'Process'],
  limitPerType: 5,
  threshold: 0.6
})

// Returns: Map<string, SearchResult[]>
for (const [type, results] of byType.entries()) {
  console.log(`${type}:`, results.length, 'results')
}
```

### Find Most Similar of Each Type

Get the single best match for each type in the database:

```typescript
import { findMostSimilarOfEachType } from './.mdxdb/vector-search.js'

// Find the most similar thing of each type
const bestMatches = await findMostSimilarOfEachType('https://occupations.org.ai/ChiefExecutives', {
  threshold: 0.5,
  excludeTypes: ['Type', 'Property'] // Optionally exclude certain types
})

// Returns: Map<string, SearchResult>
for (const [type, result] of bestMatches.entries()) {
  console.log(`Best ${type}: ${result.thing.url} (${result.score.toFixed(4)})`)
}
```

## Demos

Run the vector search demos:

```bash
# Basic semantic search
tsx .scripts/demo-vector-search.ts

# Advanced similarity search with type filtering
tsx .scripts/demo-similarity.ts
```

## Embedding Model

- **Model**: `gemini-embedding-001`
- **Dimensions**: 768
- **Provider**: Google Generative AI
- **Cost**: Free tier available

## Database Schema

Embeddings are stored in the `searches` table:

```sql
CREATE TABLE searches (
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL,           -- Reference to thing
  text TEXT NOT NULL,           -- Searchable text
  embedding BLOB,               -- Vector embedding (Float32Array)
  meta JSON,                    -- Metadata (ns, type, model, etc.)
  created_at INTEGER
);
```

## Performance

- **Similarity Calculation**: Cosine similarity in-memory
- **Search Time**: ~100-500ms for 164K embeddings
- **Storage**: ~125MB for 164K embeddings (768 dimensions each)

## Future Improvements

1. **SQLite VSS Extension**
   - Use [sqlite-vss](https://github.com/asg017/sqlite-vss) for faster vector search
   - Build approximate nearest neighbor (ANN) indices

2. **Chunking**
   - Split large content into smaller chunks
   - Store multiple embeddings per thing
   - Better granularity for long descriptions

3. **Hybrid Search**
   - Combine vector search with keyword search
   - Rerank results for better relevance

4. **Caching**
   - Cache query embeddings
   - Cache similarity calculations
   - Reduce API calls
