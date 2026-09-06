from pathlib import Path

from PIL import Image, ImageChops, ImageFilter, ImageStat


BASE_PATH = Path(
    "/Users/antonschmidt/.codex/generated_images/01a068f5-8066-7a62-9c9d-9a567ca15650/exec-a1c7cac4-43ce-4f38-9a83-f85121137ec5.png"
)
TYPE_PATH = Path("/Users/antonschmidt/Downloads/PHOTO-2026-09-04-11-25-37.jpg")
OUTPUT_PATH = Path(
    "/Users/antonschmidt/Desktop/Website-Starter/output/images/low-end-brothers-exact-type.png"
)


def background_color(image: Image.Image) -> tuple[int, int, int]:
    swatches = [
        image.crop((20, 20, 180, 180)),
        image.crop((image.width - 180, 20, image.width - 20, 180)),
        image.crop((20, image.height - 180, 180, image.height - 20)),
        image.crop((image.width - 180, image.height - 180, image.width - 20, image.height - 20)),
    ]
    merged = Image.new("RGB", (160 * len(swatches), 160))
    for index, swatch in enumerate(swatches):
        merged.paste(swatch.convert("RGB"), (index * 160, 0))
    median = ImageStat.Stat(merged).median
    return tuple(int(value) for value in median)


def extract_wordmark(source: Image.Image) -> Image.Image:
    rgb = source.convert("RGB")
    gray = rgb.convert("L")
    mask = gray.point(lambda value: 0 if value < 18 else min(255, int((value - 18) * 1.15)))
    bbox = mask.getbbox()
    if bbox is None:
        raise RuntimeError("Could not locate the white wordmark in the typography reference")

    pad = 2
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(source.width, bbox[2] + pad)
    bottom = min(source.height, bbox[3] + pad)
    mask = mask.crop((left, top, right, bottom))

    wordmark = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    solid_black = Image.new("RGBA", mask.size, (17, 17, 17, 255))
    wordmark.paste(solid_black, (0, 0), mask)
    return wordmark


def main() -> None:
    base = Image.open(BASE_PATH).convert("RGB")
    type_reference = Image.open(TYPE_PATH)
    wordmark = extract_wordmark(type_reference)

    target_width = 570
    target_height = round(wordmark.height * target_width / wordmark.width)
    wordmark = wordmark.resize((target_width, target_height), Image.Resampling.LANCZOS)

    paper = background_color(base)
    clean = base.copy()
    old_text_top = 975
    clean.paste(paper, (0, old_text_top, clean.width, clean.height))

    x = (clean.width - target_width) // 2
    y = 982
    clean.paste(wordmark, (x, y), wordmark)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    clean.save(OUTPUT_PATH, "PNG", optimize=True)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
