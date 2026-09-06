from pathlib import Path
import sys

sys.path.insert(0, "/tmp/leb-vector-deps")

import cv2
import numpy as np


SOURCE = Path("/Users/antonschmidt/Downloads/low-end-brothers-exact-type.png")
OUTPUT = Path("/Users/antonschmidt/Desktop/Website-Starter/exports/low-end-brothers")


def extract_mask(image: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray:
    x1, y1, x2, y2 = box
    crop = image[y1:y2, x1:x2]
    # Keep neutral dark artwork only. This excludes the red cursor mark.
    dark = np.max(crop, axis=2) < 145
    neutral = (np.max(crop, axis=2) - np.min(crop, axis=2)) < 35
    mask = (dark & neutral).astype(np.uint8) * 255
    return mask


def tight_crop(mask: np.ndarray, padding: int = 8) -> np.ndarray:
    ys, xs = np.where(mask > 0)
    x1, x2 = max(0, xs.min() - padding), min(mask.shape[1], xs.max() + padding + 1)
    y1, y2 = max(0, ys.min() - padding), min(mask.shape[0], ys.max() + padding + 1)
    return mask[y1:y2, x1:x2]


def contour_path(contour: np.ndarray) -> str:
    points = contour[:, 0, :]
    commands = [f"M{points[0, 0]} {points[0, 1]}"]
    commands.extend(f"L{x} {y}" for x, y in points[1:])
    commands.append("Z")
    return " ".join(commands)


def write_svg(mask: np.ndarray, target: Path, title: str) -> None:
    contours, hierarchy = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    paths = []
    for contour in contours:
        if abs(cv2.contourArea(contour)) < 0.8:
            continue
        simplified = cv2.approxPolyDP(contour, 0.45, True)
        paths.append(contour_path(simplified))

    height, width = mask.shape
    svg = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="{width}" height="{height}" role="img" aria-labelledby="title">\n'
        f'  <title id="title">{title}</title>\n'
        '  <g fill="#000000" fill-rule="evenodd">\n'
        + "\n".join(f'    <path d="{path}"/>' for path in paths)
        + "\n  </g>\n</svg>\n"
    )
    target.write_text(svg, encoding="utf-8")


def main() -> None:
    image = cv2.imread(str(SOURCE))
    if image is None:
        raise SystemExit(f"Could not read {SOURCE}")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    OUTPUT.mkdir(parents=True, exist_ok=True)

    logo = tight_crop(extract_mask(image, (300, 160, 950, 965)))
    wordmark = tight_crop(extract_mask(image, (300, 960, 950, 1235)))

    write_svg(logo, OUTPUT / "low-end-brothers-logo.svg", "Low-end Brothers logo")
    write_svg(wordmark, OUTPUT / "low-end-brothers-wordmark.svg", "Low-end Brothers wordmark")


if __name__ == "__main__":
    main()
