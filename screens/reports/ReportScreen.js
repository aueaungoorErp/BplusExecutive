import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Dimensions,
  Text,
  Platform,
  Image,
  ImageBackground,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  BackHandler,
  ScrollView,
  TouchableNativeFeedback,
  TouchableOpacity,
  Pressable,
  PermissionsAndroid,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { useStateIfMounted } from 'use-state-if-mounted';
import { connect } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
// import { Navigation } from 'react-native-navigation';
// import CalendarScreen from '@blacksakura013/th-datepicker'
import RNFetchBlob from 'rn-fetch-blob';

import { Language } from '../../translations/I18n';
import { FontSize } from '../../components/FontSizeHelper';
import Colors from '../../src/Colors';
import CalendarScreen from '@blacksakura013/th-datepicker';
// import { NavigationComponent, Modal as RNNModal } from 'react-native-navigation';
import * as loginActions from '../../src/actions/loginActions';
import * as registerActions from '../../src/actions/registerActions';
import * as databaseActions from '../../src/actions/databaseActions';
import * as activityActions from '../../src/actions/activityActions';
import * as safe_Format from '../../src/safe_Format';
import { fontSize } from 'styled-system';

import { Data } from './DocumentType';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

var ser_die = true;
let todate = new Date();
const image = '../../images/UI/Asset35.png';
let clockCall = null;
const defaultCountDown = -1;

const ReportScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const loginReducer = useSelector(({ loginReducer }) => loginReducer);
  const registerReducer = useSelector(({ registerReducer }) => registerReducer);
  const databaseReducer = useSelector(({ databaseReducer }) => databaseReducer);
  const activityReducer = useSelector(({ activityReducer }) => activityReducer);
  const [REPORTNAME, setREPORTNAME] = useState([]);
  const [loading, setLoading] = useStateIfMounted(false);
  const [loading_backG, setLoading_backG] = useStateIfMounted(true);
  const [kye_token, setkye_token] = useState({});
  const [TypeItem, setTypeItem] = useState(
    Data.filter(item => {
      return item.CODE == '00';
    })[0],
  );
  const [printItem, setPrintItem] = useState({});
  const [start_date, setS_date] = useState(new Date());
  const [end_date, setE_date] = useState(new Date());
  const [countdown, setCountdown] = useState(defaultCountDown);
  const [recon, setRecon] = useState('');
  const [GETPRINTSTATUS, setGETPRINTSTATUS] = useState([]);
  useEffect(() => {
    fetchData();
    console.log(` RPTSVR_GRANT ${activityReducer.RPTSVR_GRANT}`);
    console.log('RPTSVR_DATA', activityReducer.RPTSVR_DATA);
    for (var i in Data) console.log(`Data[${i}] > ${Data[i].CODE}`);
  }, []);

  useEffect(() => {
    setPrintItem(
      REPORTNAME.filter(item => {
        return TypeItem.CODE == '00'
          ? item.RPTSVR_CODE == item.RPTSVR_CODE
          : item.RPTSVR_CODE.substring(0, 2) == TypeItem.CODE;
      })[0],
    );
    console.log();
    console.log(
      REPORTNAME.filter(item => {
        return TypeItem.CODE == '00'
          ? item.RPTSVR_CODE == item.RPTSVR_CODE
          : item.RPTSVR_CODE.substring(0, 2) == TypeItem.CODE;
      })[0],
    );
    console.log();
  }, [TypeItem]);
  useEffect(() => {
    console.log();
    console.log(printItem);
    console.log();
  }, [printItem]);

  const decrementClock = () => {
    if (countdown === 0) {
      setCountdown(0);
      clearInterval(clockCall);
    } else if (countdown === 16) {
      connectAgain();
    } else {
      setCountdown(countdown - 1);
    }
  };
  useEffect(() => {
    if (countdown === 0) {
      Alert.alert(
        Language.t('alert.errorTitle'),
        Language.t('selectBase.UnableConnec'),
        [
          {
            text: Language.t('selectBase.connectAgain'),
            onPress: () => connectAgain(),
          },
          {
            text: Language.t('main.cancel'),
            onPress: () => BackHandler.exitApp(),
          },
        ],
      );
    }
    console.log(countdown);
  }, [countdown]);
  const connectAgain = () => {
    if (recon == 'fetchData') fetchData();
    else if (recon == 'PushPRINTREPORT') PushPRINTREPORT();
    else if (recon == 'fetchDataStatus') fetchDataStatus(kye_token);
    else setLoading(false);
  };

  const dieSer = fn => {
    setRecon(fn);
    setCountdown(15);
  };

  useEffect(() => {
    if (countdown != -1) {
      clockCall = setInterval(() => {
        decrementClock();
      }, 1000);
      return () => {
        clearInterval(clockCall);
      };
    }
  });

  const fetchData = async () => {
    dieSer('fetchData');
    setLoading(true);
    await fetch(databaseReducer.Data.urlser + '/RptServer', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': loginReducer.guid,
        'BPAPUS-FUNCTION': 'GETREPORTNAME',
        'BPAPUS-PARAM':
          '{"RPTSVR_GRANT": "' + activityReducer.RPTSVR_GRANT + '"}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0',
      }),
    })
      .then(response => response.json())
      .then(async json => {
        if (json.ResponseCode == 200) {
          let responseData = JSON.parse(json.ResponseData);
          if (responseData.RECORD_COUNT > 0) {
            console.log(printItem);
            await setREPORTNAME(responseData.GETREPORTNAME);
            await setPrintItem(
              printItem ? printItem : responseData.GETREPORTNAME[0],
            );
          } else {
            Alert.alert(
              Language.t('alert.errorTitle'),
              Language.t('report.noData'),
              [
                {
                  text: Language.t('alert.ok'),
                  onPress: () => navigation.goBack(),
                },
              ],
            );
          }
        } else {
          let temp_error = 'error_ser.' + json.ResponseCode;
          console.log('>> ', temp_error);
          Alert.alert(
            `${Language.t('alert.errorTitle')} `,
            Language.t(temp_error),
            [
              {
                text: Language.t('alert.ok'),
                onPress: () => navigation.goBack(),
              },
            ],
          );
          setLoading(false);
        }
        setLoading(false);
        setCountdown(-1);
      })
      .catch(error => {
        setCountdown(-1);
        console.log(`Function Parameter Required >> ${error}`);
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
      });
  };

  const PushPRINTREPORT = async tempGuid => {
    dieSer('PushPRINTREPORT');
    let tempprintItem = {};

    setLoading(true);

    if (printItem.RPTSVR_GUID) tempprintItem = printItem;
    else
      tempprintItem = REPORTNAME.filter(item => {
        return TypeItem.CODE == '00'
          ? item.RPTSVR_CODE == item.RPTSVR_CODE
          : item.RPTSVR_CODE.substring(0, 2) == TypeItem.CODE;
      })[0];
    let sDate = safe_Format.setnewdateF(start_date);
    sDate = parseInt(sDate);

    let eDate = safe_Format.setnewdateF(end_date);
    if (printItem.RPTSVR_RPF_DD_FIELD == 'ANYDATE') eDate = sDate;
    else eDate = parseInt(eDate);

    if (sDate > eDate) {
      Alert.alert(
        Language.t('report.Failed'),
        Language.t('report.FailedInfo'),
        [
          {
            text: Language.t('alert.ok'),
            onPress: () => setLoading(false),
          },
        ],
      );
    } else {
      console.log(`\n _push JSON>>`);
      console.log(
        JSON.stringify({
          'BPAPUS-BPAPSV': loginReducer.serviceID,
          'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
          'BPAPUS-FUNCTION': 'PRINTREPORT',
          'BPAPUS-PARAM':
            '{"RPTSVR_GRANT": "' +
            activityReducer.RPTSVR_GRANT +
            '","RPTSVR_GUID": "' +
            tempprintItem.RPTSVR_GUID +
            '","RPTQUE_RQST_FROMDATE": "' +
            sDate +
            '","RPTQUE_RQST_TODATE": "' +
            eDate +
            '","RPTQUE_RQST_OPTN": "","RPTQUE_RQST_PARAM": ""}',
          'BPAPUS-FILTER': '',
          'BPAPUS-ORDERBY': '',
          'BPAPUS-OFFSET': '0',
          'BPAPUS-FETCH': '0',
        }),
      );
      console.log('\n');

      await fetch(databaseReducer.Data.urlser + '/RptServer', {
        method: 'POST',
        body: JSON.stringify({
          'BPAPUS-BPAPSV': loginReducer.serviceID,
          'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
          'BPAPUS-FUNCTION': 'PRINTREPORT',
          'BPAPUS-PARAM':
            '{"RPTSVR_GRANT": "' +
            activityReducer.RPTSVR_GRANT +
            '","RPTSVR_GUID": "' +
            tempprintItem.RPTSVR_GUID +
            '","RPTQUE_RQST_FROMDATE": "' +
            sDate +
            '","RPTQUE_RQST_TODATE": "' +
            eDate +
            '","RPTQUE_RQST_OPTN": "","RPTQUE_RQST_PARAM": ""}',
          'BPAPUS-FILTER': '',
          'BPAPUS-ORDERBY': '',
          'BPAPUS-OFFSET': '0',
          'BPAPUS-FETCH': '0',
        }),
      })
        .then(response => response.json())
        .then(json => {
          let responseData = JSON.parse(json.ResponseData);
          let tempRPTSVR_DATA = activityReducer.RPTSVR_DATA;
          if (json.ResponseCode == 200) {
            console.log(responseData);
            setPrintItem(printItem);
            tempRPTSVR_DATA.push(responseData);
            dispatch(activityActions.RPTSVR_DATA(tempRPTSVR_DATA));
            setGETPRINTSTATUS([]);
            fetchDataStatus(responseData);
          } else {
            Alert.alert(
              Language.t('notiAlert.header'),
              `${Language.t('report.Failed')} ${json.ReasonString}`,
              [
                {
                  text: Language.t('alert.ok'),
                  onPress: () => console.log(''),
                },
              ],
            );
          }
        })
        .catch(error => {
          setCountdown(-1);
          console.log(`Function Parameter Required >> ${error}`);
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
        });
    }
    setCountdown(-1);
  };
  const fetchDataStatus = async itemtoken => {
    setkye_token(itemtoken);

    dieSer('fetchDataStatus');
    await fetch(databaseReducer.Data.urlser + '/RptServer', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': loginReducer.guid,
        'BPAPUS-FUNCTION': 'GETPRINTSTATUS',
        'BPAPUS-PARAM': '{"RPTQUE_GUID": "' + itemtoken.RPTQUE_GUID + '"}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0',
      }),
    })
      .then(response => response.json())
      .then(json => {
        console.log(json);
        let responseData = JSON.parse(json.ResponseData);

        if (responseData.RECORD_COUNT > 0) {
          if (responseData.GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 1) {
            setGETPRINTSTATUS(responseData.GETPRINTSTATUS);
            DownloadReport(responseData.GETPRINTSTATUS[0]);
            setCountdown(-1);
            setLoading(false);
          } else if (responseData.GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 0) {
            setCountdown(18);
            setGETPRINTSTATUS(responseData.GETPRINTSTATUS);
          } else {
            setCountdown(-1);
            setLoading(false);

            Alert.alert(
              Language.t('notiAlert.header'),
              `${
                responseData.GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 7
                  ? Language.t('report.cancelled')
                  : responseData.GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 8
                  ? Language.t('report.cancelled')
                  : responseData.GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 1
                  ? Language.t('report.Successful')
                  : Language.t('report.printing')
              }
                        `,
              [
                {
                  text: Language.t('selectBase.yes'),
                  onPress: () => setLoading(false),
                },
              ],
            );
          }
        } else {
          setCountdown(15);
          fetchDataStatus(itemtoken.RPTQUE_GUID);
        }
      })
      .catch(error => {
        console.log(`Function Parameter Required >> ${error}`);
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
      });
  };

  const DownloadReport = async tempItem => {
    dieSer('DownloadReport');
    setGETPRINTSTATUS([]);
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: '',
        message: '',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    console.log(`permission ${permission}`);
    if (permission === 'denied') return;
    if (permission === 'granted') {
      // YOUR WRITE FUNCTION HERE
    }

    let base64 = null;
    let dirs = RNFetchBlob.fs.dirs.DocumentDir;
    console.log(dirs);
    let docpath = tempItem.RPTQUE_RSLT_PATH.split('\\');
    let docname;
    for (var i in docpath)
      if (docpath[i].toUpperCase().search('.PDF') > -1) docname = docpath[i];
    docname = docname.toUpperCase().split('.PDF');
    await RNFetchBlob.config({
      path: dirs + `/${docname[0]}.pdf`,
      appendExt: 'pdf',
      mime: 'file/pdf',
      description: `${docname[0]}.pdf`,
      fileCache: true,
      useDownloadManager: true,
      notification: true,
    })
      .fetch('GET', databaseReducer.Data.urlser + '/DownloadFile', {
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-GUID': loginReducer.guid,
        FilePath: '',
        FileName: tempItem.RPTQUE_RSLT_PATH,
      })
      .then(res => {
        console.log(res);
        base64 = res.path();
        console.log('base64  is', base64);
        RNFetchBlob.android.actionViewIntent(base64, 'application/pdf');
      })
      .catch(error => {
        console.log(`Function Parameter Required >> ${error}`);
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
      });
  };

  return (
    <View style={styles.container1}>
      <StatusBar hidden={true} />
      <ImageBackground
        source={require(image)}
        onLoadEnd={() => {
          setLoading_backG(false);
        }}
        resizeMode="cover"
        style={styles.image}
      >
        <Image
          style={styles.topImage}
          source={require(`../../images/UI/Asset5.png`)}
        />
        {!loading_backG && REPORTNAME.length > 0 ? (
          <>
            <ScrollView>
              <KeyboardAvoidingView keyboardVerticalOffset={1}>
                <View style={styles.body}>
                  <View style={styles.body1}>
                    <Text style={styles.textTitleInfo}>
                      {Language.t('report.ReportType')} :
                    </Text>
                  </View>
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      borderColor:
                        Data.length > 0 ? Colors.buttonColorPrimary : '#979797',
                      backgroundColor: Colors.backgroundColorSecondary,
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontSize: FontSize.large }}></Text>

                    {Data.length > 0 ? (
                      <Picker
                        selectedValue={TypeItem}
                        enabled={true}
                        mode="dropdown"
                        state={{
                          color: Colors.buttonColorPrimary,
                          backgroundColor: Colors.backgroundColorSecondary,
                        }}
                        onValueChange={(itemValue, itemIndex) =>
                          setTypeItem(itemValue)
                        }
                      >
                        {Data.map((obj, index) => {
                          return (
                            <Picker.Item
                              label={obj.THNAME}
                              color={Colors.buttonColorPrimary}
                              value={obj}
                            />
                          );
                        })}
                      </Picker>
                    ) : (
                      <Picker
                        selectedValue={Data}
                        state={{
                          color: Colors.buttonColorPrimary,
                          backgroundColor: Colors.buttonColorPrimary,
                        }}
                        onValueChange={(itemValue, itemIndex) =>
                          setTypeItem(itemValue)
                        }
                        enabled={false}
                        mode="dropdown"
                      >
                        {
                          <Picker.Item
                            value="-1"
                            color={'#979797'}
                            label={Language.t('report.noData')}
                          />
                        }
                      </Picker>
                    )}
                  </View>
                  <View style={styles.body1}>
                    <Text style={styles.textTitleInfo}>
                      {Language.t('report.reportName')} :
                    </Text>
                  </View>
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      borderColor:
                        REPORTNAME.length > 0
                          ? Colors.buttonColorPrimary
                          : '#979797',
                      backgroundColor: Colors.backgroundColorSecondary,
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontSize: FontSize.large }}></Text>

                    {REPORTNAME &&
                    REPORTNAME.filter(item => {
                      return TypeItem.CODE == '00'
                        ? item.RPTSVR_CODE == item.RPTSVR_CODE
                        : item.RPTSVR_CODE.substring(0, 2) == TypeItem.CODE;
                    }).length > 0 ? (
                      <Picker
                        selectedValue={printItem}
                        enabled={true}
                        mode="dropdown"
                        state={{
                          color: Colors.buttonColorPrimary,
                          backgroundColor: Colors.backgroundColorSecondary,
                        }}
                        onValueChange={(itemValue, itemIndex) =>
                          setPrintItem(itemValue)
                        }
                      >
                        {REPORTNAME.filter(item => {
                          return TypeItem.CODE == '00'
                            ? item.RPTSVR_CODE == item.RPTSVR_CODE
                            : item.RPTSVR_CODE.substring(0, 2) == TypeItem.CODE;
                        }).map((obj, index) => {
                          return (
                            <Picker.Item
                              label={obj.RPTSVR_NAME}
                              color={Colors.buttonColorPrimary}
                              value={obj}
                            />
                          );
                        })}
                      </Picker>
                    ) : (
                      <Picker
                        selectedValue={printItem}
                        state={{
                          color: Colors.buttonColorPrimary,
                          backgroundColor: Colors.buttonColorPrimary,
                        }}
                        onValueChange={(itemValue, itemIndex) =>
                          setPrintItem(itemValue)
                        }
                        enabled={false}
                        mode="dropdown"
                      >
                        {
                          <Picker.Item
                            value="-1"
                            color={'#979797'}
                            label={Language.t('report.noData')}
                          />
                        }
                      </Picker>
                    )}
                  </View>
                  {REPORTNAME &&
                    REPORTNAME.filter(item => {
                      return TypeItem.CODE == '00'
                        ? item.RPTSVR_CODE == item.RPTSVR_CODE
                        : item.RPTSVR_CODE.substring(0, 2) == TypeItem.CODE;
                    }).length > 0 &&
                    (printItem && printItem.RPTSVR_RPF_DD_FIELD == 'ANYDATE' ? (
                      <>
                        <View style={styles.body1}>
                          <Text style={styles.textTitleInfo}>
                            {Language.t('report.asof')} :
                          </Text>
                        </View>
                        <View style={{ marginTop: 10 }}>
                          <CalendarScreen
                            value={start_date}
                            onChange={vel => setS_date(vel)}
                            language={'th'}
                            era={'be'}
                            format={'DD/MM/YYYY'}
                            borderColor={Colors.buttonColorPrimary}
                            linkTodateColor={Colors.itemColor}
                            calendarModel={{
                              backgroundColor: Colors.backgroundColor,
                              buttonSuccess: {
                                backgroundColor: Colors.itemColor,
                              },
                              pickItem: { color: Colors.itemColor },
                            }}
                            borderWidth={1}
                            icon={{ color: Colors.buttonColorPrimary }}
                            fontSize={FontSize.medium}
                            fontColor={Colors.fontColor}
                            width={deviceWidth * 0.95}
                            borderRadius={10}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.body1}>
                          <Text style={styles.textTitleInfo}>
                            {Language.t('report.from')} :
                          </Text>
                        </View>
                        <View style={{ marginTop: 10 }}>
                          <CalendarScreen
                            value={start_date}
                            onChange={vel => setS_date(vel)}
                            language={'th'}
                            era={'be'}
                            format={'DD/MM/YYYY'}
                            borderColor={Colors.buttonColorPrimary}
                            linkTodateColor={Colors.itemColor}
                            calendarModel={{
                              backgroundColor: Colors.backgroundColor,
                              buttonSuccess: {
                                backgroundColor: Colors.itemColor,
                              },
                              pickItem: { color: Colors.itemColor },
                            }}
                            borderWidth={1}
                            icon={{ color: Colors.buttonColorPrimary }}
                            fontSize={FontSize.medium}
                            fontColor={Colors.fontColor}
                            width={deviceWidth * 0.95}
                            borderRadius={10}
                          />
                        </View>
                        <View style={styles.body1}>
                          <Text style={styles.textTitleInfo}>
                            {Language.t('report.to')} :
                          </Text>
                        </View>
                        <View style={{ marginTop: 10, marginBottom: 10 }}>
                          <CalendarScreen
                            value={end_date}
                            onChange={vel => setE_date(vel)}
                            language={'th'}
                            era={'be'}
                            format={'DD/MM/YYYY'}
                            borderColor={Colors.buttonColorPrimary}
                            linkTodateColor={Colors.itemColor}
                            calendarModel={{
                              backgroundColor: Colors.backgroundColor,
                              buttonSuccess: {
                                backgroundColor: Colors.itemColor,
                              },
                              pickItem: { color: Colors.itemColor },
                            }}
                            borderWidth={1}
                            icon={{ color: Colors.buttonColorPrimary }}
                            fontSize={FontSize.medium}
                            fontColor={Colors.fontColor}
                            width={deviceWidth * 0.95}
                            borderRadius={10}
                          />
                        </View>
                      </>
                    ))}
                  <View style={{ marginTop: FontSize.large }}>
                    {REPORTNAME &&
                    REPORTNAME.filter(item => {
                      return TypeItem.CODE == '00'
                        ? item.RPTSVR_CODE == item.RPTSVR_CODE
                        : item.RPTSVR_CODE.substring(0, 2) == TypeItem.CODE;
                    }).length > 0 ? (
                      <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => {
                          Alert.alert(
                            Language.t('notiAlert.header'),
                            `${Language.t('report.doPrint')} ${
                              printItem.RPTSVR_NAME
                                ? printItem.RPTSVR_NAME
                                : REPORTNAME[0].RPTSVR_NAME
                            } ${Language.t('report.YorN')}`,
                            [
                              {
                                text: Language.t('selectBase.yes'),
                                onPress: () => PushPRINTREPORT(),
                              },
                              {
                                text: Language.t('selectBase.no'),
                                onPress: () => console.log('cancel'),
                              },
                            ],
                          );
                        }}
                      >
                        <Text style={styles.textTitle}>
                          {' '}
                          {Language.t('report.print')}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        disabled={true}
                        style={[styles.Cbutton, styles.buttonClose]}
                        onPress={() => {
                          console.log('Hit');
                        }}
                      >
                        <Text style={styles.textTitle}>
                          {' '}
                          {Language.t('report.print')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </KeyboardAvoidingView>
            </ScrollView>
          </>
        ) : (
          <View
            style={{
              width: deviceWidth,
              height: deviceHeight,
              opacity: 0.5,
              backgroundColor: Colors.backgroundLoginColorSecondary,
              alignSelf: 'center',
              justifyContent: 'center',
              alignContent: 'center',
              position: 'absolute',
            }}
          ></View>
        )}

        {loading &&
          (GETPRINTSTATUS.length > 0 ? (
            <>
              <View
                style={{
                  width: deviceWidth,
                  height: deviceHeight,
                  opacity: 0.5,
                  backgroundColor: 'black',
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignContent: 'center',
                  position: 'absolute',
                }}
              >
                <View
                  style={{
                    opacity: 0.8,
                    backgroundColor: 'black',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                    borderRadius: 20,
                  }}
                >
                  <View>
                    <Text style={styles.textTitle}>
                      {Language.t('report.printing')}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.textTitle}>
                      {GETPRINTSTATUS[0].RPTSVR_NAME}
                    </Text>
                  </View>
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
                  <View>
                    <Text style={styles.textTitle}>
                      {GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 7
                        ? Language.t('report.cancelled')
                        : GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 8
                        ? Language.t('report.cancelled')
                        : GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 1
                        ? Language.t('report.Successful')
                        : Language.t('report.printing')}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
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
          ))}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    flexDirection: 'column',
  },
  body: {
    margin: 10,

    borderRadius: 15,
  },
  body1e: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  body1: {
    marginTop: 20,
    flexDirection: 'row',
  },
  tabbar: {
    height: 70,
    padding: 5,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  footer: {
    position: 'absolute',
    justifyContent: 'center',
    padding: 10,
    left: 0,
    top: deviceHeight * 0.8,
    width: deviceWidth,
  },
  table: {
    flex: 1,
    width: deviceWidth * 2,
    borderRadius: 15,
    backgroundColor: Colors.backgroundColorSecondary,
  },
  tableView: {
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 10,
    width: deviceWidth * 2,
    flexDirection: 'row',
  },
  FaketableView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: deviceHeight * 0.4,
    width: deviceWidth * 2,
    paddingLeft: 10,
    paddingRight: 10,

    flexDirection: 'row',
  },
  tableHeader: {
    borderTopLeftRadius: 15,
    borderTopEndRadius: 15,
    padding: 10,
    flexDirection: 'row',
    backgroundColor: Colors.buttonColorPrimary,
  },
  dorpdown: {
    justifyContent: 'center',
    fontSize: FontSize.medium,
  },
  dorpdownTop: {
    justifyContent: 'flex-end',
    fontSize: FontSize.medium,
  },
  textTitle: {
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.fontColor2,
  },
  textTitleInfo: {
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.fontColor,
  },
  image: {
    flex: 1,
  },
  topImage: {
    height: deviceHeight / 2.6,
    width: deviceWidth,
  },
  imageIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    height: deviceHeight * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonColorPrimary,
    borderRadius: 10,
  },
  Cbutton: {
    marginTop: 10,
    height: deviceHeight * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.borderColor,
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
    marginLeft: 10,
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: 'center',
    borderBottomColor: '#ffff',
    color: '#ffff',
  },
  label: {
    margin: 8,
    color: '#ffff',
  },
  centeredView: {
    flex: 1,
    marginTop: deviceHeight * 0.3,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: deviceWidth,
  },
  modalView: {
    backgroundColor: Colors.backgroundLoginColor,
    borderRadius: 20,
    padding: 10,
    width: 'auto',
    shadowColor: '#000',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: Colors.fontColor2,
    fontSize: FontSize.medium,
  },
});
const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    reduxMachineNum: payload => dispatch(registerActions.machine(payload)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ReportScreen);
