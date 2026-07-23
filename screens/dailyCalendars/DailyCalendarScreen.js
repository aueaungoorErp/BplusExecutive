import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Text, View, Image, ImageBackground, TextInput, KeyboardAvoidingView, ActivityIndicator, Alert, Platform, BackHandler, StatusBar, ScrollView, TouchableNativeFeedback, TouchableOpacity, Pressable } from 'react-native';
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
import DropdownPickerField, { PICKER_HALF_BOX } from '../../components/DropdownPickerField';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const CALENDAR_DAY_SIZE = 30;
const CalendarDayCell = ({
  day,
  selected,
  hasEvent,
  onSelect,
  isSundayColumn
}) => {
  const dayNum = Number(day);
  const isValid = Number.isFinite(dayNum) && dayNum > 0;
  return <Pressable disabled={!isValid} onPress={() => onSelect(dayNum)} style={{
    width: CALENDAR_DAY_SIZE,
    height: CALENDAR_DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: selected ? Colors.itemColor : null
  }}>
      <View style={{
      alignItems: 'center',
      justifyContent: 'center'
    }}>
        {isValid ? <Text style={{
        color: selected ? Colors.backgroundColor : isSundayColumn ? 'red' : Colors.fontColor
      }}>
            {dayNum}
          </Text> : null}
        {isValid && hasEvent ? <Image style={{
        width: 5,
        height: 5
      }} resizeMode="contain" source={require('../../img/iconsMenu/record.png')} /> : null}
      </View>
    </Pressable>;
};
const DailyCalendarScreen = () => {
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
  const [loading, setLoading] = useStateIfMounted(false);
  const [loading_backG, setLoading_backG] = useStateIfMounted(true);
  const [ser_die, setSer_die] = useStateIfMounted(true);
  var daily = new Date();
  const [dateIndex, set_DateIndex] = useState(daily.getDate());
  const [monthIndex, set_MonthIndex] = useState(daily.getMonth());
  const [yearIndex, set_yearIndex] = useState(daily.getFullYear() + 543);
  const [menu1, set_menu1] = useState(false);
  const [menu2, set_menu2] = useState(false);
  const [menu3, set_menu3] = useState(false);
  const [menu4, set_menu4] = useState(false);
  const [poppoint, set_poppoint] = useState([]);
  const [mappoint, set_mappoint] = useState([]);
  const [rarchqDue, set_rarchqDue] = useState([]);
  const [rapDue, set_rapDue] = useState([]);
  const [Statedaily, set_Statedaily] = useState([]);
  const image = '../../images/UI/Asset35.png';
  const closeLoading = () => {
    setLoading(false);
  };
  const letsLoading = () => {
    setLoading(true);
  };
  useEffect(() => {
    get_Point(loginReducer.guid);
    refreshScreen();
  }, [loginReducer?.guid]);
  useEffect(() => {
    get_Point(loginReducer.guid);
    refreshScreen();
  }, [monthIndex]);
  useEffect(() => {
    get_Point(loginReducer.guid);
    refreshScreen();
  }, [yearIndex]);
  useEffect(() => {
    refreshScreen();
  }, [poppoint, mappoint, rarchqDue, rapDue, monthIndex, yearIndex]);
  useEffect(() => {
    const monthDays = (safe_Format.Day_mont(Number(yearIndex), Number(monthIndex)) || []).filter(day => {
      const dayNum = Number(day);
      return Number.isFinite(dayNum) && dayNum > 0;
    });
    const maxDay = monthDays.length > 0 ? Number(monthDays[monthDays.length - 1]) : 1;
    set_DateIndex(prev => prev > maxDay ? maxDay : prev);
  }, [monthIndex, yearIndex]);
  const formatCalendarDate = rawDay => {
    const dayNum = Number(rawDay);
    const monthNum = Number(monthIndex) + 1;
    const yearNum = Number(yearIndex) - 543;
    if (!Number.isFinite(dayNum) || dayNum <= 0) {
      return '';
    }
    return `${yearNum}${String(monthNum).padStart(2, '0')}${String(dayNum).padStart(2, '0')}`;
  };
  const getMonthDays = () => (safe_Format.Day_mont(Number(yearIndex), Number(monthIndex)) || []).filter(day => {
    const dayNum = Number(day);
    return Number.isFinite(dayNum) && dayNum > 0;
  });
  const fulldate = () => {
    return formatCalendarDate(dateIndex);
  };
  const fetchdate = d => {
    return formatCalendarDate(d);
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
        setSer_die(true);
        dispatch(loginActions.guid(responseData.BPAPUS_GUID));
        get_Point(responseData.BPAPUS_GUID);
        refreshScreen();
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
        Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.internetError') + '1', [{
          text: Language.t('alert.ok'),
          onPress: () => void 0
        }]);
      }
    });
    setLoading(false);
  };
  const get_Point = async tempGuid => {
    set_Statedaily([]);
    letsLoading();
    if (tempGuid) {
      await dispatch(loginActions.guid(tempGuid));
      await get_poppoint(tempGuid);
      await get_mappoint(tempGuid);
      await get_rarchqDue(tempGuid);
      await get_rapDue(tempGuid);
      closeLoading();
    } else {
      await get_poppoint();
      await get_mappoint();
      await get_rarchqDue();
      await get_rapDue();
      closeLoading();
    }
  };
  const refreshScreen = async () => {
    await getDay_Calendar();
  };
  const getDay_Calendar = () => {
    var Day_Calendar = [];
    var safe_Day_Calendar = safe_Format.Day_Calendar(Number(yearIndex), Number(monthIndex));
    for (var i in safe_Day_Calendar) {
      for (var j in safe_Day_Calendar[i]) {
        var temp_Day_Calendar = formatCalendarDate(safe_Day_Calendar[i][j]);
        if (temp_Day_Calendar && poppoint.SHOWCALENDARPOAPPOINT && poppoint.SHOWCALENDARPOAPPOINT.filter(item => {
          return item.TRH_SHIP_DATE == temp_Day_Calendar;
        }).length > 0 || temp_Day_Calendar && mappoint.SHOWCALENDARBKAPPOINT && mappoint.SHOWCALENDARBKAPPOINT.filter(item => {
          return item.TRH_SHIP_DATE == temp_Day_Calendar;
        }).length > 0 || temp_Day_Calendar && rarchqDue.SHOWCALENDARARDUE && rarchqDue.SHOWCALENDARARDUE.filter(item => {
          return item.ARD_DUE_DA == temp_Day_Calendar;
        }).length > 0 || temp_Day_Calendar && rapDue.SHOWCALENDARAPDUE && rapDue.SHOWCALENDARAPDUE.filter(item => {
          return item.APD_DUE_DA == temp_Day_Calendar;
        }).length > 0) {
          let obj_Day_Calendar = {
            date: safe_Day_Calendar[i][j],
            stu: true
          };
          Day_Calendar.push(obj_Day_Calendar);
        } else {
          let obj_Day_Calendar = {
            date: safe_Day_Calendar[i][j],
            stu: false
          };
          Day_Calendar.push(obj_Day_Calendar);
        }
      }
    }
    set_Statedaily(Day_Calendar);
    // safe_Day_Calendar.map((i) => {
    //     i.map((j) => {
    //         Day_Calendar.map((item) => {
    //         }
    //         )
    //     })
    // })
  };
  const get_poppoint = async tempGuid => {
    const monthDays = getMonthDays();
    if (monthDays.length === 0) {
      set_poppoint([]);
      return;
    }
    await fetch(databaseReducer.Data.urlser + '/Calendar', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'SHOWCALENDARPOAPPOINT',
        'BPAPUS-PARAM': '{"FROM_DATE": ' + fetchdate(monthDays[0]) + ',"TO_DATE": ' + fetchdate(monthDays[monthDays.length - 1]) + '}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(json => {
      let responseData = JSON.parse(json.ResponseData);
      set_poppoint(responseData);
      setSer_die(true);
    }).catch(async error => {
      if (ser_die) {
        setSer_die(false);
        await regisMacAdd();
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
  const get_mappoint = async tempGuid => {
    const monthDays = getMonthDays();
    if (monthDays.length === 0) {
      set_mappoint([]);
      return;
    }
    await fetch(databaseReducer.Data.urlser + '/Calendar', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'SHOWCALENDARBKAPPOINT',
        'BPAPUS-PARAM': '{"FROM_DATE": ' + fetchdate(monthDays[0]) + ',"TO_DATE": ' + fetchdate(monthDays[monthDays.length - 1]) + '}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(json => {
      let responseData = JSON.parse(json.ResponseData);
      set_mappoint(responseData);
      setSer_die(true);
    }).catch(async error => {
      console.error('ERROR at fetchContent >> ' + error);
    });
  };
  const get_rarchqDue = async tempGuid => {
    const monthDays = getMonthDays();
    if (monthDays.length === 0) {
      set_rarchqDue([]);
      return;
    }
    await fetch(databaseReducer.Data.urlser + '/Calendar', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'SHOWCALENDARARDUE',
        'BPAPUS-PARAM': '{"FROM_DATE": ' + fetchdate(monthDays[0]) + ',"TO_DATE": ' + fetchdate(monthDays[monthDays.length - 1]) + '}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(json => {
      let responseData = JSON.parse(json.ResponseData);
      set_rarchqDue(responseData);
      setSer_die(true);
    }).catch(async error => {
      console.error('ERROR at fetchContent >> ' + error);
    });
  };
  const get_rapDue = async tempGuid => {
    const monthDays = getMonthDays();
    if (monthDays.length === 0) {
      set_rapDue([]);
      return;
    }
    await fetch(databaseReducer.Data.urlser + '/Calendar', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'SHOWCALENDARAPDUE',
        'BPAPUS-PARAM': '{"FROM_DATE": ' + fetchdate(monthDays[0]) + ',"TO_DATE": ' + fetchdate(monthDays[monthDays.length - 1]) + '}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(json => {
      let responseData = JSON.parse(json.ResponseData);
      set_rapDue(responseData);
      setSer_die(true);
    }).catch(async error => {
      console.error('ERROR at fetchContent >> ' + error);
    });
  };
  return <SafeAreaView style={container1}>
      <StatusBar hidden={true} />
      <ImageBackground source={require(image)} onLoadEnd={() => {
      setLoading_backG(false);
    }} resizeMode="cover" style={styles.image}>
        {!loading_backG ? <>
            <View>
              <Image style={topImage} source={require('../../images/UI/Asset43.png')} />
            </View>

            <ScrollView>
              <View style={container1}>
                <View style={{
              paddingHorizontal: 12,
              paddingVertical: 20,
              marginTop: 0
            }}>
                  <View style={{
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'stretch',
                gap: 8
              }}>
                    <DropdownPickerField selectedLabel={String(yearIndex)} pickerWidth="100%" boxStyle={PICKER_HALF_BOX} selectedValue={yearIndex} enabled={true} onValueChange={itemValue => set_yearIndex(Number(itemValue))}>
                      {safe_Format.state_years.map((obj, index) => <Picker.Item key={`year-${obj}-${index}`} color={Colors.itemColor} style={{
                    backgroundColor: Colors.backgroundColorSecondary
                  }} label={obj.toString()} value={obj} />)}
                    </DropdownPickerField>
                    <DropdownPickerField selectedLabel={safe_Format.months_th[monthIndex]} pickerWidth="100%" boxStyle={PICKER_HALF_BOX} selectedValue={monthIndex} enabled={true} onValueChange={itemValue => set_MonthIndex(Number(itemValue))}>
                      {safe_Format.months_th.map((obj, index) => <Picker.Item key={`month-${index}-${obj}`} color={Colors.itemColor} style={{
                    backgroundColor: Colors.backgroundColorSecondary
                  }} label={obj} value={index} />)}
                    </DropdownPickerField>
                  </View>
                  <View>
                    <Text style={{
                  fontWeight: 'bold',
                  fontSize: FontSize.medium,
                  color: Colors.fontColor
                }}>
                      {safe_Format.months_th[monthIndex]}
                    </Text>
                  </View>
                  <View>
                    <View style={{
                  backgroundColor: Colors.backgroundLoginColorSecondary,
                  flexDirection: 'column',
                  margin: 10,
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
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}>
                        <View style={{
                      width: 30,
                      height: 30,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 15,
                      backgroundColor: null
                    }}>
                          <Text style={{
                        color: 'red',
                        fontWeight: 'bold'
                      }}>
                            {'อา'}
                          </Text>
                        </View>
                        <View style={{
                      width: 30,
                      height: 30,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 15,
                      backgroundColor: null
                    }}>
                          <Text style={{
                        color: Colors.fontColor,
                        fontWeight: 'bold'
                      }}>
                            {'จ'}
                          </Text>
                        </View>
                        <View style={{
                      width: 30,
                      height: 30,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 15,
                      backgroundColor: null
                    }}>
                          <Text style={{
                        color: Colors.fontColor,
                        fontWeight: 'bold'
                      }}>
                            {'อ'}
                          </Text>
                        </View>
                        <View style={{
                      width: 30,
                      height: 30,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 15,
                      backgroundColor: null
                    }}>
                          <Text style={{
                        color: Colors.fontColor,
                        fontWeight: 'bold'
                      }}>
                            {'พ'}
                          </Text>
                        </View>
                        <View style={{
                      width: 30,
                      height: 30,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 15,
                      backgroundColor: null
                    }}>
                          <Text style={{
                        color: Colors.fontColor,
                        fontWeight: 'bold'
                      }}>
                            {'พฤ'}
                          </Text>
                        </View>
                        <View style={{
                      width: 30,
                      height: 30,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 15,
                      backgroundColor: null
                    }}>
                          <Text style={{
                        color: Colors.fontColor,
                        fontWeight: 'bold'
                      }}>
                            {'ศ'}
                          </Text>
                        </View>
                        <View style={{
                      width: 30,
                      height: 30,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 15,
                      backgroundColor: null
                    }}>
                          <Text style={{
                        color: Colors.fontColor,
                        fontWeight: 'bold'
                      }}>
                            {'ส'}
                          </Text>
                        </View>
                      </View>
                      {safe_Format.Day_Calendar(Number(yearIndex), Number(monthIndex)).map((item, rowIndex) => <View key={`calendar-row-${yearIndex}-${monthIndex}-${rowIndex}`} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 4
                  }}>
                            {item.map((day, colIndex) => <CalendarDayCell key={`day-${rowIndex}-${colIndex}`} day={day} selected={day == dateIndex} isSundayColumn={colIndex === 0} hasEvent={day > 0 && Statedaily && Statedaily.filter(Stated => Stated.date == day && Stated.stu == true).length > 0} onSelect={set_DateIndex} />)}
                          </View>)}
                    </View>

                    <View>
                      <View style={{
                    borderBottomColor: 'black',
                    borderBottomWidth: 1,
                    padding: 10
                  }}>
                        <Text style={{
                      fontSize: FontSize.medium,
                      color: 'black'
                    }}>{`รายละเอียดวันที่ ${dateIndex} ${safe_Format.months_th[monthIndex]} ${yearIndex}`}</Text>
                      </View>
                      {/* นัดรับ */}
                      <TouchableNativeFeedback onPress={() => poppoint.SHOWCALENDARPOAPPOINT && poppoint.SHOWCALENDARPOAPPOINT.filter(item => {
                    return item.TRH_SHIP_DATE == fulldate();
                  }).length > 0 ? navigation.navigate('DailyCalendarInfomation', {
                    header: 'นัดรับ',
                    person: 'เจ้าหนี้',
                    poppoint: poppoint.SHOWCALENDARPOAPPOINT && poppoint.SHOWCALENDARPOAPPOINT.filter(item => {
                      return item.TRH_SHIP_DATE == fulldate();
                    })
                  }) : Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.errorDetail'), [{
                    text: Language.t('alert.ok'),
                    onPress: () => void 0
                  }])}>
                        <View>
                          <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 10
                      }}>
                            <View style={{
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}>
                              <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black'
                          }}>{`> นัดรับ`}</Text>
                            </View>
                            <View>
                              <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black'
                          }}>{`(${poppoint.SHOWCALENDARPOAPPOINT && poppoint.SHOWCALENDARPOAPPOINT.filter(item => {
                              return item.TRH_SHIP_DATE == fulldate();
                            }).length > 0 ? poppoint.SHOWCALENDARPOAPPOINT.filter(item => {
                              return item.TRH_SHIP_DATE == fulldate();
                            }).length : 0})`}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableNativeFeedback>

                      {/* นัดส่ง */}

                      <TouchableNativeFeedback onPress={() => mappoint.SHOWCALENDARBKAPPOINT && mappoint.SHOWCALENDARBKAPPOINT.filter(item => {
                    return item.TRH_SHIP_DATE == fulldate();
                  }).length > 0 ? navigation.navigate('DailyCalendarInfomation', {
                    header: 'นัดส่ง',
                    person: 'ลูกหนี้',
                    mappoint: mappoint.SHOWCALENDARBKAPPOINT && mappoint.SHOWCALENDARBKAPPOINT.filter(item => {
                      return item.TRH_SHIP_DATE == fulldate();
                    })
                  }) : Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.errorDetail'), [{
                    text: Language.t('alert.ok'),
                    onPress: () => void 0
                  }])}>
                        <View>
                          <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 10
                      }}>
                            <View style={{
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}>
                              <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black'
                          }}>{`> นัดส่ง`}</Text>
                            </View>
                            <View>
                              <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black'
                          }}>{`(${mappoint.SHOWCALENDARBKAPPOINT && mappoint.SHOWCALENDARBKAPPOINT.filter(item => {
                              return item.TRH_SHIP_DATE == fulldate();
                            }).length > 0 ? mappoint.SHOWCALENDARBKAPPOINT.filter(item => {
                              return item.TRH_SHIP_DATE == fulldate();
                            }).length : 0})`}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableNativeFeedback>

                      {/* รับชำระ */}
                      <TouchableNativeFeedback onPress={() => rarchqDue.SHOWCALENDARARDUE && rarchqDue.SHOWCALENDARARDUE.filter(item => {
                    return item.ARD_DUE_DA == fulldate();
                  }).length > 0 ? navigation.navigate('DailyCalendarInfomation', {
                    header: 'นัดรับชำระ',
                    person: 'ลูกหนี้',
                    rarchqDue: rarchqDue.SHOWCALENDARARDUE && rarchqDue.SHOWCALENDARARDUE.filter(item => {
                      return item.ARD_DUE_DA == fulldate();
                    })
                  }) : Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.errorDetail'), [{
                    text: Language.t('alert.ok'),
                    onPress: () => void 0
                  }])}>
                        <View>
                          <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 10
                      }}>
                            <View style={{
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}>
                              <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black'
                          }}>{`> นัดรับชำระ`}</Text>
                            </View>
                            <View>
                              <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black'
                          }}>{`(${rarchqDue.SHOWCALENDARARDUE && rarchqDue.SHOWCALENDARARDUE.filter(item => {
                              return item.ARD_DUE_DA == fulldate();
                            }).length > 0 ? rarchqDue.SHOWCALENDARARDUE.filter(item => {
                              return item.ARD_DUE_DA == fulldate();
                            }).length : 0})`}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableNativeFeedback>

                      {/* จ่ายชำระ */}
                      <TouchableNativeFeedback onPress={() => rapDue.SHOWCALENDARAPDUE && rapDue.SHOWCALENDARAPDUE.filter(item => {
                    return item.APD_DUE_DA == fulldate();
                  }).length > 0 ? navigation.navigate('DailyCalendarInfomation', {
                    header: 'นัดจ่ายชำระ',
                    person: 'เจ้าหนี้',
                    rapDue: rapDue.SHOWCALENDARAPDUE && rapDue.SHOWCALENDARAPDUE.filter(item => {
                      return item.APD_DUE_DA == fulldate();
                    })
                  }) : Alert.alert(Language.t('alert.errorTitle'), Language.t('alert.errorDetail'), [{
                    text: Language.t('alert.ok'),
                    onPress: () => void 0
                  }])}>
                        <View>
                          <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 10
                      }}>
                            <View style={{
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}>
                              <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black'
                          }}>{`> นัดจ่ายชำระ`}</Text>
                            </View>
                            <View>
                              <Text style={{
                            fontSize: FontSize.medium,
                            color: 'black'
                          }}>{`(${rapDue.SHOWCALENDARAPDUE && rapDue.SHOWCALENDARAPDUE.filter(item => {
                              return item.APD_DUE_DA == fulldate();
                            }).length > 0 ? rapDue.SHOWCALENDARAPDUE.filter(item => {
                              return item.APD_DUE_DA == fulldate();
                            }).length : 0})`}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableNativeFeedback>
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
                          {'ย้อนกลับ'}
                        </Text>
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                </View>
              </View>
            </ScrollView>
          </> : <View style={{
        width: deviceWidth,
        height: deviceHeight,
        opacity: 0.5,
        backgroundColor: null,
        alignSelf: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        position: 'absolute'
      }}></View>}

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
    flex: 1
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
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 20
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
export default DailyCalendarScreen;