import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import * as ImagePicker from 'react-native-image-picker';
import { connect } from 'react-redux';

import Colors from '../src/Colors';
import { FontSize } from '../components/FontSizeHelper';
import { Language } from '../translations/I18n';
import { QRreader } from 'react-native-qr-decode-image-camera';
import { Base64 } from '../src/safe_Format';

const backgroundImage = require('../images/UI/Asset35.png');

const EMPTY_QR_ERROR = {
  title: '',
  detail: '',
};

const ScanScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [qrError, setQrError] = useState(EMPTY_QR_ERROR);

  const closeQrError = () => {
    setQrError(EMPTY_QR_ERROR);
  };

  const openQrError = (title, detail) => {
    setQrError({
      title: title || Language.t('alert.errorTitle'),
      detail: detail || Language.t('selectBase.notfound'),
    });
  };

  const getErrorMessage = error => {
    if (!error) {
      return 'Unknown QR error';
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    if (error.code) {
      return String(error.code);
    }

    try {
      return JSON.stringify(error);
    } catch (jsonError) {
      return 'Unknown QR error';
    }
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

    const extractedPairs = normalizedPayload
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

    return extractedPairs;
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

  const waitForNextFrame = () =>
    new Promise(resolve => {
      setTimeout(resolve, 0);
    });

  const withTimeout = (promise, timeoutMs) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('QR_TIMEOUT')), timeoutMs),
      ),
    ]);

  const getQrSourceCandidates = asset => {
    const candidates = [];

    if (Platform.OS === 'android') {
      if (asset.path) {
        candidates.push(asset.path);

        if (!asset.path.startsWith('file://')) {
          candidates.push(`file://${asset.path}`);
        }
      }

      if (asset.uri) {
        candidates.push(asset.uri);
      }
    } else {
      if (asset.uri) {
        candidates.push(asset.uri);
      }

      if (asset.path) {
        candidates.push(asset.path);
      }
    }

    return [...new Set(candidates.filter(Boolean))];
  };

  const decodeQrFromCandidates = async candidates => {
    let lastError = null;
    const attemptErrors = [];

    for (const candidate of candidates) {
      try {
        console.log('[ScanScreen] tryingQrCandidate =', candidate);

        const data = await withTimeout(QRreader(candidate), 12000);

        if (data) {
          return data;
        }
      } catch (error) {
        lastError = error;
        attemptErrors.push(`${candidate} -> ${getErrorMessage(error)}`);
        console.log('[ScanScreen] qrCandidateError =', candidate, error);
      }
    }

    if (lastError) {
      lastError.attemptDetails = attemptErrors;
    }

    throw lastError || new Error('QR_NOT_FOUND');
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

  const parseQrPayload = data => {
    if (!data) {
      openQrError(
        Language.t('alert.errorTitle'),
        `${Language.t('selectBase.notfound')}\n\nEmpty QR payload`,
      );
      return;
    }

    console.log('[ScanScreen] rawQrData =', data);

    const decodedCandidates = decodePayloadCandidates(data);
    console.log('[ScanScreen] decodedCandidates =', decodedCandidates);

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

    console.log('[ScanScreen] matchedPayload =', matchedPayload);

    const extractedFields = extractQrFields(matchedPayload);
    const positionalFields = extractPositionalQrFields(matchedPayload);
    const mergedFields = {
      baseName: extractedFields.baseName,
      baseUrl: extractedFields.baseUrl || positionalFields.baseUrl,
      username: extractedFields.username || positionalFields.username,
      password: extractedFields.password || positionalFields.password,
    };
    console.log('[ScanScreen] extractedFields =', mergedFields);

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
        `${Language.t(
          'selectBase.invalid',
        )}\n\nURL name not found in: ${serurl}`,
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

    console.log('[ScanScreen] navigationPayload =', navigationPayload);

    navigation.navigate(route.params.route, navigationPayload);
  };

  const decodeImage = async asset => {
    if (!asset) {
      return;
    }

    const candidates = getQrSourceCandidates(asset);

    if (candidates.length === 0) {
      openQrError(
        Language.t('alert.errorTitle'),
        `${Language.t('selectBase.notfound')}\n\nNo asset path or URI found`,
      );
      return;
    }

    closeQrError();
    setLoading(true);

    try {
      await waitForNextFrame();

      const data = await decodeQrFromCandidates(candidates);
      console.log('[ScanScreen] QRreader result =', data);
      parseQrPayload(data);
    } catch (error) {
      console.log('[ScanScreen] decodeImage error =', error);
      const attemptDetails = Array.isArray(error?.attemptDetails)
        ? error.attemptDetails.join('\n')
        : '';
      openQrError(
        Language.t('alert.errorTitle'),
        [
          Language.t('selectBase.notfound'),
          `Reason: ${getErrorMessage(error)}`,
          attemptDetails ? `Attempts:\n${attemptDetails}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      );
    } finally {
      setLoading(false);
    }
  };

  const ensureCameraPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    if (Platform.Version < 23) {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: Language.t('selectBase.scanQR'),
        message: Language.t('selectBase.scanQR'),
        buttonPositive: Language.t('alert.ok'),
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const openCamera = async () => {
    const hasPermission = await ensureCameraPermission();

    if (!hasPermission) {
      Alert.alert(
        Language.t('alert.errorTitle'),
        Language.t('selectBase.notfound'),
      );
      return;
    }

    ImagePicker.launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        maxWidth: 1400,
        maxHeight: 1400,
        quality: 0.8,
        saveToPhotos: false,
      },
      response => {
        if (response.didCancel || response.errorCode) {
          return;
        }

        decodeImage(response.assets && response.assets[0]);
      },
    );
  };

  const chooseFile = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        maxWidth: 1400,
        maxHeight: 1400,
        quality: 0.8,
      },
      response => {
        if (response.didCancel || response.errorCode) {
          return;
        }

        decodeImage(response.assets && response.assets[0]);
      },
    );
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

          <TouchableOpacity style={styles.primaryButton} onPress={openCamera}>
            <Text style={styles.primaryButtonText}>
              {Language.t('selectBase.scanQR')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={chooseFile}>
            <Text style={styles.secondaryButtonText}>
              {Language.t('selectBase.SelectImg')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal transparent visible={loading} animationType="fade">
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
  primaryButtonText: {
    textAlign: 'center',
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.buttonTextColor,
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: Colors.backgroundColorSecondary,
    borderWidth: 1,
    borderColor: Colors.buttonColorPrimary,
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
