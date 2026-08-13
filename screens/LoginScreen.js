import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, Text, View, Image, ImageBackground, TextInput, Keyboard, KeyboardAvoidingView, ActivityIndicator, Alert, Platform, BackHandler, StatusBar, TouchableNativeFeedback, TouchableOpacity, TouchableWithoutFeedback, Pressable } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import DeviceInfo from 'react-native-device-info';
import { NetworkInfo } from 'react-native-network-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStateIfMounted } from 'use-state-if-mounted';
import { useNavigation } from '@react-navigation/native';
import { useSelector, connect, useDispatch } from 'react-redux';
import { Language, changeLanguage } from '../translations/I18n';
import { FontSize } from '../components/FontSizeHelper';
import * as loginActions from '../src/actions/loginActions';
import * as registerActions from '../src/actions/registerActions';
import * as databaseActions from '../src/actions/databaseActions';
import * as activityActions from '../src/actions/activityActions';
import Colors from '../src/Colors';
import { fontSize, fontWeight } from 'styled-system';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const registerReducer = useSelector(({
    registerReducer
  }) => registerReducer);
  const loginReducer = useSelector(({
    loginReducer
  }) => loginReducer);
  const databaseReducer = useSelector(({
    databaseReducer
  }) => databaseReducer);
  const {
    container2,
    container1,
    button,
    textButton,
    topImage,
    tabbar,
    buttonContainer
  } = styles;
  useEffect(() => {
    //backsakura013
  }, []);
  const [GUID, setGUID] = useStateIfMounted('');
  const [isSelected, setSelection] = useState(loginReducer.userloggedIn == true ? loginReducer.userloggedIn : false);
  const [isSFeatures, setSFeatures] = useState(loginReducer.isSFeatures == true ? loginReducer.isSFeatures : false);
  const [loading, setLoading] = useStateIfMounted(false);
  const [loading_backG, setLoading_backG] = useStateIfMounted(true);
  const [resultJson, setResultJson] = useState([]);
  const [marker, setMarker] = useState(false);
  const [username, setUsername] = useState(loginReducer.userloggedIn == true ? (loginReducer.userNameED || '').toUpperCase() : '');
  const [password, setPassword] = useState(loginReducer.userloggedIn == true ? loginReducer.passwordED : '');
  const activityReducer = useSelector(({
    activityReducer
  }) => activityReducer);
  const [data, setData] = useStateIfMounted({
    secureTextEntry: true
  });
  const passwordRef = useRef(null);
  const image = '../images/UI/Login/Asset4.png';
  useEffect(() => {
    const serviceID = '{167f0c96-86fd-488f-94d1-cc3169d60b1a}';
    if (serviceID != loginReducer.serviceID) dispatch(loginActions.serviceID(serviceID));
    if (registerReducer.machineNum.length == 0 || registerReducer.machineNum == '02:00:00:00:00:00') getMac();
  }, []);
  useEffect(() => {
    if (!databaseReducer.Data.urlser && !loading_backG) Alert.alert(Language.t('notiAlert.header'), Language.t('notiAlert.connectBusiness'), [{
      text: Language.t('alert.ok'),
      onPress: () => navigation.navigate('SelectScreen', {
        data: ''
      })
    }]);
  }, [loading_backG]);
  useEffect(() => {
    dispatch(loginActions.setFingerprint(isSFeatures));
  }, [isSFeatures]);
  useEffect(() => {}, [registerReducer.machineNum]);
  const closeLoading = () => {
    setLoading(false);
  };
  const letsLoading = () => {
    setLoading(true);
  };
  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry
    });
  };
  const getMac = async () => {
    let uuid = '';
    const characters = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else {
        uuid += characters[Math.floor(Math.random() * characters.length)];
      }
    }
    await DeviceInfo.getMacAddress().then(mac => {
      if (mac.length > 0 && mac != '02:00:00:00:00:00') dispatch(registerActions.machine(mac));else NetworkInfo.getBSSID().then(macwifi => {
        if (macwifi.length > 0 && macwifi != '02:00:00:00:00:00') dispatch(registerActions.machine(macwifi));else {
          const deviceId = DeviceInfo.getUniqueId();
          if (deviceId.length > 0 && deviceId != '02:00:00:00:00:00') dispatch(registerActions.machine(deviceId));else {
            dispatch(registerActions.machine(uuid));
          }
        }
      }).catch(e => dispatch(registerActions.machine(uuid)));
    }).catch(e => dispatch(registerActions.machine(uuid)));
  };
  const tslogin = async () => {
    await setLoading(true);
    await UnRegister();
    await regisMacAdd();
    await setLoading(false);
  };
  const regisMacAdd = async () => {
    await fetch(databaseReducer.Data.urlser + '/DevUsers', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': '',
        'BPAPUS-FUNCTION': 'Register',
        'BPAPUS-PARAM': '{"BPAPUS-MACHINE":"' + registerReducer.machineNum + '","BPAPUS-CNTRY-CODE": "66","BPAPUS-MOBILE": "mobile login"}'
      })
    }).then(response => response.json()).then(async json => {
      if (json.ResponseCode == 200 && json.ReasonString == 'Completed') {
        await _fetchGuidLog();
      } else {
        let temp_error = 'error_ser.' + json.ResponseCode;
        Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
          text: Language.t('alert.ok'),
          onPress: () => dispatch(loginActions.guid([]))
        }]);
      }
    }).catch(error => {
      if (databaseReducer.Data.urlser == '') {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('selectBase.error'), [{
          text: Language.t('alert.ok'),
          onPress: () => dispatch(loginActions.guid([]))
        }]);
      } else {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.internetError'), [{
          text: Language.t('alert.ok'),
          onPress: () => dispatch(loginActions.guid([]))
        }]);
      }
    });
  };
  const UnRegister = async () => {
    await fetch(databaseReducer.Data.urlser + '/DevUsers', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': '',
        'BPAPUS-FUNCTION': 'UnRegister',
        'BPAPUS-PARAM': '{"BPAPUS-MACHINE": "' + registerReducer.machineNum + '" }'
      })
    }).then(response => response.json()).then(json => {}).catch(error => {
      console.error('ERROR at _fetchGuidLogin' + error);
    });
  };
  const _fetchGuidLog = async () => {
    let tempusername = username.toUpperCase();
    let temppassword = password.toUpperCase();
    if (loginReducer.guid.length > 0) {
      tempusername = loginReducer.userNameED;
      temppassword = loginReducer.passwordED;
    }
    await fetch(databaseReducer.Data.urlser + '/DevUsers', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': '',
        'BPAPUS-FUNCTION': 'Login',
        'BPAPUS-PARAM': '{"BPAPUS-MACHINE": "' + registerReducer.machineNum + '","BPAPUS-USERID": "' + tempusername + '","BPAPUS-PASSWORD": "' + temppassword + '"}'
      })
    }).then(response => response.json()).then(json => {
      if (json && json.ResponseCode == '635') {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.errorDetail'), [{
          text: Language.t('alert.ok'),
          onPress: () => dispatch(loginActions.guid([]))
        }]);
      } else if (json && json.ResponseCode == '629') {
        Alert.alert(Language.t('alert.errorTitle'), 'Function Parameter Required', [{
          text: Language.t('alert.ok'),
          onPress: () => dispatch(loginActions.guid([]))
        }]);
      } else if (json && json.ResponseCode == '200') {
        let responseData = JSON.parse(json.ResponseData);
        dispatch(loginActions.guid(responseData.BPAPUS_GUID));
        dispatch(loginActions.userNameED(username.toUpperCase()));
        dispatch(loginActions.passwordED(password.toUpperCase()));
        dispatch(loginActions.userlogin(isSelected));
        navigation.dispatch(navigation.replace('MainScreen', {}));
      } else {
        let temp_error = 'error_ser.' + json.ResponseCode;
        Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
          text: Language.t('alert.ok'),
          onPress: () => dispatch(loginActions.guid([]))
        }]);
      }
    }).catch(error => {
      console.error('ERROR at _fetchGuidLogin' + error);
      if (databaseReducer.Data.urlser == '') {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('selectBase.error'), [{
          text: Language.t('alert.ok'),
          onPress: () => dispatch(loginActions.guid([]))
        }]);
      } else {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.internetError') + '1', [{
          text: Language.t('alert.ok'),
          onPress: () => dispatch(loginActions.guid([]))
        }]);
      }
    });
    setLoading(false);
  };
  return <SafeAreaView style={container1}>
      <StatusBar hidden={true} />
      <ImageBackground source={require(image)} onLoadEnd={async () => {
      setLoading_backG(false);
      if (loginReducer.guid.length > 0) {
        await tslogin();
      }
    }} resizeMode="cover" style={styles.image}>
        {!loading_backG ? <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.screenContent}>
            <View style={tabbar}>
              <TouchableOpacity onPress={() => navigation.navigate('SelectScreen', {
            data: ''
          })}>
                <Image style={{
              width: FontSize.large,
              height: FontSize.large
            }} resizeMode="contain" source={require('../img/gearIcon.png')} />
              </TouchableOpacity>
              <Text style={{
            marginLeft: 12,
            fontSize: FontSize.small,
            color: Colors.borderColor
          }}>
                {databaseReducer.Data.nameser ? databaseReducer.Data.nameser : 'ไม่มีการเชื่อมต่อกิจการ'}
              </Text>
            </View>
            <Pressable style={styles.formSpacer} onPress={Keyboard.dismiss} />
            {loginReducer.guid.length == 0 && <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
                <View style={styles.formContainer}>
                  <View>
                    <View style={{
                backgroundColor: Colors.backgroundLoginColorSecondary,
                flexDirection: 'column',
                borderRadius: 10,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 10,
                paddingBottom: 10,
                shadowColor: Colors.borderColor,
                shadowOffset: {
                  width: 0,
                  height: 6
                },
                shadowOpacity: 0.5,
                shadowRadius: 1.0,
                elevation: 15
              }}>
                      <View style={{
                  height: 40,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                        <Image style={{
                    height: 30,
                    width: 30
                  }} resizeMode={'contain'} source={require('../images/UI/Login/Asset2.png')} />
                        <TextInput style={{
                    flex: 8,
                    marginLeft: 10,
                    borderBottomColor: Colors.buttonColorPrimary,
                    color: Colors.fontColor,
                    paddingVertical: 7,
                    fontSize: FontSize.medium,
                    borderBottomWidth: 0.7
                  }} placeholderTextColor={Colors.fontColorSecondary} autoCapitalize="characters" value={username} maxLength={10} placeholder={Language.t('login.username')} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => passwordRef.current?.focus()} onChangeText={val => setUsername(val.toUpperCase())}></TextInput>
                      </View>
                    </View>
                  </View>

                  <View style={{
              marginTop: 8
            }}>
                    <View style={{
                backgroundColor: Colors.backgroundLoginColorSecondary,
                flexDirection: 'column',
                borderRadius: 10,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 10,
                paddingBottom: 10,
                shadowColor: Colors.borderColor,
                shadowOffset: {
                  width: 0,
                  height: 6
                },
                shadowOpacity: 0.5,
                shadowRadius: 1.0,
                elevation: 15
              }}>
                      <View style={{
                  height: 40,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                        <Image style={{
                    height: 30,
                    width: 30
                  }} resizeMode={'contain'} source={require('../images/UI/Login/Asset3.png')} />

                        <TextInput ref={passwordRef} style={{
                    flex: 8,
                    marginLeft: 10,
                    color: Colors.fontColor,
                    paddingVertical: 7,
                    fontSize: FontSize.medium,
                    borderBottomColor: Colors.buttonColorPrimary,
                    borderBottomWidth: 0.7
                  }} secureTextEntry={data.secureTextEntry ? true : false} keyboardType="default" maxLength={8} value={password} placeholderTextColor={Colors.fontColorSecondary} placeholder={Language.t('login.password')} returnKeyType="done" onSubmitEditing={Keyboard.dismiss} onChangeText={val => {
                    setPassword(val);
                  }} />
                        <TouchableOpacity style={styles.eyeIconButton} onPress={updateSecureTextEntry}>
                          {data.secureTextEntry ? <Image style={styles.eyeIcon} resizeMode="contain" source={require('../img/iconsMenu/eye-off.png')} /> : <Image style={styles.eyeIcon} resizeMode="contain" source={require('../img/iconsMenu/eye.png')} />}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <View style={styles.checkboxContainer}>
                    <View></View>
                    <CheckBox value={isSelected} onValueChange={value => setSelection(value)} boxType="square" onFillColor={Colors.buttonColorPrimary} onCheckColor={Colors.buttonTextColor} onTintColor={Colors.buttonColorPrimary} tintColor={Colors.fontColor} onAnimationType="fill" offAnimationType="fill" tintColors={{
                true: Colors.buttonColorPrimary,
                false: Colors.fontColor
              }} style={styles.checkbox} />
                    <Text style={styles.label} onPress={() => setSelection(!isSelected)}>
                      {Language.t('login.rememberpassword')}
                    </Text>
                  </View>
                  <View>
                    <View style={{
                flexDirection: 'column'
              }}>
                      <TouchableNativeFeedback onPress={() => tslogin()}>
                        <View style={{
                    borderRadius: 20,
                    flexDirection: 'column',
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    backgroundColor: Colors.buttonColorPrimary
                  }}>
                          <Text style={{
                      color: Colors.buttonTextColor,
                      alignSelf: 'center',
                      fontSize: FontSize.medium,
                      fontWeight: 'bold'
                    }}>
                            {Language.t('login.buttonLogin')}
                          </Text>
                        </View>
                      </TouchableNativeFeedback>
                    </View>
                    <View style={{
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                      <Text style={Colors.borderColor}>version 2.5.10</Text>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>}
          </View>
          </TouchableWithoutFeedback> : <View style={{
        width: deviceWidth,
        height: deviceHeight,
        opacity: 0.5,
        backgroundColor: 'black',
        alignSelf: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        position: 'absolute'
      }}></View>}
        {loading && <View style={{
        width: deviceWidth,
        height: deviceHeight,
        opacity: 0.5,
        backgroundColor: loginReducer.guid.length > 0 ? '' : 'black',
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
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container1: {
    flex: 1,
    flexDirection: 'column'
  },
  image: {
    flex: 1
  },
  container2: {
    width: deviceWidth,
    height: '100%',
    position: 'absolute',
    backgroundColor: 'white',
    flex: 1
  },
  tabbar: {
    height: 70,
    padding: 12,
    paddingLeft: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  textTitle2: {
    alignSelf: 'center',
    flex: 2,
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
    width: null,
    height: deviceWidth / 2
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
  eyeIconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center'
  },
  eyeIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.buttonColorPrimary
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 12
  },
  screenContent: {
    flex: 1
  },
  formSpacer: {
    flex: 1
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32
  },
  checkbox: {
    alignSelf: 'center',
    borderBottomColor: Colors.fontColor,
    color: Colors.fontColor
  },
  label: {
    margin: 8,
    color: Colors.fontColor
  }
});
export default LoginScreen;