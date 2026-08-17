# Changelog

## [Unreleased]

### 2026-08-16 — Yarah fork baseline

- Forked from InsForge OSS v2.3.1 (history reset).
- Full rebrand to Yarah: packages `@yarahdev/*`, env vars `YARAH_*`, compose
  project/service/database `yarah`, token issuer `yarah`, cookies `yarah_*`.
- Removed all automatic calls to upstream infrastructure: remote rate-limit
  config, partner lists, and bundled telemetry (now disabled by default).
- New brand assets (logo, favicon) and documentation reset.
