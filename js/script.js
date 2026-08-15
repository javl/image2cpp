/* eslint-disable radix */
/* eslint-disable max-len */
/* eslint-disable no-plusplus */
// A bunch of settings used when converting
const settings = {
  screenWidth: 128,
  screenHeight: 64,
  scaleToFit: true,
  preserveRatio: true,
  centerHorizontally: false,
  centerVertically: false,
  flipHorizontally: false,
  flipVertically: false,
  backgroundColor: 'white',
  scale: 1,
  drawMode: 'horizontal',
  prefix: '0x',
  ditheringThreshold: 128,
  ditheringMode: 2,
  outputFormat: 'plain',
  separator: ', ',
  outputComments: true,
  invertColors: false,
  rotation: 0,
  esp32Format: false,
  bytesPerRow: 16,
  showAsciiPreview: false,
};

function bitswap(b) {
  if (settings.bitswap) {
    // eslint-disable-next-line no-bitwise, no-mixed-operators, no-param-reassign
    b = (b & 0xF0) >> 4 | (b & 0x0F) << 4;
    // eslint-disable-next-line no-bitwise, no-mixed-operators, no-param-reassign
    b = (b & 0xCC) >> 2 | (b & 0x33) << 2;
    // eslint-disable-next-line no-bitwise, no-mixed-operators, no-param-reassign
    b = (b & 0xAA) >> 1 | (b & 0x55) << 1;
  }
  return b;
}

// settings.bytesPerRow of 0 means "wrap using the image's width instead",
// so a 8px-wide image gets a newline every 8 bytes.
function resolveWrapWidth(canvasWidth) {
  return settings.bytesPerRow > 0 ? settings.bytesPerRow : canvasWidth;
}

// Accumulates formatted bytes (prefix/value/separator, wrapped every
// wrapWidth bytes) so our ConversionFunctions can use this formatting.
// horizontal888 always wraps once per image row (canvasWidth) regardless
// of settings.bytesPerRow. When settings.showAsciiPreview is on, wrapWidth
// is ignored in favor of explicit endRow() calls (see makeAsciiRowTracker).
function makeByteWriter(wrapWidth) {
  let out = '';
  let count = 0;
  return {
    push(value, hexWidth) {
      const byteSet = bitswap(value).toString(16).padStart(hexWidth, '0');
      out += `${settings.prefix}${byteSet}${settings.separator}`;
      count++;
      if (!settings.showAsciiPreview && count >= wrapWidth) {
        out += '\n';
        count = 0;
      }
    },
    // Ends the current line early with a dot/hash ascii-art comment for the
    // row of pixels just written. Only called when settings.showAsciiPreview
    // is on, so it always wins over wrapWidth-based wrapping.
    endRow(asciiRow) {
      out += `// ${asciiRow.split('').join(' ')}\n`;
      count = 0;
    },
    result() { return out; },
  };
}

// Builds a per-image-row ascii-art tracker (. for off, # for on) used
// when settings.showAsciiPreview is on. Call once per pixel with the same
// `index` used to read that pixel's channel data; flushes to the writer as
// a comment at the end of each image row, mirroring the row-boundary math
// packBitsHorizontal uses to flush partial bytes.
function makeAsciiRowTracker(canvasWidth, dataLength) {
  let row = '';
  return (index, isOn, writer) => {
    if (!settings.showAsciiPreview) return;
    row += isOn ? '#' : '.';
    const pixelIndex = index / 4;
    const isRowEnd = pixelIndex !== 0 && ((pixelIndex + 1) % canvasWidth) === 0;
    const isImageEnd = index === dataLength - 4;
    if (isRowEnd || isImageEnd) {
      writer.endRow(row);
      row = '';
    }
  };
}

// Shared by horizontal1bit/horizontalAlpha: pack 8 samples (one per pixel,
// MSB first) into a byte, resetting early at the end of a row or the image
// so a partial final byte is still zero-padded instead of dropped.
function packBitsHorizontal(data, canvasWidth, writer, sampleAt) {
  let byteIndex = 7;
  let number = 0;
  const trackAscii = makeAsciiRowTracker(canvasWidth, data.length);
  for (let index = 0; index < data.length; index += 4) {
    const isOn = sampleAt(data, index) > settings.ditheringThreshold;
    if (isOn) {
      number += 2 ** byteIndex;
    }
    byteIndex--;

    const isRowEnd = index !== 0 && (((index / 4) + 1) % canvasWidth) === 0;
    const isImageEnd = index === data.length - 4;
    if (isRowEnd || isImageEnd) {
      byteIndex = -1;
    }

    if (byteIndex < 0) {
      writer.push(number, 2);
      number = 0;
      byteIndex = 7;
    }

    trackAscii(index, isOn, writer);
  }
}

const ConversionFunctions = {
  // Output the image as a string for horizontally drawing displays
  horizontal1bit(data, canvasWidth) {
    const writer = makeByteWriter(resolveWrapWidth(canvasWidth));
    const avgRgb = (d, i) => (d[i] + d[i + 1] + d[i + 2]) / 3;
    packBitsHorizontal(data, canvasWidth, writer, avgRgb);
    return writer.result();
  },

  // Output the image as a string for vertically drawing displays
  vertical1bit(data, canvasWidth, canvasHeight) {
    const writer = makeByteWriter(resolveWrapWidth(canvasWidth));
    for (let p = 0; p < Math.ceil(canvasHeight / 8); p++) {
      for (let x = 0; x < canvasWidth; x++) {
        let byteIndex = 7;
        let number = 0;

        for (let y = 7; y >= 0; y--) {
          const index = ((p * 8) + y) * (canvasWidth * 4) + x * 4;
          const avg = (data[index] + data[index + 1] + data[index + 2]) / 3;
          if (avg > settings.ditheringThreshold) {
            number += 2 ** byteIndex;
          }
          byteIndex--;
        }
        writer.push(number, 2);
      }
    }
    return writer.result();
  },

  // Output the image as a string for 565 displays (horizontally)
  // eslint-disable-next-line no-unused-vars
  horizontal565(data, canvasWidth) {
    const writer = makeByteWriter(resolveWrapWidth(canvasWidth));
    const trackAscii = makeAsciiRowTracker(canvasWidth, data.length);
    // format is RGBA, so move 4 steps per pixel
    for (let index = 0; index < data.length; index += 4) {
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      // Calculate the 565 color value
      // eslint-disable-next-line no-bitwise
      const rgb = ((r & 0b11111000) << 8) | ((g & 0b11111100) << 3) | ((b & 0b11111000) >> 3);
      writer.push(rgb, 4);
      trackAscii(index, (r + g + b) / 3 > settings.ditheringThreshold, writer);
    }
    return writer.result();
  },
  // Output the image as a string for rgb888 displays (horizontally), one
  // image row per output line
  horizontal888(data, canvasWidth) {
    const writer = makeByteWriter(canvasWidth);
    const trackAscii = makeAsciiRowTracker(canvasWidth, data.length);
    // format is RGBA, so move 4 steps per pixel
    for (let index = 0; index < data.length; index += 4) {
      // Split into RGB and pack into a single 24-bit value (MSB first)
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      // eslint-disable-next-line no-bitwise
      const rgb = (r << 16) | (g << 8) | (b);
      writer.push(rgb, 8);
      trackAscii(index, (r + g + b) / 3 > settings.ditheringThreshold, writer);
    }
    return writer.result();
  },
  // Output the alpha mask as a string for horizontally drawing displays
  horizontalAlpha(data, canvasWidth) {
    const writer = makeByteWriter(resolveWrapWidth(canvasWidth));
    packBitsHorizontal(data, canvasWidth, writer, (d, i) => d[i + 3]);
    return writer.result();
  },
};
settings.conversionFunction = ConversionFunctions.horizontal1bit;

// Bytes per output value for each conversion function, matching the
// hexWidth passed to writer.push() in that function (hexWidth / 2).
// Needed by downloadBinFile() to reconstruct the true byte stream instead
// of truncating multi-byte values (565/888) down to a single byte.
const CONVERSION_BYTES_PER_VALUE = new Map([
  [ConversionFunctions.horizontal1bit, 1],
  [ConversionFunctions.vertical1bit, 1],
  [ConversionFunctions.horizontal565, 2],
  [ConversionFunctions.horizontal888, 4],
  [ConversionFunctions.horizontalAlpha, 1],
]);

// An images collection with helper methods
function Images() {
  const collection = [];
  this.push = (img, canvas, glyph, width, height) => {
    collection.push({
      img, canvas, glyph, width, height,
    });
  };
  this.remove = (image) => {
    const i = collection.indexOf(image);
    if (i !== -1) collection.splice(i, 1);
  };
  this.each = (f) => { collection.forEach(f); };
  this.length = () => collection.length;
  this.first = () => collection[0];
  this.last = () => collection[collection.length - 1];
  this.getByIndex = (index) => collection[index];
  this.setByIndex = (index, img) => { collection[index] = img; };
  this.get = (img) => {
    if (img) {
      for (let i = 0; i < collection.length; i++) {
        if (collection[i].img === img) {
          return collection[i];
        }
      }
    }
    return collection;
  };
  return this;
}

const images = new Images();
// Filetypes accepted by the file picker
// const fileTypes = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'svg'];

// Invert the colors of the canvas
function invert(canvas, ctx) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]; // red
    data[i + 1] = 255 - data[i + 1]; // green
    data[i + 2] = 255 - data[i + 2]; // blue
  }
  ctx.putImageData(imageData, 0, 0);
}

// Draw the image onto the canvas, taking into account color and scaling
function placeImage(_image) {
  const { img } = _image;
  const { canvas } = _image;
  const ctx = canvas.getContext('2d');

  // reset canvas size (falls back to the canvas' current size for images,
  // like a re-imported byte array, that aren't tracked in the image list
  // with their own width/height)
  canvas.width = Number.isFinite(_image.width) && _image.width > 0 ? _image.width : canvas.width;
  canvas.height = Number.isFinite(_image.height) && _image.height > 0 ? _image.height : canvas.height;
  // eslint-disable-next-line no-param-reassign
  _image.ctx = ctx;
  ctx.save();

  // Draw background
  if (settings.backgroundColor === 'transparent') {
    ctx.fillStyle = 'rgba(0,0,0,0.0)';
    ctx.globalCompositeOperation = 'copy';
  } else {
    if (settings.invertColors) {
      if (settings.backgroundColor === 'white') {
        ctx.fillStyle = 'black';
      } else {
        ctx.fillStyle = 'white';
      }
    } else {
      ctx.fillStyle = settings.backgroundColor;
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Offset used for centering the image when requested
  let offsetX = 0;
  let offsetY = 0;
  const imgW = img.width;
  const imgH = img.height;

  switch (settings.scale) {
    case 1: // Original
      if (settings.centerHorizontally) {
        offsetX = Math.round((canvas.width - imgW) / 2);
      }
      if (settings.centerVertically) {
        offsetY = Math.round((canvas.height - imgH) / 2);
      }
      ctx.drawImage(
        img,
        0,
        0,
        imgW,
        imgH,
        offsetX,
        offsetY,
        imgW,
        imgH,
      );
      break;
    case 2: {
      // Fit (make as large as possible without changing ratio)
      const useRatio = Math.min(canvas.width / imgW, canvas.height / imgH);
      if (settings.centerHorizontally) {
        offsetX = Math.round((canvas.width - imgW * useRatio) / 2);
      }
      if (settings.centerVertically) {
        offsetY = Math.round((canvas.height - imgH * useRatio) / 2);
      }

      ctx.drawImage(
        img,
        0,
        0,
        imgW,
        imgH,
        offsetX,
        offsetY,
        imgW * useRatio,
        imgH * useRatio,
      );
      break;
    }
    case 3: // Stretch x+y (make as large as possible without keeping ratio)
      ctx.drawImage(
        img,
        0,
        0,
        imgW,
        imgH,
        offsetX,
        offsetY,
        canvas.width,
        canvas.height,
      );
      break;
    case 4: // Stretch x (make as wide as possible)
      offsetX = 0;
      if (settings.centerVertically) { Math.round(offsetY = (canvas.height - imgH) / 2); }
      // offsetY *= offsetY_dir;
      ctx.drawImage(
        img,
        0,
        0,
        imgW,
        imgH,
        offsetX,
        offsetY,
        canvas.width,
        imgH,
      );
      break;
    case 5: // Stretch y (make as tall as possible)
      if (settings.centerHorizontally) { offsetX = Math.round((canvas.width - imgW) / 2); }
      // offsetX *= offsetX_dir;
      offsetY = 0;
      ctx.drawImage(
        img,
        0,
        0,
        imgW,
        imgH,
        offsetX,
        offsetY,
        imgW,
        canvas.height,
      );
      break;
    default:
      // console.log('unknown scale');
      break;
  }
  ctx.restore();

  if (settings.conversionFunction === ConversionFunctions.horizontal1bit
    || settings.conversionFunction === ConversionFunctions.vertical1bit) {
    // eslint-disable-next-line no-undef
    dithering(ctx, canvas.width, canvas.height, settings.ditheringThreshold, settings.ditheringMode);
    if (settings.invertColors) {
      invert(canvas, ctx);
    }
  }

  if (settings.rotation !== 0) {
    const clone = canvas.cloneNode(true);
    clone.getContext('2d').drawImage(canvas, 0, 0);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (settings.rotation === 90) {
      canvas.width = clone.height;
      canvas.height = clone.width;
      ctx.setTransform(1, 0, 0, 1, canvas.width, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(clone, 0, 0);
    } else if (settings.rotation === 180) {
      ctx.setTransform(1, 0, 0, 1, canvas.width, canvas.height);
      ctx.rotate(Math.PI);
      ctx.drawImage(clone, 0, 0);
    } else if (settings.rotation === 270) {
      canvas.width = clone.height;
      canvas.height = clone.width;
      ctx.setTransform(1, 0, 0, 1, 0, canvas.height);
      ctx.rotate(Math.PI * 1.5);
      ctx.drawImage(clone, 0, 0);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  const flipHorizontal = settings.flipHorizontally ? -1 : 1;
  const xOffset = settings.flipHorizontally ? canvas.width : 0;
  const flipVertical = settings.flipVertically ? -1 : 1;
  const yOffset = settings.flipVertically ? canvas.height : 0;

  if (flipHorizontal === -1 || flipVertical === -1) {
    const clone = canvas.cloneNode(true);
    clone.getContext('2d').drawImage(canvas, 0, 0);
    ctx.setTransform(flipHorizontal, 0, 0, flipVertical, xOffset, yOffset); // set the scale and position
    ctx.drawImage(clone, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

// Handle drawing each of our images
function updateAllImages() {
  images.each((image) => {
    placeImage(image);
  });
}

// Easy way to update settings controlled by a textfield
// eslint-disable-next-line no-unused-vars
function updateInteger(fieldName) {
  settings[fieldName] = parseInt(document.getElementById(fieldName).value);
  updateAllImages();
}

// Easy way to update settings controlled by a checkbox
// eslint-disable-next-line no-unused-vars
function updateBoolean(fieldName) {
  settings[fieldName] = document.getElementById(fieldName).checked;
  updateAllImages();
}

// Easy way to update settings controlled by a text input
// eslint-disable-next-line no-unused-vars
function updateString(fieldName) {
  settings[fieldName] = document.getElementById(fieldName).value;
  updateAllImages();
}

// Convert hex to binary
function hexToBinary(s) {
  let ret = '';
  for (let i = 0; i < s.length; i += 1) {
    const nibble = parseInt(s[i], 16);
    if (Number.isNaN(nibble)) {
      return { valid: false, s };
    }
    ret += nibble.toString(2).padStart(4, '0');
  }
  return { valid: true, result: ret };
}

// The plain byte type, independent of drawMode (used by output formats,
// like adafruit_gfx, that are always byte-packed regardless of the current
// conversion function).
function getByteType() {
  return settings.esp32Format ? 'uint8_t' : 'unsigned char';
}

// get the type (in arduino code) of the output image
// this is a bit of a hack, it's better to make this a property of the conversion function (should probably turn it into objects)
function getImageType() {
  if (settings.conversionFunction === ConversionFunctions.horizontal565) {
    return 'uint16_t';
  } if (settings.conversionFunction === ConversionFunctions.horizontal888) {
    return 'unsigned long';
  }
  return getByteType();
}

// PROGMEM is an AVR-ism: it's a no-op on ESP32 (flash is memory-mapped
// there), so the ESP32 output toggle drops it instead of emitting a keyword
// that does nothing.
function progmemKeyword() {
  return settings.esp32Format ? '' : ' PROGMEM';
}

// Use the horizontally oriented list to draw the image
// Validates and decodes a comma-split list of pasted hex byte strings into
// one contiguous bit string (MSB first, each entry padded to a full byte).
// Returns { valid: true, bits } or { valid: false, s } naming the bad entry.
function hexListToBits(list) {
  let bits = '';
  for (let i = 0; i < list.length; i++) {
    const binString = hexToBinary(list[i]);
    if (!binString.valid) {
      return binString;
    }
    bits += binString.result.length === 4 ? `${binString.result}0000` : binString.result;
  }
  return { valid: true, bits };
}

function reportInvalidByteArray(s) {
  const errorEl = document.getElementById('text-input-error');
  errorEl.textContent = 'Something went wrong converting the string. Make sure there are no comments in your input.';
  errorEl.style.display = 'block';
  // eslint-disable-next-line no-console
  console.error('invalid hexToBinary: ', s);
}

// Save the canvas contents inside the (first) image object so it can be
// reused when scaling/inverting/etc.
function commitCanvasToFirstImage(canvas) {
  const img = new Image();
  img.onload = () => {
    images.first().img = img;
  };
  img.src = canvas.toDataURL('image/png');
}

// Use the horizontally oriented list to draw the image
function listToImageHorizontal(list, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const decoded = hexListToBits(list);
  if (!decoded.valid) {
    reportInvalidByteArray(decoded.s);
    return false;
  }

  const imgData = ctx.createImageData(canvas.width, canvas.height);
  let index = 0;

  // round the width up to the next byte
  const widthRoundedUp = Math.floor(canvas.width / 8 + (canvas.width % 8 ? 1 : 0)) * 8;
  let widthCounter = 0;

  // Move the list into the imageData object
  for (let k = 0; k < decoded.bits.length; k++, widthCounter++) {
    // if we've counted enough bits, reset counter for next line
    if (widthCounter >= widthRoundedUp) {
      widthCounter = 0;
    }
    // skip 'artifact' pixels due to rounding up to a byte
    if (widthCounter < canvas.width) {
      const color = decoded.bits.charAt(k) === '1' ? 255 : 0;
      imgData.data[index] = color;
      imgData.data[index + 1] = color;
      imgData.data[index + 2] = color;
      imgData.data[index + 3] = 255;
      index += 4;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  commitCanvasToFirstImage(canvas);
  return true;
}

// Quick and effective way to draw single pixels onto the canvas
// using a global 1x1px large canvas
function drawPixel(ctx, x, y, color) {
  const singlePixel = ctx.createImageData(1, 1);
  const d = singlePixel.data;

  d[0] = color;
  d[1] = color;
  d[2] = color;
  d[3] = 255;
  ctx.putImageData(singlePixel, x, y);
}

// Use the vertically oriented list to draw the image
function listToImageVertical(list, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const decoded = hexListToBits(list);
  if (!decoded.valid) {
    reportInvalidByteArray(decoded.s);
    return false;
  }

  let page = 0;
  let x = 0;
  let y = 7;

  // Move the list into the imageData object
  for (let k = 0; k < decoded.bits.length; k++) {
    const color = decoded.bits.charAt(k) === '1' ? 255 : 0;
    drawPixel(ctx, x, (page * 8) + y, color);
    y--;
    if (y < 0) {
      y = 7;
      x++;
      if (x >= settings.screenWidth) {
        x = 0;
        page++;
      }
    }
  }

  commitCanvasToFirstImage(canvas);
  return true;
}

// Set width/height preset for byte array text input
// eslint-disable-next-line no-unused-vars
function setTextInputSize(width, height) {
  document.getElementById('text-input-width').value = width;
  document.getElementById('text-input-height').value = height;
}

// Show/hide the "no images" error and report whether images are available
function checkImagesAvailable() {
  const error = document.getElementById('no-images-error');
  const glyphNameNote = document.getElementById('glyph-name-note');
  const hasImages = images.length() > 0;
  error.style.display = hasImages ? 'none' : 'block';
  glyphNameNote.style.display = hasImages ? 'block' : 'none';
  return hasImages;
}

// Handle inserting an image by pasting code
// eslint-disable-next-line no-unused-vars
function handleTextInput(drawMode) {
  const canvasContainer = document.getElementById('images-canvas-container');
  const canvas = document.createElement('canvas');

  canvas.width = parseInt(document.getElementById('text-input-width').value);
  canvas.height = parseInt(document.getElementById('text-input-height').value);
  settings.screenWidth = canvas.width;
  settings.screenHeight = canvas.height;

  if (canvasContainer.children.length) {
    canvasContainer.removeChild(canvasContainer.firstChild);
  }
  canvasContainer.appendChild(canvas);

  const image = new Image();
  images.setByIndex(0, { img: image, canvas, ctx: canvas.getContext('2d') });

  let input = document.getElementById('byte-input').value;

  // Remove Arduino code
  input = input.replace(/const\s+(unsigned\s+char|uint8_t)\s+[a-zA-Z0-9]+\s*\[\]\s*(PROGMEM\s*)?=\s*/g, '');
  input = input.replace(/\};|\{/g, '');

  // Remove comments (while newlines are still newlines, so the whole
  // comment is dropped even if it contains a comma, e.g. "// 'name', 8x8px")
  input = input.replace(/\/\/.*$/gm, '');
  // Convert newlines to comma
  input = input.replace(/\r\n|\r|\n/g, ',');
  // Convert multiple commas in a row into a single one
  input = input.replace(/,{2,}/g, ',');
  // Remove whitespace
  input = input.replace(/\s/g, '');
  // Remove "0x"
  input = input.replace(/0[xX]/g, '');
  // Split into list
  const list = input.split(',');

  if (list.length === 1 && list[0] === '') {
    const errorEl = document.getElementById('text-input-error');
    errorEl.textContent = 'Byte array is empty or invalid. Make sure there are no comments in your input.';
    errorEl.style.display = 'block';
    return;
  }

  const success = drawMode === 'horizontal'
    ? listToImageHorizontal(list, canvas)
    : listToImageVertical(list, canvas);

  if (success) {
    document.getElementById('text-input-error').style.display = 'none';
    document.querySelectorAll('.no-file-selected').forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      el.style.display = 'none';
    });
    checkImagesAvailable();

    // Mirror the result onto a small preview canvas right below the
    // buttons, so the pasted array is visible without scrolling to step 3.
    const previewCanvas = document.getElementById('text-input-preview-canvas');
    previewCanvas.width = canvas.width;
    previewCanvas.height = canvas.height;
    previewCanvas.getContext('2d').drawImage(canvas, 0, 0);
    previewCanvas.style.display = 'block';

    const readImagesNoteEl = document.getElementById('read-images-note');
    readImagesNoteEl.style.display = 'block';
  }
}

// eslint-disable-next-line no-unused-vars
function allSameSize() {
  if (images.length() > 1) {
    const inputs = document.querySelectorAll('#image-size-settings input');
    // all images same size button
    for (let i = 2; i < inputs.length; i++) {
      if (inputs[i].name === 'width') {
        inputs[i].value = inputs[0].value;
        inputs[i].oninput();
      }
      if (inputs[i].name === 'height') {
        inputs[i].value = inputs[1].value;
        inputs[i].oninput();
      }
    }
  }
}

// Handle selecting an image with the file picker
function handleImageSelection(evt) {
  const files = Array.from(evt.target.files);
  files.sort((a, b) => a.name > b.name);
  // error message
  const onlyImagesFileError = document.getElementById('only-images-file-error');

  onlyImagesFileError.style.display = 'none';

  // initial message
  const noFileSelected = document.querySelectorAll('.no-file-selected');
  if (files.length > 0) {
    noFileSelected.forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      el.style.display = 'none';
    });
  } else {
    noFileSelected.forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      el.style.display = 'block';
    });
  }

  if (files.length > 0) {
    document.getElementById('continue-note').style.display = 'block';
  } else {
    document.getElementById('continue-note').style.display = 'none';
  }

  for (let i = 0; files[i]; i++) {
    // Only process image files.
    if (!files[i].type.match('image.*')) {
      onlyImagesFileError.style.display = 'block';
      // eslint-disable-next-line no-continue
      continue;
    }

    const reader = new FileReader();

    reader.onload = (file) => {
      // eslint-disable-next-line no-param-reassign
      file.name = reader.name;
      // Render thumbnail.
      const img = new Image();

      img.onload = () => {
        const fileInputColumnEntry = document.createElement('div');
        fileInputColumnEntry.className = 'file-input-entry';

        const fileInputColumnEntryThumb = document.createElement('img');
        fileInputColumnEntryThumb.className = 'image-size-thumb';
        fileInputColumnEntryThumb.src = img.src;
        fileInputColumnEntryThumb.alt = file.name;

        const fileInputColumnEntryLabel = document.createElement('span');
        fileInputColumnEntryLabel.textContent = file.name;

        const fileInputColumnEntryRemoveButton = document.createElement('button');
        fileInputColumnEntryRemoveButton.className = 'remove-button';
        fileInputColumnEntryRemoveButton.innerHTML = 'remove image';

        const canvas = document.createElement('canvas');

        const imageEntry = document.createElement('li');
        imageEntry.setAttribute('data-img', file.name);

        const thumb = document.createElement('img');
        thumb.className = 'image-size-thumb';
        thumb.src = img.src;
        thumb.alt = file.name;

        const w = document.createElement('input');
        w.type = 'number';
        w.name = 'width';
        w.id = 'screenWidth';
        w.min = 1;
        w.className = 'size-input';
        w.value = img.width;
        w.oninput = () => {
          const image = images.get(img);
          image.width = parseInt(w.value, 10);
          placeImage(image);
        };

        const h = document.createElement('input');
        h.type = 'number';
        h.name = 'height';
        h.id = 'screenHeight';
        h.min = 1;
        h.className = 'size-input';
        h.value = img.height;
        h.oninput = () => {
          const image = images.get(img);
          image.height = parseInt(h.value, 10);
          placeImage(image);
        };

        const gil = document.createElement('span');
        gil.innerHTML = 'glyph name';
        gil.className = 'file-info';

        const gi = document.createElement('input');
        gi.type = 'text';
        gi.name = 'glyph';
        gi.className = 'glyph-input';
        const [fileName] = file.name.split('.');
        gi.value = fileName;
        gi.onchange = () => {
          const image = images.get(img);
          image.glyph = gi.value;
        };

        const fileInputColumn = document.getElementById('file-input-column-items');
        const imageSizeSettings = document.getElementById('image-size-settings');
        const canvasContainer = document.getElementById('images-canvas-container');

        const removeButtonOnClick = () => {
          const image = images.get(img);
          canvasContainer.removeChild(image.canvas);
          images.remove(image);
          imageSizeSettings.removeChild(imageEntry);

          fileInputColumn.removeChild(fileInputColumnEntry);
          if (imageSizeSettings.children.length <= 1) {
            document.getElementById('all-same-size').style.display = 'none';
          }
          if (images.length() === 0) {
            document.getElementById('file-input').value = '';
            noFileSelected.forEach((el) => {
              // eslint-disable-next-line no-param-reassign
              el.style.display = 'block';
            });
          }
          updateAllImages();
          checkImagesAvailable();
        };

        const rb = document.createElement('button');
        rb.className = 'remove-button';
        rb.innerHTML = 'remove image';
        rb.onclick = removeButtonOnClick;

        const fn = document.createElement('span');
        fn.className = 'file-info file-name';
        fn.innerHTML = `${file.name} (file resolution: ${img.width} x ${img.height})`;

        fn.appendChild(rb);

        fileInputColumnEntryRemoveButton.onclick = removeButtonOnClick;

        fileInputColumnEntry.appendChild(fileInputColumnEntryThumb);
        fileInputColumnEntry.appendChild(fileInputColumnEntryLabel);
        fileInputColumnEntry.appendChild(fileInputColumnEntryRemoveButton);
        fileInputColumn.appendChild(fileInputColumnEntry);

        const imageEntryDetails = document.createElement('div');
        imageEntryDetails.className = 'image-size-details';
        imageEntryDetails.appendChild(fn);
        imageEntryDetails.appendChild(w);
        imageEntryDetails.appendChild(document.createTextNode(' x '));
        imageEntryDetails.appendChild(h);
        imageEntryDetails.appendChild(gil);
        imageEntryDetails.appendChild(gi);

        imageEntry.appendChild(thumb);
        imageEntry.appendChild(imageEntryDetails);

        imageSizeSettings.appendChild(imageEntry);

        canvas.width = img.width;
        canvas.height = img.height;
        canvasContainer.appendChild(canvas);

        images.push(img, canvas, file.name.split('.')[0], img.width, img.height);
        if (images.length() > 1) {
          document.getElementById('all-same-size').style.display = 'block';
        }
        placeImage(images.last());
        checkImagesAvailable();
      };
      img.src = file.target.result;
    };
    reader.name = files[i].name;
    reader.readAsDataURL(files[i]);
  }
}

function imageToString(image) {
  // extract raw image data
  const { ctx } = image;
  const { canvas } = image;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  return settings.conversionFunction(data, canvas.width, canvas.height);
}

// Get the custom arduino output variable name, if any
function getIdentifier() {
  const vn = document.getElementById('identifier');
  return (vn && vn.value.length) ? vn.value : '';
}

// Builds the "// 'glyph', WxHpx" comment line placed before each image's
// byte array, or '' when comments are disabled. Indent is prefixed when given.
function glyphComment(image, indent = '') {
  if (!settings.outputComments) return '';
  return `${indent}// '${image.glyph}', ${image.canvas.width}x${image.canvas.height}px\n`;
}

// Removes the trailing separator comma left after the last byte value.
// When settings.showAsciiPreview is on, the string always ends with a
// dot/hash ascii-art comment line instead (see makeAsciiRowTracker), so the
// comma sits just before that comment rather than at the true end.
function stripTrailingComma(str) {
  return settings.showAsciiPreview
    ? str.replace(/,(\s*\/\/[^\n]*)\n?\s*$/, '$1')
    : str.replace(/,\s*$/, '');
}

// Output the image string to the textfield
// eslint-disable-next-line no-unused-vars
function generateOutputString() {
  if (!checkImagesAvailable()) return;

  let outputString = '';
  let code = '';

  switch (settings.outputFormat) {
    case 'arduino': {
      const varQuickArray = [];
      let bytesUsed = 0;
      // --
      images.each((image) => {
        code = imageToString(image);

        // Trim whitespace from end and remove trailing comma
        code = stripTrailingComma(code);

        code = `\t${code.split('\n').join('\n\t')}\n`;
        // const variableCount = images.length() > 1 ? count++ : '';
        const comment = glyphComment(image);
        bytesUsed += code.split('\n').length * resolveWrapWidth(image.canvas.width);

        const varname = getIdentifier() + (image.glyph ? `${image.glyph.replace(/[^a-zA-Z0-9]/g, '_')}` : '');
        varQuickArray.push(varname);
        code = `${comment}const ${getImageType()} ${varname} []${progmemKeyword()} = {\n${code}};\n`;
        outputString += code;
      });

      varQuickArray.sort();
      if (outputString.length > 0) {
        outputString += '\n';
      }
      if (settings.outputComments) {
        const storageNote = settings.esp32Format ? '' : ' in PROGMEM';
        outputString += `// Array of all bitmaps for convenience. (Total bytes used to store images${storageNote} = ${bytesUsed})\n`;
      }
      outputString += `const int ${getIdentifier()}allArray_LEN = ${varQuickArray.length};\n`;
      outputString += `const ${getImageType()}* ${getIdentifier()}allArray[${varQuickArray.length}] = {\n\t${varQuickArray.join(',\n\t')}\n};\n`;
      break;
    }

    case 'arduino_single': {
      let comment = '';
      images.each((image) => {
        code = imageToString(image);
        code = `\t${code.split('\n').join('\n\t')}\n`;
        comment = glyphComment(image, '\t');
        outputString += comment + code;
      });

      outputString = stripTrailingComma(outputString);

      outputString = `const ${getImageType()} ${
        getIdentifier()
      } []${progmemKeyword()} = {`
            + `\n${outputString}\n};`;
      break;
    }

    case 'adafruit_gfx': { // bitmap
      let comment = '';
      let useGlyphs = 0;
      images.each((image) => {
        code = imageToString(image);
        code = `\t${code.split('\n').join('\n\t')}\n`;
        comment = glyphComment(image, '\t');
        outputString += comment + code;
        if (image.glyph.length === 1) {
          useGlyphs++;
        }
      });

      outputString = stripTrailingComma(outputString);
      outputString = `const ${getByteType()} ${
        getIdentifier()
      }Bitmap`
            + ` []${progmemKeyword()} = {`
            + `\n${outputString}\n};\n\n`
            + `const GFXbitmapGlyph ${
              getIdentifier()
            }Glyphs []${progmemKeyword()} = {\n`;

      let firstAschiiChar = document.getElementById('first-ascii-char').value;
      const xAdvance = parseInt(document.getElementById('x-advance').value);
      let offset = 0;
      code = '';

      // GFXbitmapGlyph
      images.each((image) => {
        code += `\t{ ${
          offset}, ${
          image.canvas.width}, ${
          image.canvas.height}, ${
          xAdvance}, `
              + `'${images.length() === useGlyphs
                ? image.glyph
                : String.fromCharCode(firstAschiiChar++)}'`
              + ' }';
        if (image !== images.last()) {
          code += ',';
        }
        code += settings.outputComments ? `// '${image.glyph}'\n` : '\n';
        offset += image.canvas.width;
      });
      code += '};\n';
      outputString += code;

      // GFXbitmapFont
      outputString += `\nconst GFXbitmapFont ${
        getIdentifier()
      }Font${progmemKeyword()} = {\n`
            + `\t(uint8_t *)${
              getIdentifier()}Bitmap,\n`
            + `\t(GFXbitmapGlyph *)${
              getIdentifier()
            }Glyphs,\n`
            + `\t${images.length()
            }\n};\n`;
      break;
    }
    default: { // plain
      images.each((image) => {
        code = imageToString(image);
        let comment = image.glyph ? glyphComment(image) : '';
        if (image.img !== images.first().img) {
          comment = `\n${comment}`;
        }
        code = comment + code;
        outputString += code;
      });
      // Trim whitespace from end and remove trailing comma
      outputString = stripTrailingComma(outputString);
    }
  }

  document.getElementById('code-output').value = outputString;
}

// Copy the final output to the clipboard
// eslint-disable-next-line no-unused-vars
function copyOutput() {
  if (!checkImagesAvailable()) return;

  const output = document.getElementById('code-output');
  if (!output.value) {
    generateOutputString();
  }
  navigator.clipboard.writeText(output.value);
}

// Rebuilds the true byte stream for the current images/conversion mode by
// re-splitting each formatted output value (which may be 1, 2 or 4 bytes
// wide, depending on drawMode) back into its individual bytes, most-
// significant first. Exposed standalone so it can be exercised directly in
// tests without going through a real browser file download.
function computeBinData() {
  const bytesPerValue = CONVERSION_BYTES_PER_VALUE.get(settings.conversionFunction) || 1;
  const raw = [];
  images.each((image) => {
    const values = imageToString(image)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((token) => parseInt(token, 16));
    values.forEach((value) => {
      // Split back into individual bytes, most-significant first, matching
      // the left-to-right digit order produced by toString(16).padStart().
      for (let shift = (bytesPerValue - 1) * 8; shift >= 0; shift -= 8) {
        // eslint-disable-next-line no-bitwise
        raw.push((value >> shift) & 0xff);
      }
    });
  });
  return new Uint8Array(raw);
}

// eslint-disable-next-line no-unused-vars
function downloadBinFile() {
  if (!checkImagesAvailable()) return;

  const data = computeBinData();
  const a = document.createElement('a');
  a.style = 'display: none';
  document.body.appendChild(a);
  const blob = new Blob([data], { type: 'octet/stream' });
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = `${getIdentifier()}.bin`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// eslint-disable-next-line no-unused-vars
function updateDrawMode(elm) {
  const conversionFunction = ConversionFunctions[elm.value];
  if (conversionFunction) {
    settings.conversionFunction = conversionFunction;
  }
  updateAllImages();
}

// Updates Arduino code check-box
// eslint-disable-next-line no-unused-vars
function updateOutputFormat(elm) {
  let caption = document.getElementById('format-caption-container');
  const adafruitGfx = document.getElementById('adafruit-gfx-settings');
  const arduino = document.getElementById('arduino-identifier');
  document.getElementById('code-output').value = '';

  for (let i = 0; i < caption.children.length; i++) {
    caption.children[i].style.display = 'none';
  }
  caption = document.querySelector(`div[data-caption='${elm.value}']`);
  if (caption) caption.style.display = 'block';

  arduino.style.display = elm.value !== 'plain' ? 'block' : 'none';

  settings.prefix = '0x';
  document.getElementById('prefix').value = '0x';
  settings.separator = ', ';
  document.getElementById('separator').value = ', ';

  if (elm.value === 'adafruit_gfx') {
    adafruitGfx.style.display = 'block';
  } else {
    adafruitGfx.style.display = 'none';
  }

  settings.outputFormat = elm.value;
}

// Easy way to update settings controlled by a radiobutton
// eslint-disable-next-line no-unused-vars
function updateRadio(fieldName) {
  const radioGroup = document.getElementsByName(fieldName);
  for (let i = 0; i < radioGroup.length; i++) {
    if (radioGroup[i].checked) {
      settings[fieldName] = radioGroup[i].value;
    }
  }
  updateAllImages();
}

window.onload = () => {
  // Add events to the file input button
  const fileInput = document.getElementById('file-input');
  fileInput.addEventListener('click', () => { this.value = null; }, false);
  fileInput.addEventListener('change', handleImageSelection, false);
  const outputFormatArduino = document.getElementById('outputFormatArduino');
  outputFormatArduino.checked = true;
  outputFormatArduino.onchange();
};
