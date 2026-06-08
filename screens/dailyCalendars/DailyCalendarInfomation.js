import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  Image,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Platform,
  BackHandler,
  StatusBar,
  ScrollView,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';

import CheckBox from '@react-native-community/checkbox';
import DeviceInfo from 'react-native-device-info';
import { NetworkInfo } from 'react-native-network-info';

import { Picker } from '@react-native-picker/picker';

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
import { fontSize, fontWeight } from 'styled-system';
import * as safe_Format from '../../src/safe_Format';
import { Icon } from 'react-native-paper/lib/typescript/components/Avatar/Avatar';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const DailyCalendarInfomation = ({ route }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const registerReducer = useSelector(({ registerReducer }) => registerReducer);
  const loginReducer = useSelector(({ loginReducer }) => loginReducer);
  const databaseReducer = useSelector(({ databaseReducer }) => databaseReducer);

  const {
    container2,
    container1,
    button,
    textButton,
    topImage,
    tabbar,
    buttonContainer,
  } = styles;

  useEffect(() => {
    let sum = 0;
    let tempVal = [];
    if (route.params?.poppoint) {
      tempVal = route.params.poppoint;
      for (var i in tempVal) sum += parseFloat(tempVal[i].APPO_A_AMT);
      console.log(sum);
      set_poppoint(sum);
    }
    if (route.params?.mappoint) {
      tempVal = route.params.mappoint;
      for (var i in tempVal) sum += parseFloat(tempVal[i].AROE_A_AMT);
      console.log(sum);
      set_mappoint(sum);
    }
    if (route.params?.rarchqDue) {
      tempVal = route.params.rarchqDue;
      for (var i in tempVal) sum += parseFloat(tempVal[i].ARD_A_AMT);
      console.log(sum);
      set_rarchqDue(sum);
    }
    if (route.params?.rapDue) {
      tempVal = route.params.rapDue;
      for (var i in tempVal) sum += parseFloat(tempVal[i].APD_A_AMT);
      console.log(sum);
      set_rapDue(sum);
    }

    //backsakura013
  }, [route.params]);

  const [loading, setLoading] = useStateIfMounted(false);
  const [loading_backG, setLoading_backG] = useStateIfMounted(true);
  const [ser_die, setSer_die] = useStateIfMounted(true);

  var daily = new Date();

  const [dateIndex, set_DateIndex] = useState(1);
  const [monthIndex, set_MonthIndex] = useState(daily.getMonth());
  const [yearIndex, set_yearIndex] = useState(daily.getFullYear() + 543);
  const [menu1, set_menu1] = useState(false);
  const [menu2, set_menu2] = useState(false);
  const [menu3, set_menu3] = useState(false);
  const [menu4, set_menu4] = useState(false);

  const [poppoint, set_poppoint] = useState(0);
  const [mappoint, set_mappoint] = useState(0);
  const [rarchqDue, set_rarchqDue] = useState(0);
  const [rapDue, set_rapDue] = useState(0);

  const [Statedaily, set_Statedaily] = useState(0);

  const image = '../../images/UI/Asset35.png';

  const closeLoading = () => {
    setLoading(false);
  };
  const letsLoading = () => {
    setLoading(true);
  };

  return (
    <SafeAreaView style={container1}>
      <StatusBar hidden={true} />
      <ImageBackground
        source={require(image)}
        onLoadEnd={() => {
          setLoading_backG(false);
        }}
        resizeMode="cover"
        style={styles.image}
      >
        {!loading_backG ? (
          <>
            <StatusBar hidden={true} />
            <View style={tabbar}>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Image
                    style={{
                      width: FontSize.large,
                      height: FontSize.large,
                    }}
                    resizeMode="contain"
                    source={require('../../img/iconsMenu/goback.png')}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    marginLeft: 12,
                    fontSize: FontSize.medium,
                    color: Colors.fontColor2,
                  }}
                >
                  {route.params.header && `${route.params.header}`}
                </Text>
              </View>
              <View></View>
            </View>
            <ScrollView horizontal={true}>
              <View style={container1}>
                <View style={{ marginTop: 0 }}>
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <View style={{ width: deviceWidth * 0.4 }}>
                        <Text
                          style={{
                            fontSize: FontSize.medium,
                            color: Colors.backgroundColorSecondary,
                            fontWeight: 'bold',
                          }}
                        >
                          {' '}
                          {route.params.header && `${route.params.header}`}
                        </Text>
                      </View>
                      <View style={{ width: deviceWidth * 0.5 }}>
                        <Text
                          style={{
                            fontSize: FontSize.medium,
                            color: Colors.backgroundColorSecondary,
                            fontWeight: 'bold',
                          }}
                        >
                          {route.params.person && `${route.params.person}`}
                        </Text>
                      </View>
                      <View style={{ width: deviceWidth * 0.3 }}>
                        <Text
                          style={{
                            fontSize: FontSize.medium,
                            color: Colors.backgroundColorSecondary,
                            fontWeight: 'bold',
                          }}
                        >
                          {`วันที่เอกสาร`}{' '}
                        </Text>
                      </View>
                      <View style={{ width: deviceWidth * 0.5 }}>
                        <Text
                          style={{
                            fontSize: FontSize.medium,
                            color: Colors.backgroundColorSecondary,
                            fontWeight: 'bold',
                          }}
                        >
                          {`เลขที่เอกสาร`}{' '}
                        </Text>
                      </View>
                      <View style={{ width: deviceWidth * 0.3 }}>
                        <Text
                          style={{
                            fontSize: FontSize.medium,
                            color: Colors.backgroundColorSecondary,
                            fontWeight: 'bold',
                          }}
                        >
                          {route.params.rarchqDue ? `วางบิล` : `หมดอายุ`}{' '}
                        </Text>
                      </View>
                      <View style={{ width: deviceWidth * 0.3 }}>
                        <Text
                          style={{
                            fontSize: FontSize.medium,
                            color: Colors.backgroundColorSecondary,
                            alignSelf: 'flex-end',
                            fontWeight: 'bold',
                          }}
                        >
                          {`ยอดเงิน`}{' '}
                        </Text>
                      </View>
                    </View>
                    <ScrollView>
                      {/* นัดรับ */}
                      <>
                        {route.params.poppoint &&
                          route.params.poppoint.map(item => {
                            return (
                              <>
                                <View style={styles.tableView}>
                                  <View style={{ width: deviceWidth * 0.4 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {' '}
                                      {safe_Format.dateFormat(
                                        item.TRH_SHIP_DATE,
                                      )}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.5 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {item.AP_NAME}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.dateFormat(
                                        item.TRH_SHIP_DATE,
                                      )}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.5 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {item.DI_REF}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.dateFormat(
                                        item.TRH_CANCEL_DATE,
                                      )}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        alignSelf: 'flex-end',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.currencyFormat(
                                        item.APPO_A_AMT,
                                      )}{' '}
                                    </Text>
                                  </View>
                                </View>
                              </>
                            );
                          })}
                        {route.params.poppoint && (
                          <>
                            <View style={styles.tableView}>
                              <View style={{ width: deviceWidth * 0.4 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {' '}
                                  {'รวม'}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.5 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.5 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    alignSelf: 'flex-end',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {safe_Format.currencyFormat(poppoint)}{' '}
                                </Text>
                              </View>
                            </View>
                          </>
                        )}
                      </>

                      {/* นัดส่ง */}
                      <>
                        {route.params.mappoint &&
                          route.params.mappoint.map(item => {
                            return (
                              <>
                                <View style={styles.tableView}>
                                  <View style={{ width: deviceWidth * 0.4 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {' '}
                                      {safe_Format.dateFormat(
                                        item.TRH_SHIP_DATE,
                                      )}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.5 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {item.AR_NAME}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.dateFormat(
                                        item.TRH_SHIP_DATE,
                                      )}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.5 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {item.DI_REF}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.dateFormat(
                                        item.TRH_CANCEL_DATE,
                                      )}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        alignSelf: 'flex-end',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.currencyFormat(
                                        item.AROE_A_AMT,
                                      )}{' '}
                                    </Text>
                                  </View>
                                </View>
                              </>
                            );
                          })}
                        {route.params.mappoint && (
                          <>
                            <View style={styles.tableView}>
                              <View style={{ width: deviceWidth * 0.4 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {' '}
                                  {'รวม'}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.5 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.5 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    alignSelf: 'flex-end',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {safe_Format.currencyFormat(mappoint)}{' '}
                                </Text>
                              </View>
                            </View>
                          </>
                        )}
                      </>

                      {/* รับชำระ */}
                      <>
                        {route.params.rarchqDue &&
                          route.params.rarchqDue.map(item => {
                            return (
                              <>
                                <View style={styles.tableView}>
                                  <View style={{ width: deviceWidth * 0.4 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {' '}
                                      {safe_Format.dateFormat(item.DI_DATE)}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.5 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {item.AR_NAME}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.dateFormat(item.ARD_BIL_DA)}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.5 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {item.DI_REF}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.dateFormat(item.ARD_DUE_DA)}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        alignSelf: 'flex-end',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.currencyFormat(
                                        item.ARD_A_AMT,
                                      )}{' '}
                                    </Text>
                                  </View>
                                </View>
                              </>
                            );
                          })}
                        {route.params.rarchqDue && (
                          <>
                            <View style={styles.tableView}>
                              <View style={{ width: deviceWidth * 0.4 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {' '}
                                  {'รวม'}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.5 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.5 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    alignSelf: 'flex-end',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {safe_Format.currencyFormat(rarchqDue)}{' '}
                                </Text>
                              </View>
                            </View>
                          </>
                        )}
                      </>

                      {/* จ่ายชำระ */}
                      <>
                        {route.params.rapDue &&
                          route.params.rapDue.map(item => {
                            return (
                              <>
                                <View style={styles.tableView}>
                                  <View style={{ width: deviceWidth * 0.4 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {' '}
                                      {safe_Format.dateFormat(item.DI_DATE)}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.5 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {item.AP_NAME}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.dateFormat(item.APD_BIL_DA)}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.5 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {item.DI_REF}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.dateFormat(item.APD_DUE_DA)}{' '}
                                    </Text>
                                  </View>
                                  <View style={{ width: deviceWidth * 0.3 }}>
                                    <Text
                                      style={{
                                        fontSize: FontSize.medium,
                                        color: 'black',
                                        alignSelf: 'flex-end',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {safe_Format.currencyFormat(
                                        item.APD_A_AMT,
                                      )}{' '}
                                    </Text>
                                  </View>
                                </View>
                              </>
                            );
                          })}
                        {route.params.rapDue && (
                          <>
                            <View style={styles.tableView}>
                              <View style={{ width: deviceWidth * 0.4 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {' '}
                                  {'รวม'}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.5 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.5 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {}{' '}
                                </Text>
                              </View>
                              <View style={{ width: deviceWidth * 0.3 }}>
                                <Text
                                  style={{
                                    fontSize: FontSize.medium,
                                    color: 'black',
                                    alignSelf: 'flex-end',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {safe_Format.currencyFormat(rapDue)}{' '}
                                </Text>
                              </View>
                            </View>
                          </>
                        )}
                      </>
                    </ScrollView>
                  </View>
                </View>
              </View>
            </ScrollView>
          </>
        ) : (
          <View
            style={{
              width: deviceWidth,
              height: deviceHeight,
              opacity: 0.5,
              backgroundColor: null,
              alignSelf: 'center',
              justifyContent: 'center',
              alignContent: 'center',
              position: 'absolute',
            }}
          ></View>
        )}

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container1: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  container2: {
    width: deviceWidth,
    height: '100%',
    position: 'absolute',
    backgroundColor: 'white',
    flex: 1,
  },
  tabbar: {
    height: 70,
    padding: 12,
    paddingLeft: 20,
    alignItems: 'center',
    backgroundColor: Colors.itemColor,
    color: Colors.fontColor2,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  textTitle2: {
    alignSelf: 'center',
    flex: 2,
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
    height: deviceHeight / 3.6,
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
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: 'center',
    borderBottomColor: Colors.fontColor,
    color: Colors.fontColor,
  },
  label: {
    margin: 8,
    color: Colors.fontColor,
  },
  table: {},
  tableView: {
    backgroundColor: Colors.fontColor2,
    padding: 10,
    flexDirection: 'row',
  },
  tableHeader: {
    padding: 10,
    flexDirection: 'row',
    backgroundColor: Colors.buttonColorPrimary,
  },
});

export default DailyCalendarInfomation;
