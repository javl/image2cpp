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
  ditheringMode: 0,
  outputFormat: 'plain',
  separator: ', ',
  outputComments: true,
  invertColors: false,
  rotation: 0,
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

// Accumulates formatted bytes (prefix/value/separator, wrapped every
// wrapWidth bytes) so our ConversionFunctions can use this formatting.
// wrapWidth defaults to 16 bytes per line; horizontal888 wraps
// once per image row (canvasWidth) instead.
function makeByteWriter(wrapWidth = 16) {
  let out = '';
  let count = 0;
  return {
    push(value, hexWidth) {
      const byteSet = bitswap(value).toString(16).padStart(hexWidth, '0');
      out += `${settings.prefix}${byteSet}${settings.separator}`;
      count++;
      if (count >= wrapWidth) {
        out += '\n';
        count = 0;
      }
    },
    result() { return out; },
  };
}

// Shared by horizontal1bit/horizontalAlpha: pack 8 samples (one per pixel,
// MSB first) into a byte, resetting early at the end of a row or the image
// so a partial final byte is still zero-padded instead of dropped.
function packBitsHorizontal(data, canvasWidth, writer, sampleAt) {
  let byteIndex = 7;
  let number = 0;
  for (let index = 0; index < data.length; index += 4) {
    if (sampleAt(data, index) > settings.ditheringThreshold) {
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
  }
}

const ConversionFunctions = {
  // Output the image as a string for horizontally drawing displays
  horizontal1bit(data, canvasWidth) {
    const writer = makeByteWriter();
    const avgRgb = (d, i) => (d[i] + d[i + 1] + d[i + 2]) / 3;
    packBitsHorizontal(data, canvasWidth, writer, avgRgb);
    return writer.result();
  },

  // Output the image as a string for vertically drawing displays
  vertical1bit(data, canvasWidth, canvasHeight) {
    const writer = makeByteWriter();
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
    const writer = makeByteWriter();
    // format is RGBA, so move 4 steps per pixel
    for (let index = 0; index < data.length; index += 4) {
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      // Calculate the 565 color value
      // eslint-disable-next-line no-bitwise
      const rgb = ((r & 0b11111000) << 8) | ((g & 0b11111100) << 3) | ((b & 0b11111000) >> 3);
      writer.push(rgb, 4);
    }
    return writer.result();
  },
  // Output the image as a string for rgb888 displays (horizontally), one
  // image row per output line
  horizontal888(data, canvasWidth) {
    const writer = makeByteWriter(canvasWidth);
    // format is RGBA, so move 4 steps per pixel
    for (let index = 0; index < data.length; index += 4) {
      // Split into RGB and pack into a single 24-bit value (MSB first)
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      // eslint-disable-next-line no-bitwise
      const rgb = (r << 16) | (g << 8) | (b);
      writer.push(rgb, 8);
    }
    return writer.result();
  },
  // Output the alpha mask as a string for horizontally drawing displays
  horizontalAlpha(data, canvasWidth) {
    const writer = makeByteWriter();
    packBitsHorizontal(data, canvasWidth, writer, (d, i) => d[i + 3]);
    return writer.result();
  },
};
settings.conversionFunction = ConversionFunctions.horizontal1bit;

// An images collection with helper methods
function Images() {
  const collection = [];
  this.push = (img, canvas, glyph) => { collection.push({ img, canvas, glyph }); };
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
// Variable name, when "arduino code" is required
const identifier = 'myBitmap';

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

  // reset canvas size
  canvas.width = Number.isFinite(settings.screenWidth) && settings.screenWidth > 0 ? settings.screenWidth : 1;
  canvas.height = Number.isFinite(settings.screenHeight) && settings.screenHeight > 0 ? settings.screenHeight : 1;
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
      canvas.width = settings.screenHeight;
      canvas.height = settings.screenWidth;
      ctx.setTransform(1, 0, 0, 1, canvas.width, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(clone, 0, 0);
    } else if (settings.rotation === 180) {
      ctx.setTransform(1, 0, 0, 1, canvas.width, canvas.height);
      ctx.rotate(Math.PI);
      ctx.drawImage(clone, 0, 0);
    } else if (settings.rotation === 270) {
      canvas.width = settings.screenHeight;
      canvas.height = settings.screenWidth;
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

// get the type (in arduino code) of the output image
// this is a bit of a hack, it's better to make this a property of the conversion function (should probably turn it into objects)
function getImageType() {
  if (settings.conversionFunction === ConversionFunctions.horizontal565) {
    return 'uint16_t';
  } if (settings.conversionFunction === ConversionFunctions.horizontal888) {
    return 'unsigned long';
  }
  return 'unsigned char';
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
  // eslint-disable-next-line no-alert
  alert('Something went wrong converting the string. Make sure there are no comments in your input.');
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
    return;
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
    return;
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
    // eslint-disable-next-line no-alert
    const errorEl = document.getElementById('text-input-error');
    errorEl.style.display = 'block';
    return;
  }

  if (drawMode === 'horizontal') {
    listToImageHorizontal(list, canvas);
  } else {
    listToImageVertical(list, canvas);
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

        const fileInputColumnEntryLabel = document.createElement('span');
        fileInputColumnEntryLabel.textContent = file.name;

        const fileInputColumnEntryRemoveButton = document.createElement('button');
        fileInputColumnEntryRemoveButton.className = 'remove-button';
        fileInputColumnEntryRemoveButton.innerHTML = 'remove image';

        const canvas = document.createElement('canvas');

        const imageEntry = document.createElement('li');
        imageEntry.setAttribute('data-img', file.name);

        const w = document.createElement('input');
        w.type = 'number';
        w.name = 'width';
        w.id = 'screenWidth';
        w.min = 1;
        w.className = 'size-input';
        w.value = img.width;
        settings.screenWidth = img.width;
        w.oninput = () => {
          canvas.width = w.value;
          updateAllImages();
          updateInteger('screenWidth');
        };

        const h = document.createElement('input');
        h.type = 'number';
        h.name = 'height';
        h.id = 'screenHeight';
        h.min = 1;
        h.className = 'size-input';
        h.value = img.height;
        settings.screenHeight = img.height;
        h.oninput = () => {
          canvas.height = h.value;
          updateAllImages();
          updateInteger('screenHeight');
        };

        const gil = document.createElement('span');
        gil.innerHTML = 'glyph name';
        gil.className = 'file-info';

        const gi = document.createElement('input');
        gi.type = 'text';
        gi.name = 'glyph';
        gi.className = 'glyph-input';
        gi.value = file.name.split('.')[0];
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

        fileInputColumnEntry.appendChild(fileInputColumnEntryLabel);
        fileInputColumnEntry.appendChild(fileInputColumnEntryRemoveButton);
        fileInputColumn.appendChild(fileInputColumnEntry);

        imageEntry.appendChild(fn);
        imageEntry.appendChild(w);
        imageEntry.appendChild(document.createTextNode(' x '));
        imageEntry.appendChild(h);
        imageEntry.appendChild(gil);
        imageEntry.appendChild(gi);

        imageSizeSettings.appendChild(imageEntry);

        canvas.width = img.width;
        canvas.height = img.height;
        canvasContainer.appendChild(canvas);

        images.push(img, canvas, file.name.split('.')[0]);
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
  return (vn && vn.value.length) ? vn.value : identifier;
}

// Builds the "// 'glyph', WxHpx" comment line placed before each image's
// byte array, or '' when comments are disabled. Indent is prefixed when given.
function glyphComment(image, indent = '') {
  if (!settings.outputComments) return '';
  return `${indent}// '${image.glyph}', ${image.canvas.width}x${image.canvas.height}px\n`;
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
        code = code.replace(/,\s*$/, '');

        code = `\t${code.split('\n').join('\n\t')}\n`;
        // const variableCount = images.length() > 1 ? count++ : '';
        const comment = glyphComment(image);
        bytesUsed += code.split('\n').length * 16; // 16 bytes per line.

        const varname = getIdentifier() + (image.glyph ? `_${image.glyph.replace(/[^a-zA-Z0-9]/g, '_')}` : '');
        varQuickArray.push(varname);
        code = `${comment}const ${getImageType()} ${varname} [] PROGMEM = {\n${code}};\n`;
        outputString += code;
      });

      varQuickArray.sort();
      if (outputString.length > 0) {
        outputString += '\n';
      }
      if (settings.outputComments) {
        outputString += `// Array of all bitmaps for convenience. (Total bytes used to store images in PROGMEM = ${bytesUsed})\n`;
      }
      outputString += `const int ${getIdentifier()}_allArray_LEN = ${varQuickArray.length};\n`;
      outputString += `const ${getImageType()}* ${getIdentifier()}_allArray[${varQuickArray.length}] = {\n\t${varQuickArray.join(',\n\t')}\n};\n`;
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

      outputString = outputString.replace(/,\s*$/, '');

      outputString = `const ${getImageType()} ${
        getIdentifier()
      } [] PROGMEM = {`
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

      outputString = outputString.replace(/,\s*$/, '');
      outputString = `const unsigned char ${
        getIdentifier()
      }Bitmap`
            + ' [] PROGMEM = {'
            + `\n${outputString}\n};\n\n`
            + `const GFXbitmapGlyph ${
              getIdentifier()
            }Glyphs [] PROGMEM = {\n`;

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
      }Font PROGMEM = {\n`
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
      outputString = outputString.replace(/,\s*$/g, '');
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

// eslint-disable-next-line no-unused-vars
function downloadBinFile() {
  if (!checkImagesAvailable()) return;

  let raw = [];
  images.each((image) => {
    const data = imageToString(image)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((byte) => parseInt(byte, 16));
    raw = raw.concat(data);
  });
  const data = new Uint8Array(raw);
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
