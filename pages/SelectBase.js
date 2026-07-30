import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, Dimensions, Text, Platform, ActivityIndicator, Alert, Image, ImageBackground, KeyboardAvoidingView, ScrollView, TouchableNativeFeedback, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useStateIfMounted } from 'use-state-if-mounted';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RNRestart from 'react-native-restart';
import { connect } from 'react-redux';
import Colors from '../src/Colors';
import { useSelector, useDispatch } from 'react-redux';
import { FontSize } from '../components/FontSizeHelper';
import { useNavigation } from '@react-navigation/native';
import Dialog from 'react-native-dialog';
import { Language, changeLanguage } from '../translations/I18n';
import DeviceInfo from 'react-native-device-info';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
import * as loginActions from '../src/actions/loginActions';
import * as registerActions from '../src/actions/registerActions';
import * as databaseActions from '../src/actions/databaseActions';
import {
  buildQrNavigationPayload,
  decodeQrImageAsset,
  getQrErrorDetail,
} from '../src/qrDecodeUtils';
const CURRENT_BASE_VALUE = '__current_base__';
const QR_DECODE_OVERALL_TIMEOUT_MS = 15000;
const LANGUAGE_OPTIONS = [{
  label: 'TH',
  value: 'th'
}, {
  label: 'EN',
  value: 'en'
}];
const SelectBase = ({
  route
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {
    container2,
    container1,
    button,
    textButton,
    topImage,
    tabbar,
    buttonContainer
  } = styles;
  const loginReducer = useSelector(({
    loginReducer
  }) => loginReducer);
  const registerReducer = useSelector(({
    registerReducer
  }) => registerReducer);
  const databaseReducer = useSelector(({
    databaseReducer
  }) => databaseReducer);
  const [selectedValue, setSelectedValue] = useState('');
  const [selectbaseValue, setSelectbaseValue] = useState('-1');
  const [selectlanguage, setlanguage] = useState(loginReducer.language || (Language.getLang() == 'th' ? 'th' : 'en'));
  const [basename, setBasename] = useState('');
  const [baseurl, setBsaeurl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isShowDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useStateIfMounted(false);
  const [loading_backG, setLoading_backG] = useStateIfMounted(true);
  const [machineNo, setMachineNo] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState(Array.isArray(loginReducer.ipAddress) ? loginReducer.ipAddress : []);
  const [data, setData] = useStateIfMounted({
    secureTextEntry: true
  });
  const [updateindex, setUpdateindex] = useState(null);
  const [openPicker, setOpenPicker] = useState(null);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [languageMenuLayout, setLanguageMenuLayout] = useState(null);
  const languageTriggerRef = useRef(null);
  const pendingQrImageRef = useRef(null);
  const image = '../images/UI/Asset35.png';
  const getBaseOption = (item, index) => {
    const rawName = typeof item?.nameser === 'string' ? item.nameser.trim() : '';
    const rawUrl = typeof item?.urlser === 'string' ? item.urlser.trim() : '';
    const fallbackName = rawUrl ? rawUrl.replace(/^https?:\/\//i, '').split('/')[0] : `${Language.t('selectBase.lebel')} ${index + 1}`;
    const value = rawName || rawUrl || String(index);
    return {
      item,
      index,
      label: rawName || fallbackName,
      value,
      nameser: rawName,
      urlser: rawUrl
    };
  };
  const baseOptions = (Array.isArray(items) ? items : []).map((item, index) => getBaseOption(item, index));
  const trimmedBaseName = typeof basename === 'string' ? basename.trim() : '';
  const hasSelectedBaseOption = baseOptions.some(option => option.value === selectbaseValue);
  const shouldShowCurrentBaseOption = trimmedBaseName.length > 0 && !hasSelectedBaseOption;
  const pickerOptions = shouldShowCurrentBaseOption ? [{
    label: trimmedBaseName,
    value: CURRENT_BASE_VALUE
  }, ...baseOptions] : baseOptions;
  const setlanguageState = itemValue => {
    const nextLanguage = itemValue === 'en' ? 'en' : 'th';
    setlanguage(nextLanguage);
    changeLanguage(nextLanguage);
    dispatch(loginActions.setLanguage(nextLanguage));
  };
  const onLanguageChange = itemValue => {
    if (itemValue === selectlanguage) {
      return;
    }
    Alert.alert(Language.t('menu.changeLanguage'), '', [{
      text: Language.t('alert.cancel'),
      style: 'cancel'
    }, {
      text: Language.t('alert.ok'),
      onPress: () => setlanguageState(itemValue)
    }]);
  };
  const openLanguageDropdown = () => {
    if (languageDropdownOpen) {
      setLanguageDropdownOpen(false);
      return;
    }
    setOpenPicker(null);
    languageTriggerRef.current?.measureInWindow((x, y, width, height) => {
      setLanguageMenuLayout({
        x,
        y,
        width,
        height
      });
      setLanguageDropdownOpen(true);
    });
  };
  const onLanguageOptionPress = itemValue => {
    setLanguageDropdownOpen(false);
    if (itemValue !== selectlanguage) {
      onLanguageChange(itemValue);
    }
  };
  const renderLanguageDropdown = () => <>
      <View ref={languageTriggerRef} collapsable={false} style={styles.languageDropdownAnchor}>
        <TouchableOpacity activeOpacity={0.7} style={[styles.pickerTrigger, styles.pickerTriggerCompact]} onPress={openLanguageDropdown}>
          <Text style={[styles.pickerTriggerText, styles.pickerTriggerTextCompact]} numberOfLines={1}>
            {selectlanguage === 'th' ? 'TH' : 'EN'}
          </Text>
          <Text style={[styles.pickerChevron, styles.pickerTriggerTextCompact]}>
            {languageDropdownOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </View>
      <Modal visible={languageDropdownOpen} transparent animationType="fade" onRequestClose={() => setLanguageDropdownOpen(false)}>
        <View style={styles.languageDropdownOverlayRoot}>
          <Pressable style={styles.languageDropdownBackdrop} onPress={() => setLanguageDropdownOpen(false)} />
          {languageMenuLayout ? <View style={[styles.languageDropdownMenu, {
          top: languageMenuLayout.y + languageMenuLayout.height + 4,
          left: languageMenuLayout.x,
          minWidth: Math.max(languageMenuLayout.width, 96)
        }]}>
              {LANGUAGE_OPTIONS.map(option => {
            const selected = option.value === selectlanguage;
            return <TouchableOpacity key={option.value} activeOpacity={0.7} style={[styles.languageDropdownItem, selected && styles.languageDropdownItemSelected]} onPress={() => onLanguageOptionPress(option.value)}>
                    <Text style={[styles.languageDropdownItemText, selected && styles.languageDropdownItemTextSelected]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>;
          })}
            </View> : null}
        </View>
      </Modal>
    </>;
  const getBaseDisplayLabel = () => {
    if (selectbaseValue === '-1') {
      return Language.t('selectBase.lebel');
    }
    if (selectbaseValue === CURRENT_BASE_VALUE && trimmedBaseName) {
      return trimmedBaseName;
    }
    const match = pickerOptions.find(o => o.value === selectbaseValue);
    return match?.label ?? Language.t('selectBase.lebel');
  };
  const toggleTapPicker = (pickerId, enabled) => {
    if (!enabled) {
      return;
    }
    setLanguageDropdownOpen(false);
    setOpenPicker(openPicker === pickerId ? null : pickerId);
  };
  const renderTapPicker = ({
    pickerId,
    displayLabel,
    selectedValue,
    onValueChange,
    enabled = true,
    compact = false,
    options = []
  }) => {
    const isOpen = openPicker === pickerId;
    return <View style={styles.pickerDropListContainer}>
        <TouchableOpacity disabled={!enabled} activeOpacity={0.7} style={[styles.pickerTrigger, compact && styles.pickerTriggerCompact, !enabled && styles.pickerTriggerDisabled, isOpen && styles.pickerTriggerOpen]} onPress={() => toggleTapPicker(pickerId, enabled)}>
          <Text style={[styles.pickerTriggerText, compact && styles.pickerTriggerTextCompact]} numberOfLines={1}>
            {displayLabel}
          </Text>
          <Text style={[styles.pickerChevron, compact && styles.pickerTriggerTextCompact]}>
            {isOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
        {isOpen && enabled ? <View style={styles.pickerDropList}>
            <ScrollView style={styles.pickerDropListScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {options.map(option => {
            const selected = option.value === selectedValue;
            return <TouchableOpacity key={String(option.value)} activeOpacity={0.7} style={[styles.pickerDropListItem, selected && styles.pickerDropListItemSelected]} onPress={() => {
              setOpenPicker(null);
              onValueChange(option.value);
            }}>
                    <Text style={[styles.pickerDropListItemText, selected && styles.pickerDropListItemTextSelected]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>;
          })}
            </ScrollView>
          </View> : null}
      </View>;
  };
  var a = 0;
  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry
    });
  };
  const fetchData = () => {
    navigation.dispatch(navigation.replace('SelectScreen', {
      data: a
    }));
  };
  useEffect(() => {
    if (databaseReducer.Data.nameser) _onPressSelectbaseValue(databaseReducer.Data.nameser);
  }, []);
  useEffect(() => {
    const nextItems = Array.isArray(loginReducer.ipAddress) ? loginReducer.ipAddress : [];
    setItems(nextItems);
    if (nextItems.length === 0) {
      setSelectbaseValue('-1');
      return;
    }
    const hasSelectedBase = nextItems.some((item, index) => {
      const option = getBaseOption(item, index);
      return option.value === selectbaseValue;
    });
    if (!hasSelectedBase && databaseReducer.Data.nameser) {
      _onPressSelectbaseValue(databaseReducer.Data.nameser);
    }
  }, [loginReducer.ipAddress, databaseReducer.Data.nameser]);
  useEffect(() => {
    if (route.params?.post) {
      setBasename(route.params.post.value);
      setBsaeurl(route.params.post.label);
      setSelectbaseValue(CURRENT_BASE_VALUE);
      const scannedUsername = route.params.post.username || route.params.post.usernameser || route.params.credentials?.username || '';
      const scannedPassword = route.params.post.password || route.params.post.passwordser || route.params.credentials?.password || '';
      if (scannedUsername || scannedPassword) {
        setUsername(scannedUsername);
        setPassword(scannedPassword);
      }
      if (route.params.qrDebug) {}
    }
  }, [route.params?.post]);
  useEffect(() => {
    const pendingQrImage = route.params?.pendingQrImage;
    if (!pendingQrImage) {
      return undefined;
    }

    const pendingKey = JSON.stringify([
      pendingQrImage.id || 0,
      pendingQrImage.base64?.length || 0,
      pendingQrImage.uri || '',
      pendingQrImage.path || '',
      pendingQrImage.originalPath || '',
    ]);
    if (pendingQrImageRef.current === pendingKey) {
      return undefined;
    }
    pendingQrImageRef.current = pendingKey;

    let isActive = true;

    const processPendingQrImage = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 0));

      try {
        const data = await Promise.race([
          decodeQrImageAsset(pendingQrImage),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('QR_TIMEOUT')),
              QR_DECODE_OVERALL_TIMEOUT_MS,
            ),
          ),
        ]);
        if (!isActive) {
          return;
        }
        const navigationPayload = buildQrNavigationPayload(data);
        setBasename(navigationPayload.post.value);
        setBsaeurl(navigationPayload.post.label);
        setSelectbaseValue(CURRENT_BASE_VALUE);
        const scannedUsername =
          navigationPayload.post.username ||
          navigationPayload.credentials?.username ||
          '';
        const scannedPassword =
          navigationPayload.post.password ||
          navigationPayload.credentials?.password ||
          '';
        if (scannedUsername || scannedPassword) {
          setUsername(scannedUsername);
          setPassword(scannedPassword);
        }
        navigation.setParams({ pendingQrImage: undefined });
      } catch (error) {
        if (!isActive) {
          return;
        }
        const attemptDetails = Array.isArray(error?.attemptDetails)
          ? error.attemptDetails.join('\n')
          : '';
        Alert.alert(
          Language.t('alert.errorTitle'),
          [
            Language.t('selectBase.notfound'),
            `Reason: ${getQrErrorDetail(error)}`,
            attemptDetails ? `Attempts:\n${attemptDetails}` : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
          [{ text: Language.t('alert.ok'), onPress: () => void 0 }],
        );
        navigation.setParams({ pendingQrImage: undefined });
      } finally {
        setLoading(false);
      }
    };

    processPendingQrImage();

    return () => {
      isActive = false;
    };
  }, [route.params?.pendingQrImage, navigation]);
  useEffect(() => {
    if (loginReducer.language && loginReducer.language != Language.getLang()) {
      changeLanguage(loginReducer.language);
      setlanguage(loginReducer.language);
      RNRestart.Restart();
    }
    //backsakura
  }, [loginReducer.language]);
  const _onPressSelectbaseValue = async itemValue => {
    setSelectbaseValue(itemValue);
    if (itemValue == CURRENT_BASE_VALUE) {
      return;
    }
    if (itemValue != '-1') {
      for (let i in items) {
        const option = getBaseOption(items[i], Number(i));
        if (option.value == itemValue) {
          setBasename(items[i].nameser);
          setBsaeurl(items[i].urlser);
          setUsername(items[i].usernameser);
          setPassword(items[i].passwordser);
          setUpdateindex(i);
        }
      }
    } else {
      setBasename('');
      setBsaeurl('');
      setUsername('');
      setPassword('');
    }
  };
  const closeLoading = () => {
    setLoading(false);
  };
  const letsLoading = () => {
    setLoading(true);
  };
  const checkValue = () => {
    let c = true;
    if (basename == '') c = false;else if (baseurl == '') c = false;else if (username == '') c = false;else if (password == '') c = false;
    return c;
  };
  const _onPressUpdate = async (basename, newurl) => {
    if (checkValue() == true) {
      await checkIPAddress('-1');
    }
  };
  const _onPressDelete = async () => {
    let temp = loginReducer.ipAddress;
    let tempurl = baseurl.split('.dll');
    let newurl = tempurl[0] + '.dll';
    if (baseurl == databaseReducer.Data.urlser) {
      Alert.alert('', Language.t('selectBase.cannotDelete'), [{
        text: Language.t('alert.ok'),
        onPress: () => void 0
      }]);
    } else {
      if (temp.length == 1) {
        Alert.alert('', Language.t('selectBase.cannotDelete'), [{
          text: Language.t('alert.ok'),
          onPress: () => void 0
        }]);
      } else {
        for (let i in loginReducer.ipAddress) {
          if (loginReducer.ipAddress[i].urlser == baseurl) {
            Alert.alert('', Language.t('selectBase.questionDelete'), [{
              text: Language.t('alert.ok'),
              onPress: () => {
                temp.splice(i, 1);
                dispatch(loginActions.ipAddress(temp));
                fetchData();
              }
            }, {
              text: Language.t('alert.cancel'),
              onPress: () => {}
            }]);
            break;
          }
        }
      }
    }
    setLoading(false);
  };
  const _onPressAddbase = async () => {
    letsLoading();
    let tempurl = baseurl.split('.dll');
    let newurl = tempurl[0] + '.dll';
    let temp = [];
    let check = false;
    let checktest = false;
    if (checkValue() == true) {
      temp = items;
      for (let i in items) {
        if (i != updateindex) {
          if (items[i].nameser != basename && items[i].urlser == newurl) {
            checktest = true;
          } else if (items[i].nameser == basename && items[i].urlser != newurl) {
            checktest = true;
          }
        }
      }
      if (!checktest) {
        for (let i in items) {
          if (items[i].nameser == basename && items[i].urlser == newurl) {
            checkIPAddress('0');
            check = true;
          } else {
            if (items[i].nameser == basename) {
              Alert.alert(Language.t('selectBase.Alert'), Language.t('selectBase.Alert2') + Language.t('selectBase.url'), [{
                text: Language.t('selectBase.yes'),
                onPress: () => _onPressUpdate(basename, newurl)
              }, {
                text: Language.t('selectBase.no'),
                onPress: () => setLoading(false)
              }]);
              check = true;
              break;
            } else if (items[i].urlser == newurl) {
              Alert.alert(Language.t('selectBase.Alert'), Language.t('selectBase.Alert2') + Language.t('selectBase.name'), [{
                text: Language.t('selectBase.yes'),
                onPress: () => _onPressUpdate(basename, newurl)
              }, {
                text: Language.t('selectBase.no'),
                onPress: () => setLoading(false)
              }]);
              check = true;
              break;
            }
          }
        }
        if (!check) {
          checkIPAddress('1');
        }
      } else {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('selectBase.Alert3'), [{
          text: Language.t('alert.ok'),
          onPress: () => _onPressSelectbaseValue(selectbaseValue)
        }]);
        setLoading(false);
      }
    } else {
      Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.errorDetail'), [{
        text: Language.t('alert.ok'),
        onPress: () => void 0
      }]);
      setLoading(false);
    }
  };
  const checkIPAddress = async state => {
    let tempurl = baseurl.split('.dll');
    let newurl = tempurl[0] + '.dll';
    let temp = [];
    fetch(newurl + '/DevUsers', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': '',
        'BPAPUS-FUNCTION': 'UnRegister',
        'BPAPUS-PARAM': '{"BPAPUS-MACHINE":  "' + registerReducer.machineNum + '"}'
      })
    }).then(response => response.json()).then(async json => {
      if (json && json.ResponseCode == '200') {
        await fetch(baseurl + '/DevUsers', {
          method: 'POST',
          body: JSON.stringify({
            'BPAPUS-BPAPSV': loginReducer.serviceID,
            'BPAPUS-LOGIN-GUID': '',
            'BPAPUS-FUNCTION': 'Register',
            'BPAPUS-PARAM': '{ "BPAPUS-MACHINE":  "' + registerReducer.machineNum + '","BPAPUS-CNTRY-CODE": "66", "BPAPUS-MOBILE": "mobile login"}'
          })
        }).then(response => response.json()).then(json => {
          if (json.ResponseCode == 200 && json.ReasonString == 'Completed') {
            fetch(newurl + '/DevUsers', {
              method: 'POST',
              body: JSON.stringify({
                'BPAPUS-BPAPSV': loginReducer.serviceID,
                'BPAPUS-LOGIN-GUID': '',
                'BPAPUS-FUNCTION': 'Login',
                'BPAPUS-PARAM': '{"BPAPUS-MACHINE":  "' + registerReducer.machineNum + '","BPAPUS-USERID": "' + username.toUpperCase() + '","BPAPUS-PASSWORD": "' + password.toUpperCase() + '"}'
              })
            }).then(response => response.json()).then(json => {
              if (json && json.ResponseCode == '200') {
                let newObj = {
                  nameser: basename,
                  urlser: newurl,
                  usernameser: username.toUpperCase(),
                  passwordser: password.toUpperCase()
                };
                if (state == '-1') {
                  for (let i in loginReducer.ipAddress) {
                    if (i == updateindex) {
                      temp.push(newObj);
                    } else {
                      temp.push(loginReducer.ipAddress[i]);
                    }
                  }
                  dispatch(loginActions.ipAddress(temp));
                  dispatch(databaseActions.setData(newObj));
                } else if (state == '1') {
                  if (items.length > 0) {
                    for (let i in items) {
                      temp.push(items[i]);
                    }
                  }
                  temp.push(newObj);
                  dispatch(loginActions.ipAddress(temp));
                  dispatch(databaseActions.setData(newObj));
                } else if (state == '0') {
                  dispatch(databaseActions.setData(newObj));
                }
                fetch(newurl + '/DevUsers', {
                  method: 'POST',
                  body: JSON.stringify({
                    'BPAPUS-BPAPSV': loginReducer.serviceID,
                    'BPAPUS-LOGIN-GUID': '',
                    'BPAPUS-FUNCTION': 'UnRegister',
                    'BPAPUS-PARAM': '{"BPAPUS-MACHINE":  "' + registerReducer.machineNum + '"}'
                  })
                }).then(response => response.json()).then(json => {
                  if (json && json.ResponseCode == '200') {
                    Alert.alert(Language.t('alert.succeed'), Language.t('selectBase.connect') + ' ' + basename + ' ' + Language.t('alert.succeed'), [{
                      text: Language.t('alert.ok'),
                      onPress: () => navigation.dispatch(navigation.replace('LoginScreen'))
                    }]);
                  }
                });
              } else {
                let temp_error = 'error_ser.' + json.ResponseCode;
                Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
                  text: Language.t('alert.ok'),
                  onPress: () => _onPressSelectbaseValue(selectbaseValue)
                }]);
                setLoading(false);
              }
            }).catch(error => {
              Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.errorDetail'), [{
                text: Language.t('alert.ok'),
                onPress: () => _onPressSelectbaseValue(selectbaseValue)
              }]);
              console.error('_fetchGuidLogin ' + error);
              setLoading(false);
            });
          } else {
            let temp_error = 'error_ser.' + json.ResponseCode;
            Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
              text: Language.t('alert.ok'),
              onPress: () => void 0
            }]);
            setLoading(false);
          }
        }).catch(error => {
          Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.errorDetail'), [{
            text: Language.t('alert.ok'),
            onPress: () => void 0
          }]);
          setLoading(false);
        });
      } else {
        let temp_error = 'error_ser.' + json.ResponseCode;
        Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
          text: Language.t('alert.ok'),
          onPress: () => _onPressSelectbaseValue(selectbaseValue)
        }]);
        setLoading(false);
      }
    }).catch(error => {
      Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.errorDetail'), [{
        text: Language.t('alert.ok'),
        onPress: () => _onPressSelectbaseValue(selectbaseValue)
      }]);
      console.error('_fetchGuidLogin ' + error);
      setLoading(false);
    });
  };
  return <View style={container1}>
      <ImageBackground source={require(image)} onLoadEnd={() => {
      setLoading_backG(false);
    }} resizeMode="cover" style={styles.image}>
        <View style={[tabbar, {
        paddingTop: insets.top + 12,
        paddingBottom: 12,
        paddingLeft: Math.max(insets.left, 20),
        paddingRight: Math.max(insets.right, 16)
      }]}>
          <View style={{
          flexDirection: 'row',
          flex: 1,
          alignItems: 'center'
        }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image style={{
              width: FontSize.large,
              height: FontSize.large
            }} resizeMode="contain" source={require('../img/iconsMenu/goback.png')} />
            </TouchableOpacity>
            <Text style={{
            marginLeft: 12,
            fontSize: FontSize.medium,
            color: Colors.backgroundLoginColorSecondary,
            flexShrink: 1
          }}>
              {Language.t('selectBase.header')}
            </Text>
          </View>
          <View style={{
          marginLeft: 8
        }}>
            {renderLanguageDropdown()}
          </View>
        </View>
        <ScrollView contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 20)
      }}>
          <View>
            <KeyboardAvoidingView keyboardVerticalOffset={1} behavior={'position'}>
              <View style={styles.body}>
                <View style={styles.body1}>
                  <Text style={styles.textTitle}>
                    {Language.t('selectBase.title')} :
                  </Text>
                </View>
                {items.length > 0 ? renderTapPicker({
                pickerId: 'base',
                displayLabel: getBaseDisplayLabel(),
                selectedValue: selectbaseValue,
                onValueChange: itemValue => _onPressSelectbaseValue(itemValue),
                options: [...pickerOptions.map(option => ({
                  label: option.label,
                  value: option.value
                })), {
                  label: Language.t('selectBase.lebel'),
                  value: '-1'
                }]
              }) : renderTapPicker({
                pickerId: 'base',
                enabled: false,
                displayLabel: Language.t('selectBase.lebel'),
                selectedValue: '-1',
                onValueChange: () => {},
                options: [{
                  label: Language.t('selectBase.lebel'),
                  value: '-1'
                }]
              })}
                <View style={{
                marginTop: 10
              }}>
                  <Text style={styles.textTitle}>
                    {Language.t('selectBase.name')} :
                  </Text>
                </View>
                <View style={{
                marginTop: 10
              }}>
                  <View style={{
                  backgroundColor: Colors.backgroundColorSecondary,
                  flexDirection: 'column',
                  borderWidth: 1,
                  borderColor: Colors.buttonColorPrimary,
                  height: 50,
                  borderRadius: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 10,
                  paddingBottom: 10
                }}>
                    <View style={{
                    height: 30,
                    flexDirection: 'row'
                  }}>
                      <Image style={{
                      height: 30,
                      width: 30
                    }} resizeMode={'contain'} source={require('../images/UI/endpoint/Asset18_4x.png')} />
                      <TextInput style={{
                      flex: 8,
                      marginLeft: 10,
                      borderBottomColor: Colors.buttonColorPrimary,
                      color: Colors.fontColor,
                      paddingVertical: 3,
                      fontSize: FontSize.medium,
                      borderBottomWidth: 0.7
                    }} placeholderTextColor={Colors.fontColorSecondary} placeholder={Language.t('selectBase.name') + '..'} value={basename} onChangeText={val => {
                      setBasename(val);
                    }}></TextInput>
                      <TouchableOpacity style={{
                      marginLeft: 10
                    }} onPress={() => navigation.navigate('ScanScreen', {
                      route: 'SelectScreen'
                    })}>
                        <Image style={{
                        width: FontSize.large,
                        height: FontSize.large
                      }} resizeMode="contain" source={require('../img/iconsMenu/qr-code.png')} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={{
                marginTop: 10
              }}>
                  <Text style={styles.textTitle}>
                    {Language.t('selectBase.url')} :
                  </Text>
                </View>
                <View style={{
                marginTop: 10
              }}>
                  <View style={{
                  backgroundColor: Colors.backgroundColorSecondary,
                  flexDirection: 'column',
                  borderWidth: 1,
                  borderColor: Colors.buttonColorPrimary,
                  height: 50,
                  borderRadius: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 10,
                  height: 'auto',
                  paddingBottom: 10
                }}>
                    <View style={{
                    height: 'auto',
                    flexDirection: 'row'
                  }}>
                      <Image style={{
                      height: 30,
                      width: 30
                    }} resizeMode={'contain'} source={require('../images/UI/endpoint/Asset19_4x.png')} />
                      <TextInput style={{
                      flex: 8,
                      marginLeft: 10,
                      borderBottomColor: Colors.buttonColorPrimary,
                      color: Colors.fontColor,
                      paddingVertical: 3,
                      fontSize: FontSize.medium,
                      height: 'auto',
                      borderBottomWidth: 0.7
                    }} multiline={true} placeholderTextColor={Colors.fontColorSecondary} value={baseurl} placeholder={Language.t('selectBase.url') + '..'} onChangeText={val => {
                      setBsaeurl(val);
                    }}></TextInput>
                    </View>
                  </View>
                </View>
                <View style={{
                marginTop: 10
              }}>
                  <Text style={styles.textTitle}>
                    {Language.t('login.username')} :
                  </Text>
                </View>
                <View style={{
                marginTop: 10
              }}>
                  <View style={{
                  backgroundColor: Colors.backgroundColorSecondary,
                  flexDirection: 'column',
                  borderWidth: 1,
                  borderColor: Colors.buttonColorPrimary,
                  height: 50,
                  borderRadius: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 10,
                  paddingBottom: 10
                }}>
                    <View style={{
                    height: 30,
                    flexDirection: 'row'
                  }}>
                      <Image style={{
                      height: 30,
                      width: 30
                    }} resizeMode={'contain'} source={require('../images/UI/endpoint/Asset20_4x.png')} />
                      <TextInput style={{
                      flex: 8,
                      marginLeft: 5,
                      borderBottomColor: Colors.buttonColorPrimary,
                      color: Colors.fontColor,
                      paddingVertical: 3,
                      fontSize: FontSize.medium,
                      borderBottomWidth: 0.7
                    }} placeholderTextColor={Colors.fontColorSecondary} value={username} placeholder={Language.t('login.username') + '..'} onChangeText={val => {
                      setUsername(val);
                    }}></TextInput>
                    </View>
                  </View>
                </View>
                <View style={{
                marginTop: 10
              }}>
                  <Text style={styles.textTitle}>
                    {Language.t('login.password')} :
                  </Text>
                </View>
                <View style={{
                marginTop: 10
              }}>
                  <View style={{
                  backgroundColor: Colors.backgroundColorSecondary,
                  flexDirection: 'column',
                  height: 50,
                  borderWidth: 1,
                  borderColor: Colors.buttonColorPrimary,
                  borderRadius: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 10,
                  paddingBottom: 10
                }}>
                    <View style={{
                    height: 30,
                    flexDirection: 'row'
                  }}>
                      <Image style={{
                      height: 30,
                      width: 30
                    }} resizeMode={'contain'} source={require('../images/UI/endpoint/Asset21_4x.png')} />
                      <TextInput style={{
                      flex: 8,
                      marginLeft: 5,
                      color: Colors.fontColor,
                      paddingVertical: 3,
                      fontSize: FontSize.medium,
                      borderBottomColor: Colors.buttonColorPrimary,
                      borderBottomWidth: 0.7
                    }} secureTextEntry={data.secureTextEntry ? true : false} keyboardType="default" placeholderTextColor={Colors.fontColorSecondary} placeholder={Language.t('login.password') + '..'} value={password} onChangeText={val => {
                      setPassword(val);
                    }} />

                      <TouchableOpacity style={{
                      marginLeft: 10
                    }} onPress={updateSecureTextEntry}>
                        {data.secureTextEntry ? <Image style={{
                        width: FontSize.large,
                        height: FontSize.large
                      }} resizeMode="contain" source={require('../img/iconsMenu/eye-off.png')} /> : <Image style={{
                        width: FontSize.large,
                        height: FontSize.large
                      }} resizeMode="contain" source={require('../img/iconsMenu/eye.png')} />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.body1e}>
                  <TouchableNativeFeedback onPress={() => _onPressAddbase()}>
                    <View style={{
                    borderRadius: 10,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: 50,
                    marginRight: 10,
                    width: deviceWidth - 200,
                    backgroundColor: Colors.buttonColorPrimary
                  }}>
                      <Text style={{
                      color: Colors.buttonTextColor,
                      alignSelf: 'center',
                      fontSize: FontSize.medium,
                      fontWeight: 'bold'
                    }}>
                        {Language.t('selectBase.saveandconnect')}
                      </Text>
                    </View>
                  </TouchableNativeFeedback>

                  {items.length > 0 ? <TouchableNativeFeedback onPress={() => _onPressDelete()}>
                      <View style={{
                    borderRadius: 10,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: 50,
                    width: deviceWidth - 250,
                    backgroundColor: Colors.backgroundLoginColor
                  }}>
                        <Text style={{
                      color: Colors.backgroundColorSecondary,
                      alignSelf: 'center',
                      fontSize: FontSize.medium,
                      fontWeight: 'bold'
                    }}>
                          {Language.t('selectBase.delete')}
                        </Text>
                      </View>
                    </TouchableNativeFeedback> : <TouchableNativeFeedback onPress={() => null}>
                      <View style={{
                    borderRadius: 10,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: 50,
                    width: deviceWidth - 250,
                    backgroundColor: '#979797'
                  }}>
                        <Text style={{
                      color: '#C5C5C5',
                      alignSelf: 'center',
                      fontSize: FontSize.medium,
                      fontWeight: 'bold'
                    }}>
                          {Language.t('selectBase.delete')}
                        </Text>
                      </View>
                    </TouchableNativeFeedback>}
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </ScrollView>

        {loading && <View style={{
        width: deviceWidth,
        height: deviceHeight,
        opacity: 0.5,
        backgroundColor: 'black',
        alignSelf: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        position: 'absolute'
      }}>
            <ActivityIndicator style={{
          borderRadius: 15,
          backgroundColor: null,
          width: 100,
          height: 100,
          alignSelf: 'center'
        }} animating={loading} size="large" color={Colors.lightPrimiryColor} />
          </View>}
      </ImageBackground>
    </View>;
};
const styles = StyleSheet.create({
  container1: {
    backgroundColor: '#ffffff',
    flex: 1
  },
  body: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20
  },
  body1e: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  body1: {
    marginTop: 10,
    flexDirection: 'row'
  },
  tabbar: {
    minHeight: 48,
    alignItems: 'center',
    backgroundColor: '#223fc9',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  pickerTrigger: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.buttonColorPrimary,
    backgroundColor: Colors.backgroundColorSecondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50
  },
  pickerTriggerCompact: {
    marginTop: 0,
    height: 36,
    minWidth: 88,
    paddingHorizontal: 12,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  pickerTriggerDisabled: {
    borderColor: '#979797',
    opacity: 0.7
  },
  pickerTriggerText: {
    flex: 1,
    fontSize: FontSize.medium,
    color: Colors.buttonColorPrimary,
    marginRight: 8
  },
  pickerTriggerTextCompact: {
    flex: 0,
    color: Colors.backgroundLoginColorSecondary,
    fontSize: FontSize.medium,
    fontWeight: 'bold'
  },
  languageDropdownAnchor: {
    zIndex: 20
  },
  languageDropdownOverlayRoot: {
    flex: 1
  },
  languageDropdownBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  languageDropdownMenu: {
    position: 'absolute',
    backgroundColor: Colors.backgroundColorSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  languageDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center'
  },
  languageDropdownItemSelected: {
    backgroundColor: Colors.backgroundColor
  },
  languageDropdownItemText: {
    fontSize: FontSize.medium,
    color: Colors.fontColor,
    fontWeight: '600'
  },
  languageDropdownItemTextSelected: {
    color: Colors.buttonColorPrimary
  },
  pickerChevron: {
    fontSize: 10,
    color: Colors.buttonColorPrimary
  },
  pickerDropListContainer: {
    zIndex: 10
  },
  pickerTriggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  pickerDropList: {
    marginTop: -1,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.buttonColorPrimary,
    backgroundColor: Colors.backgroundColorSecondary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  pickerDropListScroll: {
    maxHeight: 240
  },
  pickerDropListItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderColor
  },
  pickerDropListItemSelected: {
    backgroundColor: Colors.backgroundColor
  },
  pickerDropListItemText: {
    fontSize: FontSize.medium,
    color: Colors.fontColor
  },
  pickerDropListItemTextSelected: {
    color: Colors.buttonColorPrimary,
    fontWeight: 'bold'
  },
  image: {
    flex: 1,
    justifyContent: 'center'
  },
  dorpdown: {
    justifyContent: 'center',
    fontSize: FontSize.medium
  },
  dorpdownTop: {
    justifyContent: 'flex-end',
    fontSize: FontSize.medium
  },
  textTitle: {
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.fontColor
  },
  imageIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  topImage: {
    height: deviceHeight / 3,
    width: deviceWidth
  },
  button: {
    marginTop: 10,
    marginBottom: 25,
    padding: 5,
    alignItems: 'center',
    backgroundColor: Colors.buttonColorPrimary,
    borderRadius: 10
  },
  textButton: {
    fontSize: FontSize.large,
    color: Colors.fontColor2
  },
  buttonContainer: {
    marginTop: 10
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    marginBottom: 20
  },
  checkbox: {
    alignSelf: 'center',
    borderBottomColor: '#ffff',
    color: '#ffff'
  },
  label: {
    margin: 8,
    color: '#ffff'
  }
});
const mapStateToProps = state => {
  return {};
};
const mapDispatchToProps = dispatch => {
  return {
    reduxMachineNum: payload => dispatch(registerActions.machine(payload))
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SelectBase);