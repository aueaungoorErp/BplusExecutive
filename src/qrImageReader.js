import jsQR from 'jsqr';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import RNFetchBlob from 'rn-fetch-blob';

const { PNG } = require('pngjs/browser');

const SCAN_SIZES = [480, 640, 800];

const yieldToMainThread = () => new Promise(resolve => setTimeout(resolve, 0));

const isPng = bytes =>
  bytes.length >= 4 &&
  bytes[0] === 0x89 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x4e &&
  bytes[3] === 0x47;

const normalizeBase64 = value => {
  if (!value) {
    return null;
  }
  const commaIndex = value.indexOf(',');
  return commaIndex >= 0 ? value.slice(commaIndex + 1) : value;
};

const toBytes = input => {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (typeof input === 'string') {
    return Uint8Array.from(
      Buffer.from(normalizeBase64(input), 'base64'),
    );
  }
  throw new Error('Unsupported image input type');
};

const downscaleRgba = (data, width, height, maxDim) => {
  if (width <= maxDim && height <= maxDim) {
    return { data, width, height };
  }

  const scale = maxDim / Math.max(width, height);
  const nextWidth = Math.max(1, Math.round(width * scale));
  const nextHeight = Math.max(1, Math.round(height * scale));
  const output = new Uint8ClampedArray(nextWidth * nextHeight * 4);

  for (let y = 0; y < nextHeight; y += 1) {
    for (let x = 0; x < nextWidth; x += 1) {
      const sourceX = Math.min(width - 1, Math.floor(x / scale));
      const sourceY = Math.min(height - 1, Math.floor(y / scale));
      const sourceIndex = (sourceY * width + sourceX) * 4;
      const targetIndex = (y * nextWidth + x) * 4;
      output[targetIndex] = data[sourceIndex];
      output[targetIndex + 1] = data[sourceIndex + 1];
      output[targetIndex + 2] = data[sourceIndex + 2];
      output[targetIndex + 3] = data[sourceIndex + 3];
    }
  }

  return { data: output, width: nextWidth, height: nextHeight };
};

const decodeImageToRgba = bytes => {
  if (isPng(bytes)) {
    const png = PNG.sync.read(Buffer.from(bytes));
    return {
      data: new Uint8ClampedArray(
        png.data.buffer,
        png.data.byteOffset,
        png.data.byteLength,
      ),
      width: png.width,
      height: png.height,
    };
  }

  const decoded = jpeg.decode(bytes, { useTArray: true });
  return {
    data: new Uint8ClampedArray(decoded.data),
    width: decoded.width,
    height: decoded.height,
  };
};

const scanRgba = async (data, width, height) => {
  for (const maxDim of SCAN_SIZES) {
    await yieldToMainThread();
    const scaled = downscaleRgba(data, width, height, maxDim);

    let code = jsQR(scaled.data, scaled.width, scaled.height, {
      inversionAttempts: 'dontInvert',
    });
    if (code?.data) {
      return code.data;
    }

    if (maxDim <= 640) {
      await yieldToMainThread();
      code = jsQR(scaled.data, scaled.width, scaled.height, {
        inversionAttempts: 'attemptBoth',
      });
      if (code?.data) {
        return code.data;
      }
    }
  }

  return null;
};

export const decodeQrFromBytes = async bytes => {
  const rgba = decodeImageToRgba(toBytes(bytes));
  await yieldToMainThread();
  const result = await scanRgba(rgba.data, rgba.width, rgba.height);
  if (!result) {
    const error = new Error('QR_NOT_FOUND');
    error.code = 'QR_NOT_FOUND';
    throw error;
  }
  return result;
};

export const decodeQrFromBase64 = async base64 => decodeQrFromBytes(base64);

export const decodeQrFromUri = async uri => {
  const base64 = await RNFetchBlob.fs.readFile(uri, 'base64');
  return decodeQrFromBytes(base64);
};

const QRreader = uri => decodeQrFromUri(uri);

export default QRreader;
