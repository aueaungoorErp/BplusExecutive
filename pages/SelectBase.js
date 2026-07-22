import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Dimensions,
  Text,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  TouchableNativeFeedback,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
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

const CURRENT_BASE_VALUE = '__current_base__';

const SelectBase = ({ route }) => {
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
    buttonContainer,
  } = styles;

  const loginReducer = useSelector(({ loginReducer }) => loginReducer);
  const registerReducer = useSelector(({ registerReducer }) => registerReducer);
  const databaseReducer = useSelector(({ databaseReducer }) => databaseReducer);

  const [selectedValue, setSelectedValue] = useState('');
  const [selectbaseValue, setSelectbaseValue] = useState('-1');
  const [selectlanguage, setlanguage] = useState(
    Language.getLang() == 'th' ? 'th' : 'en',
  );
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
  const [items, setItems] = useState(
    Array.isArray(loginReducer.ipAddress) ? loginReducer.ipAddress : [],
  );
  const [data, setData] = useStateIfMounted({
    secureTextEntry: true,
  });
  const [updateindex, setUpdateindex] = useState(null);
  const [openPicker, setOpenPicker] = useState(null);
  const image = '../images/UI/Asset35.png';

  const getBaseOption = (item, index) => {
    const rawName =
      typeof item?.nameser === 'string' ? item.nameser.trim() : '';
    const rawUrl = typeof item?.urlser === 'string' ? item.urlser.trim() : '';
    const fallbackName = rawUrl
      ? rawUrl.replace(/^https?:\/\//i, '').split('/')[0]
      : `${Language.t('selectBase.lebel')} ${index + 1}`;
    const value = rawName || rawUrl || String(index);

    return {
      item,
      index,
      label: rawName || fallbackName,
      value,
      nameser: rawName,
      urlser: rawUrl,
    };
  };

  const baseOptions = (Array.isArray(items) ? items : []).map((item, index) =>
    getBaseOption(item, index),
  );
  const trimmedBaseName = typeof basename === 'string' ? basename.trim() : '';
  const hasSelectedBaseOption = baseOptions.some(
    option => option.value === selectbaseValue,
  );
  const shouldShowCurrentBaseOption =
    trimmedBaseName.length > 0 && !hasSelectedBaseOption;
  const pickerOptions = shouldShowCurrentBaseOption
    ? [
        {
          label: trimmedBaseName,
          value: CURRENT_BASE_VALUE,
        },
        ...baseOptions,
      ]
    : baseOptions;
  const setlanguageState = itemValue => {
    setlanguage(itemValue);
    dispatch(loginActions.setLanguage(itemValue));
  };

  const onLanguageChange = itemValue => {
    if (itemValue === selectlanguage) {
      return;
    }
    Alert.alert(Language.t('menu.changeLanguage'), '', [
      {
        text: Language.t('alert.cancel'),
        style: 'cancel',
      },
      {
        text: Language.t('alert.ok'),
        onPress: () => setlanguageState(itemValue),
      },
    ]);
  };

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

  const renderTapPicker = ({
    pickerId,
    displayLabel,
    selectedValue,
    onValueChange,
    enabled = true,
    compact = false,
    modalTitle,
    options = [],
  }) => (
    <>
      <TouchableOpacity
        disabled={!enabled}
        activeOpacity={0.7}
        style={[
          styles.pickerTrigger,
          compact && styles.pickerTriggerCompact,
          !enabled && styles.pickerTriggerDisabled,
        ]}
        onPress={() => enabled && setOpenPicker(pickerId)}
      >
        <Text
          style={[
            styles.pickerTriggerText,
            compact && styles.pickerTriggerTextCompact,
          ]}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <Text
          style={[
            styles.pickerChevron,
            compact && styles.pickerTriggerTextCompact,
          ]}
        >
          ▼
        </Text>
      </TouchableOpacity>
      <Modal
        visible={openPicker === pickerId}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        onRequestClose={() => setOpenPicker(null)}
      >
        <Pressable
          style={styles.pickerModalOverlay}
          onPress={() => setOpenPicker(null)}
        >
          <Pressable
            style={[
              styles.pickerModalSheet,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
            onPress={e => e.stopPropagation()}
          >
            {modalTitle ? (
              <Text style={styles.pickerModalTitle}>{modalTitle}</Text>
            ) : null}
            <ScrollView
              style={styles.pickerModalList}
              keyboardShouldPersistTaps="handled"
            >
              {options.map(option => {
                const selected = option.value === selectedValue;
                return (
                  <TouchableOpacity
                    key={String(option.value)}
                    style={[
                      styles.pickerModalRow,
                      selected && styles.pickerModalRowSelected,
                    ]}
                    onPress={() => {
                      setOpenPicker(null);
                      onValueChange(option.value);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerModalRowText,
                        selected && styles.pickerModalRowTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.pickerModalCancel}
              onPress={() => setOpenPicker(null)}
            >
              <Text style={styles.pickerModalCancelText}>
                {Language.t('alert.cancel')}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );

  var a = 0;

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };

  const fetchData = () => {
    navigation.dispatch(navigation.replace('SelectScreen', { data: a }));
  };

  useEffect(() => {
    if (databaseReducer.Data.nameser)
      _onPressSelectbaseValue(databaseReducer.Data.nameser);
  }, []);

  useEffect(() => {
    const nextItems = Array.isArray(loginReducer.ipAddress)
      ? loginReducer.ipAddress
      : [];
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

      const scannedUsername =
        route.params.post.username ||
        route.params.post.usernameser ||
        route.params.credentials?.username ||
        '';
      const scannedPassword =
        route.params.post.password ||
        route.params.post.passwordser ||
        route.params.credentials?.password ||
        '';

      if (scannedUsername || scannedPassword) {
        console.log('[SelectBase] scannedCredentials =', {
          username: scannedUsername,
          password: scannedPassword,
        });
        setUsername(scannedUsername);
        setPassword(scannedPassword);
      }

      if (route.params.qrDebug) {
        console.log('[SelectBase] qrDebug =', route.params.qrDebug);
      }
    }
  }, [route.params?.post]);

  useEffect(() => {
    if (loginReducer.language && loginReducer.language != Language.getLang()) {
      console.log('loginReducer.Language >> ', loginReducer.language);
      changeLanguage(loginReducer.language);
      setlanguage(loginReducer.language);
      RNRestart.Restart();
    }
    //backsakura
  }, [loginReducer.language]);

  const _onPressSelectbaseValue = async itemValue => {
    console.log(itemValue);
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
    if (basename == '') c = false;
    else if (baseurl == '') c = false;
    else if (username == '') c = false;
    else if (password == '') c = false;
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
      Alert.alert('', Language.t('selectBase.cannotDelete'), [
        {
          text: Language.t('alert.ok'),
          onPress: () => console.log('OK Pressed'),
        },
      ]);
    } else {
      if (temp.length == 1) {
        Alert.alert('', Language.t('selectBase.cannotDelete'), [
          {
            text: Language.t('alert.ok'),
            onPress: () => console.log('OK Pressed'),
          },
        ]);
      } else {
        for (let i in loginReducer.ipAddress) {
          if (loginReducer.ipAddress[i].urlser == baseurl) {
            Alert.alert('', Language.t('selectBase.questionDelete'), [
              {
                text: Language.t('alert.ok'),
                onPress: () => {
                  temp.splice(i, 1);
                  dispatch(loginActions.ipAddress(temp));
                  fetchData();
                },
              },
              { text: Language.t('alert.cancel'), onPress: () => {} },
            ]);
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
    console.log('Hit');
    if (checkValue() == true) {
      temp = items;
      for (let i in items) {
        if (i != updateindex) {
          if (items[i].nameser != basename && items[i].urlser == newurl) {
            checktest = true;
          } else if (
            items[i].nameser == basename &&
            items[i].urlser != newurl
          ) {
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
              Alert.alert(
                Language.t('selectBase.Alert'),
                Language.t('selectBase.Alert2') + Language.t('selectBase.url'),
                [
                  {
                    text: Language.t('selectBase.yes'),
                    onPress: () => _onPressUpdate(basename, newurl),
                  },
                  {
                    text: Language.t('selectBase.no'),
                    onPress: () => setLoading(false),
                  },
                ],
              );
              check = true;
              break;
            } else if (items[i].urlser == newurl) {
              Alert.alert(
                Language.t('selectBase.Alert'),
                Language.t('selectBase.Alert2') + Language.t('selectBase.name'),
                [
                  {
                    text: Language.t('selectBase.yes'),
                    onPress: () => _onPressUpdate(basename, newurl),
                  },
                  {
                    text: Language.t('selectBase.no'),
                    onPress: () => setLoading(false),
                  },
                ],
              );
              check = true;
              break;
            }
          }
        }
        if (!check) {
          checkIPAddress('1');
        }
      } else {
        Alert.alert(
          Language.t('alert.errorTitle'),
          Language.t('selectBase.Alert3'),
          [
            {
              text: Language.t('alert.ok'),
              onPress: () => _onPressSelectbaseValue(selectbaseValue),
            },
          ],
        );
        setLoading(false);
      }
    } else {
      Alert.alert(
        Language.t('alert.errorTitle'),
        Language.t('alert.errorDetail'),
        [
          {
            text: Language.t('alert.ok'),
            onPress: () => console.log('OK Pressed'),
          },
        ],
      );
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
        'BPAPUS-PARAM':
          '{"BPAPUS-MACHINE":  "' + registerReducer.machineNum + '"}',
      }),
    })
      .then(response => response.json())
      .then(async json => {
        if (json && json.ResponseCode == '200') {
          await fetch(baseurl + '/DevUsers', {
            method: 'POST',
            body: JSON.stringify({
              'BPAPUS-BPAPSV': loginReducer.serviceID,
              'BPAPUS-LOGIN-GUID': '',
              'BPAPUS-FUNCTION': 'Register',
              'BPAPUS-PARAM':
                '{ "BPAPUS-MACHINE":  "' +
                registerReducer.machineNum +
                '","BPAPUS-CNTRY-CODE": "66", "BPAPUS-MOBILE": "mobile login"}',
            }),
          })
            .then(response => response.json())
            .then(json => {
              if (
                json.ResponseCode == 200 &&
                json.ReasonString == 'Completed'
              ) {
                fetch(newurl + '/DevUsers', {
                  method: 'POST',
                  body: JSON.stringify({
                    'BPAPUS-BPAPSV': loginReducer.serviceID,
                    'BPAPUS-LOGIN-GUID': '',
                    'BPAPUS-FUNCTION': 'Login',
                    'BPAPUS-PARAM':
                      '{"BPAPUS-MACHINE":  "' +
                      registerReducer.machineNum +
                      '","BPAPUS-USERID": "' +
                      username.toUpperCase() +
                      '","BPAPUS-PASSWORD": "' +
                      password.toUpperCase() +
                      '"}',
                  }),
                })
                  .then(response => response.json())
                  .then(json => {
                    if (json && json.ResponseCode == '200') {
                      let newObj = {
                        nameser: basename,
                        urlser: newurl,
                        usernameser: username.toUpperCase(),
                        passwordser: password.toUpperCase(),
                      };
                      console.log(json.ResponseCode);
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
                          'BPAPUS-PARAM':
                            '{"BPAPUS-MACHINE":  "' +
                            registerReducer.machineNum +
                            '"}',
                        }),
                      })
                        .then(response => response.json())
                        .then(json => {
                          if (json && json.ResponseCode == '200') {
                            Alert.alert(
                              Language.t('alert.succeed'),
                              Language.t('selectBase.connect') +
                                ' ' +
                                basename +
                                ' ' +
                                Language.t('alert.succeed'),
                              [
                                {
                                  text: Language.t('alert.ok'),
                                  onPress: () =>
                                    navigation.dispatch(
                                      navigation.replace('LoginScreen'),
                                    ),
                                },
                              ],
                            );
                          }
                        });
                    } else {
                      console.log('Function Parameter Required');
                      let temp_error = 'error_ser.' + json.ResponseCode;
                      console.log('>> ', temp_error);
                      Alert.alert(
                        Language.t('alert.errorTitle'),
                        Language.t(temp_error),
                        [
                          {
                            text: Language.t('alert.ok'),
                            onPress: () =>
                              _onPressSelectbaseValue(selectbaseValue),
                          },
                        ],
                      );
                      setLoading(false);
                    }
                  })
                  .catch(error => {
                    Alert.alert(
                      Language.t('alert.errorTitle'),
                      Language.t('alert.errorDetail'),
                      [
                        {
                          text: Language.t('alert.ok'),
                          onPress: () =>
                            _onPressSelectbaseValue(selectbaseValue),
                        },
                      ],
                    );
                    console.error('_fetchGuidLogin ' + error);
                    setLoading(false);
                  });
              } else {
                console.log('Function Parameter Required');
                let temp_error = 'error_ser.' + json.ResponseCode;
                console.log('>> ', temp_error);
                Alert.alert(
                  Language.t('alert.errorTitle'),
                  Language.t(temp_error),
                  [
                    {
                      text: Language.t('alert.ok'),
                      onPress: () => console.log('OK Pressed'),
                    },
                  ],
                );
                setLoading(false);
              }
            })
            .catch(error => {
              Alert.alert(
                Language.t('alert.errorTitle'),
                Language.t('alert.errorDetail'),
                [
                  {
                    text: Language.t('alert.ok'),
                    onPress: () => console.log('OK Pressed'),
                  },
                ],
              );
              console.log('checkIPAddress');
              setLoading(false);
            });
        } else {
          console.log('Function Parameter Required');
          let temp_error = 'error_ser.' + json.ResponseCode;
          console.log('>> ', temp_error);
          Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [
            {
              text: Language.t('alert.ok'),
              onPress: () => _onPressSelectbaseValue(selectbaseValue),
            },
          ]);
          setLoading(false);
        }
      })
      .catch(error => {
        Alert.alert(
          Language.t('alert.errorTitle'),
          Language.t('alert.errorDetail'),
          [
            {
              text: Language.t('alert.ok'),
              onPress: () => _onPressSelectbaseValue(selectbaseValue),
            },
          ],
        );
        console.error('_fetchGuidLogin ' + error);
        setLoading(false);
      });
  };

  return (
    <View style={container1}>
      <ImageBackground
        source={require(image)}
        onLoadEnd={() => {
          setLoading_backG(false);
        }}
        resizeMode="cover"
        style={styles.image}
      >
        <View
          style={[
            tabbar,
            {
              paddingTop: insets.top + 12,
              paddingBottom: 12,
              paddingLeft: Math.max(insets.left, 20),
              paddingRight: Math.max(insets.right, 16),
            },
          ]}
        >
          <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                style={{
                  width: FontSize.large,
                  height: FontSize.large,
                }}
                resizeMode="contain"
                source={require('../img/iconsMenu/goback.png')}
              />
            </TouchableOpacity>
            <Text
              style={{
                marginLeft: 12,
                fontSize: FontSize.medium,
                color: Colors.backgroundLoginColorSecondary,
                flexShrink: 1,
              }}
            >
              {Language.t('selectBase.header')}
            </Text>
          </View>
          <View style={{ marginLeft: 8 }}>
            {renderTapPicker({
            pickerId: 'lang',
            compact: true,
            displayLabel: selectlanguage === 'th' ? 'TH' : 'EN',
            selectedValue: selectlanguage,
            onValueChange: onLanguageChange,
            options: [
              { label: 'TH', value: 'th' },
              { label: 'EN', value: 'en' },
            ],
          })}
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 20),
          }}
        >
          <View>
            <KeyboardAvoidingView
              keyboardVerticalOffset={1}
              behavior={'position'}
            >
              <View style={styles.body}>
                <View style={styles.body1}>
                  <Text style={styles.textTitle}>
                    {Language.t('selectBase.title')} :
                  </Text>
                </View>
                {items.length > 0
                  ? renderTapPicker({
                      pickerId: 'base',
                      displayLabel: getBaseDisplayLabel(),
                      selectedValue: selectbaseValue,
                      modalTitle: Language.t('selectBase.title'),
                      onValueChange: itemValue =>
                        _onPressSelectbaseValue(itemValue),
                      options: [
                        ...pickerOptions.map(option => ({
                          label: option.label,
                          value: option.value,
                        })),
                        {
                          label: Language.t('selectBase.lebel'),
                          value: '-1',
                        },
                      ],
                    })
                  : renderTapPicker({
                      pickerId: 'base',
                      enabled: false,
                      displayLabel: Language.t('selectBase.lebel'),
                      selectedValue: '-1',
                      onValueChange: () => {},
                      options: [
                        {
                          label: Language.t('selectBase.lebel'),
                          value: '-1',
                        },
                      ],
                    })}
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.textTitle}>
                    {Language.t('selectBase.name')} :
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <View
                    style={{
                      backgroundColor: Colors.backgroundColorSecondary,
                      flexDirection: 'column',
                      borderWidth: 1,
                      borderColor: Colors.buttonColorPrimary,
                      height: 50,
                      borderRadius: 10,
                      paddingLeft: 20,
                      paddingRight: 20,
                      paddingTop: 10,
                      paddingBottom: 10,
                    }}
                  >
                    <View style={{ height: 30, flexDirection: 'row' }}>
                      <Image
                        style={{ height: 30, width: 30 }}
                        resizeMode={'contain'}
                        source={require('../images/UI/endpoint/Asset18_4x.png')}
                      />
                      <TextInput
                        style={{
                          flex: 8,
                          marginLeft: 10,
                          borderBottomColor: Colors.buttonColorPrimary,
                          color: Colors.fontColor,
                          paddingVertical: 3,
                          fontSize: FontSize.medium,
                          borderBottomWidth: 0.7,
                        }}
                        placeholderTextColor={Colors.fontColorSecondary}
                        placeholder={Language.t('selectBase.name') + '..'}
                        value={basename}
                        onChangeText={val => {
                          setBasename(val);
                        }}
                      ></TextInput>
                      <TouchableOpacity
                        style={{ marginLeft: 10 }}
                        onPress={() =>
                          navigation.navigate('ScanScreen', {
                            route: 'SelectScreen',
                          })
                        }
                      >
                        <Image
                          style={{
                            width: FontSize.large,
                            height: FontSize.large,
                          }}
                          resizeMode="contain"
                          source={require('../img/iconsMenu/qr-code.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.textTitle}>
                    {Language.t('selectBase.url')} :
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <View
                    style={{
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
                      paddingBottom: 10,
                    }}
                  >
                    <View style={{ height: 'auto', flexDirection: 'row' }}>
                      <Image
                        style={{ height: 30, width: 30 }}
                        resizeMode={'contain'}
                        source={require('../images/UI/endpoint/Asset19_4x.png')}
                      />
                      <TextInput
                        style={{
                          flex: 8,
                          marginLeft: 10,
                          borderBottomColor: Colors.buttonColorPrimary,
                          color: Colors.fontColor,
                          paddingVertical: 3,
                          fontSize: FontSize.medium,
                          height: 'auto',
                          borderBottomWidth: 0.7,
                        }}
                        multiline={true}
                        placeholderTextColor={Colors.fontColorSecondary}
                        value={baseurl}
                        placeholder={Language.t('selectBase.url') + '..'}
                        onChangeText={val => {
                          setBsaeurl(val);
                        }}
                      ></TextInput>
                    </View>
                  </View>
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.textTitle}>
                    {Language.t('login.username')} :
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <View
                    style={{
                      backgroundColor: Colors.backgroundColorSecondary,
                      flexDirection: 'column',
                      borderWidth: 1,
                      borderColor: Colors.buttonColorPrimary,
                      height: 50,
                      borderRadius: 10,
                      paddingLeft: 20,
                      paddingRight: 20,
                      paddingTop: 10,
                      paddingBottom: 10,
                    }}
                  >
                    <View style={{ height: 30, flexDirection: 'row' }}>
                      <Image
                        style={{ height: 30, width: 30 }}
                        resizeMode={'contain'}
                        source={require('../images/UI/endpoint/Asset20_4x.png')}
                      />
                      <TextInput
                        style={{
                          flex: 8,
                          marginLeft: 5,
                          borderBottomColor: Colors.buttonColorPrimary,
                          color: Colors.fontColor,
                          paddingVertical: 3,
                          fontSize: FontSize.medium,
                          borderBottomWidth: 0.7,
                        }}
                        placeholderTextColor={Colors.fontColorSecondary}
                        value={username}
                        placeholder={Language.t('login.username') + '..'}
                        onChangeText={val => {
                          setUsername(val);
                        }}
                      ></TextInput>
                    </View>
                  </View>
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.textTitle}>
                    {Language.t('login.password')} :
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <View
                    style={{
                      backgroundColor: Colors.backgroundColorSecondary,
                      flexDirection: 'column',
                      height: 50,
                      borderWidth: 1,
                      borderColor: Colors.buttonColorPrimary,
                      borderRadius: 10,
                      paddingLeft: 20,
                      paddingRight: 20,
                      paddingTop: 10,
                      paddingBottom: 10,
                    }}
                  >
                    <View style={{ height: 30, flexDirection: 'row' }}>
                      <Image
                        style={{ height: 30, width: 30 }}
                        resizeMode={'contain'}
                        source={require('../images/UI/endpoint/Asset21_4x.png')}
                      />
                      <TextInput
                        style={{
                          flex: 8,
                          marginLeft: 5,
                          color: Colors.fontColor,
                          paddingVertical: 3,
                          fontSize: FontSize.medium,
                          borderBottomColor: Colors.buttonColorPrimary,
                          borderBottomWidth: 0.7,
                        }}
                        secureTextEntry={data.secureTextEntry ? true : false}
                        keyboardType="default"
                        placeholderTextColor={Colors.fontColorSecondary}
                        placeholder={Language.t('login.password') + '..'}
                        value={password}
                        onChangeText={val => {
                          setPassword(val);
                        }}
                      />

                      <TouchableOpacity
                        style={{ marginLeft: 10 }}
                        onPress={updateSecureTextEntry}
                      >
                        {data.secureTextEntry ? (
                          <Image
                            style={{
                              width: FontSize.large,
                              height: FontSize.large,
                            }}
                            resizeMode="contain"
                            source={require('../img/iconsMenu/eye-off.png')}
                          />
                        ) : (
                          <Image
                            style={{
                              width: FontSize.large,
                              height: FontSize.large,
                            }}
                            resizeMode="contain"
                            source={require('../img/iconsMenu/eye.png')}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.body1e}>
                  <TouchableNativeFeedback onPress={() => _onPressAddbase()}>
                    <View
                      style={{
                        borderRadius: 10,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        height: 50,
                        marginRight: 10,
                        width: deviceWidth - 200,
                        backgroundColor: Colors.buttonColorPrimary,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.buttonTextColor,
                          alignSelf: 'center',
                          fontSize: FontSize.medium,
                          fontWeight: 'bold',
                        }}
                      >
                        {Language.t('selectBase.saveandconnect')}
                      </Text>
                    </View>
                  </TouchableNativeFeedback>

                  {items.length > 0 ? (
                    <TouchableNativeFeedback onPress={() => _onPressDelete()}>
                      <View
                        style={{
                          borderRadius: 10,
                          flexDirection: 'column',
                          justifyContent: 'center',
                          height: 50,
                          width: deviceWidth - 250,
                          backgroundColor: Colors.backgroundLoginColor,
                        }}
                      >
                        <Text
                          style={{
                            color: Colors.backgroundColorSecondary,
                            alignSelf: 'center',
                            fontSize: FontSize.medium,
                            fontWeight: 'bold',
                          }}
                        >
                          {Language.t('selectBase.delete')}
                        </Text>
                      </View>
                    </TouchableNativeFeedback>
                  ) : (
                    <TouchableNativeFeedback onPress={() => null}>
                      <View
                        style={{
                          borderRadius: 10,
                          flexDirection: 'column',
                          justifyContent: 'center',
                          height: 50,
                          width: deviceWidth - 250,
                          backgroundColor: '#979797',
                        }}
                      >
                        <Text
                          style={{
                            color: '#C5C5C5',
                            alignSelf: 'center',
                            fontSize: FontSize.medium,
                            fontWeight: 'bold',
                          }}
                        >
                          {Language.t('selectBase.delete')}
                        </Text>
                      </View>
                    </TouchableNativeFeedback>
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </ScrollView>

        {loading && (
          <View
            style={{
              width: deviceWidth,
              height: deviceHeight,
              opacity: 0.5,
              backgroundColor: 'black',
              alignSelf: 'center',
              justifyContent: 'center',
              alignContent: 'center',
              position: 'absolute',
            }}
          >
            <ActivityIndicator
              style={{
                borderRadius: 15,
                backgroundColor: null,
                width: 100,
                height: 100,
                alignSelf: 'center',
              }}
              animating={loading}
              size="large"
              color={Colors.lightPrimiryColor}
            />
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container1: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  body: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
  },
  body1e: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  body1: {
    marginTop: 10,
    flexDirection: 'row',
  },
  tabbar: {
    minHeight: 48,
    alignItems: 'center',
    backgroundColor: '#223fc9',
    justifyContent: 'space-between',
    flexDirection: 'row',
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
    height: 50,
  },
  pickerTriggerCompact: {
    marginTop: 0,
    height: 36,
    minWidth: 88,
    paddingHorizontal: 12,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  pickerTriggerDisabled: {
    borderColor: '#979797',
    opacity: 0.7,
  },
  pickerTriggerText: {
    flex: 1,
    fontSize: FontSize.medium,
    color: Colors.buttonColorPrimary,
    marginRight: 8,
  },
  pickerTriggerTextCompact: {
    flex: 0,
    color: Colors.backgroundLoginColorSecondary,
    fontSize: FontSize.medium,
    fontWeight: 'bold',
  },
  pickerChevron: {
    fontSize: 10,
    color: Colors.buttonColorPrimary,
  },
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerModalSheet: {
    backgroundColor: Colors.backgroundColorSecondary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pickerModalTitle: {
    textAlign: 'center',
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.fontColor,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderColor,
  },
  pickerModalList: {
    maxHeight: 320,
  },
  pickerModalRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderColor,
  },
  pickerModalRowSelected: {
    backgroundColor: Colors.backgroundColor,
  },
  pickerModalRowText: {
    fontSize: FontSize.medium,
    color: Colors.fontColor,
  },
  pickerModalRowTextSelected: {
    color: Colors.buttonColorPrimary,
    fontWeight: 'bold',
  },
  pickerModalCancel: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderColor,
  },
  pickerModalCancelText: {
    fontSize: FontSize.medium,
    color: Colors.fontColorSecondary,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  dorpdown: {
    justifyContent: 'center',
    fontSize: FontSize.medium,
  },
  dorpdownTop: {
    justifyContent: 'flex-end',
    fontSize: FontSize.medium,
  },
  textTitle: {
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.fontColor,
  },
  imageIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topImage: {
    height: deviceHeight / 3,
    width: deviceWidth,
  },
  button: {
    marginTop: 10,
    marginBottom: 25,
    padding: 5,
    alignItems: 'center',
    backgroundColor: Colors.buttonColorPrimary,
    borderRadius: 10,
  },
  textButton: {
    fontSize: FontSize.large,
    color: Colors.fontColor2,
  },
  buttonContainer: {
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: 'center',
    borderBottomColor: '#ffff',
    color: '#ffff',
  },
  label: {
    margin: 8,
    color: '#ffff',
  },
});
const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    reduxMachineNum: payload => dispatch(registerActions.machine(payload)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SelectBase);
