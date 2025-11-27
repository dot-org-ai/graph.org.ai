---
$id: https://models.org.ai
$context: https://models.org.ai
name: models.org.ai
parent: tech.org.ai
license: CC-BY-SA-4.0
---

# models.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

AI and Machine Learning Models ontology.

## Overview

A comprehensive registry of AI models, their capabilities, providers, pricing, and use cases.

**Parents**: [graph.org.ai](https://graph.org.ai) > [tech.org.ai](https://tech.org.ai)

## Structure

```
models.org.ai/
├── README.md
├── package.json
├── index.ts
├── types.ts
│
├── [AIModel].mdx         # AI model template
├── Providers/            # AI service providers
│   └── [Provider].mdx
├── Capabilities/         # Model capabilities
│   └── [Capability].mdx
└── Modalities/           # Input/output modalities
    └── [Modality].mdx
```

## Model Types

| Type | Description |
|------|-------------|
| LLM | Large Language Models |
| Vision | Image understanding |
| Speech | Speech recognition/synthesis |
| Multimodal | Multiple input/output types |
| Embedding | Vector embeddings |
| Agent | Autonomous agents |

## Providers

| Provider | Models |
|----------|--------|
| Anthropic | Claude 3.5, Claude 4 |
| OpenAI | GPT-4, GPT-4o |
| Google | Gemini, PaLM |
| Meta | Llama 3 |
| Mistral | Mistral, Mixtral |

## Featured Models

| Model | Provider | Type | Context |
|-------|----------|------|---------|
| claude-3-5-sonnet | Anthropic | LLM | 200K |
| claude-3-opus | Anthropic | LLM | 200K |
| gpt-4o | OpenAI | Multimodal | 128K |
| gemini-1.5-pro | Google | Multimodal | 1M |
| llama-3.1-405b | Meta | LLM | 128K |

## Usage

```typescript
import { models, providers, AIModel } from 'models.org.ai'

// Get all models
const allModels = await models

// Get models by provider
const anthropicModels = await models.filter(m =>
  m.provider === 'anthropic'
)

// Get model capabilities
const claude = await models.get('claude-3-5-sonnet')
console.log(claude.capabilities)

// Compare pricing
const llms = await models.filter(m => m.type === 'llm')
const sorted = llms.sort((a, b) => a.pricing.input - b.pricing.input)
```

## Types

```typescript
interface AIModel {
  '@type': 'AIModel'
  '@id': string
  name: string
  provider: string
  version?: string
  releaseDate?: string
  modalities: {
    input: string[]
    output: string[]
  }
  capabilities: string[]
  contextWindow?: number
  maxOutput?: number
  pricing?: {
    input: number    // per 1M tokens
    output: number   // per 1M tokens
  }
  knowledgeCutoff?: string
}
```

## Cross-References

| System | Mapping |
|--------|---------|
| [agents.org.ai](https://agents.org.ai) | AI agents |
| [tech.org.ai](https://tech.org.ai) | Technology ontology |
| [apis.org.ai](https://apis.org.ai) | API specifications |

## License

Licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
