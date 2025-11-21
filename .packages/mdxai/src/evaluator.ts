import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import * as _ from 'lodash-es';
import Papa from 'papaparse';
import { MdxDbFs } from 'mdxdb/fs';
import { generateText, generateObject, streamText, streamObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';

// Helper to fetch CSV
const CSV = {
  fetch: async (url: string, config: any = {}) => {
    const response = await fetch(url);
    let text = await response.text();
    // Remove BOM if present
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
    }
    
    const isTsv = url.endsWith('.txt') || url.endsWith('.tsv');
    
    return new Promise((resolve, reject) => {
        Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            delimiter: isTsv ? '\t' : undefined,
            ...config,
            complete: (results: Papa.ParseResult<any>) => {
                // console.log('CSV Parsed Keys:', results.meta.fields);
                resolve(results.data);
            },
            error: (err: Error) => reject(err)
        });
    });
  }
};

// Provider Setup
const cfAccount = process.env.CLOUDFLARE_AI_GATEWAY_ACCOUNT;
const cfGateway = process.env.CLOUDFLARE_AI_GATEWAY_NAME;
const useGateway = cfAccount && cfGateway;
const gatewayBase = `https://gateway.ai.cloudflare.com/v1/${cfAccount}/${cfGateway}`;

// 1. OpenAI
const openai = createOpenAI({
    baseURL: useGateway ? `${gatewayBase}/openai` : undefined,
});

// 2. Google
const google = createGoogleGenerativeAI({
    baseURL: useGateway ? `${gatewayBase}/google-ai-studio` : undefined,
});

// 3. Amazon Bedrock
// Bedrock SDK doesn't always support simple baseURL override for Gateway in the same way 
// because of AWS signing. However, Vercel SDK's `createAmazonBedrock` might support custom fetch or similar.
// Checking @ai-sdk/amazon-bedrock options... usually purely AWS Client config.
// Cloudflare Gateway for Bedrock usually acts as the endpoint.
// We might need to pass a custom bedrock client or configuration.
// For now, we'll instantiate it standard. If gateway support is needed for Bedrock, 
// it often requires redirecting the endpoint in the AWS client config.
const bedrock = createAmazonBedrock({
    // TODO: Configure Gateway if supported by SDK options
});

// 4. Cloudflare Workers AI (via OpenAI compatibility)
// Requires CF Account ID for the direct API, but via Gateway it's .../workers-ai
const workersAi = createOpenAI({
    name: 'workers-ai',
    baseURL: useGateway 
        ? `${gatewayBase}/workers-ai` 
        : `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
    apiKey: process.env.CLOUDFLARE_API_TOKEN
});

// 5. OpenRouter (via OpenAI compatibility)
const openRouter = createOpenAI({
    name: 'openrouter',
    baseURL: useGateway ? `${gatewayBase}/openrouter` : 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY
});

export async function evaluateMdx(content: string, db: MdxDbFs) {
    // Inject globals
    (global as any)._ = _;
    (global as any).CSV = CSV;
    (global as any).db = db;
    
    // Expose AI Tools and Providers
    (global as any).ai = { 
        generateText, 
        generateObject,
        streamText, 
        streamObject,
        openai,
        google,
        bedrock,
        workersAi,
        openRouter,
        // Helper to use specific provider by name string if needed
        providers: {
            openai, google, bedrock, workersAi, openRouter
        }
    }; 
    
    const exports = await evaluate(content, {
        ...runtime,
        baseUrl: import.meta.url,
        useDynamicImport: true,
    } as any);
    
    return exports;
}
