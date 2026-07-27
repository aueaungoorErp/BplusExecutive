import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
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
import { connect } from 'react-redux';
import { buildQrNavigationPayload } from '../src/qrDecodeUtils';
import Colors from '../src/Colors';
import { FontSize } from '../components/FontSizeHelper';
import { Language } from '../translations/I18n';

const EMPTY_QR_ERROR = {
  title: '',
  detail: '',
};
const PICKER_OPTIONS = {
  mediaType: 'photo',
  maxWidth: 640,
  maxHeight: 640,
  quality: 0.85,
  includeBase64: true,
};

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

const ScanScreen = ({ navigation, route }) => {
  const [qrError, setQrError] = useState(EMPTY_QR_ERROR);
  const [cameraPermission, setCameraPermission] = useState('not-determined');
  const [isScanning, setIsScanning] = useState(true);
  const isFocused = useIsFocused();
  const isMountedRef = useRef(true);
  const isScanningRef = useRef(true);
  const device = useCameraDevice('back');
  const targetRoute = route.params?.route || 'SelectScreen';

  useEffect(() => {
    isMountedRef.current = true;

    const requestPermission = async () => {
      const status = await Camera.requestCameraPermission();
      if (isMountedRef.current) {
        setCameraPermission(status);
      }
    };
    requestPermission();

    const unsubscribe = navigation.addListener('focus', () => {
      isScanningRef.current = true;
      setIsScanning(true);
    });

    return () => {
      isMountedRef.current = false;
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

  const navigateWithQrPayload = data => {
    try {
      const navigationPayload = buildQrNavigationPayload(data);
      navigation.navigate(targetRoute, navigationPayload);
    } catch (error) {
      if (error.code === 'EMPTY_QR_PAYLOAD') {
        openQrError(
          Language.t('alert.errorTitle'),
          `${Language.t('selectBase.notfound')}\n\nEmpty QR payload`,
        );
        return;
      }
      if (error.code === 'INVALID_QR_PAYLOAD') {
        openQrError(
          Language.t('alert.errorTitle'),
          `${Language.t('selectBase.invalid')}\n\nRaw: ${error.raw || error.parsed || error.url || ''}`,
        );
        return;
      }
      openQrError(Language.t('alert.errorTitle'), getErrorMessage(error));
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (!isScanningRef.current) {
        return;
      }
      const value = codes[0]?.value;
      if (!value) {
        return;
      }
      isScanningRef.current = false;
      setIsScanning(false);
      navigateWithQrPayload(value);
    },
  });

  const cameraActive =
    isFocused && isScanning && !qrError.detail && cameraPermission === 'granted';

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
    if (!asset.base64 && !asset.uri && !asset.originalPath && !asset.path) {
      openQrError(
        Language.t('alert.errorTitle'),
        `${Language.t('selectBase.notfound')}\n\nNo image data returned from picker`,
      );
      return;
    }

    closeQrError();
    navigation.navigate(targetRoute, {
      pendingQrImage: {
        id: Date.now(),
        base64: asset.base64 || null,
        uri: asset.uri || null,
        path: asset.path || null,
        originalPath: asset.originalPath || null,
      },
    });
  };

  const chooseFile = async () => {
    closeQrError();

    try {
      const response = await launchImageLibrary({
        ...PICKER_OPTIONS,
        selectionLimit: 1,
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
