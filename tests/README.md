# image2cpp test suite

Test uses the real `index.html` file and scripts in a headless browser
using `Playwright`. Output is compared against known valid (`golden`) files.
This way we are testing the output of the actual tool, not a reimplementation.

## Setup and running

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r tests/requirements.txt
playwright install chromium
```

To run:
```
python3 tests/test_conversions.py
```

Prints `ok`/`FAIL` per scenario and exits non-zero if anything doesn't
match.

## Updating golden files and test image

To generate the test image again (only needed if we changed the image):
```
python3 tests/generate_test_image.py
```

After an intentional change to the conversion logic, regenerate the
golden output and optionally review the diff before committing:

```
python3 tests/test_conversions.py --update
git diff tests/golden
```
