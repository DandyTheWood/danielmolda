#!/bin/bash

copiright_year="$(date +%Y)"
git_last_commit_date="$(git log -1 --format=%cd --date=format:'%d.%m.%Y')"
echo "Git copiright year: $copiright_year"
echo "Git last commit date: $git_last_commit_date"

html_files="$(find . -type f -name "*.html")"

for file in $html_files; do 
  echo "Inserting date and year into: $file"
  sed -i "s|<span id=\"git-copiright-year\">.*</span>|<span id=\"git-copiright-year\">$copiright_year</span>|g" "$file"
  sed -i "s|<span id=\"git-last-commit-date\">.*</span>|<span id=\"git-last-commit-date\">$git_last_commit_date</span>|g" "$file"
done