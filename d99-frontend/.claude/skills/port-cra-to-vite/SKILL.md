---
name: port-cra-to-vite
description: Use when porting any code from old-frontend/d99/d99-frontend (Create React App) into old-frontend/d99-latest/new-d99-frontend/frontend/ (Vite). Codifies the exact rewrites that must happen so the ported file compiles and behaves correctly under Vite.
---

# Port CRA → Vite

The legacy app under `old-frontend/d99/d99-frontend` is **Create React App**. The
new app under `old-frontend/d99-latest/new-d99-frontend/frontend/` is **Vite**. They differ in important ways. Apply
every rewrite below when porting a file.

## Required rewrites

| CRA                                          | Vite                                              |
|----------------------------------------------|---------------------------------------------------|
| `process.env.REACT_APP_API_URL`              | `import.meta.env.VITE_API_URL`                    |
| `process.env.REACT_APP_SOCKET_URL`           | `import.meta.env.VITE_SOCKET_URL`                 |
| `process.env.NODE_ENV === "development"`     | `import.meta.env.DEV`                             |
| `process.env.PUBLIC_URL`                     | `import.meta.env.BASE_URL` (usually `/`)          |
| `import logo from "./logo.png"`              | `import logo from "./logo.png"` *(works the same)*|
| `import("./Foo")` lazy                       | works the same                                    |
| `react-scripts start`                        | `vite`                                            |
| `react-scripts build`                        | `vite build` (outputs to `build/` here)           |
| Tests via `react-scripts test`               | not ported — tests are out-of-scope for now       |
| SVG as React component (`{ ReactComponent }`)| use `vite-plugin-svgr` *or* import as URL string  |

## Service-layer rewrites

Every API service in `old-frontend/d99/d99-frontend/src/apiservices/*.js` does
`import axios from 'axios'` directly and pulls the token from `localStorage`
inside each function. **Do not port that pattern.** Instead:

```js
// old-frontend/d99-latest/new-d99-frontend/frontend/src/apiservices/AuthService.js
import api from "./axiosClient";

export const loginUser = (credentials) =>
  api.post("/user/login", credentials).then((r) => r.data);
```

The shared `axiosClient.js` already:
- prepends `VITE_API_URL`
- attaches `Authorization: Bearer <token>` from `localStorage`
- handles 401 → redirect to `/login`

So service files become 2-3 lines each.

## File extensions

- React components → `.jsx` (not `.js`)
- Pure modules / services / utils → `.js`
- TypeScript not in use yet — keep porting in JS.

## Checklist for each ported file

- [ ] All `process.env.REACT_APP_*` rewritten
- [ ] No raw `import axios from "axios"` left
- [ ] Imports use `@/...` alias when crossing top-level folders
- [ ] New `VITE_*` env vars added to `.env.example`
- [ ] `npm run build` from `old-frontend/d99-latest/new-d99-frontend/frontend/` succeeds
