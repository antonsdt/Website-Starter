from __future__ import annotations

import os
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


SOURCE_DIR = Path(
    "/Users/antonschmidt/.codex/generated_images/01a068f5-8066-7a62-9c9d-9a567ca15650"
)
OUTPUT_PATH = Path(
    "/Users/antonschmidt/Desktop/Website-Starter/output/pdf/low-end-brothers-logo-overview.pdf"
)
THUMB_DIR = Path("/Users/antonschmidt/Desktop/Website-Starter/tmp/pdfs/contact_thumbs")

PAGE_W, PAGE_H = landscape(A4)
INK = HexColor("#111111")
PAPER = HexColor("#EEECE7")
RED = HexColor("#F04438")
MUTED = HexColor("#77736C")
LINE = HexColor("#D8D3CA")


def discover_images() -> list[Path]:
    paths = list(SOURCE_DIR.glob("*.png"))
    return sorted(paths, key=lambda path: path.stat().st_mtime)


def draw_crosshair(c: canvas.Canvas, x: float, y: float, size: float = 12) -> None:
    c.setStrokeColor(RED)
    c.setLineWidth(0.8)
    c.line(x - size, y, x - 3, y)
    c.line(x + 3, y, x + size, y)
    c.line(x, y - size, x, y - 3)
    c.line(x, y + 3, x, y + size)
    c.setFillColor(RED)
    c.rect(x - 1.4, y - 1.4, 2.8, 2.8, fill=1, stroke=0)


def draw_cover(c: canvas.Canvas, count: int) -> None:
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    c.setStrokeColor(HexColor("#292929"))
    c.setLineWidth(0.5)
    for x in range(48, int(PAGE_W), 48):
        c.line(x, 0, x, PAGE_H)
    for y in range(48, int(PAGE_H), 48):
        c.line(0, y, PAGE_W, y)

    draw_crosshair(c, PAGE_W - 88, PAGE_H - 82, 15)

    c.setFillColor(PAPER)
    c.setFont("Helvetica-Bold", 40)
    c.drawString(62, PAGE_H - 176, "LOW END")
    c.drawString(62, PAGE_H - 220, "BROTHERS")

    c.setFillColor(RED)
    c.rect(62, PAGE_H - 248, 132, 4, fill=1, stroke=0)

    c.setFillColor(PAPER)
    c.setFont("Helvetica", 15)
    c.drawString(62, PAGE_H - 292, "Logo exploration archive")

    c.setFillColor(HexColor("#A8A49D"))
    c.setFont("Helvetica", 9)
    c.drawString(62, 62, f"{count:02d} ENTWUERFE  /  CHRONOLOGISCHE UEBERSICHT")
    c.drawRightString(PAGE_W - 62, 62, "ASPHALT  /  SIGNALROT  /  KNOCHENWEISS")
    c.showPage()


def fit_image(path: Path, max_w: float, max_h: float) -> tuple[float, float]:
    with Image.open(path) as image:
        width, height = image.size
    scale = min(max_w / width, max_h / height)
    return width * scale, height * scale


def make_pdf_thumbnail(path: Path) -> Path:
    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    output = THUMB_DIR / f"{path.stem}.jpg"
    if output.exists() and output.stat().st_mtime >= path.stat().st_mtime:
        return output
    with Image.open(path) as image:
        image = image.convert("RGB")
        image.thumbnail((900, 900), Image.Resampling.LANCZOS)
        image.save(output, "JPEG", quality=88, optimize=True, progressive=True)
    return output


def draw_gallery_page(
    c: canvas.Canvas, images: list[Path], start_index: int, page_no: int, page_total: int
) -> None:
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    margin_x = 40
    top = PAGE_H - 42
    bottom = 38
    gutter_x = 24
    gutter_y = 20
    header_h = 28
    usable_w = PAGE_W - margin_x * 2
    usable_h = top - bottom - header_h
    cell_w = (usable_w - gutter_x) / 2
    cell_h = (usable_h - gutter_y) / 2

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(margin_x, PAGE_H - 27, "LOW END BROTHERS  /  LOGO ARCHIVE")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawRightString(PAGE_W - margin_x, PAGE_H - 27, f"SEITE {page_no:02d} / {page_total:02d}")
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(margin_x, PAGE_H - 35, PAGE_W - margin_x, PAGE_H - 35)

    for slot, image_path in enumerate(images):
        row = slot // 2
        col = slot % 2
        x = margin_x + col * (cell_w + gutter_x)
        y = bottom + (1 - row) * (cell_h + gutter_y)

        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        c.roundRect(x, y, cell_w, cell_h, 8, fill=0, stroke=1)

        number = start_index + slot + 1
        c.setFillColor(RED)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x + 12, y + cell_h - 18, f"{number:02d}")

        c.setFillColor(MUTED)
        c.setFont("Helvetica", 6.5)
        short_id = image_path.stem.replace("exec-", "")[:8].upper()
        c.drawRightString(x + cell_w - 12, y + cell_h - 18, short_id)

        inner_x = x + 10
        inner_y = y + 10
        inner_w = cell_w - 20
        inner_h = cell_h - 38
        pdf_image = make_pdf_thumbnail(image_path)
        draw_w, draw_h = fit_image(pdf_image, inner_w, inner_h)
        draw_x = inner_x + (inner_w - draw_w) / 2
        draw_y = inner_y + (inner_h - draw_h) / 2
        c.drawImage(
            str(pdf_image),
            draw_x,
            draw_y,
            width=draw_w,
            height=draw_h,
            preserveAspectRatio=True,
            mask="auto",
        )

    c.showPage()


def build_pdf() -> None:
    images = discover_images()
    if not images:
        raise RuntimeError(f"No PNG files found in {SOURCE_DIR}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT_PATH), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    c.setTitle("Low End Brothers - Logo Overview")
    c.setAuthor("OpenAI Codex")
    c.setSubject("Chronological overview of all generated logo concepts")

    gallery_pages = (len(images) + 3) // 4
    total_pages = 1 + gallery_pages
    draw_cover(c, len(images))

    for page_index in range(gallery_pages):
        start = page_index * 4
        draw_gallery_page(
            c,
            images[start : start + 4],
            start,
            page_index + 2,
            total_pages,
        )

    c.save()
    print(f"Created {OUTPUT_PATH} with {len(images)} logos across {total_pages} pages")


if __name__ == "__main__":
    build_pdf()
