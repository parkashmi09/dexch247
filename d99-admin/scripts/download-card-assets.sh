#!/usr/bin/env bash
#
# Download card assets from ecoassetsservice to public/img/cards.
# Base URL: https://versionobj.ecoassetsservice.com/v92/static/admin/img/cards/
#

set -e

BASE_URL="https://versionobj.ecoassetsservice.com/v92/static/admin/img/cards"
TARGET_DIR="/var/www/html/reddyanna-d99/d99-admin/public/img/cards"

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

# Card back
FILES=("1.png")

# Numeric face cards (2-13)
for n in 2 3 4 5 6 7 8 9 10 11 12 13; do
  FILES+=("${n}.png")
done

# Face cards as single letter (J, Q, K) in case server uses these
FILES+=(J.png Q.png K.png A.png)

# Ranks and suits for full deck: A,2-10,J,Q,K and SS,HH,CC,DD
RANKS=(A 2 3 4 5 6 7 8 9 10 J Q K)
SUITS=(SS HH CC DD)

for suit in "${SUITS[@]}"; do
  for rank in "${RANKS[@]}"; do
    FILES+=("${rank}${suit}.png")
  done
done

echo "Downloading card assets to $TARGET_DIR"
echo "Base URL: $BASE_URL"
echo "Total files to try: ${#FILES[@]}"
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
