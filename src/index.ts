interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Open Collective public MCP.
 *
 * Auth: none for public read endpoints.
 * Docs: https://docs.opencollective.com/help/contributing/development/api
 */


const BASE = 'https://opencollective.com';
const UA = 'pipeworx-mcp-opencollective/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'collective',
    description: 'Public collective info by slug (name, balance, currency, sponsors).',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'e.g. "babel", "webpack", "preact"' } },
      required: ['slug'],
    },
  },
  {
    name: 'members',
    description: 'Members (backers / sponsors / admins / contributors) for a collective.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        role: { type: 'string', description: 'BACKER | SPONSOR | ADMIN | CONTRIBUTOR (default ALL)' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'transactions',
    description: 'Transaction list for a collective.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        type: { type: 'string', description: 'CREDIT | DEBIT (default both)' },
        limit: { type: 'number', description: '1-1000 (default 100)' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'events',
    description: 'Events for a collective.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string' } },
      required: ['slug'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'collective':
      return ocGet(`/${slug(args)}.json`);
    case 'members': {
      const role = (args.role as string | undefined)?.toLowerCase();
      const path = role ? `/${slug(args)}/members/${encodeURIComponent(role)}.json` : `/${slug(args)}/members.json`;
      return ocGet(path);
    }
    case 'transactions': {
      const limit = Math.min(1000, Math.max(1, (args.limit as number) ?? 100));
      const type = (args.type as string | undefined)?.toUpperCase();
      const params = new URLSearchParams({ limit: String(limit) });
      if (type) {
        if (type !== 'CREDIT' && type !== 'DEBIT') throw new Error('type must be CREDIT or DEBIT.');
        params.set('type', type);
      }
      return ocGet(`/${slug(args)}/transactions.json?${params}`);
    }
    case 'events':
      return ocGet(`/${slug(args)}/events.json`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function slug(args: Record<string, unknown>): string {
  const s = reqStr(args, 'slug', '"webpack"').toLowerCase();
  if (!/^[a-z0-9-]+$/.test(s)) throw new Error(`Invalid slug "${s}". Use lowercase alphanumerics and dashes only.`);
  return s;
}

async function ocGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (res.status === 404) throw new Error('Open Collective: not found');
  if (!res.ok) throw new Error(`Open Collective: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
