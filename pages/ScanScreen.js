import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import RNFetchBlob from 'rn-fetch-blob';
import { connect } from 'react-redux';
import {
  decodeQrFromBase64,
  decodeQrFromUri,
} from '../src/qrImageReader';
import Colors from '../src/Colors';
import { FontSize } from '../components/FontSizeHelper';
import { Language } from '../translations/I18n';
import { Base64 } from '../src/safe_Format';

const EMPTY_QR_ERROR = {
  title: '',
  detail: '',
};
const QR_DECODE_TIMEOUT_MS = 6000;
const QR_DECODE_OVERALL_TIMEOUT_MS = 15000;
const QR_FILE_READY_RETRIES = 6;
const QR_FILE_READY_DELAY_MS = 150;
const QR_LOG_TAG = '[ScanScreen][QrDecode]';
const PICKER_OPTIONS = {
  mediaType: 'photo',
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.92,
  includeBase64: true,
};

const qrFlowLog = (step, detail) => {
  const payload =
    detail === undefined
      ? ''
      : ` ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  console.log(`${QR_LOG_TAG} ${step}${payload}`);
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getErrorMessage = error => {
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

const getQrErrorDetail = error => {
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

const decodeImageData = async asset => {
  const flowStartedAt = Date.now();
  const attemptErrors = [];
  let lastError = null;
  const attempts = [];

  qrFlowLog('decodeImageData:start', {
    hasBase64: Boolean(asset?.base64),
    base64Length: asset?.base64?.length || 0,
    uri: asset?.uri || null,
    path: asset?.path || null,
    originalPath: asset?.originalPath || null,
  });

  if (asset?.base64) {
    attempts.push({
      label: 'base64',
      run: () => decodeQrFromBase64(asset.base64),
    });
  } else {
    const candidates = getQrSourceCandidates(asset);
    if (candidates.length > 0) {
      qrFlowLog('waitForReadableAsset:start', { candidates });
      const waitStartedAt = Date.now();
      await waitForReadableAsset(asset, candidates);
      qrFlowLog('waitForReadableAsset:done', { ms: Date.now() - waitStartedAt });
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

  qrFlowLog('attempts:queued', {
    count: attempts.length,
    labels: attempts.map(item => item.label),
  });

  for (const attempt of attempts) {
    const attemptStartedAt = Date.now();
    qrFlowLog('attempt:start', { label: attempt.label });
    try {
      const data = await withTimeout(attempt.run(), QR_DECODE_TIMEOUT_MS);
      if (data) {
        qrFlowLog('attempt:success', {
          label: attempt.label,
          ms: Date.now() - attemptStartedAt,
          totalMs: Date.now() - flowStartedAt,
        });
        return data;
      }
      attemptErrors.push(`${attempt.label} -> empty result`);
      qrFlowLog('attempt:empty', {
        label: attempt.label,
        ms: Date.now() - attemptStartedAt,
      });
    } catch (error) {
      lastError = error;
      attemptErrors.push(`${attempt.label} -> ${getErrorMessage(error)}`);
      qrFlowLog('attempt:error', {
        label: attempt.label,
        message: getErrorMessage(error),
        ms: Date.now() - attemptStartedAt,
      });
      console.error('[ScanScreen] qrCandidateError =', attempt.label, error);
    }
  }

  qrFlowLog('decodeImageData:failed', {
    totalMs: Date.now() - flowStartedAt,
    attemptErrors,
  });

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

const ScanScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [qrError, setQrError] = useState(EMPTY_QR_ERROR);
  const [cameraPermission, setCameraPermission] = useState('not-determined');
  const [isScanning, setIsScanning] = useState(true);
  const isFocused = useIsFocused();
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const isScanningRef = useRef(true);
  const device = useCameraDevice('back');

  useEffect(() => {
    isMountedRef.current = true;
    loadingRef.current = false;
    setLoading(false);

    const requestPermission = async () => {
      const status = await Camera.requestCameraPermission();
      if (isMountedRef.current) {
        setCameraPermission(status);
      }
    };
    requestPermission();

    const unsubscribe = navigation.addListener('focus', () => {
      loadingRef.current = false;
      isScanningRef.current = true;
      setLoading(false);
      setIsScanning(true);
    });

    return () => {
      isMountedRef.current = false;
      loadingRef.current = false;
      setLoading(false);
      unsubscribe();
    };
  }, [navigation]);

  const closeQrError = () => {
    setQrError(EMPTY_QR_ERROR);
    isScanningRef.current = true;
    setIsScanning(true);
  };

  const openQrError = (title, detail) => {
    setQrError({
      title: title || Language.t('alert.errorTitle'),
      detail: detail || Language.t('selectBase.notfound'),
    });
  };

  const setLoadingSafe = value => {
    loadingRef.current = value;
    if (isMountedRef.current) {
      setLoading(value);
    }
  };

  const parseQrPayload = data => {
    if (!data) {
      openQrError(
        Language.t('alert.errorTitle'),
        `${Language.t('selectBase.notfound')}\n\nEmpty QR payload`,
      );
      return;
    }
    const decodedCandidates = decodePayloadCandidates(data);
    const matchedPayload = decodedCandidates.find(
      item => typeof item === 'string' && item.indexOf('.dll') !== -1,
    );
    if (!matchedPayload) {
      openQrError(
        Language.t('alert.errorTitle'),
        `${Language.t('selectBase.invalid')}\n\nRaw: ${String(data)}`,
      );
      return;
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
      openQrError(
        Language.t('alert.errorTitle'),
        `${Language.t('selectBase.invalid')}\n\nParsed: ${matchedPayload}`,
      );
      return;
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
      openQrError(
        Language.t('alert.errorTitle'),
        `${Language.t('selectBase.invalid')}\n\nURL name not found in: ${serurl}`,
      );
      return;
    }
    const navigationPayload = {
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
    navigation.navigate(route.params?.route || 'SelectScreen', navigationPayload);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (!isScanningRef.current || loadingRef.current) {
        return;
      }
      const value = codes[0]?.value;
      if (!value) {
        return;
      }
      isScanningRef.current = false;
      setIsScanning(false);
      parseQrPayload(value);
    },
  });

  const cameraActive =
    isFocused && isScanning && !loading && !qrError.detail && cameraPermission === 'granted';

  const decodeImage = async asset => {
    if (!asset) {
      return;
    }
    if (
      !asset.base64 &&
      !asset.uri &&
      !asset.originalPath &&
      !asset.path
    ) {
      openQrError(
        Language.t('alert.errorTitle'),
        `${Language.t('selectBase.notfound')}\n\nNo image data returned from picker`,
      );
      return;
    }
    closeQrError();
    setLoadingSafe(true);
    const decodeStartedAt = Date.now();
    qrFlowLog('decodeImage:start');
    try {
      const data = await withTimeout(
        decodeImageData(asset),
        QR_DECODE_OVERALL_TIMEOUT_MS,
      );
      qrFlowLog('decodeImage:success', { ms: Date.now() - decodeStartedAt });
      parseQrPayload(data);
    } catch (error) {
      qrFlowLog('decodeImage:error', {
        ms: Date.now() - decodeStartedAt,
        message: getErrorMessage(error),
      });
      console.error('[ScanScreen] decodeImage error =', error);
      const attemptDetails = Array.isArray(error?.attemptDetails)
        ? error.attemptDetails.join('\n')
        : '';
      openQrError(
        Language.t('alert.errorTitle'),
        [
          Language.t('selectBase.notfound'),
          `Reason: ${getQrErrorDetail(error)}`,
          attemptDetails ? `Attempts:\n${attemptDetails}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      );
    } finally {
      setLoadingSafe(false);
    }
  };

  const handleImagePickerResponse = response => {
    if (response.didCancel) {
      return;
    }
    if (response.errorCode) {
      let message = response.errorMessage || response.errorCode;
      if (response.errorCode === 'permission') {
        message = Language.t('selectBase.scanQR');
      }
      openQrError(Language.t('alert.errorTitle'), message);
      return;
    }
    const asset = response.assets?.[0];
    if (!asset) {
      openQrError(
        Language.t('alert.errorTitle'),
        `${Language.t('selectBase.notfound')}\n\nNo image returned from picker`,
      );
      return;
    }
    decodeImage(asset);
  };

  const chooseFile = async () => {
    closeQrError();
    if (loadingRef.current) {
      setLoadingSafe(false);
    }

    try {
      qrFlowLog('launchImageLibrary:start');
      const pickerStartedAt = Date.now();
      const response = await launchImageLibrary({
        ...PICKER_OPTIONS,
        selectionLimit: 1,
      });
      qrFlowLog('launchImageLibrary:done', {
        ms: Date.now() - pickerStartedAt,
        didCancel: Boolean(response.didCancel),
        errorCode: response.errorCode || null,
        assetCount: response.assets?.length || 0,
      });
      handleImagePickerResponse(response);
    } catch (error) {
      console.error('[ScanScreen] launchImageLibrary error =', error);
      openQrError(Language.t('alert.errorTitle'), getErrorMessage(error));
    }
  };

  return (
    <View style={styles.page}>
      {device != null && cameraPermission === 'granted' ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={cameraActive}
          codeScanner={codeScanner}
        />
      ) : (
        <View style={styles.permissionFallback}>
          <Text style={styles.permissionText}>
            {cameraPermission === 'denied'
              ? Language.t('selectBase.scanQR')
              : Language.t('selectBase.scanQR')}
          </Text>
        </View>
      )}

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.topButton}
          >
            <Image
              style={styles.backIcon}
              resizeMode="contain"
              source={require('../img/iconsMenu/arrow.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={chooseFile} style={styles.galleryButton}>
            <Text style={styles.galleryButtonText}>
              {Language.t('selectBase.SelectImg')}
            </Text>
          </TouchableOpacity>
        </View>

        {device != null && cameraPermission === 'granted' ? (
          <View style={styles.markerContainer} pointerEvents="none">
            <View style={styles.marker} />
          </View>
        ) : null}
      </View>

      <Modal
        transparent
        visible={loading}
        animationType="fade"
        onRequestClose={() => setLoadingSafe(false)}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.buttonColorPrimary} />
            <Text style={styles.loadingText}>
              {Language.t('selectBase.scanQR')}
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={Boolean(qrError.detail)}
        animationType="fade"
        onRequestClose={closeQrError}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{qrError.title}</Text>
            <Text style={styles.errorDetail}>{qrError.detail}</Text>
            <TouchableOpacity style={styles.errorButton} onPress={closeQrError}>
              <Text style={styles.errorButtonText}>
                {Language.t('alert.ok')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  permissionFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  permissionText: {
    color: '#ffffff',
    fontSize: FontSize.medium,
    textAlign: 'center',
  },
  markerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  topButton: {
    padding: 8,
  },
  backIcon: {
    width: FontSize.large,
    height: FontSize.large,
    tintColor: '#ffffff',
  },
  galleryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  galleryButtonText: {
    fontSize: FontSize.small,
    fontWeight: '600',
    color: Colors.fontColor,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  loadingCard: {
    minWidth: 180,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: FontSize.medium,
    color: Colors.fontColor,
  },
  errorCard: {
    width: '86%',
    maxHeight: '75%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    color: Colors.buttonColorPrimary,
    fontSize: FontSize.medium,
    fontWeight: '700',
  },
  errorDetail: {
    marginTop: 12,
    fontSize: FontSize.small,
    color: Colors.fontColor,
  },
  errorButton: {
    alignSelf: 'flex-end',
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.buttonColorPrimary,
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: FontSize.small,
    fontWeight: '700',
  },
});

export default connect()(ScanScreen);
