# Yarah Edge Function Examples

This folder contains **example serverless (edge) functions** you can deploy to Yarah.

## Files

- `demo-hello-world.js`: public function (GET/POST) with CORS + secret example (`HELLO_PREFIX`)
- `demo-whoami.js`: authenticated function (GET) that returns the current user

## Deploy

Use the Yarah MCP tools:

- `create-function` with `slug` matching the function name you want (e.g. `demo-hello-world`)
- `update-function` to redeploy after edits

## Invoke from a client app (SDK)

```js
// GET
await yarah.functions.invoke('demo-hello-world', { method: 'GET' })

// POST
await yarah.functions.invoke('demo-hello-world', {
  body: { name: 'Gary' }
})

// Authenticated GET (SDK auto-includes user token if logged in)
await yarah.functions.invoke('demo-whoami', { method: 'GET' })
```

