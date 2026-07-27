import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Dimensions, Text, View, Image, Button, TextInput, KeyboardAvoidingView, ActivityIndicator, Alert, Platform, BackHandler, StatusBar, TouchableOpacity, Pressable } from 'react-native';
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
import { fontSize, right } from 'styled-system';
import * as safe_Format from '../../../src/safe_Format';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
/** Label + date picker on one row inside the search modal sheet. */
const DATE_LABEL_WIDTH = 72;
const DATE_LABEL_GAP = 24;
/** modal sheet inset + modalView/inner box horizontal padding */
const DATE_ROW_HORIZONTAL_INSET =
  32 + 10 + 10 + 10 + 10;
const DATE_PICKER_WIDTH_INITIAL = Math.max(
  120,
  deviceWidth - DATE_ROW_HORIZONTAL_INSET - DATE_LABEL_WIDTH - DATE_LABEL_GAP,
);
import tableStyles from '../tableStyles';

const incomeCalendarModel = {
  backgroundColor: Colors.backgroundColor,
  buttonSuccess: {
    backgroundColor: Colors.itemColor,
  },
  pickItem: {
    color: Colors.itemColor,
  },
};

const incomeCalendarIcon = {
  color: Colors.primaryColor,
};

const ShowInCome = ({
  route
}) => {
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
  useEffect(() => {
    var newsum = 0;
    for (var i in arrayObj) {
      newsum += Number(arrayObj[i].sellAmount);
    }
    setSum(newsum);
  }, [arrayObj]);
  const normalizePickerDate = value => safe_Format.checkDate(value);

  const [datePickerWidth, setDatePickerWidth] = useState(
    DATE_PICKER_WIDTH_INITIAL,
  );

  const onDatePickerLayout = useCallback(event => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setDatePickerWidth(prev => (prev === nextWidth ? prev : nextWidth));
    }
  }, []);

  const calendarScreenProps = useMemo(
    () => ({
      language: 'th',
      era: 'be',
      format: 'DD/MM/YYYY',
      borderColor: Colors.primaryColor,
      linkTodateColor: Colors.itemColor,
      calendarModel: incomeCalendarModel,
      borderWidth: 1,
      icon: incomeCalendarIcon,
      fontSize: FontSize.medium,
      fontColor: Colors.fontColor,
      width: datePickerWidth,
      borderRadius: 10,
    }),
    [datePickerWidth],
  );

  const onChangeStartDate = vel => {
    const nextStart = normalizePickerDate(vel);
    const currentEnd = normalizePickerDate(end_date);
    setS_date(nextStart);
    if (nextStart.getTime() > currentEnd.getTime()) {
      setE_date(nextStart);
    }
  };

  const onChangeEndDate = vel => {
    const nextEnd = normalizePickerDate(vel);
    const currentStart = normalizePickerDate(start_date);
    setE_date(nextEnd);
    if (nextEnd.getTime() < currentStart.getTime()) {
      setS_date(nextEnd);
    }
  };

  const regisMacAdd = async () => {
    let tempGuid = await safe_Format._fetchGuidLog(databaseReducer.Data.urlser, loginReducer.serviceID, registerReducer.machineNum, loginReducer.userNameED, loginReducer.passwordED);
    await dispatch(loginActions.guid(tempGuid));
    fetchInCome(tempGuid);
  };
  const InCome = async () => {
    const fromDate = normalizePickerDate(start_date);
    const toDate = normalizePickerDate(end_date);
    if (fromDate.getTime() > toDate.getTime()) {
      Alert.alert(
        Language.t('alert.errorTitle'),
        Language.t('report.dateRangeInvalid'),
        [{ text: Language.t('alert.ok') }],
      );
      return;
    }
    setS_date(fromDate);
    setE_date(toDate);
    setLoading(true);
    setModalVisible(false);
    await fetchInCome(undefined, fromDate, toDate);
  };
  const fetchInCome = async (tempGuid, fromDateArg, toDateArg) => {
    const fromDate = normalizePickerDate(fromDateArg ?? start_date);
    const toDate = normalizePickerDate(toDateArg ?? end_date);
    var sDate = safe_Format.setnewdateF(fromDate);
    var eDate = safe_Format.setnewdateF(toDate);
    const requestBody = {
      'BPAPUS-BPAPSV': loginReducer.serviceID,
      'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
      'BPAPUS-FUNCTION': 'SHOWINCOMEBYYEAR',
      'BPAPUS-PARAM': '{"FROM_DATE": "' + sDate + '","TO_DATE": "' + eDate + '"}',
      'BPAPUS-FILTER': '',
      'BPAPUS-ORDERBY': '',
      'BPAPUS-OFFSET': '0',
      'BPAPUS-FETCH': '0'
    };
    await fetch(databaseReducer.Data.urlser + '/Executive', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    }).then(response => response.json()).then(json => {
      let responseData = JSON.parse(json.ResponseData);
      const nextRows = [];
      if (responseData.RECORD_COUNT > 0) {
        for (var i in responseData.SHOWINCOMEBYYEAR) {
          nextRows.push({
            id: i,
            year: responseData.SHOWINCOMEBYYEAR[i].SHOWYEAR,
            month: responseData.SHOWINCOMEBYYEAR[i].SHOWMONTH,
            sellAmount: responseData.SHOWINCOMEBYYEAR[i].SHOWSELLAMOUNT
          });
        }
      } else {
        safe_Format.alertNoData();
      }
      setArrayObj(nextRows);
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
      setS_date(normalizePickerDate(Radio_Obj.sdate));
      setE_date(normalizePickerDate(Radio_Obj.edate));
    }
    setRadioIndex2(2);
    setRadioIndex3(2);
  };
  const setRadio_menu2 = (index, val) => {
    const Radio_Obj = safe_Format.Radio_menu(index, val);
    setRadioIndex2(Radio_Obj.index);
    if (val != null) {
      setS_date(normalizePickerDate(Radio_Obj.sdate));
      setE_date(normalizePickerDate(Radio_Obj.edate));
    }
    setRadioIndex1(2);
    setRadioIndex3(2);
  };
  const setRadio_menu3 = (index, val) => {
    const Radio_Obj = safe_Format.Radio_menu(index, val);
    setRadioIndex3(Radio_Obj.index);
    if (val != null) {
      setS_date(normalizePickerDate(Radio_Obj.sdate));
      setE_date(normalizePickerDate(Radio_Obj.edate));
    }
    setRadioIndex1(2);
    setRadioIndex2(2);
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
          }}>{Language.t('executiveMenus.m1.showIncome')}</Text>
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
                  }}> {Language.t('report.year')}</Text></View>
                                    <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                    fontSize: FontSize.medium,
                    color: Colors.fontColor2,
                    alignSelf: 'center'
                  }}>{Language.t('report.month')}</Text></View>
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
                                                {arrayObj.map((item, index) => {
                        return <View key={`${item.id ?? index}-${item.year}-${item.month}`} style={tableStyles.tableCell}>
                                                            <View width={deviceWidth * 0.2} style={tableStyles.tableCellTitle}><Text style={{
                              fontSize: FontSize.medium,
                              color: Colors.fontColor,
                              alignSelf: 'flex-start'
                            }}>{item.year}</Text></View>
                                                            <View width={deviceWidth * 0.4} style={tableStyles.tableCellTitle}><Text style={{
                              fontSize: FontSize.medium,
                              color: Colors.fontColor,
                              alignSelf: 'flex-start'
                            }}>{safe_Format.monthFormat(item.month)}</Text></View>
                                                            <View width={deviceWidth * 0.4} style={tableStyles.tableCellTitle}><Text style={{
                              fontSize: FontSize.medium,
                              color: Colors.fontColor,
                              alignSelf: 'flex-end'
                            }}>{safe_Format.currencyFormat(item.sellAmount)}</Text></View>
                                                        </View>;
                      })}

                                            </View>
                                        </TouchableNativeFeedback>
                                    </KeyboardAvoidingView>
                                    {arrayObj.length > 0 ? <View style={tableStyles.tableHeader}>
                                        <View width={deviceWidth * 0.2} style={tableStyles.tableHeaderTitle}><Text style={{
                      fontSize: FontSize.medium,
                      color: Colors.fontColor2,
                      alignSelf: 'flex-start'
                    }}>{Language.t('report.total')}</Text></View>

                                        <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                      fontSize: FontSize.medium,
                      color: Colors.fontColor2,
                      alignSelf: 'flex-end'
                    }}></Text></View>
                                        <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}><Text style={{
                      fontSize: FontSize.medium,
                      color: Colors.fontColor2,
                      alignSelf: 'flex-end'
                    }}> {safe_Format.currencyFormat(sum)} </Text></View>
                                    </View> : null}
                                </ScrollView>


                            </View>
                        </ScrollView>
                    </View>
                </View>
            </SafeAreaView>

            {modalVisible ? (
              <View style={styles.dateModalBackdrop} pointerEvents="box-none">
                <Pressable
                  style={styles.dateModalBackdropPress}
                  onPress={() => setModalVisible(false)}
                />
                <View style={styles.dateModalSheet}>
                  <View style={styles.modalView}>
                                        <View style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row'
                  }}>
                                            <View width={20}></View>
                                            <Text style={styles.modalText}>{Language.t('report.selectSearch')}</Text>
                                            <Pressable style={{
                      alignItems: 'flex-end'
                    }} onPress={() => setModalVisible(false)}>
                                                <Image style={{
                        width: FontSize.large,
                        height: FontSize.large
                      }} resizeMode="contain" source={require('../../../img/iconsMenu/cancel.png')} />
                                            </Pressable>
                                        </View>
                                        <View style={{
                    backgroundColor: Colors.fontColor2,
                    borderRadius: 20,
                    padding: 10,
                    width: '100%',
                    overflow: 'hidden',
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
                                            <View style={styles.dateFieldRow}>
                                                <Text style={styles.dateFieldLabel} numberOfLines={1}>{Language.t('report.from')}</Text>
                                                <View
                                                  style={styles.dateFieldPicker}
                                                  onLayout={onDatePickerLayout}
                                                >
                                                  <CalendarScreen
                                                    value={start_date}
                                                    onChange={onChangeStartDate}
                                                    {...calendarScreenProps}
                                                  />
                                                </View>
                                            </View>
                                            <View style={styles.dateFieldRow}>
                                                <Text style={styles.dateFieldLabel} numberOfLines={1}>{Language.t('report.to')}</Text>
                                                <View style={styles.dateFieldPicker}>
                                                  <CalendarScreen
                                                    value={end_date}
                                                    onChange={onChangeEndDate}
                                                    {...calendarScreenProps}
                                                  />
                                                </View>
                                            </View>
                                            <Pressable style={[styles.button, styles.buttonClose]} onPress={() => InCome()}>
                                                <Text style={styles.textStyle}>{Language.t('alert.ok')}</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                </View>
              </View>
            ) : null}

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
  dateModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: deviceWidth,
    height: deviceHeight,
    zIndex: 1000,
    elevation: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 16,
  },
  dateModalBackdropPress: {
    ...StyleSheet.absoluteFillObject
  },
  dateModalSheet: {
    width: '100%',
    maxWidth: deviceWidth - 32,
    zIndex: 1001,
    elevation: 1001
  },
  dateFieldRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateFieldLabel: {
    width: DATE_LABEL_WIDTH,
    flexShrink: 0,
    fontSize: FontSize.medium,
    color: 'black',
    fontWeight: 'bold',
    marginRight: DATE_LABEL_GAP,
    textAlign: 'left',
  },
  dateFieldPicker: {
    flex: 1,
    minWidth: 0,
  },
  modalView: {
    backgroundColor: Colors.backgroundLoginColor,
    borderRadius: 20,
    padding: 10,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
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
export default ShowInCome;