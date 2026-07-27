import jsQR from 'jsqr';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import RNFetchBlob from 'rn-fetch-blob';

const { PNG } = require('pngjs/browser');

const LOG_TAG = '[QrDecode]';
const MAX_QR_SCAN_DIMENSION = 800;

const qrLog = (step, detail) => {
  const payload =
    detail === undefined
      ? ''
      : ` ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  console.log(`${LOG_TAG} ${step}${payload}`);
};

const elapsedMs = startedAt => Date.now() - startedAt;

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

const downscaleRgba = (data, width, height, maxDim = MAX_QR_SCAN_DIMENSION) => {
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
  const startedAt = Date.now();
  if (isPng(bytes)) {
    qrLog('decodeImageToRgba:png:start', { byteLength: bytes.length });
    const png = PNG.sync.read(Buffer.from(bytes));
    const rgba = {
      data: new Uint8ClampedArray(
        png.data.buffer,
        png.data.byteOffset,
        png.data.byteLength,
      ),
      width: png.width,
      height: png.height,
    };
    qrLog('decodeImageToRgba:png:done', {
      width: rgba.width,
      height: rgba.height,
      ms: elapsedMs(startedAt),
    });
    return rgba;
  }

  qrLog('decodeImageToRgba:jpeg:start', { byteLength: bytes.length });
  const decoded = jpeg.decode(bytes, { useTArray: true });
  const rgba = {
    data: new Uint8ClampedArray(decoded.data),
    width: decoded.width,
    height: decoded.height,
  };
  qrLog('decodeImageToRgba:jpeg:done', {
    width: rgba.width,
    height: rgba.height,
    ms: elapsedMs(startedAt),
  });
  return rgba;
};

const scanRgba = (data, width, height) => {
  const startedAt = Date.now();
  const scanAttempts = [
    { data, width, height, label: 'full' },
  ];
  const scaled = downscaleRgba(data, width, height);
  if (scaled.width !== width || scaled.height !== height) {
    scanAttempts.push({
      data: scaled.data,
      width: scaled.width,
      height: scaled.height,
      label: 'scaled',
    });
  }

  for (const attempt of scanAttempts) {
    qrLog('scanRgba:start', {
      label: attempt.label,
      width: attempt.width,
      height: attempt.height,
    });
    const code = jsQR(attempt.data, attempt.width, attempt.height, {
      inversionAttempts: 'attemptBoth',
    });
    if (code?.data) {
      qrLog('scanRgba:done', {
        label: attempt.label,
        found: true,
        ms: elapsedMs(startedAt),
      });
      return code.data;
    }
  }

  qrLog('scanRgba:done', {
    found: false,
    ms: elapsedMs(startedAt),
  });
  return null;
};

export const decodeQrFromBytes = bytes => {
  const startedAt = Date.now();
  qrLog('decodeQrFromBytes:start', { byteLength: bytes?.length || 0 });
  const rgba = decodeImageToRgba(toBytes(bytes));
  const result = scanRgba(rgba.data, rgba.width, rgba.height);
  if (!result) {
    qrLog('decodeQrFromBytes:not_found', { ms: elapsedMs(startedAt) });
    const error = new Error('QR_NOT_FOUND');
    error.code = 'QR_NOT_FOUND';
    throw error;
  }
  qrLog('decodeQrFromBytes:success', {
    length: result.length,
    ms: elapsedMs(startedAt),
  });
  return result;
};

export const decodeQrFromBase64 = base64 => {
  const startedAt = Date.now();
  qrLog('decodeQrFromBase64:start', { base64Length: base64?.length || 0 });
  const result = decodeQrFromBytes(base64);
  qrLog('decodeQrFromBase64:done', { ms: elapsedMs(startedAt) });
  return result;
};

export const decodeQrFromUri = async uri => {
  const startedAt = Date.now();
  qrLog('decodeQrFromUri:readFile:start', { uri });
  const base64 = await RNFetchBlob.fs.readFile(uri, 'base64');
  qrLog('decodeQrFromUri:readFile:done', {
    base64Length: base64?.length || 0,
    ms: elapsedMs(startedAt),
  });
  const decodeStartedAt = Date.now();
  const result = decodeQrFromBytes(base64);
  qrLog('decodeQrFromUri:done', { ms: elapsedMs(decodeStartedAt) });
  return result;
};

const QRreader = uri => decodeQrFromUri(uri);

export default QRreader;
