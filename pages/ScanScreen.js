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

const ScanScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);

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
      usernameser: 'username',
      username: 'username',
      user: 'username',
      userid: 'username',
      passwordser: 'password',
      password: 'password',
      pass: 'password',
      pwd: 'password',
    };

    try {
      const jsonData = JSON.parse(normalizedPayload);

      if (jsonData && typeof jsonData === 'object') {
        return Object.entries(jsonData).reduce(
          (result, [key, value]) => {
            const mappedKey = keyMap[String(key).toLowerCase()];

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

          const rawKey = part.slice(0, separatorIndex).trim().toLowerCase();
          const rawValue = part.slice(separatorIndex + 1).trim();
          const mappedKey = keyMap[rawKey];

          if (mappedKey && rawValue) {
            result[mappedKey] = rawValue;
          }

          return result;
        },
        { ...emptyResult },
      );

    return extractedPairs;
  };

  const waitForNextFrame = () =>
    new Promise(resolve => {
      setTimeout(resolve, 0);
    });

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
      Alert.alert(
        Language.t('alert.errorTitle'),
        Language.t('selectBase.notfound'),
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
      Alert.alert(
        Language.t('alert.errorTitle'),
        Language.t('selectBase.invalid'),
      );
      return;
    }

    console.log('[ScanScreen] matchedPayload =', matchedPayload);

    const extractedFields = extractQrFields(matchedPayload);
    console.log('[ScanScreen] extractedFields =', extractedFields);

    const result = matchedPayload.split('|');

    if (!result[0] || result[0].indexOf('.dll') === -1) {
      Alert.alert(
        Language.t('alert.errorTitle'),
        Language.t('selectBase.invalid'),
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
      Alert.alert(
        Language.t('alert.errorTitle'),
        Language.t('selectBase.invalid'),
      );
      return;
    }

    const navigationPayload = {
      post: {
        label: extractedFields.baseUrl || serurl,
        value: extractedFields.baseName || urlname[0],
        username: extractedFields.username || '',
        password: extractedFields.password || '',
      },
      credentials: {
        username: extractedFields.username || '',
        password: extractedFields.password || '',
      },
      qrDebug: {
        raw: data,
        matchedPayload,
        extractedFields,
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

    const path =
      Platform.OS === 'android'
        ? asset.path || asset.uri
        : asset.uri || asset.path;

    if (!path) {
      Alert.alert(
        Language.t('alert.errorTitle'),
        Language.t('selectBase.notfound'),
      );
      return;
    }

    setLoading(true);

    try {
      await waitForNextFrame();

      const data = await Promise.race([
        QRreader(path),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('QR_TIMEOUT')), 4000),
        ),
      ]);
      console.log('[ScanScreen] QRreader result =', data);
      parseQrPayload(data);
    } catch (error) {
      console.log('[ScanScreen] decodeImage error =', error);
      Alert.alert(
        Language.t('alert.errorTitle'),
        Language.t('selectBase.notfound'),
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
});

export default connect()(ScanScreen);
