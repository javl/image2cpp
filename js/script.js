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
  removeZeroesCommas: false,
  ditheringThreshold: 128,
  ditheringMode: 0,
  outputFormat: 'plain',
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

const ConversionFunctions = {
  // Output the image as a string for horizontally drawing displays
  horizontal1bit(data, canvasWidth) {
    let stringFromBytes = '';
    let outputIndex = 0;
    let byteIndex = 7;
    let number = 0;

    // format is RGBA, so move 4 steps per pixel
    for (let index = 0; index < data.length; index += 4) {
      // Get the average of the RGB (we ignore A)
      const avg = (data[index] + data[index + 1] + data[index + 2]) / 3;
      if (avg > settings.ditheringThreshold) {
        number += 2 ** byteIndex;
      }
      byteIndex--;

      // if this was the last pixel of a row or the last pixel of the
      // image, fill up the rest of our byte with zeros so it always contains 8 bits
      if ((index !== 0 && (((index / 4) + 1) % (canvasWidth)) === 0) || (index === data.length - 4)) {
        // for(var i=byteIndex;i>-1;i--){
        // number += Math.pow(2, i);
        // }
        byteIndex = -1;
      }

      // When we have the complete 8 bits, combine them into a hex value
      if (byteIndex < 0) {
        let byteSet = bitswap(number).toString(16);
        if (byteSet.length === 1) { byteSet = `0${byteSet}`; }
        if (!settings.removeZeroesCommas) {
          stringFromBytes += `0x${byteSet}, `;
        } else {
          stringFromBytes += byteSet;
        }
        outputIndex++;
        if (outputIndex >= 16) {
          if (!settings.removeZeroesCommas) {
            stringFromBytes += '\n';
          }
          outputIndex = 0;
        }
        number = 0;
        byteIndex = 7;
      }
    }
    return stringFromBytes;
  },

  // Output the image as a string for vertically drawing displays
  // eslint-disable-next-line no-unused-vars
  vertical1bit(data, canvasWidth) {
    let stringFromBytes = '';
    let outputIndex = 0;
    for (let p = 0; p < Math.ceil(settings.screenHeight / 8); p++) {
      for (let x = 0; x < settings.screenWidth; x++) {
        let byteIndex = 7;
        let number = 0;

        for (let y = 7; y >= 0; y--) {
          const index = ((p * 8) + y) * (settings.screenWidth * 4) + x * 4;
          const avg = (data[index] + data[index + 1] + data[index + 2]) / 3;
          if (avg > settings.ditheringThreshold) {
            number += 2 ** byteIndex;
          }
          byteIndex--;
        }
        let byteSet = bitswap(number).toString(16);
        if (byteSet.length === 1) { byteSet = `0${byteSet}`; }
        if (!settings.removeZeroesCommas) {
          stringFromBytes += `0x${byteSet.toString(16)}, `;
        } else {
          stringFromBytes += byteSet.toString(16);
        }
        outputIndex++;
        if (outputIndex >= 16) {
          stringFromBytes += '\n';
          outputIndex = 0;
        }
      }
    }
    return stringFromBytes;
  },

  // Output the image as a string for 565 displays (horizontally)
  // eslint-disable-next-line no-unused-vars
  horizontal565(data, canvasWidth) {
    let stringFromBytes = '';
    let outputIndex = 0;

    // format is RGBA, so move 4 steps per pixel
    for (let index = 0; index < data.length; index += 4) {
      // Get the RGB values
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      // calculate the 565 color value
      // eslint-disable-next-line no-bitwise
      const rgb = ((r & 0b11111000) << 8) | ((g & 0b11111100) << 3) | ((b & 0b11111000) >> 3);
      // Split up the color value in two bytes
      // const firstByte = (rgb >> 8) & 0xff;
      // const secondByte = rgb & 0xff;

      let byteSet = bitswap(rgb).toString(16);
      while (byteSet.length < 4) { byteSet = `0${byteSet}`; }
      if (!settings.removeZeroesCommas) {
        stringFromBytes += `0x${byteSet}, `;
      } else {
        stringFromBytes += byteSet;
      }
      // add newlines every 16 bytes
      outputIndex++;
      if (outputIndex >= 16) {
        stringFromBytes += '\n';
        outputIndex = 0;
      }
    }
    return stringFromBytes;
  },
  // Output the image as a string for rgb888 displays (horizontally)
  horizontal888(data, canvasWidth) {
    let stringFromBytes = '';
    let outputIndex = 0;

    // format is RGBA, so move 4 steps per pixel
    for (let index = 0; index < data.length; index += 4) {
      // Get the RGB values
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      // calculate the 565 color value
      // eslint-disable-next-line no-bitwise
      const rgb = (r << 16) | (g << 8) | (b);
      // Split up the color value in two bytes
      // const firstByte = (rgb >> 8) & 0xff;
      // const secondByte = rgb & 0xff;

      let byteSet = bitswap(rgb).toString(16);
      while (byteSet.length < 8) { byteSet = `0${byteSet}`; }
      if (!settings.removeZeroesCommas) {
        stringFromBytes += `0x${byteSet}, `;
      } else {
        stringFromBytes += byteSet;
      }

      // add newlines every 16 bytes
      outputIndex++;
      if (outputIndex >= canvasWidth) {
        stringFromBytes += '\n';
        outputIndex = 0;
      }
    }
    return stringFromBytes;
  },
  // Output the alpha mask as a string for horizontally drawing displays
  horizontalAlpha(data, canvasWidth) {
    let stringFromBytes = '';
    let outputIndex = 0;
    let byteIndex = 7;
    let number = 0;

    // format is RGBA, so move 4 steps per pixel
    for (let index = 0; index < data.length; index += 4) {
      // Get alpha part of the image data
      const alpha = data[index + 3];
      if (alpha > settings.ditheringThreshold) {
        number += 2 ** byteIndex;
      }
      byteIndex--;

      // if this was the last pixel of a row or the last pixel of the
      // image, fill up the rest of our byte with zeros so it always contains 8 bits
      if ((index !== 0 && (((index / 4) + 1) % (canvasWidth)) === 0) || (index === data.length - 4)) {
        byteIndex = -1;
      }

      // When we have the complete 8 bits, combine them into a hex value
      if (byteIndex < 0) {
        let byteSet = bitswap(number).toString(16);
        if (byteSet.length === 1) { byteSet = `0${byteSet}`; }
        if (!settings.removeZeroesCommas) {
          stringFromBytes += `0x${byteSet}, `;
        } else {
          stringFromBytes += byteSet;
        }
        outputIndex++;
        if (outputIndex >= 16) {
          stringFromBytes += '\n';
          outputIndex = 0;
        }
        number = 0;
        byteIndex = 7;
      }
    }
    return stringFromBytes;
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
  canvas.width = settings.screenWidth;
  canvas.height = settings.screenHeight;
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

// Convert hex to binary
function hexToBinary(s) {
  let i;
  let ret = '';
  // lookup table for easier conversion. "0" characters are padded for "1" to "7"
  const lookupTable = {
    0: '0000',
    1: '0001',
    2: '0010',
    3: '0011',
    4: '0100',
    5: '0101',
    6: '0110',
    7: '0111',
    8: '1000',
    9: '1001',
    a: '1010',
    b: '1011',
    c: '1100',
    d: '1101',
    e: '1110',
    f: '1111',
    A: '1010',
    B: '1011',
    C: '1100',
    D: '1101',
    E: '1110',
    F: '1111',
  };
  for (i = 0; i < s.length; i += 1) {
    // eslint-disable-next-line no-prototype-builtins
    if (lookupTable.hasOwnProperty(s[i])) {
      ret += lookupTable[s[i]];
    } else {
      return { valid: false, s };
    }
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
function listToImageHorizontal(list, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const imgData = ctx.createImageData(canvas.width, canvas.height);
  let index = 0;

  // round the width up to the next byte
  const widthRoundedUp = Math.floor(canvas.width / 8 + (canvas.width % 8 ? 1 : 0)) * 8;
  let widthCounter = 0;

  // Move the list into the imageData object
  for (let i = 0; i < list.length; i++) {
    let binString = hexToBinary(list[i]);
    if (!binString.valid) {
      // eslint-disable-next-line no-alert
      alert('Something went wrong converting the string. Make sure there are no comments in your input?');
      // eslint-disable-next-line no-console
      console.error('invalid hexToBinary: ', binString.s);
      return;
    }
    binString = binString.result;
    if (binString.length === 4) {
      binString += '0000';
    }

    // Check if pixel is white or black
    for (let k = 0; k < binString.length; k++, widthCounter++) {
      // if we've counted enough bits, reset counter for next line
      if (widthCounter >= widthRoundedUp) {
        widthCounter = 0;
      }
      // skip 'artifact' pixels due to rounding up to a byte
      if (widthCounter < canvas.width) {
        let color = 0;
        if (binString.charAt(k) === '1') {
          color = 255;
        }
        imgData.data[index] = color;
        imgData.data[index + 1] = color;
        imgData.data[index + 2] = color;
        imgData.data[index + 3] = 255;

        index += 4;
      }
    }
  }

  // Draw the image onto the canvas, then save the canvas contents
  // inside the img object. This way we can reuse the img object when
  // we want to scale / invert, etc.
  ctx.putImageData(imgData, 0, 0);
  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  images.first().img = img;
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

  let page = 0;
  let x = 0;
  let y = 7;

  // Move the list into the imageData object
  for (let i = 0; i < list.length; i++) {
    let binString = hexToBinary(list[i]);
    if (!binString.valid) {
      // eslint-disable-next-line no-alert
      alert('Something went wrong converting the string. Did you forget to remove any comments from the input?');
      // eslint-disable-next-line no-console
      console.error('invalid hexToBinary: ', binString.s);
      return;
    }
    binString = binString.result;
    if (binString.length === 4) {
      binString += '0000';
    }

    // Check if pixel is white or black
    for (let k = 0; k < binString.length; k++) {
      let color = 0;
      if (binString.charAt(k) === '1') {
        color = 255;
      }
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
  }
  // Save the canvas contents inside the img object. This way we can
  // reuse the img object when we want to scale / invert, etc.
  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  images.first().img = img;
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
  images.setByIndex(0, { img: image, canvas });

  let input = document.getElementById('byte-input').value;

  // Remove Arduino code
  input = input.replace(/const\s+(unsigned\s+char|uint8_t)\s+[a-zA-Z0-9]+\s*\[\]\s*(PROGMEM\s*)?=\s*/g, '');
  input = input.replace(/\};|\{/g, '');

  // Convert newlines to comma (helps to remove comments later)
  input = input.replace(/\r\n|\r|\n/g, ',');
  // Convert multiple commas in a row into a single one
  input = input.replace(/,{2,}/g, ',');
  // Remove whitespace
  input = input.replace(/\s/g, '');
  // Remove comments
  input = input.replace(/\/\/(.+?),/g, '');
  // Remove "0x"
  input = input.replace(/0[xX]/g, '');
  // Split into list
  const list = input.split(',');

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
        fileInputColumnEntryRemoveButton.innerHTML = 'remove';

        const canvas = document.createElement('canvas');

        const imageEntry = document.createElement('li');
        imageEntry.setAttribute('data-img', file.name);

        const w = document.createElement('input');
        w.type = 'number';
        w.name = 'width';
        w.id = 'screenWidth';
        w.min = 0;
        w.className = 'size-input';
        w.value = img.width;
        settings.screenWidth = img.width;
        w.oninput = () => {
          canvas.width = this.value;
          updateAllImages();
          updateInteger('screenWidth');
        };

        const h = document.createElement('input');
        h.type = 'number';
        h.name = 'height';
        h.id = 'screenHeight';
        h.min = 0;
        h.className = 'size-input';
        h.value = img.height;
        settings.screenHeight = img.height;
        h.oninput = () => {
          canvas.height = this.value;
          updateAllImages();
          updateInteger('screenHeight');
        };

        const gil = document.createElement('span');
        gil.innerHTML = 'glyph';
        gil.className = 'file-info';

        const gi = document.createElement('input');
        gi.type = 'text';
        gi.name = 'glyph';
        gi.className = 'glyph-input';
        gi.onchange = () => {
          const image = images.get(img);
          image.glyph = gi.value;
        };

        const fn = document.createElement('span');
        fn.className = 'file-info';
        fn.innerHTML = `${file.name} (file resolution: ${img.width} x ${img.height})`;
        fn.innerHTML += '<br />';

        const rb = document.createElement('button');
        rb.className = 'remove-button';
        rb.innerHTML = 'remove';

        const fileInputColumn = document.getElementById('file-input-column');
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
            noFileSelected.forEach((el) => {
              // eslint-disable-next-line no-param-reassign
              el.style.display = 'block';
            });
          }
          updateAllImages();
        };

        rb.onclick = removeButtonOnClick;
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
        imageEntry.appendChild(rb);

        imageSizeSettings.appendChild(imageEntry);

        canvas.width = img.width;
        canvas.height = img.height;
        canvasContainer.appendChild(canvas);

        images.push(img, canvas, file.name.split('.')[0]);
        if (images.length() > 1) {
          document.getElementById('all-same-size').style.display = 'block';
        }
        placeImage(images.last());
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
  return settings.conversionFunction(data, canvas.width);
}

// Get the custom arduino output variable name, if any
function getIdentifier() {
  const vn = document.getElementById('identifier');
  return vn && vn.value.length ? vn.value : identifier;
}

// Output the image string to the textfield
// eslint-disable-next-line no-unused-vars
function generateOutputString() {
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
        const comment = `// '${image.glyph}', ${image.canvas.width}x${image.canvas.height}px\n`;
        bytesUsed += code.split('\n').length * 16; // 16 bytes per line.

        const varname = getIdentifier() + image.glyph.replace(/[^a-zA-Z0-9]/g, '_');
        varQuickArray.push(varname);
        code = `${comment}const ${getImageType()} ${varname} [] PROGMEM = {\n${code}};\n`;
        outputString += code;
      });

      varQuickArray.sort();
      outputString += `\n// Array of all bitmaps for convenience. (Total bytes used to store images in PROGMEM = ${bytesUsed})\n`;
      outputString += `const int ${getIdentifier()}allArray_LEN = ${varQuickArray.length};\n`;
      outputString += `const ${getImageType()}* ${getIdentifier()}allArray[${varQuickArray.length}] = {\n\t${varQuickArray.join(',\n\t')}\n};\n`;
      break;
    }

    case 'arduino_single': {
      let comment = '';
      images.each((image) => {
        code = imageToString(image);
        code = `\t${code.split('\n').join('\n\t')}\n`;
        comment = `\t// '${image.glyph}, ${image.canvas.width}x${image.canvas.height}px\n`;
        outputString += comment + code;
      });

      outputString = outputString.replace(/,\s*$/, '');

      outputString = `const ${getImageType()} ${
        +getIdentifier()
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
        comment = `\t// '${image.glyph}, ${image.canvas.width}x${image.canvas.height}px\n`;
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
        code += `// '${image.glyph}'\n`;
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
        let comment = '';
        if (image.glyph) {
          comment = (`// '${image.glyph}', ${image.canvas.width}x${image.canvas.height}px\n`);
        }
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
  document.getElementById('copy-button').disabled = false;
}

// Copy the final output to the clipboard
// eslint-disable-next-line no-unused-vars
function copyOutput() {
  navigator.clipboard.writeText(document.getElementById('code-output').value);
}

// eslint-disable-next-line no-unused-vars
function downloadBinFile() {
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
}

// Updates Arduino code check-box
// eslint-disable-next-line no-unused-vars
function updateOutputFormat(elm) {
  let caption = document.getElementById('format-caption-container');
  const adafruitGfx = document.getElementById('adafruit-gfx-settings');
  const arduino = document.getElementById('arduino-identifier');
  const removeZeroesCommasContainer = document.getElementById('remove-zeroes-commas-container');
  document.getElementById('code-output').value = '';

  for (let i = 0; i < caption.children.length; i++) {
    caption.children[i].style.display = 'none';
  }
  caption = document.querySelector(`div[data-caption='${elm.value}']`);
  if (caption) caption.style.display = 'block';

  if (elm.value !== 'plain') {
    arduino.style.display = 'block';
    removeZeroesCommasContainer.style.display = 'none';
    settings.removeZeroesCommas = false;
    document.getElementById('removeZeroesCommas').checked = false;
  } else {
    arduino.style.display = 'none';
    removeZeroesCommasContainer.style.display = 'table-row';
  }
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
  document.getElementById('copy-button').disabled = true;

  // Add events to the file input button
  const fileInput = document.getElementById('file-input');
  fileInput.addEventListener('click', () => { this.value = null; }, false);
  fileInput.addEventListener('change', handleImageSelection, false);
  document.getElementById('outputFormat').value = 'arduino';
  document.getElementById('outputFormat').onchange();
};
