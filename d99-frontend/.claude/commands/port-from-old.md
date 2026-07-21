---
description: Port a file or feature from old-frontend/d99/d99-frontend into the new Vite frontend
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
argument-hint: <relative path inside old-frontend/d99/d99-frontend/src>
---

Use the `api-porter` subagent to translate the file at
`old-frontend/d99/d99-frontend/src/$ARGUMENTS` into the equivalent location under
`old-frontend/d99-latest/new-d99-frontend/frontend/src/$ARGUMENTS`, rewriting CRA-isms (`process.env.REACT_APP_*` →
`import.meta.env.VITE_*`, raw axios → shared `axiosClient`, etc.).

Also port any direct dependencies of that file so the new file compiles, and
update `old-frontend/d99-latest/new-d99-frontend/frontend/.env.example` if any new `VITE_*` env vars were introduced.
