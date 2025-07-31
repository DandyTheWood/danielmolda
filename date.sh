#!/bin/bash

current_date="$(date +'%d.%m.%Y')"
echo "Current date: $current_date"

html_files="$(find . -type f -name "*.html")"

for file in $html_files; do
  echo "Updating dates in: $file"
  sed -i "s|<span id=\"current-date\">.*</span>|<span id=\"current-date\">$current_date</span>|g" "$file"
done