import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Text, View, Image, Button, TextInput, KeyboardAvoidingView, ActivityIndicator, Alert, Platform, BackHandler, StatusBar, TouchableOpacity, Modal, Pressable } from 'react-native';
import CalendarScreen from '@blacksakura013/th-datepicker';
import CheckBox from '@react-native-community/checkbox';
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button';
import { ScrollView, TouchableNativeFeedback } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStateIfMounted } from 'use-state-if-mounted';
import { useNavigation } from '@react-navigation/native';
import { useSelector, connect, useDispatch } from 'react-redux';
import { Language } from '../../../translations/I18n';
import { FontSize } from '../../../components/FontSizeHelper';
import * as loginActions from '../../../src/actions/loginActions';
import * as registerActions from '../../../src/actions/registerActions';
import * as databaseActions from '../../../src/actions/databaseActions';
import Colors from '../../../src/Colors';
import { fontSize } from 'styled-system';
import * as safe_Format from '../../../src/safe_Format';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
import tableStyles from '../tableStyles';
const SlmnByYearMonth = ({
  route
}) => {
  let arrayResult = [];
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {
    container2,
    container,
    button,
    textButton,
    topImage,
    tabbar,
    buttonContainer
  } = styles;
  const registerReducer = useSelector(({
    registerReducer
  }) => registerReducer);
  const loginReducer = useSelector(({
    loginReducer
  }) => loginReducer);
  const databaseReducer = useSelector(({
    databaseReducer
  }) => databaseReducer);
  const [loading, setLoading] = useStateIfMounted(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [arrayObj, setArrayObj] = useState([]);
  const [start_date, setS_date] = useState(new Date());
  const [end_date, setE_date] = useState(new Date());
  const [sum, setSum] = useState(0);
  const [radioIndex1, setRadioIndex1] = useState(6);
  const [radioIndex2, setRadioIndex2] = useState(6);
  const [radioIndex3, setRadioIndex3] = useState(6);
  const radio_props = [{
    label: Language.t('report.filter.lastYearPeriod'),
    value: 'lastyear'
  }, {
    label: Language.t('report.filter.thisYear'),
    value: 'nowyear'
  }, {
    label: Language.t('report.filter.thisMonth'),
    value: 'nowmonth'
  }, {
    label: Language.t('report.filter.previousMonth'),
    value: 'lastmonth'
  }, {
    label: Language.t('report.filter.yesterday'),
    value: 'lastday'
  }, {
    label: Language.t('report.filter.today'),
    value: 'nowday'
  }, {
    label: null,
    value: null
  }];
  useEffect(() => {
    setRadio_menu3(1, radio_props[5].value);
  }, []);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState([0]);
  var ser_die = true;
  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);
  useEffect(() => {}, [loginReducer.guid]);
  useEffect(() => {
    var newsum = 0;
    for (var i in arrayObj) {
      newsum += Number(arrayObj[i].sellAmount);
    }
    setSum(newsum);
  }, [arrayObj]);
  const regisMacAdd = async () => {
    let tempGuid = await safe_Format._fetchGuidLog(databaseReducer.Data.urlser, loginReducer.serviceID, registerReducer.machineNum, loginReducer.userNameED, loginReducer.passwordED);
    await dispatch(loginActions.guid(tempGuid));
    fetchInCome(tempGuid);
  };
  const InCome = async () => {
    setLoading(true);
    setModalVisible(false);
    await fetchInCome();
    setArrayObj(arrayResult);
  };
  const fetchInCome = async tempGuid => {
    var sDate = safe_Format.setnewdateF(safe_Format.checkDate(start_date));
    var eDate = safe_Format.setnewdateF(safe_Format.checkDate(end_date));
    await fetch(databaseReducer.Data.urlser + '/Executive', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'SHOWINCOMEBYSALESMAN',
        'BPAPUS-PARAM': '{"FROM_DATE": "' + sDate + '","TO_DATE": ' + eDate + '}',
        'BPAPUS-FILTER': "AND ( SLD_SLMN  ='" + route.params.Obj + "')",
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(json => {
      let responseData = JSON.parse(json.ResponseData);
      if (responseData.RECORD_COUNT > 0) {
        for (var i in responseData.SHOWINCOMEBYSALESMAN) {
          let jsonObj = {
            id: i,
            code: responseData.SHOWINCOMEBYSALESMAN[i].SLMN_CODE,
            name: responseData.SHOWINCOMEBYSALESMAN[i].SLMN_NAME,
            sellAmount: responseData.SHOWINCOMEBYSALESMAN[i].SHOWSELLAMOUNT
          };
          arrayResult.push(jsonObj);
        }
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
  const setRadio_menu1 = (index, val) => {
    const Radio_Obj = safe_Format.Radio_menu(index, val);
    setRadioIndex1(Radio_Obj.index);
    if (val != null) {
      setS_date(new Date(Radio_Obj.sdate));
      setE_date(new Date(Radio_Obj.edate));
    }
    setRadioIndex2(2);
    setRadioIndex3(2);
  };
  const setRadio_menu2 = (index, val) => {
    const Radio_Obj = safe_Format.Radio_menu(index, val);
    setRadioIndex2(Radio_Obj.index);
    if (val != null) {
      setS_date(new Date(Radio_Obj.sdate));
      setE_date(new Date(Radio_Obj.edate));
    }
    setRadioIndex1(2);
    setRadioIndex3(2);
  };
  const setRadio_menu3 = (index, val) => {
    const Radio_Obj = safe_Format.Radio_menu(index, val);
    setRadioIndex3(Radio_Obj.index);
    if (val != null) {
      setS_date(new Date(Radio_Obj.sdate));
      setE_date(new Date(Radio_Obj.edate));
    }
    setRadioIndex1(2);
    setRadioIndex2(2);
  };
  useEffect(() => {}, []);
  return <>
            <SafeAreaView style={container}>
                <StatusBar hidden={true} />
                <View style={tableStyles.tabbar}>
                    <View style={{
          flexDirection: 'row'
        }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                             <Image style={{
              width: FontSize.large,
              height: FontSize.large
            }} resizeMode="contain" source={require('../../../img/iconsMenu/arrow.png')} />
                        </TouchableOpacity>
                        <Text style={{
            marginLeft: 12,
            fontSize: FontSize.medium,
            color: 'black'
          }}>{Language.t('executiveMenus.m6.slmnMonthly')}</Text>
                    </View>
                    <View>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                             <Image style={{
              width: FontSize.large,
              height: FontSize.large
            }} resizeMode="contain" source={require('../../../img/iconsMenu/calendar.png')} />
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={{
        flex: 1
      }}>
                    <View>
                        <ScrollView horizontal={true}>
                            <View style={tableStyles.table}>
                                <View style={tableStyles.tableHeader}>
                                    <View width={deviceWidth * 0.2} style={tableStyles.tableHeaderTitle}><Text style={{
                    fontSize: FontSize.medium,
                    color: Colors.fontColor2,
                    alignSelf: 'center'
                  }}> รหัส</Text></View>
                                    <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                    fontSize: FontSize.medium,
                    color: Colors.fontColor2,
                    alignSelf: 'center'
                  }}>{Language.t('report.employeeName')}</Text></View>
                                    <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                    fontSize: FontSize.medium,
                    color: Colors.fontColor2,
                    alignSelf: 'center'
                  }}> {Language.t('report.sales')} </Text></View>
                                </View>
                                <ScrollView>
                                    <KeyboardAvoidingView keyboardVerticalOffset={1}>
                                        <TouchableNativeFeedback>
                                            <View>
                                                {arrayObj.map(item => {
                        return <>
                                                            <View style={tableStyles.tableCell}>
                                                                <View width={deviceWidth * 0.2} style={tableStyles.tableCellTitle}><Text style={{
                                fontSize: FontSize.medium,
                                color: Colors.fontColor,
                                alignSelf: 'flex-start'
                              }}>{item.code}</Text></View>
                                                                <View width={deviceWidth * 0.4} style={tableStyles.tableCellTitle}><Text style={{
                                fontSize: FontSize.medium,
                                color: Colors.fontColor,
                                alignSelf: 'flex-start'
                              }}>{item.name}</Text></View>
                                                                <View width={deviceWidth * 0.4} style={tableStyles.tableCellTitle}><Text style={{
                                fontSize: FontSize.medium,
                                color: Colors.fontColor,
                                alignSelf: 'flex-end'
                              }}>{safe_Format.currencyFormat(item.sellAmount)}</Text></View>
                                                            </View>
                                                        </>;
                      })}
                                            </View>
                                        </TouchableNativeFeedback>
                                    </KeyboardAvoidingView>
                                    {arrayObj.length > 0 ? <View style={tableStyles.tableHeader}>
                                            <View width={deviceWidth * 0.2} style={tableStyles.tableHeaderTitle}><Text style={{
                      fontSize: FontSize.medium,
                      color: Colors.fontColor2,
                      alignSelf: 'center'
                    }}>{Language.t('report.total')}</Text></View>
                                            <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                      fontSize: FontSize.medium,
                      color: Colors.fontColor2,
                      alignSelf: 'center'
                    }}> </Text></View>
                                            <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                      fontSize: FontSize.medium,
                      color: Colors.fontColor2,
                      alignSelf: 'flex-end'
                    }}>{safe_Format.currencyFormat(sum)}</Text></View>
                                        </View> : null}
                                </ScrollView>

                            </View>
                        </ScrollView>
                    </View>
                    <View style={styles.centeredView}>
                        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
                            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.centeredView}>
                                <View>
                                    <View style={styles.modalView}>
                                        <View style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row'
                  }}>
                                            <View width={20}></View>
                                            <Text style={styles.modalText}>{Language.t('report.selectSearch')}</Text>
                                            <Pressable style={{
                      alignItems: 'flex-end'
                    }} onPress={() => setModalVisible(!modalVisible)}>
                                                 <Image style={{
                        width: FontSize.large,
                        height: FontSize.large
                      }} resizeMode="contain" source={require('../../../img/iconsMenu/cancel.png')} />
                                            </Pressable>
                                        </View>
                                        <View style={{
                    backgroundColor: Colors.fontColor2,
                    borderRadius: 20,
                    padding: 10
                  }}>
                                            <View style={{
                      paddingBottom: 10
                    }}>
                                                <RadioGroup style={{
                        flexDirection: 'row',
                        paddingLeft: 10
                      }} selectedIndex={radioIndex1} onSelect={(index, value) => setRadio_menu1(index, value)}>
                                                    <RadioButton value={radio_props[0].value}>
                                                        <Text style={{
                            fontSize: FontSize.medium,
                            width: 100,
                            color: 'black',
                            fontWeight: 'bold'
                          }}>{radio_props[0].label}</Text>
                                                    </RadioButton>
                                                    <RadioButton value={radio_props[1].value}>
                                                        <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black',
                            fontWeight: 'bold'
                          }}>{radio_props[1].label}</Text>
                                                    </RadioButton>
                                                </RadioGroup>
                                                <RadioGroup style={{
                        flexDirection: 'row',
                        paddingLeft: 10
                      }} selectedIndex={radioIndex2} onSelect={(index, value) => setRadio_menu2(index, value)}>
                                                    <RadioButton value={radio_props[2].value}>
                                                        <Text style={{
                            fontSize: FontSize.medium,
                            width: 100,
                            color: 'black',
                            fontWeight: 'bold'
                          }}>{radio_props[2].label}</Text>
                                                    </RadioButton>

                                                    <RadioButton value={radio_props[3].value}>
                                                        <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black',
                            fontWeight: 'bold'
                          }}>{radio_props[3].label}</Text>
                                                    </RadioButton>
                                                </RadioGroup>
                                                <RadioGroup style={{
                        flexDirection: 'row',
                        paddingLeft: 10
                      }} selectedIndex={radioIndex3} onSelect={(index, value) => setRadio_menu3(index, value)}>
                                                    <RadioButton value={radio_props[4].value}>
                                                        <Text style={{
                            fontSize: FontSize.medium,
                            width: 100,
                            color: 'black',
                            fontWeight: 'bold'
                          }}>{radio_props[4].label}</Text>
                                                    </RadioButton>
                                                    <RadioButton value={radio_props[5].value}>
                                                        <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black',
                            fontWeight: 'bold'
                          }}>{radio_props[5].label}</Text>
                                                    </RadioButton>
                                                </RadioGroup>
                                            </View>
                                            <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10
                    }}>
                                                <Text style={{
                        fontSize: FontSize.medium,
                        marginRight: 5,
                        color: 'black',
                        fontWeight: 'bold'
                      }}>{Language.t('report.from')}</Text>
                                                <CalendarScreen value={start_date} onChange={vel => setS_date(vel)} language={Language.getLang()} era={'be'} format={'DD/MM/YYYY'} borderColor={Colors.primaryColor} linkTodateColor={Colors.itemColor} calendarModel={{
                        backgroundColor: Colors.backgroundColor,
                        buttonSuccess: {
                          backgroundColor: Colors.itemColor
                        },
                        pickItem: {
                          color: Colors.itemColor
                        }
                      }} borderWidth={1} icon={{
                        color: Colors.primaryColor
                      }} fontSize={FontSize.medium} fontColor={Colors.fontColor} width={250} borderRadius={10} />
                                            </View>
                                            <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10
                    }}>
                                                <Text style={{
                        fontSize: FontSize.medium,
                        color: 'black',
                        fontWeight: 'bold'
                      }}>{Language.t('report.to')}</Text>
                                                <CalendarScreen value={end_date} onChange={vel => setE_date(vel)} language={Language.getLang()} era={'be'} format={'DD/MM/YYYY'} borderColor={Colors.primaryColor} linkTodateColor={Colors.itemColor} calendarModel={{
                        backgroundColor: Colors.backgroundColor,
                        buttonSuccess: {
                          backgroundColor: Colors.itemColor
                        },
                        pickItem: {
                          color: Colors.itemColor
                        }
                      }} borderWidth={1} icon={{
                        color: Colors.primaryColor
                      }} fontSize={FontSize.medium} fontColor={Colors.fontColor} width={250} borderRadius={10} />
                                            </View>
                                            <Pressable style={[styles.button, styles.buttonClose]} onPress={() => InCome()}>
                                                <Text style={styles.textStyle}>{Language.t('alert.ok')}</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </View>

                </View>



            </SafeAreaView>

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
        </>;
};
const styles = StyleSheet.create({
  table: {},
  container: {
    backgroundColor: '#fff',
    flex: 1
  },
  container2: {
    width: deviceWidth,
    height: '100%',
    position: 'absolute',
    backgroundColor: 'white',
    flex: 1
  },
  tableView: {},
  tableHeader: {
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundLoginColor
  },
  tabbar: {
    height: 70,
    padding: 5,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  tabbuttom: {
    width: '100%',
    height: 50,
    padding: 5,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.backgroundLoginColor,
    justifyContent: 'space-between',
    flexDirection: 'row',
    position: 'absolute',
    //Here is the trick
    bottom: 0 //Here is the trick
  },
  tabbuttomsum: {
    backgroundColor: Colors.backgroundLoginColor,
    color: Colors.fontColor2
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
    color: '#FFFFF',
    height: Platform.OS === 'ios' ? 300 : deviceWidth / 2,
    marginBottom: 50
  },
  button: {
    marginTop: 10,
    marginBottom: 25,
    padding: 5,
    paddingBottom: 10,
    paddingTop: 10,
    alignItems: 'center',
    backgroundColor: Colors.backgroundLoginColor,
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
    marginLeft: 10,
    marginBottom: 20
  },
  checkbox: {
    alignSelf: "center",
    borderBottomColor: '#ffff',
    color: '#ffff'
  },
  label: {
    margin: 8,
    color: '#ffff'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: deviceWidth
  },
  modalView: {
    backgroundColor: Colors.backgroundLoginColor,
    borderRadius: 20,
    padding: 10,
    width: "auto",
    shadowColor: "#000"
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF"
  },
  buttonClose: {
    backgroundColor: Colors.backgroundLoginColor
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: FontSize.mediumw,
    color: Colors.fontColor2
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: Colors.fontColor2,
    fontSize: FontSize.medium
  }
});
export default SlmnByYearMonth;