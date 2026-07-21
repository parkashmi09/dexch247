---
description: Download or refresh all assets listed in the manifest into old-frontend/d99-latest/new-d99-frontend/frontend/public/assets/
allowed-tools: Bash, Read, Edit
---

Run the asset sync script and report which files were added, updated, or skipped.

```bash
cd frontend && npm run sync-assets
```

If new assets are referenced by components but missing from
`old-frontend/d99-latest/new-d99-frontend/frontend/scripts/assets.manifest.json`, add them to the manifest first
(delegate to the `asset-downloader` subagent), then re-run.
