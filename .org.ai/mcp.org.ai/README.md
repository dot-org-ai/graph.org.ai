---
$id: https://mcp.org.ai
$context: https://mcp.org.ai
name: mcp.org.ai
parent: agents.org.ai
license: CC-BY-SA-4.0
---

# mcp.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Comprehensive ontology and documentation for the Model Context Protocol (MCP) - a standardized framework enabling seamless integration between AI models and external systems, tools, and data sources.

## Overview

The Model Context Protocol is an open protocol that allows AI models (particularly Claude) to safely access external capabilities on-demand. This domain contains comprehensive documentation covering all aspects of MCP: architecture, server implementation, client integration, tool specifications, resource management, and transport mechanisms.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [agents.org.ai](https://agents.org.ai)

## Hierarchy

```
graph.org.ai
    └── schema.org.ai
        └── nouns.org.ai
            └── agents.org.ai
                └── mcp.org.ai
```

## Documentation Structure

### Core Guides

#### 1. [MCPOverview.mdx](./MCPOverview.mdx)
**Model Context Protocol Overview**

Comprehensive introduction to MCP covering:
- Core philosophy and principles
- Key components (servers, clients, transports, protocols)
- Architecture overview and interaction patterns
- Core capabilities: tools, resources, sampling
- Benefits for AI developers, tool providers, and end users
- Use cases across development, data analysis, business, and creativity
- Security considerations and future directions

**Audience:** Architects, system designers, decision makers

#### 2. [MCPServers.mdx](./MCPServers.mdx)
**MCP Server Implementation**

Complete server-side implementation guide:
- Server architecture and core components
- Tool registration and specification
- Tool categories: query, action, analysis, integration
- Practical tool implementation examples
- Resource provider implementation
- Resource URI patterns and templates
- Server initialization and configuration
- Connection setup (stdio, HTTP, WebSocket)
- Capabilities declaration
- Error handling strategies
- Performance optimization techniques
- Monitoring, logging, and health checks
- Best practices and deployment guidelines

**Audience:** Backend developers, tool providers, API developers

#### 3. [MCPClients.mdx](./MCPClients.mdx)
**MCP Client Integration**

Complete client-side implementation guide:
- Client architecture and core components
- Client initialization for various transports
- Server discovery and dynamic configuration
- Tool discovery and execution
- Resource management and access
- Connection lifecycle management
- Claude Desktop integration
- IDE plugin development (VS Code example)
- Error handling and resilience
- Timeout management and rate limiting
- Performance optimization (batching, caching)
- Logging and debugging strategies
- Integration with AI models

**Audience:** Frontend developers, IDE developers, application builders

#### 4. [MCPTools.mdx](./MCPTools.mdx)
**Tool Definitions and Examples**

Comprehensive tool specification guide:
- Tool structure and definition
- Input schema specification (JSON Schema)
- Basic types and constraints
- Complex nested schemas
- Conditional schemas
- Return types and result structures
- Five detailed practical examples:
  - Data query tool (product search)
  - File manipulation tool
  - API execution tool
  - Code analysis tool
  - Image generation tool
- Best practices for schema design
- Implementation guidelines
- Performance considerations
- Documentation standards

**Audience:** Tool developers, API designers, documentation writers

#### 5. [MCPResources.mdx](./MCPResources.mdx)
**Resources and URI Schemes**

Complete resource management guide:
- Resource fundamentals and definitions
- Resource vs tools comparison
- URI schemes and patterns (file, db, HTTP, custom)
- URI templates and dynamic resources
- Resource types:
  - Text resources (Markdown, plain text, CSV)
  - Structured resources (JSON, JSON-LD, XML)
  - Binary resources (images, PDFs, archives)
  - Real-time resources (metrics, streams, feeds)
- Dynamic resource provider implementation
- Template-based resource patterns
- Resource subscriptions and updates
- Access control and security
- Input sanitization
- Resource implementation patterns
- Best practices and optimization

**Audience:** Backend developers, data architects, integration specialists

#### 6. [MCPTransports.mdx](./MCPTransports.mdx)
**Transport Mechanisms**

Complete transport layer guide:
- Transport overview and types comparison
- JSON-RPC 2.0 message structure
- **Stdio Transport:**
  - Process-based communication
  - Client and server implementation
  - Configuration examples
- **HTTP Transport:**
  - REST-like semantics
  - Request/response flow
  - Authentication and middleware
  - Error handling
  - Express implementation
- **Server-Sent Events (SSE):**
  - Unidirectional server-to-client streaming
  - Client and server implementation
  - Resource streaming patterns
- **WebSocket Transport:**
  - True bidirectional communication
  - Client and server implementation
  - ws library and Socket.io examples
  - Bidirectional streaming
- **Transport selection guide**
- Comparison matrix
- Best practices for each transport

**Audience:** Infrastructure engineers, system architects, DevOps specialists

## Quick Navigation

### By Use Case

**I want to...**

- **Build an MCP Server** → [MCPServers.mdx](./MCPServers.mdx)
- **Build an MCP Client** → [MCPClients.mdx](./MCPClients.mdx)
- **Define Tools** → [MCPTools.mdx](./MCPTools.mdx)
- **Manage Resources** → [MCPResources.mdx](./MCPResources.mdx)
- **Choose a Transport** → [MCPTransports.mdx](./MCPTransports.mdx)
- **Understand MCP** → [MCPOverview.mdx](./MCPOverview.mdx)

### By Component

- **Servers** → [MCPServers.mdx](./MCPServers.mdx)
- **Clients** → [MCPClients.mdx](./MCPClients.mdx)
- **Tools** → [MCPTools.mdx](./MCPTools.mdx)
- **Resources** → [MCPResources.mdx](./MCPResources.mdx)
- **Transports** → [MCPTransports.mdx](./MCPTransports.mdx)

### By Role

| Role | Key Documents |
|------|---|
| **Architect** | [MCPOverview.mdx](./MCPOverview.mdx), [MCPTransports.mdx](./MCPTransports.mdx) |
| **Backend Developer** | [MCPServers.mdx](./MCPServers.mdx), [MCPTools.mdx](./MCPTools.mdx), [MCPResources.mdx](./MCPResources.mdx) |
| **Frontend Developer** | [MCPClients.mdx](./MCPClients.mdx), [MCPOverview.mdx](./MCPOverview.mdx) |
| **DevOps/Infrastructure** | [MCPTransports.mdx](./MCPTransports.mdx), [MCPServers.mdx](./MCPServers.mdx) |
| **API Designer** | [MCPTools.mdx](./MCPTools.mdx), [MCPResources.mdx](./MCPResources.mdx) |
| **Tool Developer** | [MCPServers.mdx](./MCPServers.mdx), [MCPTools.mdx](./MCPTools.mdx) |

## Key Concepts

### Server
An MCP Server exposes tools and resources to clients. It implements the protocol, registers capabilities, and handles requests.

**Learn more:** [MCPServers.mdx](./MCPServers.mdx)

### Client
An MCP Client connects to servers, discovers capabilities, and makes requests on behalf of applications (like Claude).

**Learn more:** [MCPClients.mdx](./MCPClients.mdx)

### Tool
A callable function exposed by an MCP server with defined parameters (JSON Schema) and return types.

**Learn more:** [MCPTools.mdx](./MCPTools.mdx)

### Resource
A data source or content accessible through URI-based addressing. Can be text, structured data, binary, or real-time streams.

**Learn more:** [MCPResources.mdx](./MCPResources.mdx)

### Transport
The underlying communication mechanism between client and server (stdio, HTTP, SSE, or WebSocket).

**Learn more:** [MCPTransports.mdx](./MCPTransports.mdx)

## Related Domains

- **[agents.org.ai](https://agents.org.ai)** - Agent frameworks and implementations
- **[tools.org.ai](https://tools.org.ai)** - Tool registry and specifications
- **[apis.org.ai](https://apis.org.ai)** - API patterns and standards
- **[code.org.ai](https://code.org.ai)** - Development tools and environments
- **[schema.org.ai](https://schema.org.ai)** - Schema definitions and ontology

## Structure

```
mcp.org.ai/
├── README.md                 # This file
├── MCPOverview.mdx          # Protocol overview and architecture
├── MCPServers.mdx           # Server implementation guide
├── MCPClients.mdx           # Client implementation guide
├── MCPTools.mdx             # Tool specification and examples
├── MCPResources.mdx         # Resource management and URIs
├── MCPTransports.mdx        # Transport mechanisms
├── [Mcp].mdx                # Generic Mcp type template
├── package.json             # NPM package configuration
├── index.ts                 # Type exports and utilities
├── types.ts                 # TypeScript type definitions
└── node_modules/            # Dependencies
```

## Types

- [`Mcp`](https://mcp.org.ai/Mcp) - Base MCP type

## Usage

### Import as NPM Package

```typescript
import { Mcp, things } from 'mcp.org.ai'
```

### Use in MDX

```mdx
---
$type: https://mcp.org.ai/Mcp
name: Example MCP Resource
description: An example of an MCP resource
---

# Example MCP Resource

This resource demonstrates the MCP domain structure.
```

### Reference in Documentation

Link to MCP concepts from other domains:

```markdown
See [MCPTools.mdx](https://mcp.org.ai/MCPTools) for tool specification details.
```

## Getting Started

1. **Understand the Protocol**: Start with [MCPOverview.mdx](./MCPOverview.mdx)
2. **Choose Your Role**:
   - Building a server? → [MCPServers.mdx](./MCPServers.mdx)
   - Building a client? → [MCPClients.mdx](./MCPClients.mdx)
3. **Learn Transport Options**: [MCPTransports.mdx](./MCPTransports.mdx)
4. **Deep Dive**: Read domain-specific guides for your needs

## Standards & Specifications

- **Protocol**: JSON-RPC 2.0
- **Schema**: JSON Schema
- **Resource Addressing**: URI (RFC 3986)
- **URI Templates**: RFC 6570
- **Transport**: Multiple supported (stdio, HTTP, SSE, WebSocket)

## Implementation Languages

MCP implementations are available in multiple languages:

- **TypeScript/Node.js** - Official SDK
- **Python** - Community implementations
- **Go** - Community implementations
- **Rust** - Community implementations

See specific language documentation for details on each implementation.

## Common Patterns

### Pattern: Query Server
```
Client → Discovers tools via ListTools
Client → Calls tool with parameters
Server → Executes tool
Server → Returns results
```

### Pattern: Resource Access
```
Client → Lists available resources
Client → Requests specific resource
Server → Fetches/generates resource
Server → Returns resource content
```

### Pattern: Real-time Updates
```
Client → Subscribes to resource
Server → Streams updates via SSE or WebSocket
Client → Receives and processes updates
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. Contributions follow the guidelines at [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai).

### How to Contribute

1. **Report Issues**: Found a mistake or gap? Open an issue.
2. **Submit Examples**: Share practical implementation examples.
3. **Improve Docs**: Help clarify and expand documentation.
4. **Add Content**: Propose new guides or sections.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## See Also

### MCP Resources

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io)
- [Official MCP Documentation](https://mcp.org)
- [Claude MCP Integration](https://claude.ai/docs/mcp)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol/mcp)

### Related Documentation

- [agents.org.ai Documentation](https://agents.org.ai)
- [tools.org.ai Documentation](https://tools.org.ai)
- [apis.org.ai Documentation](https://apis.org.ai)

## Document Map

```
MCPOverview.mdx
├── Architecture
├── Components
├── Capabilities
├── Use Cases
└── Security

MCPServers.mdx
├── Server Architecture
├── Tool Registration
├── Resource Providers
├── Server Initialization
├── Error Handling
├── Performance
└── Monitoring

MCPClients.mdx
├── Client Architecture
├── Server Discovery
├── Tool Discovery
├── Resource Management
├── Connection Management
├── Claude Desktop Integration
├── IDE Plugins
└── Error Handling

MCPTools.mdx
├── Tool Structure
├── Input Schemas
├── Return Types
├── Examples
└── Best Practices

MCPResources.mdx
├── Resource Fundamentals
├── URI Schemes
├── URI Templates
├── Dynamic Resources
├── Resource Types
├── Subscriptions
└── Security

MCPTransports.mdx
├── Transport Overview
├── Stdio Transport
├── HTTP Transport
├── SSE Transport
├── WebSocket Transport
└── Selection Guide
```

## Maintenance

This documentation is maintained as part of the .org.ai ontology project. Updates are made to reflect:

- MCP specification changes
- New implementation patterns
- Community feedback and best practices
- Tool ecosystem evolution

Last Updated: November 28, 2024
