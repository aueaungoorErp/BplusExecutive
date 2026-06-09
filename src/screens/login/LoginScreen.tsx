// @ts-nocheck
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  StyleSheet,
  BackHandler,
  View,
  Text,
  Button,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  LogBox,
  ToastAndroid,
  StatusBar,
  Platform,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Fumi } from 'react-native-textinput-effects';
import { connect } from 'react-redux';
import { GetfetchAuthLoginApi } from '../../actions';
import Modal from 'react-native-modal';
import { ProgressDialog } from 'react-native-simple-dialogs';
import { strings, getDefaultLocal, switchLanguage } from '../../util/lang/i18n';

var connect_point = '';
class LoginScreen extends Component {
  _didFocusSubscription;
  _willBlurSubscription;

  static navigationOptions = ({ navigation }) => {
    const { param } = navigation.state;

    return {
      header: (
        <View
          style={{
            height: 50,
            backgroundColor: '#a955a0',
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 20,
          }}
        >
          <StatusBar
            barStyle={Platform.OS == 'ios' ? 'dark-content' : 'light-content'}
            hidden={false}
            backgroundColor="#a955a0"
            translucent={true}
          />
          <View
            style={{ width: '100%', flex: 1, height: 50, flexDirection: 'row' }}
          ></View>
          <View style={{ width: '100%', flex: 6, height: 50 }}></View>

          <View
            style={{
              width: '100%',
              flex: 2,
              height: 50,
              flexDirection: 'row',
              marginTop: 5,
            }}
          >
            <TouchableOpacity
              style={{ width: 30, height: 30 }}
              onPress={() => navigation.navigate('AboutScreen')}
            >
              <Image
                source={require('../../images/ico_about.png')}
                resizeMode="stretch"
                style={{ width: 30, height: 30, flex: 1 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ width: 30, height: 30 }}
              onPress={() => navigation.navigate('ConnectionSettingScreen')}
            >
              <Image
                source={require('../../images/ico_setting.png')}
                resizeMode="stretch"
                style={{ width: 30, height: 30, flex: 1 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      ),
      // headerRight: (
      //     <View style={{ flexDirection: 'row' ,marginTop:20,marginBottom:5}}>
      //     <StatusBar barStyle={(Platform.OS == 'ios') ? "dark-content" : "light-content"} hidden={false} backgroundColor="#a955a0" translucent={true} />
      //         <TouchableOpacity
      //             style={{ width: 30, height: 30 }}
      //             onPress={() => navigation.navigate("AboutScreen")} >
      //             <Image
      //                 source={require('../../images/ico_about.png')}
      //                 resizeMode="stretch"
      //                 style={{ width: 30, height: 30,  flex: 1 }}
      //             />
      //         </TouchableOpacity>

      //         <TouchableOpacity
      //             style={{ width: 30, height: 30 }}
      //             onPress={() => navigation.navigate("ConnectionSettingScreen")} >
      //             <Image
      //                 source={require('../../images/ico_setting.png')}
      //                 resizeMode="stretch"
      //                 style={{ width: 30, height: 30,  flex: 1 }}
      //             />
      //         </TouchableOpacity>
      //     </View>
      //)
    };
  };

  constructor(props) {
    super(props);
    this.inputRefs = {};
    this.backHandlerSubscription = null;
    this.state = {
      user: '',
      pass: '',
      visibleModal: 1,
      secureTextEntry: true,
    };
    LogBox.ignoreLogs([
      'Warning: isMounted(...) is deprecated',
      'Module RCTImageLoader',
    ]);

    this._didFocusSubscription = props.navigation.addListener(
      'didFocus',
      payload => {
        this.backHandlerSubscription = BackHandler.addEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid,
        );
      },
    );
    this.LoadLocal();
  }
  onBackButtonPressAndroid = () => {
    this.props.ClearData();
    BackHandler.exitApp();
    //ToastAndroid.show('Back : Login)', ToastAndroid.SHORT);
    // if (this.isSelectionModeEnabled()) {
    //     this.disableSelectionMode();
    //  return true;
    // } else {
    //     return false;
    // }
  };
  componentDidMount() {
    this._willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      payload => {
        if (
          this.backHandlerSubscription &&
          typeof this.backHandlerSubscription.remove === 'function'
        ) {
          this.backHandlerSubscription.remove();
          this.backHandlerSubscription = null;
        } else {
          BackHandler.removeEventListener?.(
            'hardwareBackPress',
            this.onBackButtonPressAndroid,
          );
        }
      },
    );
  }

  componentWillMount() {
    // ToastAndroid.show('Begin : Login)', ToastAndroid.SHORT);
    this.LoadLocal();
  }
  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
    if (
      this.backHandlerSubscription &&
      typeof this.backHandlerSubscription.remove === 'function'
    ) {
      this.backHandlerSubscription.remove();
      this.backHandlerSubscription = null;
    } else {
      BackHandler.removeEventListener?.(
        'hardwareBackPress',
        this.onBackButtonPressAndroid,
      );
    }
    // ToastAndroid.show('Dispose : Login)', ToastAndroid.SHORT);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.fetchReducer.languageName !== nextProps.languageName) {
      switchLanguage(nextProps.fetchReducer.languageName, this);
    }
    if (this.props.fetchReducer.connectPoint !== nextProps.connectPoint) {
      connect_point = nextProps.fetchReducer.connectPoint;
      console.log('connectPoint com = ', nextProps.fetchReducer.connectPoint);
    }
  }
  LoadLocal = async () => {
    try {
      const valueINPUT_LOCAL = await AsyncStorage.getItem('INPUT_LOCAL');
      const valueCONNECT_POINT = await AsyncStorage.getItem('CONNECT_POINT');
      if (valueINPUT_LOCAL !== null) {
        switchLanguage(valueINPUT_LOCAL, this);
      } else {
        this.props.SetLanguageName('th');
        switchLanguage('th', this);
        await AsyncStorage.setItem('INPUT_LOCAL', 'th');
      }
      if (valueCONNECT_POINT !== null) {
        connect_point = valueCONNECT_POINT;
        console.log('LoadLocal = ' + connect_point);
      } else {
      }
    } catch (error) {
      alert(error);
    }
  };
  onChangeUser_(txt1) {
    this.setState({ user: txt1 });
  }
  onChangePass_(txt1) {
    this.setState({ pass: txt1 });
  }
  updateSecureTextEntry = () => {
    this.setState(prevState => ({
      secureTextEntry: !prevState.secureTextEntry,
    }));
  };
  goToScreen() {
    console.log('login name = ' + this.state.user);
    setTimeout(() => {
      this.props.navigation.navigate('AppRouter');
    }, 1000);
  }
  _FetchApiData = async () => {
    try {
      await AsyncStorage.setItem('LOGIN_NAME', this.state.user);
      const valueINPUT_1 = await AsyncStorage.getItem('INPUT_1');
      const valueINPUT_2 = await AsyncStorage.getItem('INPUT_2');
      const valueINPUT_3 = await AsyncStorage.getItem('INPUT_3');
      const valueINPUT_4 = await AsyncStorage.getItem('INPUT_4');
      const valueINPUT_RADIO_SET = await AsyncStorage.getItem(
        'INPUT_RADIO_SET',
      );

      if (valueINPUT_RADIO_SET === 'A' && valueINPUT_RADIO_SET !== null) {
        this.props.getfetchAuthApi(
          valueINPUT_1,
          this.state.user,
          this.state.pass,
        );
      } else if (
        valueINPUT_RADIO_SET === 'B' &&
        valueINPUT_RADIO_SET !== null
      ) {
        this.props.getfetchAuthApi(
          valueINPUT_2,
          this.state.user,
          this.state.pass,
        );
      } else if (
        valueINPUT_RADIO_SET === 'C' &&
        valueINPUT_RADIO_SET !== null
      ) {
        this.props.getfetchAuthApi(
          valueINPUT_3,
          this.state.user,
          this.state.pass,
        );
      } else if (
        valueINPUT_RADIO_SET === 'D' &&
        valueINPUT_RADIO_SET !== null
      ) {
        this.props.getfetchAuthApi(
          valueINPUT_4,
          this.state.user,
          this.state.pass,
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  renderModalContent = () => (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 300,
          height: 70,
          backgroundColor: '#8000ff',
        }}
      >
        <View
          style={{
            height: 70,
            alignItems: 'center',
            backgroundColor: '#ffffff',
            flexDirection: 'row',
          }}
        >
          <Text style={{ fontSize: 20, alignSelf: 'center' }}>Loading...</Text>
        </View>
      </View>
    </View>
  );
  _focusNextField(nextField) {
    const inputRef = this.inputRefs[nextField];

    if (inputRef && typeof inputRef.focus === 'function') {
      inputRef.focus();
    }
  }
  render() {
    if (this.props.fetchReducer.dataApi) {
      if (this.props.fetchReducer.dataApi.ReadUserKey) {
        if (this.props.fetchReducer.dataApi.ReadUserKey.length > 0) {
          console.log(
            '1id ' + this.props.fetchReducer.dataApi.ReadUserKey.length,
          );
        } else {
          console.log(
            '2id ' + this.props.fetchReducer.dataApi.ReadUserKey.length,
          );
        }
      } else {
        console.log('xxx t id ');
      }
    } else {
      console.log('don t id ');
    }

    return (
      <ScrollView
        style={{ flex: 1, height: '100%', backgroundColor: '#a955a0' }}
      >
        <KeyboardAvoidingView
          styles={[styles.container, { height: '100%' }]}
          behavior="padding"
          enabled
        >
          <View style={{ flex: 1, backgroundColor: '#a955a0', height: '100%' }}>
            <View
              style={{
                backgroundColor: '#a955a0',
                padding: 16,
                flex: 1,
                height: '100%',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={require('../../images/pic_logo_app.png')}
                  resizeMode="stretch"
                  style={{ width: 200, height: 200, alignItems: 'center' }}
                />
              </View>

              <View style={styles.inputWrapper}>
                <FontAwesomeIcon
                  name="user-circle"
                  size={18}
                  color="#f95a25"
                  style={styles.inputIcon}
                />
                <Fumi
                  ref={ref => {
                    this.inputRefs['1'] = ref;
                  }}
                  style={styles.input}
                  label={'UserName'}
                  labelStyle={[styles.inputLabel, { color: '#a3a3a3' }]}
                  inputStyle={styles.inputText}
                  blurOnSubmit={false}
                  returnKeyType="next"
                  onChangeText={this.onChangeUser_.bind(this)}
                  value={this.state.user}
                  onSubmitEditing={() => this._focusNextField('2')}
                />
              </View>
              <View style={styles.inputWrapper}>
                <FontAwesomeIcon
                  name="bullseye"
                  size={18}
                  color="#f95a25"
                  style={styles.inputIcon}
                />
                <Fumi
                  ref={ref => {
                    this.inputRefs['2'] = ref;
                  }}
                  style={styles.input}
                  label={'PassWord'}
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.inputText}
                  returnKeyType="done"
                  secureTextEntry={this.state.secureTextEntry}
                  onChangeText={this.onChangePass_.bind(this)}
                  value={this.state.pass}
                  onSubmitEditing={() => this._FetchApiData()}
                />
                <TouchableOpacity
                  style={styles.eyeIconButton}
                  onPress={this.updateSecureTextEntry}
                >
                  <MaterialCommunityIcons
                    name={this.state.secureTextEntry ? 'eye-off' : 'eye'}
                    size={22}
                    color="#f95a25"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: '#fe8a01' }]}
                onPress={() => this._FetchApiData()}
              >
                <Text style={[styles.submitButtonText]}>
                  {' '}
                  {strings('login.btn_login')}{' '}
                </Text>
              </TouchableOpacity>
            </View>

            {this.props.fetchReducer.dataApi ? (
              this.props.fetchReducer.dataApi.ReadUserKey ? (
                this.props.fetchReducer.dataApi.ReadUserKey.length > 0 ? (
                  this.goToScreen()
                ) : (
                  <Text
                    style={{
                      alignItems: 'center',
                      alignSelf: 'center',
                      color: '#fe8a01',
                    }}
                  >
                    {strings('login.noAccount')}
                  </Text>
                )
              ) : (
                <Text
                  style={{
                    alignItems: 'center',
                    alignSelf: 'center',
                    color: '#fe8a01',
                  }}
                >
                  {strings('login.pleaseLogin')}
                </Text>
              )
            ) : (
              <Text>dataApi == null</Text>
            )}

            <ProgressDialog
              visible={this.props.fetchReducer.isApiData_Fetching}
              title="Loading"
              message="Please, wait..."
            />
          </View>
        </KeyboardAvoidingView>
        <View style={{ height: '20%', paddingTop: 20 }}>
          <Text
            style={{
              alignItems: 'center',
              alignSelf: 'center',
              color: '#fe8a01',
            }}
          >
            {' '}
            {strings('login.connectDefault')} : {connect_point}
          </Text>
          {/* <Text style={{ alignItems: 'center', alignSelf: 'center' }}>LOGIN {this.props.fetchReducer.dataApi.ReadUserKey && this.props.fetchReducer.dataApi.ReadUserKey.length>0 ? this.props.navigation.navigate("AppRouter"): "ไม่พบชื่อผู้ใช้"}</Text> */}
        </View>
        {/* <View style={{ marginTop: 30, marginBottom: 5 }}>
                    <Text style={{ alignSelf: 'center', color: 'white' }}>การเชื่อมต่อปัจจุบัน:</Text>
                </View> */}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 23,
  },
  input: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    height: 50,
    borderColor: '#a955a0',
    borderWidth: 1,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 28,
    top: 22,
    zIndex: 1,
  },
  inputLabel: {
    color: '#a3a3a3',
    marginLeft: 24,
  },
  inputText: {
    color: '#f95a25',
    marginLeft: 24,
    marginRight: 36,
  },
  eyeIconButton: {
    position: 'absolute',
    right: 28,
    top: 17,
    zIndex: 2,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#7a42f4',
    padding: 10,
    margin: 15,
    height: 40,
  },
  submitButtonText: {
    color: 'white',
  },
  title: {
    paddingBottom: 16,
    textAlign: 'center',
    color: '#404d5b',
    fontSize: 20,
    fontWeight: 'bold',
    opacity: 0.8,
  },
});
const _mapStateToProps = state => ({
  fetchReducer: state.fetchReducer,
});
const _mapDispatchToProps = dispatch => {
  return {
    ClearData: () => {
      return dispatch({ type: 'CLEAR_DATA_ALL' });
    },
    SetLanguageName: n => {
      return dispatch({ type: 'SET_LANGUAE_NAME', payload: n });
    },
    ConnectPoint: n => {
      return dispatch({ type: 'CONNECT_POINT', payload: n });
    },
    getfetchAuthApi: (x, user, pass) => {
      return dispatch(GetfetchAuthLoginApi(x, user, pass));
    },
  };
};
export default connect(_mapStateToProps, _mapDispatchToProps)(LoginScreen);
