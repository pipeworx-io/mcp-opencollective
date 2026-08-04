# @pipeworx/opencollective

Open Collective public MCP — collective info, transactions, contributors. Uses the public REST endpoints (no auth required for public data).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `collective(slug)` — public collective info (name, balance, currency, sponsors)
- `members(slug, role?)` — backers / sponsors / admins / contributors for a collective
- `transactions(slug, type?, limit?)` — transaction list (CREDIT / DEBIT)
- `events(slug)` — events for a collective

## Data source

`https://opencollective.com/<slug>.json` and `/<slug>/transactions.json` etc. Public read endpoints, no API key needed.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "opencollective": {
      "url": "https://gateway.pipeworx.io/opencollective/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Opencollective data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
