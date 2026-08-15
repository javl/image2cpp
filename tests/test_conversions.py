#!/usr/bin/env python3
"""Test suite for image2cpp's conversion output.

Controls the real index.html in a headless browser (Playwright), feeds it the
deterministic test-pattern image, exercises every conversion option through
the actual UI, and compares the generated code output against saved golden
files. Because it runs the real app (not a reimplementation of the
conversion logic), any change to js/script.js or js/dithering.js that
changes output is caught.

Usage:
    python tests/test_conversions.py            # run tests, compare to golden
    python tests/test_conversions.py --diff     # print diff on failing scenarios
    python tests/test_conversions.py --update   # (re)generate golden files
"""
import argparse
import difflib
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).parent.parent
INDEX_HTML = ROOT / "index.html"
TEST_IMAGE = Path(__file__).parent / "fixtures" / "test_pattern.png"
GOLDEN_DIR = Path(__file__).parent / "golden"

NATIVE_WIDTH, NATIVE_HEIGHT = 32, 24

# Full set of controllable options and their app defaults.
BASE_SETTINGS = {
    "drawMode": "horizontal1bit",
    "outputFormat": "plain",
    "backgroundColor": "white",
    "invertColors": False,
    "ditheringMode": 0,
    "ditheringThreshold": 128,
    "scale": 1,
    "centerHorizontally": False,
    "centerVertically": False,
    "rotation": 0,
    "flipHorizontally": False,
    "flipVertically": False,
    "bitswap": False,
    "prefix": "0x",
    "separator": ", ",
    "esp32Format": False,
}

OUTPUT_FORMAT_IDS = {
    "plain": "outputFormatPlain",
    "arduino": "outputFormatArduino",
    "arduino_single": "outputFormatArduinoSingle",
    "adafruit_gfx": "outputFormatAdafruitGfx",
}

# (scenario name, overrides on top of BASE_SETTINGS, optional canvas resize)
SCENARIOS = [
    ("default", {}, None),
    ("draw_mode_vertical1bit", {"drawMode": "vertical1bit"}, None),
    ("draw_mode_horizontal565", {"drawMode": "horizontal565"}, None),
    ("draw_mode_horizontal888", {"drawMode": "horizontal888"}, None),
    ("draw_mode_horizontal_alpha", {"drawMode": "horizontalAlpha"}, None),
    ("output_arduino", {"outputFormat": "arduino"}, None),
    ("output_arduino_single", {"outputFormat": "arduino_single"}, None),
    ("output_adafruit_gfx", {"outputFormat": "adafruit_gfx"}, None),
    ("output_arduino_esp32", {"outputFormat": "arduino", "esp32Format": True}, None),
    (
        "output_arduino_single_esp32",
        {"outputFormat": "arduino_single", "esp32Format": True},
        None,
    ),
    ("output_adafruit_gfx_esp32", {"outputFormat": "adafruit_gfx", "esp32Format": True}, None),
    (
        "output_arduino_esp32_565",
        {"outputFormat": "arduino", "drawMode": "horizontal565", "esp32Format": True},
        None,
    ),
    ("invert_colors", {"invertColors": True}, None),
    ("flip_horizontal", {"flipHorizontally": True}, None),
    ("flip_vertical", {"flipVertically": True}, None),
    ("flip_both", {"flipHorizontally": True, "flipVertically": True}, None),
    ("rotate_90", {"rotation": 90}, None),
    ("rotate_180", {"rotation": 180}, None),
    ("rotate_270", {"rotation": 270}, None),
    ("rotate_90_vertical", {"drawMode": "vertical1bit", "rotation": 90}, None),
    ("rotate_270_vertical", {"drawMode": "vertical1bit", "rotation": 270}, None),
    ("rotate_180_vertical", {"drawMode": "vertical1bit", "rotation": 180}, None),
    ("rotate_90_horizontal565", {"drawMode": "horizontal565", "rotation": 90}, None),
    ("rotate_90_horizontal888", {"drawMode": "horizontal888", "rotation": 90}, None),
    ("rotate_90_horizontal_alpha", {"drawMode": "horizontalAlpha", "rotation": 90}, None),
    (
        "rotate_90_flip_both",
        {"rotation": 90, "flipHorizontally": True, "flipVertically": True},
        None,
    ),
    ("rotate_270_flip_horizontal", {"rotation": 270, "flipHorizontally": True}, None),
    ("rotate_90_resized", {"rotation": 90}, (48, 24)),
    ("bitswap_vertical", {"drawMode": "vertical1bit", "bitswap": True}, None),
    ("dithering_bayer", {"ditheringMode": 1}, None),
    ("dithering_floyd_steinberg", {"ditheringMode": 2}, None),
    ("dithering_atkinson", {"ditheringMode": 3}, None),
    ("dithering_threshold_low", {"ditheringThreshold": 64}, None),
    ("dithering_threshold_high", {"ditheringThreshold": 200}, None),
    ("bitswap", {"bitswap": True}, None),
    ("remove_zeroes_commas", {"prefix": "", "separator": ""}, None),
    # scale=1 (original) on a canvas larger than the image so the
    # background actually shows through in the margins.
    ("background_white_larger_canvas", {"backgroundColor": "white"}, (48, 40)),
    ("background_black", {"backgroundColor": "black"}, (48, 40)),
    # RGB channels of a transparent background are zero-initialized, same as
    # an explicit black background, so the two are indistinguishable under
    # the 1-bit draw modes (which ignore alpha). Use the alpha draw mode
    # here so transparency is actually used.
    (
        "background_transparent",
        {"backgroundColor": "transparent", "drawMode": "horizontalAlpha"},
        (48, 40),
    ),
    ("scale_fit_larger_canvas", {"scale": 2}, (48, 40)),
    ("scale_stretch_larger_canvas", {"scale": 3}, (48, 40)),
    ("scale_stretch_h_larger_canvas", {"scale": 4}, (48, NATIVE_HEIGHT)),
    ("scale_stretch_v_larger_canvas", {"scale": 5}, (NATIVE_WIDTH, 40)),
    (
        "center_both_larger_canvas",
        {"centerHorizontally": True, "centerVertically": True},
        (48, 40),
    ),
    (
        "kitchen_sink",
        {
            "drawMode": "vertical1bit",
            "invertColors": True,
            "flipHorizontally": True,
            "flipVertically": True,
            "bitswap": True,
            "removeZeroesCommas": True,
            "ditheringMode": 2,
        },
        None,
    ),
]

# Bytes per output value per drawMode, mirroring CONVERSION_BYTES_PER_VALUE in
# js/script.js. Used to verify downloadBinFile()'s byte stream (via the
# computeBinData() helper) matches the hex values shown in the text output,
# instead of the multi-byte values (565/888) getting truncated to one byte.
BYTES_PER_VALUE = {
    "horizontal1bit": 1,
    "vertical1bit": 1,
    "horizontal565": 2,
    "horizontal888": 4,
    "horizontalAlpha": 1,
}

# Scenario names to also verify against computeBinData(); restricted to ones
# using the default plain/comma-separated output (outputFormat and separator
# untouched), since that's the format downloadBinFile's parser expects.
BIN_CHECK_NAMES = {
    "default",
    "draw_mode_vertical1bit",
    "draw_mode_horizontal565",
    "draw_mode_horizontal888",
    "draw_mode_horizontal_alpha",
    "rotate_90_horizontal565",
    "rotate_90_horizontal888",
    "rotate_90_horizontal_alpha",
}


def expected_bin_bytes(output, draw_mode):
    """Reconstruct the byte stream a correct downloadBinFile() should produce
    from the plain-format hex text output, expanding each value back to its
    full byte width (MSB first) instead of assuming one byte per value."""
    bytes_per_value = BYTES_PER_VALUE[draw_mode]
    values = (int(tok, 16) for tok in re.findall(r"0x[0-9a-fA-F]+", output))
    result = []
    for value in values:
        for shift in range((bytes_per_value - 1) * 8, -1, -8):
            result.append((value >> shift) & 0xFF)
    return result


def reset_canvas_size(page, width, height):
    """Set canvas size through the real width/height text inputs."""
    page.fill("#screenWidth", str(width))
    page.fill("#screenHeight", str(height))


def apply_settings(page, settings):
    page.select_option("#drawMode", settings["drawMode"])
    # Selecting an output format resets prefix/separator to their defaults
    # (updateOutputFormat() in script.js), so this must run before those two
    # fields are filled in below.
    page.check(f"#{OUTPUT_FORMAT_IDS[settings['outputFormat']]}")
    page.check(f"#backgroundColor{settings['backgroundColor'].capitalize()}")
    set_checkbox(page, "#invertColors", settings["invertColors"])
    page.select_option("#ditheringMode", str(settings["ditheringMode"]))
    page.fill("#ditheringThreshold", str(settings["ditheringThreshold"]))
    page.select_option("#scale", str(settings["scale"]))
    set_checkbox(page, "#centerHorizontally", settings["centerHorizontally"])
    set_checkbox(page, "#centerVertically", settings["centerVertically"])
    page.select_option("#rotation", str(settings["rotation"]))
    set_checkbox(page, "#flipHorizontally", settings["flipHorizontally"])
    set_checkbox(page, "#flipVertically", settings["flipVertically"])
    set_checkbox(page, "#bitswap", settings["bitswap"])
    page.fill("#prefix", settings["prefix"])
    page.fill("#separator", settings["separator"])
    # esp32Format checkbox only exists in the DOM (visible) for non-plain
    # output formats; plain output has no type/PROGMEM declarations to affect.
    if settings["outputFormat"] != "plain":
        set_checkbox(page, "#esp32Format", settings["esp32Format"])


def set_checkbox(page, selector, checked):
    if checked:
        page.check(selector)
    else:
        page.uncheck(selector)


def run_scenario(page, name, overrides, resize):
    settings = {**BASE_SETTINGS, **overrides}
    reset_canvas_size(page, *(resize or (NATIVE_WIDTH, NATIVE_HEIGHT)))
    apply_settings(page, settings)
    # Force a redraw with the final settings state regardless of which
    # controls' change events actually fired (some may be no-ops if the
    # value didn't change from the previous scenario).
    page.evaluate("updateAllImages()")
    page.click("text=Generate code")
    return page.input_value("#code-output")


def roundtrip_eligible(settings):
    """Only plain-format, non-bitswapped 1-bit output is re-importable via the
    "Paste byte array" box: other draw modes aren't supported by the parser,
    bitswap mangles the byte stream with no importer to undo it, and the
    parser splits bytes on commas, so a separator without one (e.g. the
    empty string used to strip formatting) can't be read back."""
    return (
        settings["drawMode"] in ("horizontal1bit", "vertical1bit")
        and settings["outputFormat"] == "plain"
        and not settings["bitswap"]
        and "," in settings["separator"]
    )


def run_roundtrip(page, output, draw_mode, width, height):
    """Paste a generated byte array back in, import it, and re-export it,
    same steps a user would take to sanity-check their array. Uses a fresh
    page load, so the reimported canvas is the only pixel source, nothing
    left over from a previous scenario."""
    page.goto(INDEX_HTML.as_uri())
    # window.onload defaults outputFormat to "arduino"; force it back to plain
    # to match the format the scenario was exported in.
    page.check(f"#{OUTPUT_FORMAT_IDS['plain']}")
    page.fill("#byte-input", output)
    page.fill("#text-input-width", str(width))
    page.fill("#text-input-height", str(height))
    direction = "horizontal" if draw_mode == "horizontal1bit" else "vertical"
    page.click(f"text=Read as {direction}")
    # The imported canvas is only backed by a real <img> once its data-URL
    # finishes loading (async); switching draw mode before that swap
    # completes triggers a redraw from the still-blank placeholder image and
    # wipes the canvas. Wait for the swap so this matches how a person would
    # naturally pause between clicking "Read as..." and changing the dropdown.
    page.wait_for_function("images.first().img.src")
    if direction == "vertical":
        page.select_option("#drawMode", "vertical1bit")
    page.click("text=Generate code")
    return page.input_value("#code-output")


def run_multi_image_independent_sizes(page):
    """Each image in a multi-image upload keeps its own canvas size; setting
    one image's width/height must not resize any other image's canvas.
    Regression test for a bug where every canvas was forced to the size of
    the first uploaded image."""
    page.goto(INDEX_HTML.as_uri())
    page.set_input_files("#file-input", [str(TEST_IMAGE), str(TEST_IMAGE)])
    page.wait_for_function("document.querySelectorAll('#image-size-settings li').length === 2")

    page.fill("#image-size-settings li:nth-child(1) input[name='width']", "50")
    page.fill("#image-size-settings li:nth-child(1) input[name='height']", "60")
    page.fill("#image-size-settings li:nth-child(2) input[name='width']", "20")
    page.fill("#image-size-settings li:nth-child(2) input[name='height']", "10")

    sizes = page.evaluate(
        "[images.getByIndex(0).canvas.width, images.getByIndex(0).canvas.height,"
        " images.getByIndex(1).canvas.width, images.getByIndex(1).canvas.height]"
    )
    expected = [50, 60, 20, 10]
    if sizes != expected:
        print("FAIL   multi_image_independent_sizes")
        return [f"multi_image_independent_sizes: expected canvas sizes {expected}, got {sizes}"]
    print("ok     multi_image_independent_sizes")
    return []


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--update", action="store_true", help="(re)generate golden files instead of comparing"
    )
    parser.add_argument(
        "--diff", action="store_true", help="print a diff against golden output on failure"
    )
    args = parser.parse_args()

    if not TEST_IMAGE.exists():
        print(f"Test image missing at {TEST_IMAGE}; run generate_test_image.py first")
        sys.exit(1)

    GOLDEN_DIR.mkdir(parents=True, exist_ok=True)

    failures = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(INDEX_HTML.as_uri())
        page.set_input_files("#file-input", str(TEST_IMAGE))
        # Wait for the app to finish loading the image and create its canvas.
        page.wait_for_selector("#image-size-settings li")

        for name, overrides, resize in SCENARIOS:
            settings = {**BASE_SETTINGS, **overrides}
            output = run_scenario(page, name, overrides, resize)
            golden_path = GOLDEN_DIR / f"{name}.txt"

            if args.update:
                golden_path.write_text(output)
                print(f"wrote  {name}")
                continue

            if not golden_path.exists():
                failures.append(f"{name}: no golden file (run with --update first)")
                print(f"MISSING {name}")
                continue

            expected = golden_path.read_text()
            if output != expected:
                failures.append(name)
                print(f"FAIL   {name}")
                if args.diff:
                    diff = difflib.unified_diff(
                        expected.splitlines(keepends=True),
                        output.splitlines(keepends=True),
                        fromfile=f"{name} (golden)",
                        tofile=f"{name} (actual)",
                    )
                    sys.stdout.writelines(diff)
                continue

            print(f"ok     {name}")

            if name in BIN_CHECK_NAMES:
                expected_bytes = expected_bin_bytes(output, settings["drawMode"])
                actual_bytes = page.evaluate("Array.from(computeBinData())")
                if actual_bytes != expected_bytes:
                    failures.append(f"{name}: bin data mismatch")
                    print(f"FAIL   {name} (bin)")
                else:
                    print(f"ok     {name} (bin)")

            if roundtrip_eligible(settings):
                width, height = resize or (NATIVE_WIDTH, NATIVE_HEIGHT)
                roundtripped = run_roundtrip(page, output, settings["drawMode"], width, height)
                # The re-imported image has no filename to derive a glyph
                # comment from, so plain output drops its leading "// name,
                # WxHpx" comment line; strip it before comparing byte data.
                comparable_output = re.sub(r"^//[^\n]*\n", "", output)
                if roundtripped != comparable_output:
                    failures.append(f"{name}: round-trip mismatch")
                    print(f"FAIL   {name} (round-trip)")
                    if args.diff:
                        diff = difflib.unified_diff(
                            comparable_output.splitlines(keepends=True),
                            roundtripped.splitlines(keepends=True),
                            fromfile=f"{name} (exported)",
                            tofile=f"{name} (re-imported+exported)",
                        )
                        sys.stdout.writelines(diff)
                else:
                    print(f"ok     {name} (round-trip)")

                # The page was reloaded for the round-trip check; reload the
                # test image so the next scenario has its canvas back.
                page.goto(INDEX_HTML.as_uri())
                page.set_input_files("#file-input", str(TEST_IMAGE))
                page.wait_for_selector("#image-size-settings li")

        if not args.update:
            failures.extend(run_multi_image_independent_sizes(page))

        browser.close()

    if args.update:
        print(f"\nWrote {len(SCENARIOS)} golden files to {GOLDEN_DIR}")
        return

    total = len(SCENARIOS) + 1
    if failures:
        print(f"\n{len(failures)} of {total} scenarios failed:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)

    print(f"\nAll {total} scenarios match golden output.")


if __name__ == "__main__":
    main()
