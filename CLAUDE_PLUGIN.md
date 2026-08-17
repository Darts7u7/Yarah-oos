# Yarah Claude Code Plugin

Official plugin for building with Yarah in Claude Code.

The public plugin is maintained in the
[Yarah/yarah-skills](https://github.com/Yarah/yarah-skills)
repository. This repository keeps the marketplace entry so users can install it
from the Yarah marketplace.

## Installation

In Claude Code, run:

```
/plugin marketplace add Yarah/Yarah
```

Then install the plugin:

```
/plugin install yarah
```

## What's Included

The public plugin currently includes four skills.

### `yarah`

Guidance for building application code with Yarah and `@insforge/sdk`,
including database CRUD, auth, storage uploads, functions, OpenRouter AI,
realtime, email, Stripe flows, and S3-compatible storage integrations.

### `yarah-cli`

Command-line project management with `@yarah/cli`, including project
creation, linking, SQL, migrations, RLS policies, functions, storage,
deployments, compute services, secrets, AI setup, payments, schedules, logs,
imports, exports, and backend branches.

### `yarah-debug`

Diagnostics for Yarah project issues, including SDK errors, HTTP failures,
edge function failures, database performance, auth and RLS denials, realtime
issues, and deployment failures.

### `yarah-integrations`

Integration guides for third-party auth providers and related RLS setup,
including Auth0, Clerk, Kinde, Stytch, WorkOS, Better Auth, and payment
facilitator guidance.

## Usage

Once installed, Claude Code can load Yarah-specific guidance when you are:

- setting up backend infrastructure such as tables, buckets, functions, auth,
  AI, payments, or deployments
- integrating `@insforge/sdk` into frontend or server applications
- implementing database access with RLS-aware patterns
- debugging Yarah project errors and deployment issues
- connecting external auth providers to Yarah

## Repository Layout Note

The public plugin lives in
[Yarah/yarah-skills](https://github.com/Yarah/yarah-skills).

The `.claude/skills/` and `.agents/skills/` directories in this repository are
internal contributor skills for people working on the Yarah OSS repository.
They are not the public Claude Code plugin and should not be used as the
marketplace source.

## Contributing

To improve the public plugin, contribute to
[Yarah/yarah-skills](https://github.com/Yarah/yarah-skills).

The skills in that repository are Markdown files with YAML frontmatter. See its
`CONTRIBUTING.md` for guidelines on adding or improving skills.

## Feedback

Found an issue or have a suggestion? [Open an issue](https://github.com/Yarah/Yarah/issues)
or join our [Discord](https://yarah.dev/community).

## License

MIT - Same as the public Yarah skills plugin.
