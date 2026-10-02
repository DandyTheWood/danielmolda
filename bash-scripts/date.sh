#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
current_date="$(date +'%d.%m.%Y')"

while IFS= read -r -d '' file; do
    if grep -q '<span id="current-date">.*</span>' "$file"; then
        sed -i "s|<span id=\"current-date\">.*</span>|<span id=\"current-date\">$current_date</span>|g" "$file"
        printf 'Updated date in %s\n' "$file"
    fi
done < <(find "$PROJECT_DIR" -path "$PROJECT_DIR/.git" -prune -o -type f -name '*.html' -print0)
