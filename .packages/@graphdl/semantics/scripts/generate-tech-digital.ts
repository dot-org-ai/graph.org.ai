#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Generate Tech/Digital domain files:
 * - Models.tsv (AI/ML models)
 * - APIs.tsv (API types and protocols)
 * - Code.tsv (programming languages, paradigms, patterns)
 * - Security.tsv (vulnerabilities, security concerns)
 *
 * And generate relationship files linking these domains
 */

function toPascalCase(text: string): string {
  const articles = new Set(['the', 'a', 'an'])
  const conjunctions = new Set(['and', 'or', 'but', 'nor', 'so', 'yet'])
  const prepositions = new Set(['in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by'])

  const tokens = text.split(/[\s\-\/,;:()]+/).filter(t => t.trim())

  const result = tokens
    .filter(t => {
      const lower = t.toLowerCase()
      return !articles.has(lower) && !conjunctions.has(lower) && !prepositions.has(lower)
    })
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('')

  return result || text.replace(/\s+/g, '')
}

async function generateModels() {
  console.log('\n🤖 Generating Models.tsv...')

  const models: Array<{
    id: string
    name: string
    description: string
    type: string
    modality: string
  }> = []

  // AI/ML Model Types
  const modelData = [
    // Large Language Models
    { name: 'GPT-4', description: 'OpenAI\'s fourth-generation language model', type: 'LLM', modality: 'text' },
    { name: 'GPT-3.5', description: 'OpenAI\'s GPT-3.5 language model', type: 'LLM', modality: 'text' },
    { name: 'Claude', description: 'Anthropic\'s large language model', type: 'LLM', modality: 'text' },
    { name: 'Claude Sonnet', description: 'Anthropic\'s Claude Sonnet model', type: 'LLM', modality: 'text,vision' },
    { name: 'Claude Opus', description: 'Anthropic\'s most capable model', type: 'LLM', modality: 'text,vision' },
    { name: 'Claude Haiku', description: 'Anthropic\'s fastest model', type: 'LLM', modality: 'text,vision' },
    { name: 'PaLM', description: 'Google\'s Pathways Language Model', type: 'LLM', modality: 'text' },
    { name: 'Gemini', description: 'Google\'s multimodal AI model', type: 'LLM', modality: 'text,vision,audio' },
    { name: 'LLaMA', description: 'Meta\'s Large Language Model Meta AI', type: 'LLM', modality: 'text' },
    { name: 'Mistral', description: 'Mistral AI\'s language model', type: 'LLM', modality: 'text' },
    { name: 'BERT', description: 'Bidirectional Encoder Representations from Transformers', type: 'LLM', modality: 'text' },
    { name: 'T5', description: 'Text-to-Text Transfer Transformer', type: 'LLM', modality: 'text' },

    // Vision Models
    { name: 'DALL-E', description: 'OpenAI\'s text-to-image generation model', type: 'Vision', modality: 'text,image' },
    { name: 'Stable Diffusion', description: 'Open-source text-to-image diffusion model', type: 'Vision', modality: 'text,image' },
    { name: 'Midjourney', description: 'AI image generation model', type: 'Vision', modality: 'text,image' },
    { name: 'CLIP', description: 'Contrastive Language-Image Pre-training', type: 'Vision', modality: 'text,image' },
    { name: 'ViT', description: 'Vision Transformer', type: 'Vision', modality: 'image' },
    { name: 'ResNet', description: 'Residual Neural Network for image recognition', type: 'Vision', modality: 'image' },
    { name: 'YOLO', description: 'You Only Look Once object detection', type: 'Vision', modality: 'image' },

    // Audio Models
    { name: 'Whisper', description: 'OpenAI\'s speech recognition model', type: 'Audio', modality: 'audio' },
    { name: 'WaveNet', description: 'DeepMind\'s audio generation model', type: 'Audio', modality: 'audio' },
    { name: 'Tacotron', description: 'Text-to-speech synthesis model', type: 'Audio', modality: 'text,audio' },

    // Embedding Models
    { name: 'Word2Vec', description: 'Word embedding model', type: 'Embedding', modality: 'text' },
    { name: 'GloVe', description: 'Global Vectors for word representation', type: 'Embedding', modality: 'text' },
    { name: 'FastText', description: 'Word embeddings with subword information', type: 'Embedding', modality: 'text' },
    { name: 'Sentence-BERT', description: 'Sentence embeddings using BERT', type: 'Embedding', modality: 'text' },

    // Specialized Models
    { name: 'CodeLlama', description: 'Meta\'s code generation model', type: 'Code', modality: 'text,code' },
    { name: 'Codex', description: 'OpenAI\'s code generation model', type: 'Code', modality: 'text,code' },
    { name: 'AlphaCode', description: 'DeepMind\'s competitive programming model', type: 'Code', modality: 'text,code' },
    { name: 'CodeGen', description: 'Salesforce\'s code generation model', type: 'Code', modality: 'text,code' },
    { name: 'StarCoder', description: 'Open-source code generation model', type: 'Code', modality: 'text,code' },
  ]

  for (const model of modelData) {
    const id = toPascalCase(model.name)
    models.push({
      id,
      name: model.name,
      description: model.description,
      type: model.type,
      modality: model.modality
    })
  }

  models.sort((a, b) => a.id.localeCompare(b.id))

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')
  const modelsPath = path.join(dataDir, 'Models.tsv')
  const headers = ['id', 'name', 'description', 'type', 'modality']
  const rows = models.map(m =>
    `${m.id}\t${m.name}\t${m.description}\t${m.type}\t${m.modality}`
  )

  fs.writeFileSync(modelsPath, headers.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ Models.tsv (${models.length} AI/ML models)`)

  return models
}

async function generateAPIs() {
  console.log('\n🌐 Generating APIs.tsv...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const apis: Array<{
    id: string
    name: string
    description: string
    type: string
    protocol: string
  }> = []

  // Extract APIs from Apps data
  const appsPath = path.join(dataDir, 'Apps.tsv')
  const appsContent = fs.readFileSync(appsPath, 'utf-8')
  const appsLines = appsContent.split('\n')

  const seen = new Set<string>()

  // Add common API types
  const apiTypes = [
    { name: 'REST API', description: 'Representational State Transfer API', type: 'Web Service', protocol: 'HTTP' },
    { name: 'GraphQL API', description: 'Query language for APIs', type: 'Web Service', protocol: 'HTTP' },
    { name: 'SOAP API', description: 'Simple Object Access Protocol API', type: 'Web Service', protocol: 'HTTP' },
    { name: 'WebSocket API', description: 'Real-time bidirectional communication', type: 'Web Service', protocol: 'WebSocket' },
    { name: 'gRPC API', description: 'High-performance RPC framework', type: 'Web Service', protocol: 'HTTP/2' },
    { name: 'OpenAPI', description: 'API specification standard', type: 'Standard', protocol: 'HTTP' },
    { name: 'Webhook', description: 'HTTP callback for event notifications', type: 'Event-Driven', protocol: 'HTTP' },
    { name: 'JSON-RPC', description: 'Remote procedure call using JSON', type: 'RPC', protocol: 'HTTP' },
    { name: 'XML-RPC', description: 'Remote procedure call using XML', type: 'RPC', protocol: 'HTTP' },
    { name: 'SSE', description: 'Server-Sent Events for real-time updates', type: 'Streaming', protocol: 'HTTP' },
    { name: 'OAuth API', description: 'Authorization framework API', type: 'Authentication', protocol: 'HTTP' },
    { name: 'SAML API', description: 'Security Assertion Markup Language API', type: 'Authentication', protocol: 'HTTP' },
    { name: 'OpenID Connect', description: 'Identity layer on OAuth 2.0', type: 'Authentication', protocol: 'HTTP' },
    { name: 'MQTT', description: 'Message Queuing Telemetry Transport', type: 'IoT', protocol: 'TCP' },
    { name: 'CoAP', description: 'Constrained Application Protocol', type: 'IoT', protocol: 'UDP' },
    { name: 'AMQP', description: 'Advanced Message Queuing Protocol', type: 'Messaging', protocol: 'TCP' },
    { name: 'STOMP', description: 'Simple Text Oriented Messaging Protocol', type: 'Messaging', protocol: 'TCP' },
    { name: 'Kafka API', description: 'Distributed streaming platform API', type: 'Streaming', protocol: 'TCP' },
    { name: 'Redis API', description: 'In-memory data structure store API', type: 'Database', protocol: 'TCP' },
    { name: 'MongoDB API', description: 'NoSQL document database API', type: 'Database', protocol: 'TCP' },
  ]

  for (const api of apiTypes) {
    const id = toPascalCase(api.name)
    if (!seen.has(id)) {
      seen.add(id)
      apis.push({
        id,
        name: api.name,
        description: api.description,
        type: api.type,
        protocol: api.protocol
      })
    }
  }

  // Extract API references from Apps
  for (let i = 1; i < appsLines.length; i++) {
    const line = appsLines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const appName = cols[1]

    if (!appName) continue

    // Generate API entry for each app
    const apiId = toPascalCase(appName + ' API')
    if (!seen.has(apiId)) {
      seen.add(apiId)
      apis.push({
        id: apiId,
        name: appName + ' API',
        description: `API for ${appName} integration`,
        type: 'Integration',
        protocol: 'HTTP'
      })
    }
  }

  apis.sort((a, b) => a.id.localeCompare(b.id))

  const apisPath = path.join(dataDir, 'APIs.tsv')
  const headers = ['id', 'name', 'description', 'type', 'protocol']
  const rows = apis.map(a =>
    `${a.id}\t${a.name}\t${a.description}\t${a.type}\t${a.protocol}`
  )

  fs.writeFileSync(apisPath, headers.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ APIs.tsv (${apis.length} API types)`)

  return apis
}

async function generateCode() {
  console.log('\n💻 Generating Code.tsv...')

  const code: Array<{
    id: string
    name: string
    description: string
    language: string
    paradigm: string
  }> = []

  // Programming languages and paradigms
  const codeData = [
    // Languages
    { name: 'JavaScript', description: 'High-level programming language for web development', language: 'JavaScript', paradigm: 'Multi-paradigm' },
    { name: 'TypeScript', description: 'Typed superset of JavaScript', language: 'TypeScript', paradigm: 'Multi-paradigm' },
    { name: 'Python', description: 'High-level general-purpose programming language', language: 'Python', paradigm: 'Multi-paradigm' },
    { name: 'Java', description: 'Object-oriented programming language', language: 'Java', paradigm: 'Object-Oriented' },
    { name: 'C#', description: 'Multi-paradigm language by Microsoft', language: 'C#', paradigm: 'Multi-paradigm' },
    { name: 'C++', description: 'General-purpose programming language', language: 'C++', paradigm: 'Multi-paradigm' },
    { name: 'Go', description: 'Statically typed compiled language by Google', language: 'Go', paradigm: 'Concurrent' },
    { name: 'Rust', description: 'Systems programming language focused on safety', language: 'Rust', paradigm: 'Multi-paradigm' },
    { name: 'Ruby', description: 'Dynamic object-oriented language', language: 'Ruby', paradigm: 'Object-Oriented' },
    { name: 'PHP', description: 'Server-side scripting language', language: 'PHP', paradigm: 'Multi-paradigm' },
    { name: 'Swift', description: 'Apple\'s programming language for iOS', language: 'Swift', paradigm: 'Multi-paradigm' },
    { name: 'Kotlin', description: 'Modern language for JVM and Android', language: 'Kotlin', paradigm: 'Multi-paradigm' },
    { name: 'R', description: 'Language for statistical computing', language: 'R', paradigm: 'Functional' },
    { name: 'Scala', description: 'Functional and object-oriented language', language: 'Scala', paradigm: 'Multi-paradigm' },
    { name: 'Haskell', description: 'Purely functional programming language', language: 'Haskell', paradigm: 'Functional' },
    { name: 'Clojure', description: 'Functional Lisp dialect on JVM', language: 'Clojure', paradigm: 'Functional' },
    { name: 'Elixir', description: 'Functional language for scalable applications', language: 'Elixir', paradigm: 'Functional' },
    { name: 'Dart', description: 'Client-optimized language for apps', language: 'Dart', paradigm: 'Object-Oriented' },
    { name: 'SQL', description: 'Domain-specific language for databases', language: 'SQL', paradigm: 'Declarative' },
    { name: 'HTML', description: 'Markup language for web pages', language: 'HTML', paradigm: 'Markup' },
    { name: 'CSS', description: 'Style sheet language for web pages', language: 'CSS', paradigm: 'Declarative' },

    // Paradigms and Patterns
    { name: 'Object-Oriented Programming', description: 'Programming based on objects and classes', language: 'General', paradigm: 'Object-Oriented' },
    { name: 'Functional Programming', description: 'Programming with pure functions and immutability', language: 'General', paradigm: 'Functional' },
    { name: 'Procedural Programming', description: 'Programming with procedures and routines', language: 'General', paradigm: 'Procedural' },
    { name: 'Reactive Programming', description: 'Programming with asynchronous data streams', language: 'General', paradigm: 'Reactive' },
    { name: 'Event-Driven Programming', description: 'Programming based on events and handlers', language: 'General', paradigm: 'Event-Driven' },
    { name: 'Declarative Programming', description: 'Programming that expresses logic without control flow', language: 'General', paradigm: 'Declarative' },

    // Design Patterns
    { name: 'Singleton Pattern', description: 'Ensures a class has only one instance', language: 'General', paradigm: 'Design Pattern' },
    { name: 'Factory Pattern', description: 'Creates objects without specifying exact class', language: 'General', paradigm: 'Design Pattern' },
    { name: 'Observer Pattern', description: 'Notifies dependents of state changes', language: 'General', paradigm: 'Design Pattern' },
    { name: 'Strategy Pattern', description: 'Defines family of algorithms', language: 'General', paradigm: 'Design Pattern' },
    { name: 'Decorator Pattern', description: 'Adds behavior to objects dynamically', language: 'General', paradigm: 'Design Pattern' },
    { name: 'MVC Pattern', description: 'Model-View-Controller architectural pattern', language: 'General', paradigm: 'Architecture' },
    { name: 'MVVM Pattern', description: 'Model-View-ViewModel architectural pattern', language: 'General', paradigm: 'Architecture' },
    { name: 'Microservices Pattern', description: 'Architectural style with small services', language: 'General', paradigm: 'Architecture' },
    { name: 'Serverless Pattern', description: 'Cloud architecture without server management', language: 'General', paradigm: 'Architecture' },
  ]

  for (const item of codeData) {
    const id = toPascalCase(item.name)
    code.push({
      id,
      name: item.name,
      description: item.description,
      language: item.language,
      paradigm: item.paradigm
    })
  }

  code.sort((a, b) => a.id.localeCompare(b.id))

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')
  const codePath = path.join(dataDir, 'Code.tsv')
  const headers = ['id', 'name', 'description', 'language', 'paradigm']
  const rows = code.map(c =>
    `${c.id}\t${c.name}\t${c.description}\t${c.language}\t${c.paradigm}`
  )

  fs.writeFileSync(codePath, headers.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ Code.tsv (${code.length} languages, paradigms, and patterns)`)

  return code
}

async function generateSecurity() {
  console.log('\n🔒 Generating Security.tsv...')

  const security: Array<{
    id: string
    name: string
    description: string
    category: string
    severity: string
  }> = []

  // OWASP Top 10 and common security concerns
  const securityData = [
    // OWASP Top 10 2021
    { name: 'Broken Access Control', description: 'Unauthorized access to resources', category: 'OWASP Top 10', severity: 'Critical' },
    { name: 'Cryptographic Failures', description: 'Weak or missing encryption', category: 'OWASP Top 10', severity: 'High' },
    { name: 'Injection', description: 'SQL, NoSQL, OS command injection', category: 'OWASP Top 10', severity: 'Critical' },
    { name: 'Insecure Design', description: 'Security design flaws', category: 'OWASP Top 10', severity: 'High' },
    { name: 'Security Misconfiguration', description: 'Insecure default configurations', category: 'OWASP Top 10', severity: 'High' },
    { name: 'Vulnerable Components', description: 'Use of vulnerable dependencies', category: 'OWASP Top 10', severity: 'High' },
    { name: 'Authentication Failures', description: 'Weak authentication mechanisms', category: 'OWASP Top 10', severity: 'Critical' },
    { name: 'Data Integrity Failures', description: 'Unverified software updates', category: 'OWASP Top 10', severity: 'High' },
    { name: 'Logging Failures', description: 'Insufficient logging and monitoring', category: 'OWASP Top 10', severity: 'Medium' },
    { name: 'SSRF', description: 'Server-Side Request Forgery', category: 'OWASP Top 10', severity: 'High' },

    // Common Vulnerabilities
    { name: 'XSS', description: 'Cross-Site Scripting vulnerability', category: 'Web Security', severity: 'High' },
    { name: 'CSRF', description: 'Cross-Site Request Forgery', category: 'Web Security', severity: 'Medium' },
    { name: 'SQL Injection', description: 'Database query manipulation', category: 'Injection', severity: 'Critical' },
    { name: 'Command Injection', description: 'OS command execution', category: 'Injection', severity: 'Critical' },
    { name: 'Path Traversal', description: 'Unauthorized file system access', category: 'Access Control', severity: 'High' },
    { name: 'XXE', description: 'XML External Entity attack', category: 'Injection', severity: 'High' },
    { name: 'LDAP Injection', description: 'LDAP query manipulation', category: 'Injection', severity: 'High' },
    { name: 'Buffer Overflow', description: 'Memory corruption vulnerability', category: 'Memory Safety', severity: 'Critical' },
    { name: 'Race Condition', description: 'Timing-dependent security flaw', category: 'Concurrency', severity: 'Medium' },
    { name: 'DoS', description: 'Denial of Service attack', category: 'Availability', severity: 'High' },
    { name: 'DDoS', description: 'Distributed Denial of Service', category: 'Availability', severity: 'Critical' },

    // Authentication & Authorization
    { name: 'Weak Password Policy', description: 'Insufficient password requirements', category: 'Authentication', severity: 'High' },
    { name: 'Session Hijacking', description: 'Unauthorized session takeover', category: 'Authentication', severity: 'High' },
    { name: 'Session Fixation', description: 'Session ID manipulation', category: 'Authentication', severity: 'Medium' },
    { name: 'Privilege Escalation', description: 'Unauthorized privilege gain', category: 'Authorization', severity: 'Critical' },
    { name: 'Insecure JWT', description: 'Weak JSON Web Token implementation', category: 'Authentication', severity: 'High' },
    { name: 'OAuth Misconfiguration', description: 'Improper OAuth setup', category: 'Authentication', severity: 'High' },

    // Data Security
    { name: 'Data Leak', description: 'Unintentional data exposure', category: 'Data Security', severity: 'Critical' },
    { name: 'Sensitive Data Exposure', description: 'Unprotected sensitive information', category: 'Data Security', severity: 'Critical' },
    { name: 'PII Exposure', description: 'Personal Identifiable Information leak', category: 'Privacy', severity: 'Critical' },
    { name: 'Insecure Deserialization', description: 'Unsafe object deserialization', category: 'Data Security', severity: 'High' },

    // Network Security
    { name: 'Man-in-the-Middle', description: 'Intercepting network communications', category: 'Network Security', severity: 'Critical' },
    { name: 'Insecure TLS', description: 'Weak transport layer security', category: 'Network Security', severity: 'High' },
    { name: 'Open Redirect', description: 'Unvalidated URL redirection', category: 'Web Security', severity: 'Medium' },
    { name: 'CORS Misconfiguration', description: 'Improper cross-origin resource sharing', category: 'Web Security', severity: 'Medium' },

    // API Security
    { name: 'API Rate Limiting', description: 'Missing or weak rate limits', category: 'API Security', severity: 'Medium' },
    { name: 'API Authentication', description: 'Weak API authentication', category: 'API Security', severity: 'High' },
    { name: 'API Injection', description: 'API parameter manipulation', category: 'API Security', severity: 'High' },
    { name: 'GraphQL Injection', description: 'GraphQL query manipulation', category: 'API Security', severity: 'High' },

    // Cloud Security
    { name: 'Cloud Misconfiguration', description: 'Insecure cloud resource settings', category: 'Cloud Security', severity: 'Critical' },
    { name: 'S3 Bucket Exposure', description: 'Publicly accessible S3 buckets', category: 'Cloud Security', severity: 'Critical' },
    { name: 'IAM Misconfiguration', description: 'Improper identity and access management', category: 'Cloud Security', severity: 'High' },

    // Container Security
    { name: 'Container Escape', description: 'Breaking out of container isolation', category: 'Container Security', severity: 'Critical' },
    { name: 'Vulnerable Container Image', description: 'Container with known vulnerabilities', category: 'Container Security', severity: 'High' },
    { name: 'Insecure Container Registry', description: 'Unprotected container registry', category: 'Container Security', severity: 'Medium' },
  ]

  for (const item of securityData) {
    const id = toPascalCase(item.name)
    security.push({
      id,
      name: item.name,
      description: item.description,
      category: item.category,
      severity: item.severity
    })
  }

  security.sort((a, b) => a.id.localeCompare(b.id))

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')
  const securityPath = path.join(dataDir, 'Security.tsv')
  const headers = ['id', 'name', 'description', 'category', 'severity']
  const rows = security.map(s =>
    `${s.id}\t${s.name}\t${s.description}\t${s.category}\t${s.severity}`
  )

  fs.writeFileSync(securityPath, headers.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ Security.tsv (${security.length} security concerns)`)

  return security
}

async function generateRelationships() {
  console.log('\n🔗 Generating Relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Read Tech.tsv for technology relationships
  const techPath = path.join(dataDir, 'Tech.tsv')
  const techContent = fs.readFileSync(techPath, 'utf-8')
  const techLines = techContent.split('\n')
  const techNames = new Set<string>()

  for (let i = 1; i < techLines.length; i++) {
    const line = techLines[i]
    if (!line.trim()) continue
    const cols = line.split('\t')
    techNames.add(cols[0]) // id
  }

  // Read Apps.tsv
  const appsPath = path.join(dataDir, 'Apps.tsv')
  const appsContent = fs.readFileSync(appsPath, 'utf-8')
  const appsLines = appsContent.split('\n')

  // APIs.Apps.tsv - Link APIs to Apps
  const apisApps: Array<{ apiId: string; appId: string }> = []

  for (let i = 1; i < appsLines.length; i++) {
    const line = appsLines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const appId = cols[0]
    const appName = cols[1]

    if (!appId || !appName) continue

    const apiId = toPascalCase(appName + ' API')
    apisApps.push({ apiId, appId })
  }

  const apisAppsPath = path.join(dataDir, 'APIs.Apps.tsv')
  const apisAppsHeaders = ['apiId', 'appId']
  const apisAppsRows = apisApps.map(r => `${r.apiId}\t${r.appId}`)
  fs.writeFileSync(apisAppsPath, apisAppsHeaders.join('\t') + '\n' + apisAppsRows.join('\n'))
  console.log(`  ✓ APIs.Apps.tsv (${apisApps.length} relationships)`)

  // Models.Tech.tsv - Link ML models to technologies
  const modelsTech: Array<{ modelId: string; techId: string }> = [
    // Link models to relevant technologies
    { modelId: 'Gpt4', techId: 'Python' },
    { modelId: 'Gpt4', techId: 'Api' },
    { modelId: 'Claude', techId: 'Python' },
    { modelId: 'Claude', techId: 'Api' },
    { modelId: 'StableDiffusion', techId: 'Python' },
    { modelId: 'Whisper', techId: 'Python' },
  ]

  const modelsTechPath = path.join(dataDir, 'Models.Tech.tsv')
  const modelsTechHeaders = ['modelId', 'techId']
  const modelsTechRows = modelsTech.map(r => `${r.modelId}\t${r.techId}`)
  fs.writeFileSync(modelsTechPath, modelsTechHeaders.join('\t') + '\n' + modelsTechRows.join('\n'))
  console.log(`  ✓ Models.Tech.tsv (${modelsTech.length} relationships)`)

  // Code.Tech.tsv - Link programming languages to technologies
  const codeTech: Array<{ codeId: string; techId: string }> = []

  // Link languages found in Tech data
  const languageKeywords = ['javascript', 'python', 'java', 'typescript', 'ruby', 'php', 'go', 'rust', 'swift', 'kotlin']

  for (const lang of languageKeywords) {
    const langId = toPascalCase(lang)
    for (const techId of techNames) {
      if (techId.toLowerCase().includes(lang)) {
        codeTech.push({ codeId: langId, techId })
      }
    }
  }

  const codeTechPath = path.join(dataDir, 'Code.Tech.tsv')
  const codeTechHeaders = ['codeId', 'techId']
  const codeTechRows = codeTech.map(r => `${r.codeId}\t${r.techId}`)
  fs.writeFileSync(codeTechPath, codeTechHeaders.join('\t') + '\n' + codeTechRows.join('\n'))
  console.log(`  ✓ Code.Tech.tsv (${codeTech.length} relationships)`)

  // Security.Tech.tsv - Link security concerns to technologies
  const securityTech: Array<{ securityId: string; techId: string }> = [
    // Web technologies and their common vulnerabilities
    { securityId: 'Xss', techId: 'Javascript' },
    { securityId: 'Csrf', techId: 'Javascript' },
    { securityId: 'SqlInjection', techId: 'Sql' },
    { securityId: 'SqlInjection', techId: 'Mysql' },
    { securityId: 'SqlInjection', techId: 'Postgresql' },
  ]

  const securityTechPath = path.join(dataDir, 'Security.Tech.tsv')
  const securityTechHeaders = ['securityId', 'techId']
  const securityTechRows = securityTech.map(r => `${r.securityId}\t${r.techId}`)
  fs.writeFileSync(securityTechPath, securityTechHeaders.join('\t') + '\n' + securityTechRows.join('\n'))
  console.log(`  ✓ Security.Tech.tsv (${securityTech.length} relationships)`)

  // APIs.Integrations.tsv - Link APIs to integration actions
  const actionsPath = path.join(dataDir, 'Actions.tsv')
  const actionsContent = fs.readFileSync(actionsPath, 'utf-8')
  const actionsLines = actionsContent.split('\n')
  const actionsHeaders = actionsLines[0].split('\t')
  const appSlugIdx = actionsHeaders.indexOf('appSlug')
  const appNameIdx = actionsHeaders.indexOf('appName')

  const apisIntegrations: Array<{ apiId: string; actionId: string }> = []

  for (let i = 1; i < Math.min(actionsLines.length, 1000); i++) {
    const line = actionsLines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const actionId = cols[0]
    const appName = cols[appNameIdx]

    if (!actionId || !appName) continue

    const apiId = toPascalCase(appName + ' API')
    apisIntegrations.push({ apiId, actionId })
  }

  const apisIntegrationsPath = path.join(dataDir, 'APIs.Integrations.tsv')
  const apisIntegrationsHeaders = ['apiId', 'actionId']
  const apisIntegrationsRows = apisIntegrations.map(r => `${r.apiId}\t${r.actionId}`)
  fs.writeFileSync(apisIntegrationsPath, apisIntegrationsHeaders.join('\t') + '\n' + apisIntegrationsRows.join('\n'))
  console.log(`  ✓ APIs.Integrations.tsv (${apisIntegrations.length} relationships)`)

  return {
    apisApps: apisApps.length,
    modelsTech: modelsTech.length,
    codeTech: codeTech.length,
    securityTech: securityTech.length,
    apisIntegrations: apisIntegrations.length
  }
}

async function main() {
  console.log('='.repeat(100))
  console.log('TECH/DIGITAL DOMAIN GENERATION')
  console.log('='.repeat(100))

  const models = await generateModels()
  const apis = await generateAPIs()
  const code = await generateCode()
  const security = await generateSecurity()
  const relationships = await generateRelationships()

  console.log('\n' + '='.repeat(100))
  console.log('✅ Tech/Digital domain files generated!')
  console.log('='.repeat(100))
  console.log('\nSummary:')
  console.log(`  Models:      ${models.length} records`)
  console.log(`  APIs:        ${apis.length} records`)
  console.log(`  Code:        ${code.length} records`)
  console.log(`  Security:    ${security.length} records`)
  console.log(`\nRelationships:`)
  console.log(`  APIs.Apps:           ${relationships.apisApps} links`)
  console.log(`  Models.Tech:         ${relationships.modelsTech} links`)
  console.log(`  Code.Tech:           ${relationships.codeTech} links`)
  console.log(`  Security.Tech:       ${relationships.securityTech} links`)
  console.log(`  APIs.Integrations:   ${relationships.apisIntegrations} links`)
  console.log('='.repeat(100))
}

main().catch(console.error)
