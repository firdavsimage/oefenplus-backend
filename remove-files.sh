#!/bin/bash

# GitHub repository URL
REPO_URL="https://github.com/firdavsimage/oefenplus-backend.git"

# Repository nomi (oxirgi papka nomi)
REPO_DIR="oefenplus-backend"

# Fayllarni o‘chirish ro‘yxati
FILES_TO_DELETE=("author" "convertor" "pdf" "plagit" "translite")

# Repozitoriyani klon qilish
if [ ! -d "$REPO_DIR" ]; then
  echo "Cloning repository..."
  git clone "$REPO_URL"
fi

cd "$REPO_DIR" || exit

# Branch nomini aniqlash
BRANCH=$(git symbolic-ref --short HEAD)

# Fayllarni o‘chirish
echo "Deleting files..."
for file in "${FILES_TO_DELETE[@]}"; do
  git rm -r --cached "$file" 2>/dev/null || echo "File not found: $file"
done

# Git commit
echo "Committing changes..."
git commit -m "Remove unwanted files: ${FILES_TO_DELETE[*]}"

# GitHub’ga push qilish
echo "Pushing to GitHub..."
git push origin "$BRANCH"

echo "✅ Files removed and changes pushed successfully."
