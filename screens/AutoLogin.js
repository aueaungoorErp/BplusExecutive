import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Text, View, Image, ImageBackground, TextInput, KeyboardAvoidingView, ActivityIndicator, Alert, Platform, BackHandler, StatusBar, ScrollView, TouchableNativeFeedback, TouchableOpacity } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import DeviceInfo from 'react-native-device-info';
import { NetworkInfo } from "react-native-network-info";
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
const LoginScreen = ({
  route
}) => {
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
  const [loading, setLoading] = useStateIfMounted(true);
  const [loading_backG, setLoading_backG] = useStateIfMounted(true);
  const [resultJson, setResultJson] = useState([]);
  const [marker, setMarker] = useState(false);
  const [username, setUsername] = useState(loginReducer.userloggedIn == true ? loginReducer.userNameED : '');
  const [password, setPassword] = useState(loginReducer.userloggedIn == true ? loginReducer.passwordED : '');
  const activityReducer = useSelector(({
    activityReducer
  }) => activityReducer);
  const [data, setData] = useStateIfMounted({
    secureTextEntry: true
  });
  const image = '../images/UI/Login/Asset4.png';
  useEffect(() => {
    regisMacAdd();
  }, []);
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
          onPress: () => void 0
        }]);
      }
    }).catch(error => {
      if (databaseReducer.Data.urlser == '') {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('selectBase.error'), [{
          text: Language.t('alert.ok'),
          onPress: () => void 0
        }]);
      } else {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.internetError'), [{
          text: Language.t('alert.ok'),
          onPress: () => void 0
        }]);
      }
    });
  };
  const _fetchGuidLog = async () => {
    await fetch(databaseReducer.Data.urlser + '/DevUsers', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': '',
        'BPAPUS-FUNCTION': 'Login',
        'BPAPUS-PARAM': '{"BPAPUS-MACHINE": "' + registerReducer.machineNum + '","BPAPUS-USERID": "' + loginReducer.userNameED + '","BPAPUS-PASSWORD": "' + loginReducer.passwordED + '"}'
      })
    }).then(response => response.json()).then(json => {
      if (json && json.ResponseCode == '635') {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.errorDetail'), [{
          text: Language.t('alert.ok'),
          onPress: () => void 0
        }]);
      } else if (json && json.ResponseCode == '629') {
        Alert.alert(Language.t('alert.errorTitle'), 'Function Parameter Required', [{
          text: Language.t('alert.ok'),
          onPress: () => void 0
        }]);
      } else if (json && json.ResponseCode == '200') {
        let responseData = JSON.parse(json.ResponseData);
        dispatch(loginActions.guid(responseData.BPAPUS_GUID));
        navigation.dispatch(navigation.replace('MainScreen', {}));
      } else {
        let temp_error = 'error_ser.' + json.ResponseCode;
        Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
          text: Language.t('alert.ok'),
          onPress: () => void 0
        }]);
      }
    }).catch(error => {
      console.error('ERROR at _fetchGuidLogin' + error);
      if (databaseReducer.Data.urlser == '') {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('selectBase.error'), [{
          text: Language.t('alert.ok'),
          onPress: () => void 0
        }]);
      } else {
        Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.internetError') + "1", [{
          text: Language.t('alert.ok'),
          onPress: () => void 0
        }]);
      }
    });
    setLoading(false);
  };
  return <SafeAreaView style={container1}>
      <StatusBar hidden={true} />
      <ImageBackground source={require(image)} onLoadEnd={() => {
      setLoading_backG(false);
    }} resizeMode="cover" style={styles.image}>
        <View style={{
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
        </View>
      </ImageBackground>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container1: {
    flex: 1,
    flexDirection: 'column'
  },
  image: {
    flex: 1,
    justifyContent: "center"
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
  checkboxContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 20
  },
  checkbox: {
    alignSelf: "center",
    borderBottomColor: Colors.fontColor,
    color: Colors.fontColor
  },
  label: {
    margin: 8,
    color: Colors.fontColor
  }
});
export default LoginScreen;