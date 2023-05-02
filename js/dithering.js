/* eslint-disable no-plusplus */
const bwrPalette = [
  [0, 0, 0, 255],
  [255, 255, 255, 255],
  [255, 0, 0, 255],
];

const bwPalette = [
  [0, 0, 0, 255],
  [255, 255, 255, 255],
];

function dithering(ctx, width, height, threshold, typeIndex) {
  const type = ['binary', 'bayer', 'floydsteinberg', 'atkinson'][typeIndex];
  const bayerThresholdMap = [
    [15, 135, 45, 165],
    [195, 75, 225, 105],
    [60, 180, 30, 150],
    [240, 120, 210, 90],
  ];

  const lumR = [];
  const lumG = [];
  const lumB = [];
  for (let i = 0; i < 256; i++) {
    lumR[i] = i * 0.299;
    lumG[i] = i * 0.587;
    lumB[i] = i * 0.114;
  }
  const imageData = ctx.getImageData(0, 0, width, height);

  const imageDataLength = imageData.data.length;

  // Greyscale luminance (sets r pixels to luminance of rgb)
  for (let i = 0; i <= imageDataLength; i += 4) {
    imageData.data[i] =
      Math.floor(lumR[imageData.data[i]] + lumG[imageData.data[i + 1]] + lumB[imageData.data[i + 2]]);
  }

  const w = imageData.width;
  let newPixel; let
    err;

  for (let currentPixel = 0; currentPixel <= imageDataLength; currentPixel += 4) {
    if (type === 'binary') {
      // No dithering
      imageData.data[currentPixel] = imageData.data[currentPixel] < threshold ? 0 : 255;
    } else if (type === 'bayer') {
      // 4x4 Bayer ordered dithering algorithm
      // eslint-disable-next-line no-mixed-operators
      const x = currentPixel / 4 % w;
      const y = Math.floor(currentPixel / 4 / w);
      const map = Math.floor((imageData.data[currentPixel] + bayerThresholdMap[x % 4][y % 4]) / 2);
      imageData.data[currentPixel] = (map < threshold) ? 0 : 255;
    } else if (type === 'floydsteinberg') {
      // Floydaâ‚¬"Steinberg dithering algorithm
      newPixel = imageData.data[currentPixel] < 129 ? 0 : 255;
      err = Math.floor((imageData.data[currentPixel] - newPixel) / 16);
      imageData.data[currentPixel] = newPixel;

      imageData.data[currentPixel + 4] += err * 7;
      imageData.data[currentPixel + 4 * w - 4] += err * 3;
      imageData.data[currentPixel + 4 * w] += err * 5;
      imageData.data[currentPixel + 4 * w + 4] += err * 1;
    } else if (type === 'atkinson') {
      // Bill Atkinson's dithering algorithm
      newPixel = imageData.data[currentPixel] < threshold ? 0 : 255;
      err = Math.floor((imageData.data[currentPixel] - newPixel) / 8);
      imageData.data[currentPixel] = newPixel;

      imageData.data[currentPixel + 4] += err;
      imageData.data[currentPixel + 8] += err;
      imageData.data[currentPixel + 4 * w - 4] += err;
      imageData.data[currentPixel + 4 * w] += err;
      imageData.data[currentPixel + 4 * w + 4] += err;
      imageData.data[currentPixel + 8 * w] += err;
    } else {
      console.error(`unknown dithering type requested: ${type}`);
    }

    // Set g and b pixels equal to r
    imageData.data[currentPixel + 1] = imageData.data[currentPixel + 2] = imageData.data[currentPixel];
  }

  ctx.putImageData(imageData, 0, 0);
}

function canvas2bytes(canvas, type = 'bw') {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const arr = [];
  let buffer = [];

  for (let x = canvas.width - 1; x >= 0; x--) {
    for (let y = 0; y < canvas.height; y++) {
      const index = (canvas.width * 4 * y) + x * 4;
      if (type !== 'bwr') {
        buffer.push(imageData.data[index] > 0 && imageData.data[index + 1] > 0 && imageData.data[index + 2] > 0 ? 1 : 0);
      } else {
        buffer.push(imageData.data[index] > 0 && imageData.data[index + 1] === 0 && imageData.data[index + 2] === 0 ? 1 : 0);
      }

      if (buffer.length === 8) {
        arr.push(parseInt(buffer.join(''), 2));
        buffer = [];
      }
    }
  }
  return arr;
}

function getColorDistance(rgba1, rgba2) {
  const [r1, b1, g1] = rgba1;
  const [r2, b2, g2] = rgba2;

  const rm = (r1 + r2) / 2;

  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;

  return Math.sqrt((2 + rm / 256) * r * r + 4 * g * g + (2 + (255 - rm) / 256) * b * b);
}

function getNearColor(pixel, palette) {
  let minDistance = 255 * 255 * 3 + 1;
  let paletteIndex = 0;

  for (let i = 0; i < palette.length; i++) {
    const targetColor = palette[i];
    const distance = getColorDistance(pixel, targetColor);
    if (distance < minDistance) {
      minDistance = distance;
      paletteIndex = i;
    }
  }

  return palette[paletteIndex];
}

function getNearColorV2(color, palette) {
  let minDistanceSquared = 255 * 255 + 255 * 255 + 255 * 255 + 1;

  let bestIndex = 0;
  for (let i = 0; i < palette.length; i++) {
    const rdiff = (color[0] & 0xff) - (palette[i][0] & 0xff);
    const gdiff = (color[1] & 0xff) - (palette[i][1] & 0xff);
    const bdiff = (color[2] & 0xff) - (palette[i][2] & 0xff);
    const distanceSquared = rdiff * rdiff + gdiff * gdiff + bdiff * bdiff;
    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      bestIndex = i;
    }
  }
  return palette[bestIndex];
}

function updatePixel(imageData, index, color) {
  imageData[index] = color[0];
  imageData[index + 1] = color[1];
  imageData[index + 2] = color[2];
  imageData[index + 3] = color[3];
}

function getColorErr(color1, color2, rate) {
  const res = [];
  for (let i = 0; i < 3; i++) {
    res.push(Math.floor((color1[i] - color2[i]) / rate));
  }
  return res;
}

function updatePixelErr(imageData, index, err, rate) {
  imageData[index] += err[0] * rate;
  imageData[index + 1] += err[1] * rate;
  imageData[index + 2] += err[2] * rate;
}

function ditheringCanvasByPalette(canvas, palette, type) {
  palette = palette || bwrPalette;

  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const w = imageData.width;

  for (let currentPixel = 0; currentPixel <= imageData.data.length; currentPixel += 4) {
    const newColor = getNearColorV2(imageData.data.slice(currentPixel, currentPixel + 4), palette);

    if (type === 'bwr_floydsteinberg') {
      const err = getColorErr(imageData.data.slice(currentPixel, currentPixel + 4), newColor, 16);

      updatePixel(imageData.data, currentPixel, newColor);
      updatePixelErr(imageData.data, currentPixel + 4, err, 7);
      updatePixelErr(imageData.data, currentPixel + 4 * w - 4, err, 3);
      updatePixelErr(imageData.data, currentPixel + 4 * w, err, 5);
      updatePixelErr(imageData.data, currentPixel + 4 * w + 4, err, 1);
    } else {
      const err = getColorErr(imageData.data.slice(currentPixel, currentPixel + 4), newColor, 8);

      updatePixel(imageData.data, currentPixel, newColor);
      updatePixelErr(imageData.data, currentPixel + 4, err, 1);
      updatePixelErr(imageData.data, currentPixel + 8, err, 1);
      updatePixelErr(imageData.data, currentPixel + 4 * w - 4, err, 1);
      updatePixelErr(imageData.data, currentPixel + 4 * w, err, 1);
      updatePixelErr(imageData.data, currentPixel + 4 * w + 4, err, 1);
      updatePixelErr(imageData.data, currentPixel + 8 * w, err, 1);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
