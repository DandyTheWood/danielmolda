#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
BIG_DIR="$PROJECT_DIR/images/Gallery/big"
SMALL_DIR="$PROJECT_DIR/images/Gallery/small"
force=false

case "${1:-}" in
    '') ;;
    --force) force=true ;;
    *)
        printf 'Usage: %s [--force]\n' "$0" >&2
        exit 2
        ;;
esac

if (($# > 1)); then
    printf 'Usage: %s [--force]\n' "$0" >&2
    exit 2
fi

if [[ ! -d "$BIG_DIR" ]]; then
    printf 'Gallery originals directory not found: %s\n' "$BIG_DIR" >&2
    exit 1
fi

if command -v magick >/dev/null 2>&1; then
    image_processor="imagemagick"
    image_command=(magick)
elif command -v convert >/dev/null 2>&1; then
    image_processor="imagemagick"
    image_command=(convert)
elif command -v python3 >/dev/null 2>&1 && python3 -c 'from PIL import Image' >/dev/null 2>&1; then
    image_processor="pillow"
else
    printf 'ImageMagick or Python 3 with Pillow is required to resize images.\n' >&2
    exit 1
fi

mkdir -p "$SMALL_DIR"

images=()
while IFS= read -r -d '' image; do
    images+=("$image")
done < <(
    find "$BIG_DIR" -type f \
        \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.avif' \) \
        -print0
)

if ((${#images[@]} == 0)); then
    printf 'No supported images found in %s\n' "$BIG_DIR" >&2
    exit 1
fi

for image in "${images[@]}"; do
    relative_path="${image#"$BIG_DIR"/}"
    filename="$(basename -- "$relative_path")"
    extension="${filename##*.}"
    extension="${extension,,}"
    output="$SMALL_DIR/${relative_path%.*}.$extension"
    mkdir -p "$(dirname -- "$output")"

    if [[ -f "$output" && "$force" == false ]]; then
        printf 'Thumbnail already exists, skipping: %s\n' "$output"
        continue
    fi

    if [[ "$image_processor" == "imagemagick" ]]; then
        resize_options=(-auto-orient -thumbnail '430x430>' -strip)

        case "$extension" in
            jpg|jpeg|webp) resize_options+=(-quality 85) ;;
        esac

        "${image_command[@]}" "$image" "${resize_options[@]}" "$output"
    else
        python3 - "$image" "$output" <<'PY'
import sys
from PIL import Image, ImageOps

source, destination = sys.argv[1:]
with Image.open(source) as image:
    image = ImageOps.exif_transpose(image)
    resampling = getattr(Image, "Resampling", Image).LANCZOS
    image.thumbnail((430, 430), resampling)
    options = {"quality": 85} if image.format in {"JPEG", "WEBP"} else {}
    image.save(destination, **options)
PY
    fi

    printf 'Created thumbnail: %s\n' "$output"
done
