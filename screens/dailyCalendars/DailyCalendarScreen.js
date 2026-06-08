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

const DailyCalendarScreen = () => {
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
    //backsakura013
  }, []);

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
  const setMonthState = (itemValue, itemIndex) => {
    set_MonthIndex(itemIndex);
  };

  useEffect(() => {
    get_Point(loginReducer.guid);
    refreshScreen();
  }, [loginReducer?.guid]);

  useEffect(() => {
    console.log(`monthIndex ${monthIndex}`);
    get_Point(loginReducer.guid);
    refreshScreen();
  }, [monthIndex]);
  useEffect(() => {
    console.log(fulldate());
    refreshScreen();
  }, [loading]);
  useEffect(() => {
    console.log(`yearIndex ${yearIndex}`);
    get_Point(loginReducer.guid);
    refreshScreen();
  }, [yearIndex]);

  useEffect(() => {
    refreshScreen();
  }, [poppoint || mappoint || rarchqDue || rapDue || Statedaily]);
  const formatCalendarDate = rawDay => {
    const dayNum = Number(rawDay);
    const monthNum = monthIndex + 1;
    const yearNum = yearIndex - 543;

    if (!Number.isFinite(dayNum) || dayNum <= 0) {
      return '';
    }

    return `${yearNum}${String(monthNum).padStart(2, '0')}${String(dayNum).padStart(2, '0')}`;
  };

  const getMonthDays = () =>
    (safe_Format.Day_mont(yearIndex, monthIndex) || []).filter(day => {
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
        'BPAPUS-PARAM':
          '{"BPAPUS-MACHINE":"' +
          registerReducer.machineNum +
          '","BPAPUS-CNTRY-CODE": "66","BPAPUS-MOBILE": "mobile login"}',
      }),
    })
      .then(response => response.json())
      .then(async json => {
        if (json.ResponseCode == 200 && json.ReasonString == 'Completed') {
          await _fetchGuidLog();
        } else {
          console.log('Function Parameter Required');
          let temp_error = 'error_ser.' + json.ResponseCode;
          console.log('>> ', temp_error);
          Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [
            {
              text: Language.t('alert.ok'),
              onPress: () => console.log('OK Pressed'),
            },
          ]);
        }
      })
      .catch(error => {
        console.log('ERROR at regisMacAdd ' + error);
        console.log('http', databaseReducer.Data.urlser);
        if (databaseReducer.Data.urlser == '') {
          Alert.alert(
            Language.t('alert.errorTitle'),
            Language.t('selectBase.error'),
            [
              {
                text: Language.t('alert.ok'),
                onPress: () => console.log('OK Pressed'),
              },
            ],
          );
        } else {
          Alert.alert(
            Language.t('alert.errorTitle'),
            Language.t('alert.internetError'),
            [
              {
                text: Language.t('alert.ok'),
                onPress: () => console.log('OK Pressed'),
              },
            ],
          );
        }
      });
  };

  const _fetchGuidLog = async () => {
    console.log('FETCH GUID LOGIN ', databaseReducer.Data.urlser);
    await fetch(databaseReducer.Data.urlser + '/DevUsers', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': '',
        'BPAPUS-FUNCTION': 'Login',
        'BPAPUS-PARAM':
          '{"BPAPUS-MACHINE": "' +
          registerReducer.machineNum +
          '","BPAPUS-USERID": "' +
          loginReducer.userNameED +
          '","BPAPUS-PASSWORD": "' +
          loginReducer.passwordED +
          '"}',
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json && json.ResponseCode == '635') {
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
          console.log('NOT FOUND MEMBER');
        } else if (json && json.ResponseCode == '629') {
          Alert.alert(
            Language.t('alert.errorTitle'),
            'Function Parameter Required',
            [
              {
                text: Language.t('alert.ok'),
                onPress: () => console.log('OK Pressed'),
              },
            ],
          );
        } else if (json && json.ResponseCode == '200') {
          let responseData = JSON.parse(json.ResponseData);
          setSer_die(true);
          dispatch(loginActions.guid(responseData.BPAPUS_GUID));
          get_Point(responseData.BPAPUS_GUID);
          refreshScreen();
        } else {
          console.log('Function Parameter Required');
          let temp_error = 'error_ser.' + json.ResponseCode;
          console.log('>> ', temp_error);
          Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [
            {
              text: Language.t('alert.ok'),
              onPress: () => console.log('OK Pressed'),
            },
          ]);
        }
      })
      .catch(error => {
        console.error('ERROR at _fetchGuidLogin' + error);
        if (databaseReducer.Data.urlser == '') {
          Alert.alert(
            Language.t('alert.errorTitle'),
            Language.t('selectBase.error'),
            [
              {
                text: Language.t('alert.ok'),
                onPress: () => console.log('OK Pressed'),
              },
            ],
          );
        } else {
          Alert.alert(
            Language.t('alert.errorTitle'),
            Language.t('alert.internetError') + '1',
            [
              {
                text: Language.t('alert.ok'),
                onPress: () => console.log('OK Pressed'),
              },
            ],
          );
        }
      });
    setLoading(false);
  };

  const get_Point = async tempGuid => {
    set_Statedaily([]);
    letsLoading();
    safe_Format.Day_Calendar(yearIndex, monthIndex).map((item, index) => {
      return set_Statedaily();
    });
    if (tempGuid) {
      console.log(ser_die);
      console.log('tempGuid > ' + tempGuid);
      console.log('guid > ' + loginReducer.guid);
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
    var safe_Day_Calendar = safe_Format.Day_Calendar(yearIndex, monthIndex);
    for (var i in safe_Day_Calendar) {
      for (var j in safe_Day_Calendar[i]) {
        var temp_Day_Calendar = formatCalendarDate(safe_Day_Calendar[i][j]);
        if (
          (temp_Day_Calendar &&
            poppoint.SHOWCALENDARPOAPPOINT &&
            poppoint.SHOWCALENDARPOAPPOINT.filter(item => {
              return item.TRH_SHIP_DATE == temp_Day_Calendar;
            }).length > 0) ||
          (temp_Day_Calendar &&
            mappoint.SHOWCALENDARBKAPPOINT &&
            mappoint.SHOWCALENDARBKAPPOINT.filter(item => {
              return item.TRH_SHIP_DATE == temp_Day_Calendar;
            }).length > 0) ||
          (temp_Day_Calendar &&
            rarchqDue.SHOWCALENDARARDUE &&
            rarchqDue.SHOWCALENDARARDUE.filter(item => {
              return item.ARD_DUE_DA == temp_Day_Calendar;
            }).length > 0) ||
          (temp_Day_Calendar &&
            rapDue.SHOWCALENDARAPDUE &&
            rapDue.SHOWCALENDARAPDUE.filter(item => {
              return item.APD_DUE_DA == temp_Day_Calendar;
            }).length > 0)
        ) {
          let obj_Day_Calendar = {
            date: safe_Day_Calendar[i][j],
            stu: true,
          };
          Day_Calendar.push(obj_Day_Calendar);
        } else {
          let obj_Day_Calendar = {
            date: safe_Day_Calendar[i][j],
            stu: false,
          };
          Day_Calendar.push(obj_Day_Calendar);
        }
      }
    }
    console.log(Day_Calendar);
    set_Statedaily(Day_Calendar);
    // safe_Day_Calendar.map((i) => {
    //     i.map((j) => {
    //         Day_Calendar.map((item) => {
    //             return (console.log(item.date == j && item.date))
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
        'BPAPUS-PARAM':
          '{"FROM_DATE": ' +
          fetchdate(monthDays[0]) +
          ',"TO_DATE": ' +
          fetchdate(monthDays[monthDays.length - 1]) +
          '}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0',
      }),
    })
      .then(response => response.json())
      .then(json => {
        let responseData = JSON.parse(json.ResponseData);
        set_poppoint(responseData);
        console.log(responseData);
        setSer_die(true);
      })
      .catch(async error => {
        if (ser_die) {
          setSer_die(false);
          await regisMacAdd();
        } else {
          console.log('Function Parameter Required');
          let temp_error = 'error_ser.' + 610;
          console.log('>> ', temp_error);
          Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [
            {
              text: Language.t('alert.ok'),
              onPress: () =>
                navigation.dispatch(navigation.replace('LoginScreen')),
            },
          ]);
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
        'BPAPUS-PARAM':
          '{"FROM_DATE": ' +
          fetchdate(monthDays[0]) +
          ',"TO_DATE": ' +
          fetchdate(monthDays[monthDays.length - 1]) +
          '}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0',
      }),
    })
      .then(response => response.json())
      .then(json => {
        let responseData = JSON.parse(json.ResponseData);
        set_mappoint(responseData);
        console.log(responseData);
        setSer_die(true);
      })
      .catch(async error => {
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
        'BPAPUS-PARAM':
          '{"FROM_DATE": ' +
          fetchdate(monthDays[0]) +
          ',"TO_DATE": ' +
          fetchdate(monthDays[monthDays.length - 1]) +
          '}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0',
      }),
    })
      .then(response => response.json())
      .then(json => {
        let responseData = JSON.parse(json.ResponseData);
        set_rarchqDue(responseData);
        console.log(responseData);
        setSer_die(true);
      })
      .catch(async error => {
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
        'BPAPUS-PARAM':
          '{"FROM_DATE": ' +
          fetchdate(monthDays[0]) +
          ',"TO_DATE": ' +
          fetchdate(monthDays[monthDays.length - 1]) +
          '}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0',
      }),
    })
      .then(response => response.json())
      .then(json => {
        let responseData = JSON.parse(json.ResponseData);
        set_rapDue(responseData);
        console.log(responseData);
        setSer_die(true);
      })
      .catch(async error => {
        console.error('ERROR at fetchContent >> ' + error);
      });
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
            <View>
              <Image
                style={topImage}
                source={require('../../images/UI/Asset43.png')}
              />
            </View>

            <ScrollView>
              <View style={container1}>
                <View style={{ padding: 20, marginTop: 0 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        marginTop: 10,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        borderColor: Colors.itemColor,
                        backgroundColor: Colors.backgroundColorSecondary,
                        borderWidth: 1,
                        padding: 10,
                        borderRadius: 10,
                        width: deviceWidth / 2.5,
                      }}
                    >
                      <Text style={{ fontSize: FontSize.large }}></Text>
                      <Picker
                        selectedValue={yearIndex}
                        enabled={true}
                        mode="dropdown"
                        style={{
                          color: Colors.itemColor,
                          width: deviceWidth / 2.6,
                          backgroundColor: Colors.backgroundColorSecondary,
                        }}
                        onValueChange={(itemValue, itemIndex) =>
                          set_yearIndex(itemValue, itemIndex)
                        }
                      >
                        {safe_Format.state_years.map((obj, index) => {
                          return (
                            <Picker.Item
                              key={`year-${obj}-${index}`}
                              color={Colors.itemColor}
                              style={{
                                backgroundColor:
                                  Colors.backgroundColorSecondary,
                              }}
                              label={obj.toString()}
                              value={obj}
                            />
                          );
                        })}
                      </Picker>
                    </View>
                    <View
                      style={{
                        marginTop: 10,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        borderColor: Colors.itemColor,
                        backgroundColor: Colors.backgroundColorSecondary,
                        borderWidth: 1,
                        padding: 10,
                        borderRadius: 10,
                        width: deviceWidth / 2.5,
                      }}
                    >
                      <Text style={{ fontSize: FontSize.large }}></Text>
                      <Picker
                        selectedValue={monthIndex}
                        enabled={true}
                        mode="dropdown"
                        style={{
                          color: Colors.itemColor,
                          width: deviceWidth / 2.6,
                          backgroundColor: Colors.backgroundColorSecondary,
                        }}
                        onValueChange={(itemValue, itemIndex) =>
                          setMonthState(itemValue, itemIndex)
                        }
                      >
                        {safe_Format.months_th.map((obj, index) => {
                          return (
                            <Picker.Item
                              key={`month-${index}-${obj}`}
                              color={Colors.itemColor}
                              style={{
                                backgroundColor:
                                  Colors.backgroundColorSecondary,
                              }}
                              label={obj}
                              value={index}
                            />
                          );
                        })}
                      </Picker>
                    </View>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: FontSize.large,
                        color: Colors.fontColor,
                      }}
                    >
                      {safe_Format.months_th[monthIndex]}
                    </Text>
                  </View>
                  <View>
                    <View
                      style={{
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
                          height: 6,
                        },
                        shadowOpacity: 0.5,
                        shadowRadius: 1.0,
                        elevation: 15,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 15,
                            backgroundColor: null,
                          }}
                        >
                          <Text style={{ color: 'red', fontWeight: 'bold' }}>
                            {'อา'}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 15,
                            backgroundColor: null,
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.fontColor,
                              fontWeight: 'bold',
                            }}
                          >
                            {'จ'}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 15,
                            backgroundColor: null,
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.fontColor,
                              fontWeight: 'bold',
                            }}
                          >
                            {'อ'}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 15,
                            backgroundColor: null,
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.fontColor,
                              fontWeight: 'bold',
                            }}
                          >
                            {'พ'}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 15,
                            backgroundColor: null,
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.fontColor,
                              fontWeight: 'bold',
                            }}
                          >
                            {'พฤ'}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 15,
                            backgroundColor: null,
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.fontColor,
                              fontWeight: 'bold',
                            }}
                          >
                            {'ศ'}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 15,
                            backgroundColor: null,
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.fontColor,
                              fontWeight: 'bold',
                            }}
                          >
                            {'ส'}
                          </Text>
                        </View>
                      </View>
                      {safe_Format
                        .Day_Calendar(yearIndex, monthIndex)
                        .map((item, index) => {
                          return (
                            <View
                              key={`calendar-row-${yearIndex}-${monthIndex}-${index}`}
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}
                            >
                              <View
                                style={{
                                  width: 30,
                                  height: 30,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 15,
                                  backgroundColor:
                                    item[0] == dateIndex
                                      ? Colors.itemColor
                                      : null,
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  onPress={() => set_DateIndex(item[0])}
                                >
                                  <>
                                    <Text
                                      style={{
                                        color:
                                          item[0] == dateIndex
                                            ? Colors.backgroundColor
                                            : 'red',
                                      }}
                                    >
                                      {item[0]}
                                    </Text>
                                    {item[0] > 0 &&
                                      Statedaily &&
                                      Statedaily.filter(Stated => {
                                        return (
                                          Stated.date == item[0] &&
                                          Stated.stu == true
                                        );
                                      }).length > 0 && (
                                        <Image
                                          style={{
                                            width: 5,
                                            height: 5,
                                          }}
                                          resizeMode="contain"
                                          source={require('../../img/iconsMenu/record.png')}
                                        />
                                      )}
                                  </>
                                </TouchableOpacity>
                              </View>
                              <View
                                style={{
                                  width: 30,
                                  height: 30,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 15,
                                  backgroundColor:
                                    item[1] == dateIndex
                                      ? Colors.itemColor
                                      : null,
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  onPress={() => set_DateIndex(item[1])}
                                >
                                  <>
                                    <Text
                                      style={{
                                        color:
                                          item[1] == dateIndex
                                            ? Colors.backgroundColor
                                            : 'black',
                                      }}
                                    >
                                      {item[1]}
                                    </Text>
                                    {item[1] > 0 &&
                                      Statedaily &&
                                      Statedaily.filter(Stated => {
                                        return (
                                          Stated.date == item[1] &&
                                          Stated.stu == true
                                        );
                                      }).length > 0 && (
                                        <Image
                                          style={{
                                            width: 5,
                                            height: 5,
                                          }}
                                          resizeMode="contain"
                                          source={require('../../img/iconsMenu/record.png')}
                                        />
                                      )}
                                  </>
                                </TouchableOpacity>
                              </View>
                              <View
                                style={{
                                  width: 30,
                                  height: 30,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 15,
                                  backgroundColor:
                                    item[2] == dateIndex
                                      ? Colors.itemColor
                                      : null,
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  onPress={() => set_DateIndex(item[2])}
                                >
                                  <>
                                    <Text
                                      style={{
                                        color:
                                          item[2] == dateIndex
                                            ? Colors.backgroundColor
                                            : 'black',
                                      }}
                                    >
                                      {item[2]}
                                    </Text>
                                    {item[2] > 0 &&
                                      Statedaily &&
                                      Statedaily.filter(Stated => {
                                        return (
                                          Stated.date == item[2] &&
                                          Stated.stu == true
                                        );
                                      }).length > 0 && (
                                        <Image
                                          style={{
                                            width: 5,
                                            height: 5,
                                          }}
                                          resizeMode="contain"
                                          source={require('../../img/iconsMenu/record.png')}
                                        />
                                      )}
                                  </>
                                </TouchableOpacity>
                              </View>
                              <View
                                style={{
                                  width: 30,
                                  height: 30,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 15,
                                  backgroundColor:
                                    item[3] == dateIndex
                                      ? Colors.itemColor
                                      : null,
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  onPress={() => set_DateIndex(item[3])}
                                >
                                  <>
                                    <Text
                                      style={{
                                        color:
                                          item[3] == dateIndex
                                            ? Colors.backgroundColor
                                            : 'black',
                                      }}
                                    >
                                      {item[3]}
                                    </Text>
                                    {item[3] > 0 &&
                                      Statedaily &&
                                      Statedaily.filter(Stated => {
                                        return (
                                          Stated.date == item[3] &&
                                          Stated.stu == true
                                        );
                                      }).length > 0 && (
                                        <Image
                                          style={{
                                            width: 5,
                                            height: 5,
                                          }}
                                          resizeMode="contain"
                                          source={require('../../img/iconsMenu/record.png')}
                                        />
                                      )}
                                  </>
                                </TouchableOpacity>
                              </View>
                              <View
                                style={{
                                  width: 30,
                                  height: 30,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 15,
                                  backgroundColor:
                                    item[4] == dateIndex
                                      ? Colors.itemColor
                                      : null,
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  onPress={() => set_DateIndex(item[4])}
                                >
                                  <>
                                    <Text
                                      style={{
                                        color:
                                          item[4] == dateIndex
                                            ? Colors.backgroundColor
                                            : 'black',
                                      }}
                                    >
                                      {item[4]}
                                    </Text>
                                    {item[4] > 0 &&
                                      Statedaily &&
                                      Statedaily.filter(Stated => {
                                        return (
                                          Stated.date == item[4] &&
                                          Stated.stu == true
                                        );
                                      }).length > 0 && (
                                        <Image
                                          style={{
                                            width: 5,
                                            height: 5,
                                          }}
                                          resizeMode="contain"
                                          source={require('../../img/iconsMenu/record.png')}
                                        />
                                      )}
                                  </>
                                </TouchableOpacity>
                              </View>
                              <View
                                style={{
                                  width: 30,
                                  height: 30,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 15,
                                  backgroundColor:
                                    item[5] == dateIndex
                                      ? Colors.itemColor
                                      : null,
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  onPress={() => set_DateIndex(item[5])}
                                >
                                  <>
                                    <Text
                                      style={{
                                        color:
                                          item[5] == dateIndex
                                            ? Colors.backgroundColor
                                            : 'black',
                                      }}
                                    >
                                      {item[5]}
                                    </Text>
                                    {item[5] > 0 &&
                                      Statedaily &&
                                      Statedaily.filter(Stated => {
                                        return (
                                          Stated.date == item[5] &&
                                          Stated.stu == true
                                        );
                                      }).length > 0 && (
                                        <Image
                                          style={{
                                            width: 5,
                                            height: 5,
                                          }}
                                          resizeMode="contain"
                                          source={require('../../img/iconsMenu/record.png')}
                                        />
                                      )}
                                  </>
                                </TouchableOpacity>
                              </View>
                              <View
                                style={{
                                  width: 30,
                                  height: 30,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 15,
                                  backgroundColor:
                                    item[6] == dateIndex
                                      ? Colors.itemColor
                                      : null,
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  onPress={() => set_DateIndex(item[6])}
                                >
                                  <>
                                    <Text
                                      style={{
                                        color:
                                          item[6] == dateIndex
                                            ? Colors.backgroundColor
                                            : 'black',
                                      }}
                                    >
                                      {item[6]}
                                    </Text>
                                    {item[6] > 0 &&
                                      Statedaily &&
                                      Statedaily.filter(Stated => {
                                        return (
                                          Stated.date == item[6] &&
                                          Stated.stu == true
                                        );
                                      }).length > 0 && (
                                        <Image
                                          style={{
                                            width: 5,
                                            height: 5,
                                          }}
                                          resizeMode="contain"
                                          source={require('../../img/iconsMenu/record.png')}
                                        />
                                      )}
                                  </>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        })}
                    </View>

                    <View>
                      <View
                        style={{
                          borderBottomColor: 'black',
                          borderBottomWidth: 1,
                          padding: 10,
                        }}
                      >
                        <Text
                          style={{ fontSize: FontSize.medium, color: 'black' }}
                        >{`รายละเอียดวันที่ ${dateIndex} ${safe_Format.months_th[monthIndex]} ${yearIndex}`}</Text>
                      </View>
                      {/* นัดรับ */}
                      <TouchableNativeFeedback
                        onPress={() =>
                          poppoint.SHOWCALENDARPOAPPOINT &&
                          poppoint.SHOWCALENDARPOAPPOINT.filter(item => {
                            return item.TRH_SHIP_DATE == fulldate();
                          }).length > 0
                            ? navigation.navigate('DailyCalendarInfomation', {
                                header: 'นัดรับ',
                                person: 'เจ้าหนี้',
                                poppoint:
                                  poppoint.SHOWCALENDARPOAPPOINT &&
                                  poppoint.SHOWCALENDARPOAPPOINT.filter(
                                    item => {
                                      return item.TRH_SHIP_DATE == fulldate();
                                    },
                                  ),
                              })
                            : Alert.alert(
                                Language.t('alert.errorTitle'),
                                Language.t('alert.errorDetail'),
                                [
                                  {
                                    text: Language.t('alert.ok'),
                                    onPress: () => console.log('OK Pressed'),
                                  },
                                ],
                              )
                        }
                      >
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: 10,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: FontSize.medium,
                                  color: 'black',
                                }}
                              >{`> นัดรับ`}</Text>
                            </View>
                            <View>
                              <Text
                                style={{
                                  fontSize: FontSize.medium,
                                  color: 'black',
                                }}
                              >{`(${
                                poppoint.SHOWCALENDARPOAPPOINT &&
                                poppoint.SHOWCALENDARPOAPPOINT.filter(item => {
                                  return item.TRH_SHIP_DATE == fulldate();
                                }).length > 0
                                  ? poppoint.SHOWCALENDARPOAPPOINT.filter(
                                      item => {
                                        return item.TRH_SHIP_DATE == fulldate();
                                      },
                                    ).length
                                  : 0
                              })`}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableNativeFeedback>

                      {/* นัดส่ง */}

                      <TouchableNativeFeedback
                        onPress={() =>
                          mappoint.SHOWCALENDARBKAPPOINT &&
                          mappoint.SHOWCALENDARBKAPPOINT.filter(item => {
                            return item.TRH_SHIP_DATE == fulldate();
                          }).length > 0
                            ? navigation.navigate('DailyCalendarInfomation', {
                                header: 'นัดส่ง',
                                person: 'ลูกหนี้',
                                mappoint:
                                  mappoint.SHOWCALENDARBKAPPOINT &&
                                  mappoint.SHOWCALENDARBKAPPOINT.filter(
                                    item => {
                                      return item.TRH_SHIP_DATE == fulldate();
                                    },
                                  ),
                              })
                            : Alert.alert(
                                Language.t('alert.errorTitle'),
                                Language.t('alert.errorDetail'),
                                [
                                  {
                                    text: Language.t('alert.ok'),
                                    onPress: () => console.log('OK Pressed'),
                                  },
                                ],
                              )
                        }
                      >
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: 10,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: FontSize.medium,
                                  color: 'black',
                                }}
                              >{`> นัดส่ง`}</Text>
                            </View>
                            <View>
                              <Text
                                style={{
                                  fontSize: FontSize.medium,
                                  color: 'black',
                                }}
                              >{`(${
                                mappoint.SHOWCALENDARBKAPPOINT &&
                                mappoint.SHOWCALENDARBKAPPOINT.filter(item => {
                                  return item.TRH_SHIP_DATE == fulldate();
                                }).length > 0
                                  ? mappoint.SHOWCALENDARBKAPPOINT.filter(
                                      item => {
                                        return item.TRH_SHIP_DATE == fulldate();
                                      },
                                    ).length
                                  : 0
                              })`}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableNativeFeedback>

                      {/* รับชำระ */}
                      <TouchableNativeFeedback
                        onPress={() =>
                          rarchqDue.SHOWCALENDARARDUE &&
                          rarchqDue.SHOWCALENDARARDUE.filter(item => {
                            return item.ARD_DUE_DA == fulldate();
                          }).length > 0
                            ? navigation.navigate('DailyCalendarInfomation', {
                                header: 'นัดรับชำระ',
                                person: 'ลูกหนี้',
                                rarchqDue:
                                  rarchqDue.SHOWCALENDARARDUE &&
                                  rarchqDue.SHOWCALENDARARDUE.filter(item => {
                                    return item.ARD_DUE_DA == fulldate();
                                  }),
                              })
                            : Alert.alert(
                                Language.t('alert.errorTitle'),
                                Language.t('alert.errorDetail'),
                                [
                                  {
                                    text: Language.t('alert.ok'),
                                    onPress: () => console.log('OK Pressed'),
                                  },
                                ],
                              )
                        }
                      >
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: 10,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: FontSize.medium,
                                  color: 'black',
                                }}
                              >{`> นัดรับชำระ`}</Text>
                            </View>
                            <View>
                              <Text
                                style={{
                                  fontSize: FontSize.medium,
                                  color: 'black',
                                }}
                              >{`(${
                                rarchqDue.SHOWCALENDARARDUE &&
                                rarchqDue.SHOWCALENDARARDUE.filter(item => {
                                  return item.ARD_DUE_DA == fulldate();
                                }).length > 0
                                  ? rarchqDue.SHOWCALENDARARDUE.filter(item => {
                                      return item.ARD_DUE_DA == fulldate();
                                    }).length
                                  : 0
                              })`}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableNativeFeedback>

                      {/* จ่ายชำระ */}
                      <TouchableNativeFeedback
                        onPress={() =>
                          rapDue.SHOWCALENDARAPDUE &&
                          rapDue.SHOWCALENDARAPDUE.filter(item => {
                            return item.APD_DUE_DA == fulldate();
                          }).length > 0
                            ? navigation.navigate('DailyCalendarInfomation', {
                                header: 'นัดจ่ายชำระ',
                                person: 'เจ้าหนี้',
                                rapDue:
                                  rapDue.SHOWCALENDARAPDUE &&
                                  rapDue.SHOWCALENDARAPDUE.filter(item => {
                                    return item.APD_DUE_DA == fulldate();
                                  }),
                              })
                            : Alert.alert(
                                Language.t('alert.errorTitle'),
                                Language.t('alert.errorDetail'),
                                [
                                  {
                                    text: Language.t('alert.ok'),
                                    onPress: () => console.log('OK Pressed'),
                                  },
                                ],
                              )
                        }
                      >
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: 10,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: FontSize.medium,
                                  color: 'black',
                                }}
                              >{`> นัดจ่ายชำระ`}</Text>
                            </View>
                            <View>
                              <Text
                                style={{
                                  fontSize: FontSize.medium,
                                  color: 'black',
                                }}
                              >{`(${
                                rapDue.SHOWCALENDARAPDUE &&
                                rapDue.SHOWCALENDARAPDUE.filter(item => {
                                  return item.APD_DUE_DA == fulldate();
                                }).length > 0
                                  ? rapDue.SHOWCALENDARAPDUE.filter(item => {
                                      return item.APD_DUE_DA == fulldate();
                                    }).length
                                  : 0
                              })`}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableNativeFeedback>
                    </View>

                    <TouchableNativeFeedback
                      onPress={() => navigation.goBack()}
                    >
                      <View
                        style={{
                          margin: 10,
                          borderRadius: 20,
                          flexDirection: 'column',
                          padding: 10,
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
                          {'ย้อนกลับ'}
                        </Text>
                      </View>
                    </TouchableNativeFeedback>
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
});

export default DailyCalendarScreen;
