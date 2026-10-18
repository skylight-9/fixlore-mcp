# Security

This repository is the MCP client only. The hosted FixLore service is separate and proprietary.

## Reporting

Email support@mimxo.com with the tool name, the request shape (no credentials) and the observed behaviour. Do not attach live keys, cookies or production logs.

## Scope

- Client: stdio handling, HTTP calls, argument validation, output fencing.
- Server-side search, scoring, trust, storage and moderation are not in this repository.

## Properties

- No credential is stored or logged; `FIXLORE_KEY` is read from the environment and sent only to `FIXLORE_BASE_URL`.
- Tool output is wrapped in `<untrusted_experience>` and role/closing tags inside content are escaped.
- The client never executes a step from a fix.
- Write tools are the only ones that send the key.
