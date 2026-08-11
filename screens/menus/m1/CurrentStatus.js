import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Text, View, Image, Button, TextInput, KeyboardAvoidingView, ActivityIndicator, Alert, Platform, BackHandler, StatusBar, TouchableOpacity, Modal, Pressable } from 'react-native';
import CalendarScreen from '@blacksakura013/th-datepicker';
import CheckBox from '@react-native-community/checkbox';
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button';
import { ScrollView, TouchableNativeFeedback } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStateIfMounted } from 'use-state-if-mounted';
import { useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import { Language } from '../../../translations/I18n';
import { FontSize } from '../../../components/FontSizeHelper';
import * as loginActions from '../../../src/actions/loginActions';
import * as registerActions from '../../../src/actions/registerActions';
import * as databaseActions from '../../../src/actions/databaseActions';
import Colors from '../../../src/Colors';
import * as safe_Format from '../../../src/safe_Format';
import { useFetchCurrentStatusNetIncome } from '../../../src/api/useTanstack';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
import tableStyles from '../tableStyles';
const CurrentStatus = ({
  route
}) => {
  const dispatch = useDispatch();
  let arrayResult = [];
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
  const { fetchCurrentStatusNetIncome } = useFetchCurrentStatusNetIncome();
  const [loading, setLoading] = useStateIfMounted(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [arrayObj, setArrayObj] = useState([]);
  const [start_date, setS_date] = useState(new Date());
  const [end_date, setE_date] = useState(new Date());
  // const [sum, setSum] = useState(0)
  const [radioIndex, setRadioIndex] = useState(3);
  const radio_props = [{
    label: Language.t('report.filter.thisYear'),
    value: 'nowyear'
  }, {
    label: Language.t('report.filter.previousMonth'),
    value: 'lastmonth'
  }, {
    label: Language.t('report.filter.thisMonth'),
    value: 'nowmonth'
  }, {
    label: Language.t('report.filter.today'),
    value: 'nowday'
  }];
  const setRadioFilter = (index, val) => {
    const Radio_Obj = safe_Format.Radio_menu(index, val);
    setRadioIndex(Radio_Obj.index);
    if (val != null) {
      setS_date(new Date(Radio_Obj.sdate));
      setE_date(new Date(Radio_Obj.edate));
    }
  };
  useEffect(() => {
    setRadioFilter(3, radio_props[3].value);
  }, []);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState([0]);
  const [arrayObj_last_month, last_monthsetArrayObj] = useState([]);
  const [arrayObj_this_year, this_yearsetArrayObj] = useState([]);
  const [arrayObj_last_year, last_yearsetArrayObj] = useState([]);
  let sum_last_month = [];
  let sum_this_year = [];
  let sum_last_year = [];
  var ser_die = true;
  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);
  useEffect(() => {
    arrayObj_last_month.map(item => void 0);
  }, [sum_last_month]);
  const getSum = obj => {
    let sum = 0;
    for (var i in obj) sum += Number(obj[i]);
    return sum;
  };
  const regisMacAdd = async () => {
    let tempGuid = await safe_Format._fetchGuidLog(databaseReducer.Data.urlser, loginReducer.serviceID, registerReducer.machineNum, loginReducer.userNameED, loginReducer.passwordED);
    await dispatch(loginActions.guid(tempGuid));
    fetchInCome(tempGuid);
  };
  const InCome = async () => {
    setLoading(true);
    await fetchInCome();
    setModalVisible(!modalVisible);
    setArrayObj(arrayResult);
    last_monthsetArrayObj(sum_last_month);
    this_yearsetArrayObj(sum_this_year);
    last_yearsetArrayObj(sum_last_year);
    arrayObj.map(item => {});
  };
  const fetchInCome = async tempGuid => {
    setModalVisible(!modalVisible);
    var eDate = safe_Format.setnewdateF(safe_Format.checkDate(end_date));
    const loginGuid = tempGuid ? tempGuid : loginReducer.guid;
    arrayResult = [];
    sum_last_month = [];
    sum_this_year = [];
    sum_last_year = [];
    try {
      const response = await fetch(databaseReducer.Data.urlser + '/Executive', {
        method: 'POST',
        body: JSON.stringify({
          'BPAPUS-BPAPSV': loginReducer.serviceID,
          'BPAPUS-LOGIN-GUID': loginGuid,
          'BPAPUS-FUNCTION': 'SHOWFINANCERATIO',
          'BPAPUS-PARAM': '{"TO_DATE": ' + eDate + '}',
          'BPAPUS-FILTER': '',
          'BPAPUS-ORDERBY': '',
          'BPAPUS-OFFSET': '0',
          'BPAPUS-FETCH': '0'
        })
      });
      const json = await response.json();
      const responseData = JSON.parse(json.ResponseData);
      if (Number(responseData.RECORD_COUNT) <= 0 || !responseData.SHOWFINANCERATIO) {
        safe_Format.alertNoData();
        return;
      }

      const rows = [];
      for (var i in responseData.SHOWFINANCERATIO) {
        rows.push({
          id: i,
          key: responseData.SHOWFINANCERATIO[i].TDATA_KEY,
          type: responseData.SHOWFINANCERATIO[i].TDATA_TYPE,
          desc: responseData.SHOWFINANCERATIO[i].TDATA_DESC,
          last_month: responseData.SHOWFINANCERATIO[i].TDATA_LAST_MONTH,
          this_year: responseData.SHOWFINANCERATIO[i].TDATA_THIS_YEAR,
          last_year: responseData.SHOWFINANCERATIO[i].TDATA_LAST_YEAR
        });
      }

      const netIncome = await fetchCurrentStatusNetIncome({
        urlser: databaseReducer.Data.urlser,
        serviceID: loginReducer.serviceID,
        loginGuid,
        toDate: eDate,
      });
      const netRowIndex = rows.findIndex(row =>
        String(row.desc ?? '').includes('รายได้สุทธิ'),
      );
      if (netRowIndex >= 0) {
        rows[netRowIndex].last_month = netIncome.lastMonth;
        rows[netRowIndex].last_year = netIncome.lastYear;
        rows[netRowIndex].this_year = netIncome.thisYear;
      }

      for (const row of rows) {
        sum_last_month.push(row.last_month);
        sum_this_year.push(row.this_year);
        sum_last_year.push(row.last_year);
        arrayResult.push(row);
      }
    } catch (error) {
      if (ser_die) {
        ser_die = false;
        regisMacAdd();
      } else {
        let temp_error = 'error_ser.' + 610;
        Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
          text: Language.t('alert.ok'),
          onPress: () => navigation.dispatch(navigation.replace('LoginStackScreen'))
        }]);
      }
      console.error('ERROR at fetchContent >> ' + error);
    } finally {
      setLoading(false);
    }
  };
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
          }}>{Language.t('executiveMenus.m1.currentStatus')}</Text>
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

                <ScrollView horizontal={true}>
                    <View style={tableStyles.table}>
                        <View style={tableStyles.tableHeader}>
                            <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                fontSize: FontSize.medium,
                color: Colors.fontColor2,
                alignSelf: 'center'
              }}>{Language.t('report.detail')}</Text></View>
                            <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                fontSize: FontSize.medium,
                color: Colors.fontColor2,
                alignSelf: 'center'
              }}>{Language.t('report.lastMonth')}</Text></View>
                            <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                fontSize: FontSize.medium,
                color: Colors.fontColor2,
                alignSelf: 'center'
              }}>{Language.t('report.lastYear')}</Text></View>
                            <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                fontSize: FontSize.medium,
                color: Colors.fontColor2,
                alignSelf: 'center'
              }}> ปีนี้ </Text></View>
                        </View>
                        <ScrollView>
                            <KeyboardAvoidingView keyboardVerticalOffset={1}>
                                <TouchableNativeFeedback>
                                    <View>
                                        {arrayObj.map(item => {
                    return <>
                                                    <View style={tableStyles.tableCell}>
                                                        <View width={deviceWidth * 0.4} style={tableStyles.tableCellTitle}><Text style={{
                            fontSize: FontSize.medium,
                            color: Colors.fontColor,
                            alignSelf: 'flex-start'
                          }}>{item.desc}</Text></View>
                                                        <View width={deviceWidth * 0.4} style={tableStyles.tableCellTitle}><Text style={{
                            fontSize: FontSize.medium,
                            color: Colors.fontColor,
                            alignSelf: 'flex-end'
                          }}>{safe_Format.currencyFormat(item.last_month)}</Text></View>
                                                        <View width={deviceWidth * 0.4} style={tableStyles.tableCellTitle}><Text style={{
                            fontSize: FontSize.medium,
                            color: Colors.fontColor,
                            alignSelf: 'flex-end'
                          }}>{safe_Format.currencyFormat(item.last_year)}</Text></View>
                                                        <View width={deviceWidth * 0.4} style={tableStyles.tableCellTitle}><Text style={{
                            fontSize: FontSize.medium,
                            color: Colors.fontColor,
                            alignSelf: 'flex-end'
                          }}>{safe_Format.currencyFormat(item.this_year)}</Text></View>

                                                    </View>
                                                </>;
                  })}

                                    </View>
                                </TouchableNativeFeedback>
                            </KeyboardAvoidingView>
                            {arrayObj.length > 0 ? <View style={tableStyles.tableHeader}>
                                    <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                  fontSize: FontSize.medium,
                  color: Colors.fontColor2,
                  alignSelf: 'flex-start'
                }}>{Language.t('report.total')}</Text></View>
                                    <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                  fontSize: FontSize.medium,
                  color: Colors.fontColor2,
                  alignSelf: 'flex-end'
                }}>{safe_Format.currencyFormat(getSum(arrayObj_last_month))}</Text></View>
                                    <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                  fontSize: FontSize.medium,
                  color: Colors.fontColor2,
                  alignSelf: 'flex-end'
                }}>{safe_Format.currencyFormat(getSum(arrayObj_last_year))}</Text></View>
                                    <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                  fontSize: FontSize.medium,
                  color: Colors.fontColor2,
                  alignSelf: 'flex-end'
                }}> {safe_Format.currencyFormat(getSum(arrayObj_this_year))} </Text></View>
                                </View> : null}
                        </ScrollView>

                    </View>
                </ScrollView>


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
                    }} selectedIndex={radioIndex <= 1 ? radioIndex : 2} onSelect={(index, value) => setRadioFilter(index, value)}>
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
                    }} selectedIndex={radioIndex >= 2 ? radioIndex - 2 : 2} onSelect={(index, value) => setRadioFilter(index + 2, value)}>
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

                                        <Pressable style={[styles.button, styles.buttonClose]} onPress={() => InCome()}>
                                            <Text style={styles.textStyle}>{Language.t('alert.ok')}</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Modal>
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
  table: {
    margin: 0,
    height: deviceHeight - FontSize.large * 2
  },
  tableHeader: {
    flexDirection: 'row'
  },
  tableHeaderTitle: {
    backgroundColor: Colors.backgroundLoginColor,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black'
  },
  tableCell: {
    flexDirection: 'row'
  },
  tableCellTitle: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'black'
  },
  tabbar: {
    height: FontSize.large * 2,
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
    color: Colors.fontColor2
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: Colors.fontColor2,
    fontSize: FontSize.medium
  },
});
export default CurrentStatus;