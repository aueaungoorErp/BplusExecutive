import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Text, View, Image, ImageBackground, TextInput, KeyboardAvoidingView, ActivityIndicator, Alert, Platform, BackHandler, StatusBar, ScrollView, TouchableNativeFeedback, TouchableOpacity } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import DeviceInfo from 'react-native-device-info';
import { NetworkInfo } from "react-native-network-info";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStateIfMounted } from 'use-state-if-mounted';
import { useNavigation } from '@react-navigation/native';
import { useSelector, connect, useDispatch } from 'react-redux';
import { Language, changeLanguage } from '../../translations/I18n';
import { FontSize } from '../../components/FontSizeHelper';
import * as loginActions from '../../src/actions/loginActions';
import * as registerActions from '../../src/actions/registerActions';
import * as databaseActions from '../../src/actions/databaseActions';
import Colors from '../../src/Colors';
import * as safe_Format from '../../src/safe_Format';
import { fontSize, fontWeight, paddingTop } from 'styled-system';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const OrderScreen = () => {
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
  var ser_die = true;
  useEffect(() => {

    //backsakura013
  }, []);
  const [loading, setLoading] = useStateIfMounted(false);
  const [loading_backG, setLoading_backG] = useStateIfMounted(true);
  //8852099021532
  const [textsearch, setSearch] = useState('');
  const [arrayObj, setArrayObj] = useState([]);
  const [data, setData] = useStateIfMounted({
    secureTextEntry: true
  });
  const image = '../../images/UI/Asset35.png';
  useEffect(() => {
    InCome();
  }, [registerReducer.machineNum]);
  const closeLoading = () => {
    setLoading(false);
  };
  const letsLoading = () => {
    setLoading(true);
  };
  const InCome = async () => {
    letsLoading();
    await fetchInCome();
    closeLoading();
    // setArrayObj(arrayResult)
  };
  const regisMacAdd = async () => {
    let tempGuid = await safe_Format._fetchGuidLog(databaseReducer.Data.urlser, loginReducer.serviceID, registerReducer.machineNum, loginReducer.userNameED, loginReducer.passwordED);
    await dispatch(loginActions.guid(tempGuid));
    fetchInCome(tempGuid);
  };
  const fetchInCome = async tempGuid => {
    setArrayObj([]);
    await fetch(databaseReducer.Data.urlser + '/UpdateErp', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'SearchGoodsInfoWPurcPrice',
        'BPAPUS-PARAM': '{"APPRB_KEY": " 0" }',
        'BPAPUS-FILTER': "AND (GOODS_CODE LIKE '%" + textsearch + "%') OR (SKU_NAME LIKE '%" + textsearch + "%') OR (SKU_CODE LIKE '%" + textsearch + "%') ",
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '20'
      })
    }).then(async response => {
      const rawResponse = await response.text();
      try {
        return JSON.parse(rawResponse);
      } catch (error) {
        const preview = rawResponse ? rawResponse.trim().slice(0, 200) : '';
        throw new Error(`Invalid JSON response${preview ? `: ${preview}` : ''}`);
      }
    }).then(json => {
      let responseData = typeof json.ResponseData === 'string' ? JSON.parse(json.ResponseData) : json.ResponseData;
      if (responseData.RECORD_COUNT > 0) {
        setArrayObj(responseData.SearchGoodsInfoWPurcPrice);
      } else {
        safe_Format.alertNoData();
      }
      setLoading(false);
    }).catch(error => {
      if (ser_die) {
        ser_die = false;
        regisMacAdd();
      } else {
        let temp_error = 'error_ser.' + 610;
        Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
          text: Language.t('alert.ok'),
          onPress: () => navigation.dispatch(navigation.replace('LoginScreen'))
        }]);
        setLoading(false);
      }
      console.error('ERROR at fetchContent >> ' + error);
    });
  };
  return <SafeAreaView style={container1}>
            <StatusBar hidden={true} />
            <ImageBackground source={require(image)} onLoadEnd={() => {
      setLoading_backG(false);
    }} resizeMode="cover" style={styles.image}>
                {!loading_backG ? <>
                        <Image style={topImage} source={require('../../images/UI/Asset41.png')} />
                        <View style={{
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 20,
          marginTop: 0
        }}>
                            <View style={{
            borderTopStartRadius: 20,
            borderTopEndRadius: 20,
            borderBottomStartRadius: arrayObj.length > 0 ? 0 : 20,
            borderBottomEndRadius: arrayObj.length > 0 ? 0 : 20,
            backgroundColor: Colors.backgroundLoginColorSecondary
          }}>
                                <View style={{
              borderRadius: 20,
              flexDirection: 'column',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.backgroundLoginColorSecondary,
              borderColor: Colors.borderColor,
              borderWidth: 1
            }}>
                                    <TextInput style={{
                flex: 8,
                marginLeft: 10,
                color: Colors.fontColor,
                fontSize: FontSize.medium
              }} value={textsearch} onChangeText={val => setSearch(val)} placeholderTextColor={Colors.fontColorSecondary} placeholder={'ค้นหา'} onSubmitEditing={() => InCome()} />

                                    <TouchableNativeFeedback onPress={() => InCome()}>

                                        <Image style={{
                  height: 30,
                  width: 30,
                  marginRight: 10
                }} resizeMode={'contain'} source={require('../../images/UI/Asset45.png')} />
                                    </TouchableNativeFeedback>
                                </View>
                            </View>
                        </View>
                        <ScrollView>
                            <View style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 20,
            marginTop: 0
          }}>
                                {arrayObj.length > 0 ? <View style={{
              padding: 20,
              borderBottomStartRadius: 20,
              borderBottomEndRadius: 20,
              backgroundColor: Colors.backgroundLoginColorSecondary
            }}>
                                        {arrayObj.map((item, index) => {
                return <TouchableNativeFeedback key={`${item.GOODS_CODE ?? item.SKU_CODE ?? index}`} onPress={() => navigation.navigate('OrderInformation', {
                  header: 'สอบถามข้อมูลการสั่งซื้อ',
                  data: item
                })}>

                                                    <View style={{
                    flexDirection: 'column'
                  }}>
                                                        <View style={{
                      borderBottomColor: 'black',
                      borderBottomWidth: 1,
                      paddingBottom: 10,
                      paddingTop: 10
                    }}>
                                                            <View style={{
                        flexDirection: 'row',
                        paddingBottom: 5
                      }}>
                                                                <Text style={{
                          width: deviceWidth / 4,
                          color: Colors.fontColor
                        }}>{'รหัสซื้อขาย'}</Text>
                                                                <Text style={{
                          color: Colors.fontColor
                        }}>{item.GOODS_CODE}</Text>
                                                            </View>
                                                            <View style={{
                        flexDirection: 'row',
                        paddingBottom: 5
                      }}>
                                                                <Text style={{
                          width: deviceWidth / 4,
                          color: Colors.fontColor
                        }}>{'ชื่อสินค้า'}</Text>
                                                                <Text style={{
                          width: deviceWidth / 1.8,
                          color: Colors.fontColor
                        }}>{item.SKU_NAME}</Text>
                                                            </View>
                                                            <View style={{
                        flexDirection: 'row',
                        paddingBottom: 5
                      }}>
                                                                <Text style={{
                          width: deviceWidth / 4,
                          color: Colors.fontColor
                        }}>{'หน่วยนับ'}</Text>
                                                                <Text style={{
                          color: Colors.fontColor
                        }}>{item.UTQ_NAME}</Text>
                                                            </View>
                                                            <View style={{
                        flexDirection: 'row',
                        paddingBottom: 5
                      }}>
                                                                <Text style={{
                          width: deviceWidth / 4,
                          color: Colors.fontColor
                        }}>{'รหัสสินค้า'}</Text>
                                                                <Text style={{
                          color: Colors.fontColor
                        }}>{item.SKU_CODE}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableNativeFeedback>;
              })}

                                    </View> : null}
                            </View>
                            <TouchableNativeFeedback onPress={() => navigation.goBack()}>
                                <View style={{
              margin: 10,
              borderRadius: 20,
              flexDirection: 'column',
              padding: 10,
              backgroundColor: Colors.buttonColorPrimary
            }}>
                                    <Text style={{
                color: Colors.buttonTextColor,
                alignSelf: 'center',
                fontSize: FontSize.medium,
                fontWeight: 'bold'
              }}>
                                        {Language.t('executiveMenus.back')}
                                    </Text>
                                </View>
                            </TouchableNativeFeedback>
                        </ScrollView>

                    </> : <View style={{
        width: deviceWidth,
        height: deviceHeight,
        opacity: 0.5,
        backgroundColor: 'black',
        alignSelf: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        position: 'absolute'
      }}>

                    </View>}

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
    height: deviceHeight / 3.6,
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
export default OrderScreen;