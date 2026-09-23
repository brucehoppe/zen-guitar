#!/usr/bin/env bash
# scripts/fetch-fonts.sh: pulls the OFL-licensed Source fonts from the
# @fontsource npm packages via jsDelivr, once, into site/assets/fonts.
set -euo pipefail
cd "$(dirname "$0")/../site/assets/fonts"
base=https://cdn.jsdelivr.net/npm
get() { curl -fsSL -o "$2" "$1"; echo "fetched $2"; }
get $base/@fontsource/source-serif-4@5/files/source-serif-4-latin-400-normal.woff2 source-serif-4-latin-400-normal.woff2
get $base/@fontsource/source-serif-4@5/files/source-serif-4-latin-400-italic.woff2 source-serif-4-latin-400-italic.woff2
get $base/@fontsource/source-serif-4@5/files/source-serif-4-latin-500-normal.woff2 source-serif-4-latin-500-normal.woff2
get $base/@fontsource/source-sans-3@5/files/source-sans-3-latin-400-normal.woff2  source-sans-3-latin-400-normal.woff2
get $base/@fontsource/source-sans-3@5/files/source-sans-3-latin-600-normal.woff2  source-sans-3-latin-600-normal.woff2
get $base/@fontsource/source-serif-4@5/LICENSE OFL-Source-Serif-4.txt
get $base/@fontsource/source-sans-3@5/LICENSE  OFL-Source-Sans-3.txt
