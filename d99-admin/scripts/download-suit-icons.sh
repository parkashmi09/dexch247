#!/usr/bin/env bash
#
# Download s1–s6 suit/position icons for Unique Teenpatti result UI.
# Source: https://versionobj.ecoassetsservice.com/v93/static/admin/img/
# Saves to public/img/ so app can use /img/s1-icon.png ... /img/s6-icon.png
#

set -e

BASE_URL="https://versionobj.ecoassetsservice.com/v93/static/admin/img"
TARGET_DIR="/var/www/html/reddyanna-d99/d99-admin/public/img"

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

# s1-icon.png through s6-icon.png (Unique Teenpatti card position icons)
FILES=(s1-icon.png s2-icon.png s3-icon.png s4-icon.png s5-icon.png s6-icon.png)

echo "Downloading suit/position icons (s1–s6) to $TARGET_DIR"
echo "Base URL: $BASE_URL"
echo "Files: ${FILES[*]}"
echo ""

DOWNLOADED=0
FAILED=0

for f in "${FILES[@]}"; do
  url="${BASE_URL}/${f}"
  if curl -sf -o "$f" "$url"; then
    echo "OK   $f"
    ((DOWNLOADED++)) || true
  else
    echo "skip $f (not found or error)"
    ((FAILED++)) || true
    rm -f "$f"
  fi
done

echo ""
echo "Done. Downloaded: $DOWNLOADED, skipped/missing: $FAILED"
