# @mdxdb/clickhouse

ClickHouse client for mdxdb with support for both Node.js and Web environments (including Cloudflare Workers).

## Features

- **Node.js Support**: Full-featured ClickHouse client with connection pooling
- **Web/Edge Support**: Web-compatible client for Cloudflare Workers and Edge Runtime
- **TypeScript**: Fully typed with TypeScript
- **Dual Exports**: Separate entry points for Node.js and Web environments

## Installation

```bash
npm install @mdxdb/clickhouse
```

## Usage

### Node.js

```typescript
import { getClickHouseClient, closeClickHouseClient } from '@mdxdb/clickhouse';

const client = getClickHouseClient();
```

### Web/Cloudflare Workers

```typescript
import { getClickHouseClient, getClickHouseClientFromEnv } from '@mdxdb/clickhouse/web';

const client = getClickHouseClientFromEnv(env);
```

## License

MIT
