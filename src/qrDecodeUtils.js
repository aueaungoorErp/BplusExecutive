import { Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { Base64 } from './safe_Format';
import { decodeQrFromBase64, decodeQrFromUri } from './qrImageReader';

const QR_DECODE_TIMEOUT_MS = 6000;
const QR_FILE_READY_RETRIES = 6;
const QR_FILE_READY_DELAY_MS = 150;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const getErrorMessage = error => {
  if (!error) {
    return 'Unknown QR error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error.code) {
    return String(error.code);
  }
  if (error.message) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch (jsonError) {
    return 'Unknown QR error';
  }
};

export const getQrErrorDetail = error => {
  const message = getErrorMessage(error);
  if (message === 'QR_TIMEOUT') {
    return 'QR_TIMEOUT: Scan timed out before a code could be read.';
  }
  if (
    message.includes('IO_ERROR') ||
    message.toLowerCase().includes('failed to read') ||
    message.toLowerCase().includes('no such file')
  ) {
    return `IO_ERROR: ${message}`;
  }
  if (
    message === 'QR_NOT_FOUND' ||
    message.includes('No related QR code') ||
    message.includes('Invalid or No related QR code') ||
    message.includes('NOT_OK')
  ) {
    return 'QR_NOT_FOUND: No readable QR code was found in the photo.';
  }
  return message;
};

const addQrSourceCandidate = (candidates, value) => {
  if (!value) {
    return;
  }
  if (value.startsWith('content://') || value.startsWith('file://')) {
    candidates.push(value);
    return;
  }
  if (value.startsWith('/')) {
    candidates.push(`file://${value}`);
    candidates.push(value);
    return;
  }
  candidates.push(value);
};

const isAccessibleQrSource = value => {
  if (!value) {
    return false;
  }
  if (value.startsWith('content://')) {
    return true;
  }
  if (
    value.includes('rn_image_picker_lib_temp') ||
    value.includes('/cache/') ||
    value.includes('/com.bplusexecutive/')
  ) {
    return true;
  }
  if (
    Platform.OS === 'android' &&
    (value.includes('/storage/emulated/') || value.includes('/DCIM/'))
  ) {
    return false;
  }
  return value.startsWith('file://') || value.startsWith('/');
};

const getQrSourceCandidates = asset => {
  const candidates = [];
  const sources =
    Platform.OS === 'android'
      ? [asset.uri]
      : [asset.uri, asset.originalPath, asset.path];

  for (const source of sources) {
    if (isAccessibleQrSource(source)) {
      addQrSourceCandidate(candidates, source);
    }
  }

  return [...new Set(candidates.filter(Boolean))];
};

const waitForReadableAsset = async (asset, candidates = getQrSourceCandidates(asset)) => {
  if (candidates.some(candidate => candidate.startsWith('content://'))) {
    return asset;
  }

  for (let attempt = 0; attempt < QR_FILE_READY_RETRIES; attempt += 1) {
    for (const candidate of candidates) {
      const filePath = candidate.replace(/^file:\/\//, '');
      try {
        const exists = await RNFetchBlob.fs.exists(filePath);
        if (!exists) {
          continue;
        }
        const stat = await RNFetchBlob.fs.stat(filePath);
        if (stat.size > 0) {
          return asset;
        }
      } catch (error) {
        // Keep retrying until the camera file is fully written.
      }
    }
    await sleep(QR_FILE_READY_DELAY_MS);
  }

  return asset;
};

const withTimeout = (promise, timeoutMs) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('QR_TIMEOUT')), timeoutMs),
    ),
  ]);

export const decodeQrImageAsset = async asset => {
  const attemptErrors = [];
  let lastError = null;
  const attempts = [];

  if (asset?.base64) {
    attempts.push({
      label: 'base64',
      run: () => decodeQrFromBase64(asset.base64),
    });
  } else {
    const candidates = getQrSourceCandidates(asset);
    if (candidates.length > 0) {
      await waitForReadableAsset(asset, candidates);
      for (const candidate of candidates) {
        attempts.push({
          label: candidate,
          run: () => decodeQrFromUri(candidate),
        });
      }
    } else {
      attemptErrors.push('no base64 or accessible uri available');
    }
  }

  for (const attempt of attempts) {
    try {
      const data = await withTimeout(attempt.run(), QR_DECODE_TIMEOUT_MS);
      if (data) {
        return data;
      }
      attemptErrors.push(`${attempt.label} -> empty result`);
    } catch (error) {
      lastError = error;
      attemptErrors.push(`${attempt.label} -> ${getErrorMessage(error)}`);
    }
  }

  const error = lastError || new Error('QR_NOT_FOUND');
  error.attemptDetails = attemptErrors;
  throw error;
};

const extractQrFields = payload => {
  const emptyResult = {
    baseName: null,
    baseUrl: null,
    username: null,
    password: null,
  };
  if (!payload || typeof payload !== 'string') {
    return emptyResult;
  }
  const normalizedPayload = payload.trim();
  const keyMap = {
    nameser: 'baseName',
    basename: 'baseName',
    name: 'baseName',
    urlser: 'baseUrl',
    url: 'baseUrl',
    server: 'baseUrl',
    databaseurl: 'baseUrl',
    usernameser: 'username',
    username: 'username',
    user: 'username',
    userid: 'username',
    loginid: 'username',
    loginname: 'username',
    bpapususerid: 'username',
    passwordser: 'password',
    password: 'password',
    pass: 'password',
    pwd: 'password',
    loginpassword: 'password',
    bpapuspassword: 'password',
  };
  const resolveMappedKey = rawKey => {
    const normalizedKey = String(rawKey).trim().toLowerCase();
    const compactKey = normalizedKey.replace(/[^a-z0-9]/g, '');
    return keyMap[normalizedKey] || keyMap[compactKey] || null;
  };
  try {
    const jsonData = JSON.parse(normalizedPayload);
    if (jsonData && typeof jsonData === 'object') {
      return Object.entries(jsonData).reduce(
        (result, [key, value]) => {
          const mappedKey = resolveMappedKey(key);
          if (mappedKey && typeof value === 'string' && value.trim()) {
            result[mappedKey] = value.trim();
          }
          return result;
        },
        { ...emptyResult },
      );
    }
  } catch (error) {}
  return normalizedPayload
    .split(/[|\n;,]+/)
    .map(part => part.trim())
    .filter(Boolean)
    .reduce(
      (result, part) => {
        const separatorIndex =
          part.indexOf('=') > -1 ? part.indexOf('=') : part.indexOf(':');
        if (separatorIndex === -1) {
          return result;
        }
        const rawKey = part.slice(0, separatorIndex).trim();
        const rawValue = part.slice(separatorIndex + 1).trim();
        const mappedKey = resolveMappedKey(rawKey);
        if (mappedKey && rawValue) {
          result[mappedKey] = rawValue;
        }
        return result;
      },
      { ...emptyResult },
    );
};

const extractPositionalQrFields = payload => {
  const emptyResult = {
    baseName: null,
    baseUrl: null,
    username: null,
    password: null,
  };
  if (!payload || typeof payload !== 'string') {
    return emptyResult;
  }
  const parts = payload
    .split('|')
    .map(part => part.trim())
    .filter(Boolean);
  const dllIndex = parts.findIndex(part => part.indexOf('.dll') !== -1);
  if (dllIndex === -1) {
    return emptyResult;
  }
  const baseUrl = parts[dllIndex];
  const remainingParts = parts.slice(dllIndex + 1);
  const baseName = remainingParts[0] || null;
  const credentialParts = remainingParts.slice(-2);
  const username = credentialParts.length === 2 ? credentialParts[0] : null;
  const password = credentialParts.length === 2 ? credentialParts[1] : null;
  return {
    baseName,
    baseUrl,
    username,
    password,
  };
};

const decodePayloadCandidates = data => {
  const candidates = [data];
  try {
    candidates.push(Base64.decode(data));
  } catch (error) {}
  try {
    candidates.push(Base64.decode(Base64.decode(data)));
  } catch (error) {}
  return candidates.filter(Boolean);
};

export const buildQrNavigationPayload = data => {
  if (!data) {
    const error = new Error('EMPTY_QR_PAYLOAD');
    error.code = 'EMPTY_QR_PAYLOAD';
    throw error;
  }

  const decodedCandidates = decodePayloadCandidates(data);
  const matchedPayload = decodedCandidates.find(
    item => typeof item === 'string' && item.indexOf('.dll') !== -1,
  );
  if (!matchedPayload) {
    const error = new Error('INVALID_QR_PAYLOAD');
    error.code = 'INVALID_QR_PAYLOAD';
    error.raw = String(data);
    throw error;
  }

  const extractedFields = extractQrFields(matchedPayload);
  const positionalFields = extractPositionalQrFields(matchedPayload);
  const mergedFields = {
    baseName: extractedFields.baseName,
    baseUrl: extractedFields.baseUrl || positionalFields.baseUrl,
    username: extractedFields.username || positionalFields.username,
    password: extractedFields.password || positionalFields.password,
  };
  const result = matchedPayload.split('|');
  if (!result[0] || result[0].indexOf('.dll') === -1) {
    const error = new Error('INVALID_QR_PAYLOAD');
    error.code = 'INVALID_QR_PAYLOAD';
    error.parsed = matchedPayload;
    throw error;
  }

  const tempurl = result[0].split('.dll');
  const serurl = tempurl[0] + '.dll';
  const tempname = serurl.split('/');
  let urlname = null;
  for (const item of tempname) {
    if (item.search('.dll') > -1) {
      urlname = item.split('.dll');
    }
  }
  if (!urlname) {
    const error = new Error('INVALID_QR_PAYLOAD');
    error.code = 'INVALID_QR_PAYLOAD';
    error.url = serurl;
    throw error;
  }

  return {
    post: {
      label: mergedFields.baseUrl || serurl,
      value: mergedFields.baseName || urlname[0],
      username: mergedFields.username || '',
      password: mergedFields.password || '',
    },
    credentials: {
      username: mergedFields.username || '',
      password: mergedFields.password || '',
    },
    qrDebug: {
      raw: data,
      matchedPayload,
      extractedFields: mergedFields,
    },
    data: Date.now(),
  };
};
