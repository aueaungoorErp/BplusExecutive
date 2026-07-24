import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { connect } from 'react-redux';
import { QRreader } from 'react-native-qr-decode-image-camera';
import Colors from '../src/Colors';
import { FontSize } from '../components/FontSizeHelper';
import { Language } from '../translations/I18n';
import { Base64 } from '../src/safe_Format';

const backgroundImage = require('../images/UI/Asset35.png');
const EMPTY_QR_ERROR = {
  title: '',
  detail: '',
};
const QR_DECODE_TIMEOUT_MS = 6000;
const QR_DECODE_OVERALL_TIMEOUT_MS = 15000;
const QR_FILE_READY_RETRIES = 6;
const QR_FILE_READY_DELAY_MS = 150;
const PICKER_OPTIONS = {
  mediaType: 'photo',
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  includeBase64: false,
};

const requestCameraPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }
  try {
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (alreadyGranted) {
      return true;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: Language.t('selectBase.scanQR'),
        message: Language.t('selectBase.scanQR'),
        buttonPositive: Language.t('alert.ok'),
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('[ScanScreen] camera permission error =', error);
    return false;
  }
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

const getQrSourceCandidates = asset => {
  const candidates = [];
  addQrSourceCandidate(candidates, asset.uri);
  addQrSourceCandidate(candidates, asset.originalPath);
  addQrSourceCandidate(candidates, asset.path);
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
  const attemptErrors = [];
  let lastError = null;
  const candidates = getQrSourceCandidates(asset);

  if (candidates.length > 0) {
    await waitForReadableAsset(asset, candidates);
    for (const candidate of candidates) {
      try {
        const data = await withTimeout(QRreader(candidate), QR_DECODE_TIMEOUT_MS);
        if (data) {
          return data;
        }
        attemptErrors.push(`${candidate} -> empty result`);
      } catch (error) {
        lastError = error;
        attemptErrors.push(`${candidate} -> ${getErrorMessage(error)}`);
        console.error('[ScanScreen] qrCandidateError =', candidate, error);
      }
    }
  } else if (!asset?.uri && !asset?.originalPath && !asset?.path) {
    attemptErrors.push('no uri available');
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

const ScanScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [qrError, setQrError] = useState(EMPTY_QR_ERROR);
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    loadingRef.current = false;
    setLoading(false);

    const unsubscribe = navigation.addListener('focus', () => {
      loadingRef.current = false;
      setLoading(false);
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

  const decodeImage = async asset => {
    if (!asset) {
      return;
    }
    if (!asset.uri && !asset.originalPath && !asset.path) {
      openQrError(
        Language.t('alert.errorTitle'),
        `${Language.t('selectBase.notfound')}\n\nNo image data returned from picker`,
      );
      return;
    }
    closeQrError();
    setLoadingSafe(true);
    try {
      const data = await withTimeout(
        decodeImageData(asset),
        QR_DECODE_OVERALL_TIMEOUT_MS,
      );
      parseQrPayload(data);
    } catch (error) {
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
      } else if (response.errorCode === 'camera_unavailable') {
        message = Language.t('selectBase.notfound');
      } else if (
        response.errorCode === 'others' &&
        typeof message === 'string' &&
        message.toLowerCase().includes('camera')
      ) {
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

  const openCamera = async () => {
    closeQrError();
    if (loadingRef.current) {
      setLoadingSafe(false);
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      openQrError(
        Language.t('alert.errorTitle'),
        Language.t('selectBase.scanQR'),
      );
      return;
    }

    try {
      const response = await launchCamera({
        ...PICKER_OPTIONS,
        cameraType: 'back',
        saveToPhotos: false,
      });
      console.log('[ScanScreen] launchCamera response =', response?.errorCode || 'ok');
      handleImagePickerResponse(response);
    } catch (error) {
      console.error('[ScanScreen] launchCamera error =', error);
      openQrError(Language.t('alert.errorTitle'), getErrorMessage(error));
    }
  };

  const chooseFile = async () => {
    closeQrError();
    if (loadingRef.current) {
      setLoadingSafe(false);
    }

    try {
      const response = await launchImageLibrary({
        ...PICKER_OPTIONS,
        selectionLimit: 1,
      });
      console.log('[ScanScreen] launchImageLibrary response =', response?.errorCode || 'ok');
      handleImagePickerResponse(response);
    } catch (error) {
      console.error('[ScanScreen] launchImageLibrary error =', error);
      openQrError(Language.t('alert.errorTitle'), getErrorMessage(error));
    }
  };

  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="cover"
      style={styles.page}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image
            style={styles.backIcon}
            resizeMode="contain"
            source={require('../img/iconsMenu/arrow.png')}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>{Language.t('selectBase.scanQR')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Image
            style={styles.heroIcon}
            resizeMode="contain"
            source={require('../img/iconsMenu/qr-code.png')}
          />
          <Text style={styles.title}>{Language.t('selectBase.scanQR')}</Text>
          <Text style={styles.subtitle}>
            {Language.t('selectBase.SelectImg')}
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={openCamera}
          >
            <Text style={styles.primaryButtonText}>
              {Language.t('selectBase.scanQR')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, loading && styles.buttonDisabled]}
            onPress={chooseFile}
          >
            <Text style={styles.secondaryButtonText}>
              {Language.t('selectBase.SelectImg')}
            </Text>
          </TouchableOpacity>
        </View>
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  header: {
    height: 70,
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
    backgroundColor: '#223fc9',
    flexDirection: 'row',
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    width: FontSize.large,
    height: FontSize.large,
  },
  headerText: {
    color: Colors.backgroundLoginColorSecondary,
    fontSize: FontSize.medium,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 18,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
  },
  heroIcon: {
    width: 84,
    height: 84,
    marginBottom: 20,
  },
  title: {
    fontSize: FontSize.large,
    fontWeight: 'bold',
    color: Colors.fontColor,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSize.medium,
    color: Colors.fontColorSecondary,
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: Colors.buttonColorPrimary,
    marginBottom: 12,
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: Colors.backgroundColorSecondary,
    borderWidth: 1,
    borderColor: Colors.buttonColorPrimary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    textAlign: 'center',
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.buttonTextColor,
  },
  secondaryButtonText: {
    textAlign: 'center',
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.buttonColorPrimary,
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
