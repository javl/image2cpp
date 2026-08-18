#!/usr/bin/env python3
""" Generate a simple test-pattern image for use with the test suite.
    This 32x24 image is used to test all the different conversion paths in
    js/script.js and js/dithering.js. Different quadrants of the image test
    different aspects of the conversion process:

    - top-left:     checkerboard       -> stresses the threshold/dithering modes
    - top-right:    horizontal grayscale gradient -> stresses dithering algorithms
    - bottom-left:  RGB color bars         -> stresses 565/888 color output
    - bottom-right: diagonal line on white -> asymmetric element to test flip/rotate/mirror

A 1px red marker in the extreme top-left corner and a 1px blue marker in the
extreme bottom-right corner give an unambiguous orientation reference.
"""
from pathlib import Path

from PIL import Image

WIDTH, HEIGHT = 32, 24
OUT_PATH = Path(__file__).parent / "fixtures" / "test_pattern.png"


def build_image():
    img = Image.new("RGB", (WIDTH, HEIGHT), "white")
    px = img.load()
    if px is None:
        raise RuntimeError("Failed to create image object")

    half_w, half_h = WIDTH // 2, HEIGHT // 2

    # Top-left: checkerboard
    for y in range(half_h):
        for x in range(half_w):
            color = (0, 0, 0) if (x // 2 + y // 2) % 2 == 0 else (255, 255, 255)
            px[x, y] = color

    # Top-right: horizontal grayscale gradient
    for y in range(half_h):
        for x in range(half_w):
            v = int((x / max(half_w - 1, 1)) * 255)
            px[half_w + x, y] = (v, v, v)

    # Bottom-left: RGB color bars (red, green, blue, white)
    bars = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 255)]
    bar_w = max(half_w // len(bars), 1)
    for y in range(half_h):
        for x in range(half_w):
            bar = min(x // bar_w, len(bars) - 1)
            px[x, half_h + y] = bars[bar]

    # Bottom-right: diagonal line on white background (asymmetric marker)
    for y in range(half_h):
        for x in range(half_w):
            px[half_w + x, half_h + y] = (255, 255, 255)
    for i in range(min(half_w, half_h)):
        px[half_w + i, half_h + i] = (0, 0, 0)

    # Orientation markers
    px[0, 0] = (255, 0, 0)  # top-left corner: red
    px[WIDTH - 1, HEIGHT - 1] = (0, 0, 255)  # bottom-right corner: blue

    return img


def main():
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    build_image().save(OUT_PATH)
    print(f"wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
