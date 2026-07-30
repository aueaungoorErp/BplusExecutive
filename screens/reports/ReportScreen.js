import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, TextInput, Dimensions, Text, Platform, Image, ImageBackground, ActivityIndicator, Alert, StatusBar, KeyboardAvoidingView, BackHandler, ScrollView, TouchableNativeFeedback, TouchableOpacity, Pressable, PermissionsAndroid } from 'react-native';
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
import ModalSelectField, { SelectOverlayProvider } from '../../components/ModalSelectField';
const filterReportsByType = (reports, typeCode) => {
  if (!reports || !reports.length) {
    return [];
  }
  return reports.filter(item => typeCode === '00' ? item.RPTSVR_CODE === item.RPTSVR_CODE : item.RPTSVR_CODE.substring(0, 2) === typeCode);
};
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
var ser_die = true;
let todate = new Date();
const image = '../../images/UI/Asset35.png';
let clockCall = null;
const defaultCountDown = -1;
const REPORT_PICKER_FONT = FontSize.medium;
const LOG_TAG = '[ReportScreen]';
const PRINT_STATUS_LABEL = {
  '0': 'กำลังประมวลผล/รอคิว',
  '1': 'สำเร็จ - พร้อมดาวน์โหลด',
  '7': 'ยกเลิก',
  '8': 'ยกเลิก',
};
const getPrintStatusLabel = status =>
  PRINT_STATUS_LABEL[String(status)] || `สถานะอื่น (${status})`;
const reportLog = (step, detail) => {
  const payload =
    detail === undefined
      ? ''
      : ` ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  console.log(`${LOG_TAG} ${step}${payload}`);
};
const reportFlow = (phase, message, detail) => {
  if (detail === undefined || detail === null || detail === '') {
    console.log(`${LOG_TAG}[${phase}] ${message}`);
    return;
  }
  if (typeof detail === 'string') {
    console.log(`${LOG_TAG}[${phase}] ${message} | ${detail}`);
    return;
  }
  console.log(`${LOG_TAG}[${phase}] ${message}`, detail);
};
const logPrintStatusItem = (item, pollNumber) => {
  const status = String(item?.RPTQUE_RSLT_STATUS ?? '');
  const pdfPath = item?.RPTQUE_RSLT_PATH || '';
  const serverMessage =
    item?.SYSLKUP_T_DESC || item?.RPTQUE_RSLT_MESSAGE || '-';
  reportFlow(
    'STEP2_STATUS',
    `poll #${pollNumber} ผลลัพธ์`,
    `status=${status} (${getPrintStatusLabel(status)}) | server=${serverMessage} | pdf=${pdfPath || 'ยังไม่มี'}`,
  );
};
const ReportSelectRow = props => <View style={{
  marginTop: 10,
  flexDirection: 'row',
  justifyContent: 'center'
}}>
    <View style={{
    flex: 1,
    minWidth: 0
  }}>
      <ModalSelectField labelFontSize={REPORT_PICKER_FONT} {...props} />
    </View>
  </View>;
const ReportScreen = ({
  route
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const loginReducer = useSelector(({
    loginReducer
  }) => loginReducer);
  const registerReducer = useSelector(({
    registerReducer
  }) => registerReducer);
  const databaseReducer = useSelector(({
    databaseReducer
  }) => databaseReducer);
  const activityReducer = useSelector(({
    activityReducer
  }) => activityReducer);
  const [REPORTNAME, setREPORTNAME] = useState([]);
  const [loading, setLoading] = useStateIfMounted(false);
  const [loadingKind, setLoadingKind] = useState('data'); // 'data' | 'print'
  const [loading_backG, setLoading_backG] = useStateIfMounted(true);
  const [kye_token, setkye_token] = useState({});
  const [typeCode, setTypeCode] = useState('00');
  const [printGuid, setPrintGuid] = useState('');
  const [start_date, setS_date] = useState(new Date());
  const [end_date, setE_date] = useState(new Date());
  const [countdown, setCountdown] = useState(defaultCountDown);
  const [recon, setRecon] = useState('');
  const [GETPRINTSTATUS, setGETPRINTSTATUS] = useState([]);
  const pollCountRef = useRef(0);
  useEffect(() => {
    reportLog('mount:start');
    fetchData();
    for (var i in Data) {}
  }, []);
  const filteredReports = useMemo(() => filterReportsByType(REPORTNAME, typeCode), [REPORTNAME, typeCode]);
  const typeItem = useMemo(() => Data.find(item => item.CODE === typeCode) ?? Data[0], [typeCode]);
  const printItem = useMemo(() => {
    if (!REPORTNAME.length) {
      return {};
    }
    const byGuid = REPORTNAME.find(item => item.RPTSVR_GUID === printGuid);
    if (byGuid) {
      return byGuid;
    }
    return filteredReports[0] ?? {};
  }, [REPORTNAME, printGuid, filteredReports]);
  useEffect(() => {
    if (!filteredReports.length) {
      return;
    }
    const stillValid = filteredReports.some(item => item.RPTSVR_GUID === printGuid);
    if (!stillValid) {
      reportLog('printGuid:autoSelect', {
        typeCode,
        guid: filteredReports[0].RPTSVR_GUID,
        name: filteredReports[0].RPTSVR_NAME,
      });
      setPrintGuid(filteredReports[0].RPTSVR_GUID);
    }
  }, [typeCode, REPORTNAME, filteredReports, printGuid]);
  const reportNamePickerIndex = useMemo(() => {
    if (!filteredReports.length) {
      return 0;
    }
    const idx = filteredReports.findIndex(item => item.RPTSVR_GUID === printGuid);
    return idx >= 0 ? idx : 0;
  }, [filteredReports, printGuid]);
  const reportNameLabel = useMemo(() => filteredReports[reportNamePickerIndex]?.RPTSVR_NAME ?? '', [filteredReports, reportNamePickerIndex]);
  const reportTypeOptions = useMemo(() => Data.map(item => ({
    label: item.THNAME,
    value: item.CODE
  })), []);
  const reportNameOptions = useMemo(() => filteredReports.map((item, index) => ({
    label: item.RPTSVR_NAME,
    value: index
  })), [filteredReports]);
  const decrementClock = () => {
    if (countdown === 0) {
      reportFlow('POLL', 'หมดเวลารอ server', `recon=${recon}`);
      reportLog('countdown:timeout', { recon });
      setCountdown(0);
      clearInterval(clockCall);
    } else if (countdown === 16) {
      reportFlow('POLL', 'ถึงเวลาถามสถานะอีกครั้ง', `recon=${recon}`);
      reportLog('countdown:poll', { recon, kye_token });
      connectAgain();
    } else if (countdown === 17 || countdown === 18) {
      reportFlow('POLL', `รอ poll อีก ${countdown} วินาที`);
      setCountdown(countdown - 1);
    } else {
      setCountdown(countdown - 1);
    }
  };
  useEffect(() => {
    if (countdown === 0) {
      reportLog('countdown:showReconnectAlert');
      Alert.alert(Language.t('alert.errorTitle'), Language.t('selectBase.UnableConnec'), [{
        text: Language.t('selectBase.connectAgain'),
        onPress: () => connectAgain()
      }, {
        text: Language.t('main.cancel'),
        onPress: () => BackHandler.exitApp()
      }]);
    }
  }, [countdown]);
  const connectAgain = () => {
    reportFlow('POLL', 'connectAgain', `recon=${recon}`);
    reportLog('connectAgain', { recon });
    if (recon == 'fetchData') fetchData();else if (recon == 'PushPRINTREPORT') PushPRINTREPORT();else if (recon == 'fetchDataStatus') fetchDataStatus(kye_token);else setLoading(false);
  };
  const dieSer = fn => {
    reportLog('dieSer', { fn });
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
    setLoadingKind('data');
    setLoading(true);
    const apiUrl = databaseReducer.Data.urlser + '/RptServer';
    const requestBody = {
      'BPAPUS-BPAPSV': loginReducer.serviceID,
      'BPAPUS-LOGIN-GUID': loginReducer.guid,
      'BPAPUS-FUNCTION': 'GETREPORTNAME',
      'BPAPUS-PARAM': '{"RPTSVR_GRANT": "' + activityReducer.RPTSVR_GRANT + '"}',
      'BPAPUS-FILTER': '',
      'BPAPUS-ORDERBY': '',
      'BPAPUS-OFFSET': '0',
      'BPAPUS-FETCH': '0'
    };
    reportLog('fetchData:start', { apiUrl, requestBody });
    const startedAt = Date.now();
    await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    }).then(response => response.json()).then(async json => {
      reportLog('fetchData:response', {
        ms: Date.now() - startedAt,
        ResponseCode: json.ResponseCode,
        ReasonString: json.ReasonString || null,
      });
      if (json.ResponseCode == 200) {
        let responseData = JSON.parse(json.ResponseData);
        reportLog('fetchData:parsed', {
          RECORD_COUNT: responseData.RECORD_COUNT,
          count: responseData.GETREPORTNAME?.length || 0,
        });
        if (responseData.RECORD_COUNT > 0) {
          await setREPORTNAME(responseData.GETREPORTNAME);
        } else {
          reportLog('fetchData:noData');
          Alert.alert(Language.t('alert.errorTitle'), Language.t('report.noData'), [{
            text: Language.t('alert.ok'),
            onPress: () => navigation.goBack()
          }]);
        }
      } else {
        let temp_error = 'error_ser.' + json.ResponseCode;
        reportLog('fetchData:errorCode', { temp_error, json });
        Alert.alert(`${Language.t('alert.errorTitle')} `, Language.t(temp_error), [{
          text: Language.t('alert.ok'),
          onPress: () => navigation.goBack()
        }]);
        setLoading(false);
      }
      setLoading(false);
      setCountdown(-1);
      reportLog('fetchData:done');
    }).catch(error => {
      reportLog('fetchData:catch', { message: String(error) });
      console.error(`${LOG_TAG} fetchData error =`, error);
      setCountdown(-1);
      let temp_error = 'error_ser.' + 610;
      Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
        text: Language.t('alert.ok'),
        onPress: () => navigation.dispatch(navigation.replace('LoginScreen'))
      }]);
      setLoading(false);
    });
  };
  const PushPRINTREPORT = async tempGuid => {
    dieSer('PushPRINTREPORT');
    let tempprintItem = {};
    setLoadingKind('print');
    setLoading(true);
    if (printItem.RPTSVR_GUID) {
      tempprintItem = printItem;
    } else {
      tempprintItem = filterReportsByType(REPORTNAME, typeCode)[0] ?? {};
    }
    let sDate = safe_Format.setnewdateF(start_date);
    sDate = parseInt(sDate);
    let eDate = safe_Format.setnewdateF(end_date);
    if (printItem.RPTSVR_RPF_DD_FIELD == 'ANYDATE') eDate = sDate;else eDate = parseInt(eDate);
    reportFlow(
      'STEP1_PRINT',
      'ส่งคำสั่งพิมพ์ → PRINTREPORT',
      `report=${tempprintItem.RPTSVR_NAME || '-'} | guid=${tempprintItem.RPTSVR_GUID || '-'} | from=${sDate} | to=${eDate}`,
    );
    reportLog('PushPRINTREPORT:start', {
      report: {
        guid: tempprintItem.RPTSVR_GUID,
        name: tempprintItem.RPTSVR_NAME,
        dateField: tempprintItem.RPTSVR_RPF_DD_FIELD,
      },
      sDate,
      eDate,
      typeCode,
    });
    if (sDate > eDate) {
      reportFlow('STEP1_PRINT', 'ล้มเหลว - วันที่ไม่ถูกต้อง', `from=${sDate} to=${eDate}`);
      reportLog('PushPRINTREPORT:invalidDate', { sDate, eDate });
      Alert.alert(Language.t('report.Failed'), Language.t('report.FailedInfo'), [{
        text: Language.t('alert.ok'),
        onPress: () => setLoading(false)
      }]);
    } else {
      const apiUrl = databaseReducer.Data.urlser + '/RptServer';
      const requestBody = {
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'PRINTREPORT',
        'BPAPUS-PARAM': '{"RPTSVR_GRANT": "' + activityReducer.RPTSVR_GRANT + '","RPTSVR_GUID": "' + tempprintItem.RPTSVR_GUID + '","RPTQUE_RQST_FROMDATE": "' + sDate + '","RPTQUE_RQST_TODATE": "' + eDate + '","RPTQUE_RQST_OPTN": "","RPTQUE_RQST_PARAM": ""}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      };
      reportLog('PushPRINTREPORT:request', { apiUrl, requestBody });
      const startedAt = Date.now();
      await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      }).then(response => response.json()).then(json => {
        reportLog('PushPRINTREPORT:response', {
          ms: Date.now() - startedAt,
          ResponseCode: json.ResponseCode,
          ReasonString: json.ReasonString || null,
          ResponseData: json.ResponseData || null,
        });
        let responseData = JSON.parse(json.ResponseData);
        let tempRPTSVR_DATA = activityReducer.RPTSVR_DATA;
        if (json.ResponseCode == 200) {
          pollCountRef.current = 0;
          reportFlow(
            'STEP1_PRINT',
            'สำเร็จ - ได้คิวงาน',
            `RPTQUE_GUID=${responseData.RPTQUE_GUID || '-'} | RPTQUE_KEY=${responseData.RPTQUE_KEY || '-'}`,
          );
          reportLog('PushPRINTREPORT:queued', responseData);
          tempRPTSVR_DATA.push(responseData);
          dispatch(activityActions.RPTSVR_DATA(tempRPTSVR_DATA));
          setGETPRINTSTATUS([]);
          fetchDataStatus(responseData);
        } else {
          reportFlow(
            'STEP1_PRINT',
            'ล้มเหลว',
            `ResponseCode=${json.ResponseCode} | ${json.ReasonString || '-'}`,
          );
          reportLog('PushPRINTREPORT:failed', json);
          setLoading(false);
          Alert.alert(Language.t('notiAlert.header'), `${Language.t('report.Failed')} ${json.ReasonString}`, [{
            text: Language.t('alert.ok'),
            onPress: () => void 0
          }]);
        }
      }).catch(error => {
        reportLog('PushPRINTREPORT:catch', { message: String(error) });
        console.error(`${LOG_TAG} PushPRINTREPORT error =`, error);
        setCountdown(-1);
        let temp_error = 'error_ser.' + 610;
        Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
          text: Language.t('alert.ok'),
          onPress: () => navigation.dispatch(navigation.replace('LoginScreen'))
        }]);
        setLoading(false);
      });
    }
    reportLog('PushPRINTREPORT:clearCountdown');
    setCountdown(-1);
  };
  const fetchDataStatus = async itemtoken => {
    pollCountRef.current += 1;
    const pollNumber = pollCountRef.current;
    const queueGuid = itemtoken?.RPTQUE_GUID || itemtoken;
    reportFlow(
      'STEP2_STATUS',
      `poll #${pollNumber} ถามสถานะ → GETPRINTSTATUS`,
      `RPTQUE_GUID=${queueGuid}`,
    );
    reportLog('fetchDataStatus:start', {
      itemtoken,
      tokenType: typeof itemtoken,
      RPTQUE_GUID: itemtoken?.RPTQUE_GUID || itemtoken,
    });
    setkye_token(itemtoken);
    dieSer('fetchDataStatus');
    setLoadingKind('print');
    setLoading(true);
    const apiUrl = databaseReducer.Data.urlser + '/RptServer';
    const requestBody = {
      'BPAPUS-BPAPSV': loginReducer.serviceID,
      'BPAPUS-LOGIN-GUID': loginReducer.guid,
      'BPAPUS-FUNCTION': 'GETPRINTSTATUS',
      'BPAPUS-PARAM': '{"RPTQUE_GUID": "' + queueGuid + '"}',
      'BPAPUS-FILTER': '',
      'BPAPUS-ORDERBY': '',
      'BPAPUS-OFFSET': '0',
      'BPAPUS-FETCH': '0'
    };
    reportLog('fetchDataStatus:request', { apiUrl, requestBody });
    const startedAt = Date.now();
    await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    }).then(response => response.json()).then(json => {
      reportLog('fetchDataStatus:response', {
        ms: Date.now() - startedAt,
        ResponseCode: json.ResponseCode,
        ReasonString: json.ReasonString || null,
        ResponseData: json.ResponseData || null,
      });
      let responseData = JSON.parse(json.ResponseData);
      reportLog('fetchDataStatus:parsed', {
        RECORD_COUNT: responseData.RECORD_COUNT,
        status: responseData.GETPRINTSTATUS?.[0] || null,
      });
      if (responseData.RECORD_COUNT > 0) {
        const statusItem = responseData.GETPRINTSTATUS[0];
        const printStatus = statusItem.RPTQUE_RSLT_STATUS;
        logPrintStatusItem(statusItem, pollNumber);
        if (printStatus == 1) {
          reportFlow('STEP2_STATUS', `poll #${pollNumber} เสร็จแล้ว - ไปดาวน์โหลด PDF`);
          reportLog('fetchDataStatus:success', statusItem);
          setGETPRINTSTATUS(responseData.GETPRINTSTATUS);
          DownloadReport(responseData.GETPRINTSTATUS[0]);
          setCountdown(-1);
          setLoading(false);
        } else if (printStatus == 0) {
          reportFlow(
            'POLL',
            `poll #${pollNumber} ยังไม่เสร็จ - รอ 18 วินาที แล้วถามอีกครั้ง`,
            getPrintStatusLabel(printStatus),
          );
          reportLog('fetchDataStatus:processing', {
            status: printStatus,
            nextPollInSec: 18,
          });
          setCountdown(18);
          setGETPRINTSTATUS(responseData.GETPRINTSTATUS);
        } else {
          reportFlow(
            'STEP2_STATUS',
            `poll #${pollNumber} จบด้วยสถานะพิเศษ`,
            getPrintStatusLabel(printStatus),
          );
          reportLog('fetchDataStatus:terminal', { status: printStatus });
          setCountdown(-1);
          setLoading(false);
          Alert.alert(Language.t('notiAlert.header'), `${responseData.GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 7 ? Language.t('report.cancelled') : responseData.GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 8 ? Language.t('report.cancelled') : responseData.GETPRINTSTATUS[0].RPTQUE_RSLT_STATUS == 1 ? Language.t('report.Successful') : Language.t('report.printing')}
                        `, [{
            text: Language.t('selectBase.yes'),
            onPress: () => setLoading(false)
          }]);
        }
      } else {
        reportFlow(
          'STEP2_STATUS',
          `poll #${pollNumber} ไม่มีข้อมูล RECORD_COUNT=0 - ลองถามอีกครั้ง`,
          `RPTQUE_GUID=${queueGuid}`,
        );
        reportLog('fetchDataStatus:emptyRecord', {
          queueGuid,
          retryWith: itemtoken?.RPTQUE_GUID || itemtoken,
        });
        setCountdown(15);
        fetchDataStatus(itemtoken?.RPTQUE_GUID ? itemtoken : { RPTQUE_GUID: itemtoken });
      }
    }).catch(error => {
      reportLog('fetchDataStatus:catch', { message: String(error) });
      console.error(`${LOG_TAG} fetchDataStatus error =`, error);
      let temp_error = 'error_ser.' + 610;
      Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
        text: Language.t('alert.ok'),
        onPress: () => navigation.dispatch(navigation.replace('LoginScreen'))
      }]);
      setLoading(false);
    });
  };
  const DownloadReport = async tempItem => {
    const savePathPreview = tempItem?.RPTQUE_RSLT_PATH || '-';
    reportFlow(
      'STEP3_DOWNLOAD',
      'เริ่มดาวน์โหลด PDF → DownloadFile',
      `fileName=${savePathPreview}`,
    );
    reportLog('DownloadReport:start', tempItem);
    dieSer('DownloadReport');
    setGETPRINTSTATUS([]);
    const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
      title: '',
      message: '',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK'
    });
    reportLog('DownloadReport:permission', { permission });
    if (permission === 'denied') {
      reportFlow('STEP3_DOWNLOAD', 'ล้มเหลว - ไม่ได้รับ permission storage');
      reportLog('DownloadReport:permissionDenied');
      setLoading(false);
      return;
    }
    if (permission === 'granted') {
      // YOUR WRITE FUNCTION HERE
    }
    let base64 = null;
    let dirs = RNFetchBlob.fs.dirs.DocumentDir;
    let docpath = tempItem.RPTQUE_RSLT_PATH.split('\\');
    let docname;
    for (var i in docpath) if (docpath[i].toUpperCase().search('.PDF') > -1) docname = docpath[i];
    docname = docname.toUpperCase().split('.PDF');
    const downloadUrl = databaseReducer.Data.urlser + '/DownloadFile';
    const downloadHeaders = {
      'BPAPUS-BPAPSV': loginReducer.serviceID,
      'BPAPUS-GUID': loginReducer.guid,
      FilePath: '',
      FileName: tempItem.RPTQUE_RSLT_PATH
    };
    reportLog('DownloadReport:request', {
      downloadUrl,
      downloadHeaders,
      savePath: dirs + `/${docname[0]}.pdf`,
    });
    const startedAt = Date.now();
    await RNFetchBlob.config({
      path: dirs + `/${docname[0]}.pdf`,
      appendExt: 'pdf',
      mime: 'file/pdf',
      description: `${docname[0]}.pdf`,
      fileCache: true,
      useDownloadManager: true,
      notification: true
    }).fetch('GET', downloadUrl, downloadHeaders).then(res => {
      base64 = res.path();
      reportFlow('STEP3_DOWNLOAD', 'สำเร็จ - เปิด PDF', `path=${base64}`);
      reportLog('DownloadReport:success', {
        ms: Date.now() - startedAt,
        path: base64,
      });
      setLoading(false);
      RNFetchBlob.android.actionViewIntent(base64, 'application/pdf');
    }).catch(error => {
      reportLog('DownloadReport:catch', { message: String(error) });
      console.error(`${LOG_TAG} DownloadReport error =`, error);
      let temp_error = 'error_ser.' + 610;
      Alert.alert(Language.t('alert.errorTitle'), Language.t(temp_error), [{
        text: Language.t('alert.ok'),
        onPress: () => navigation.dispatch(navigation.replace('LoginScreen'))
      }]);
      setLoading(false);
    });
  };
  return <SelectOverlayProvider>
    <View style={styles.container1}>
      <StatusBar hidden={true} />
      <ImageBackground source={require(image)} onLoadEnd={() => {
        setLoading_backG(false);
      }} resizeMode="cover" style={styles.image}>
        <Image style={styles.topImage} source={require(`../../images/UI/Asset5.png`)} />
        {!loading_backG && REPORTNAME.length > 0 ? <>
            <ScrollView>
              <KeyboardAvoidingView keyboardVerticalOffset={1}>
                <View style={styles.body}>
                  <View style={styles.body1}>
                    <Text style={styles.textTitleInfo}>
                      {Language.t('report.ReportType')} :
                    </Text>
                  </View>
                  <ReportSelectRow selectedLabel={typeItem?.THNAME ?? ''} selectedValue={typeCode} options={reportTypeOptions} modalTitle={Language.t('report.ReportType')} onSelect={value => {
                    reportLog('typeSelected', { typeCode: value });
                    setTypeCode(value);
                  }} />
                  <View style={styles.body1}>
                    <Text style={styles.textTitleInfo}>
                      {Language.t('report.reportName')} :
                    </Text>
                  </View>
                  {filteredReports.length > 0 ? <ReportSelectRow selectedLabel={reportNameLabel} selectedValue={reportNamePickerIndex} options={reportNameOptions} modalTitle={Language.t('report.reportName')} onSelect={index => {
                  const picked = filteredReports[Number(index)];
                  if (picked?.RPTSVR_GUID) {
                    reportLog('reportSelected', {
                      guid: picked.RPTSVR_GUID,
                      name: picked.RPTSVR_NAME,
                      dateField: picked.RPTSVR_RPF_DD_FIELD,
                    });
                    setPrintGuid(picked.RPTSVR_GUID);
                  }
                }} /> : <ReportSelectRow selectedLabel={Language.t('report.noData')} selectedValue={null} options={[]} enabled={false} labelColor="#979797" onSelect={() => {}} />}
                  {filteredReports.length > 0 && (printItem && printItem.RPTSVR_RPF_DD_FIELD == 'ANYDATE' ? <>
                        <View style={styles.body1}>
                          <Text style={styles.textTitleInfo}>
                            {Language.t('report.asof')} :
                          </Text>
                        </View>
                        <View style={{
                    marginTop: 10
                  }}>
                          <CalendarScreen value={start_date} onChange={vel => setS_date(vel)} language={Language.getLang()} era={'be'} format={'DD/MM/YYYY'} borderColor={Colors.backgroundColorSecondary} linkTodateColor={Colors.itemColor} calendarModel={{
                      backgroundColor: Colors.backgroundColor,
                      buttonSuccess: {
                        backgroundColor: Colors.itemColor
                      },
                      pickItem: {
                        color: Colors.itemColor
                      }
                    }} borderWidth={0} icon={{
                      color: Colors.fontColor
                    }} fontSize={FontSize.medium} fontColor={Colors.fontColor} width={deviceWidth * 0.95} borderRadius={10} />
                        </View>
                      </> : <>
                        <View style={styles.body1}>
                          <Text style={styles.textTitleInfo}>
                            {Language.t('report.from')} :
                          </Text>
                        </View>
                        <View style={{
                    marginTop: 10
                  }}>
                          <CalendarScreen value={start_date} onChange={vel => setS_date(vel)} language={Language.getLang()} era={'be'} format={'DD/MM/YYYY'} borderColor={Colors.backgroundColorSecondary} linkTodateColor={Colors.itemColor} calendarModel={{
                      backgroundColor: Colors.backgroundColor,
                      buttonSuccess: {
                        backgroundColor: Colors.itemColor
                      },
                      pickItem: {
                        color: Colors.itemColor
                      }
                    }} borderWidth={0} icon={{
                      color: Colors.fontColor
                    }} fontSize={FontSize.medium} fontColor={Colors.fontColor} width={deviceWidth * 0.95} borderRadius={10} />
                        </View>
                        <View style={styles.body1}>
                          <Text style={styles.textTitleInfo}>
                            {Language.t('report.to')} :
                          </Text>
                        </View>
                        <View style={{
                    marginTop: 10,
                    marginBottom: 10
                  }}>
                          <CalendarScreen value={end_date} onChange={vel => setE_date(vel)} language={Language.getLang()} era={'be'} format={'DD/MM/YYYY'} borderColor={Colors.backgroundColorSecondary} linkTodateColor={Colors.itemColor} calendarModel={{
                      backgroundColor: Colors.backgroundColor,
                      buttonSuccess: {
                        backgroundColor: Colors.itemColor
                      },
                      pickItem: {
                        color: Colors.itemColor
                      }
                    }} borderWidth={0} icon={{
                      color: Colors.fontColor
                    }} fontSize={FontSize.medium} fontColor={Colors.fontColor} width={deviceWidth * 0.95} borderRadius={10} />
                        </View>
                      </>)}
                  <View style={{
                  marginTop: FontSize.large
                }}>
                    {filteredReports.length > 0 ? <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={() => {
                    reportFlow(
                      'UI',
                      'กดพิมพ์',
                      printItem.RPTSVR_NAME || REPORTNAME[0]?.RPTSVR_NAME || '-',
                    );
                    reportLog('printButton:pressed', {
                      name: printItem.RPTSVR_NAME || REPORTNAME[0]?.RPTSVR_NAME,
                      guid: printItem.RPTSVR_GUID,
                    });
                    Alert.alert(Language.t('notiAlert.header'), `${Language.t('report.doPrint')} ${printItem.RPTSVR_NAME ? printItem.RPTSVR_NAME : REPORTNAME[0].RPTSVR_NAME} ${Language.t('report.YorN')}`, [{
                      text: Language.t('selectBase.yes'),
                      onPress: () => {
                        reportFlow('UI', 'ยืนยันพิมพ์');
                        reportLog('printButton:confirmed');
                        PushPRINTREPORT();
                      }
                    }, {
                      text: Language.t('selectBase.no'),
                      onPress: () => void 0
                    }]);
                  }}>
                        <Text style={styles.textTitle}>
                          {' '}
                          {Language.t('report.print')}
                        </Text>
                      </TouchableOpacity> : <TouchableOpacity disabled={true} style={[styles.Cbutton, styles.buttonClose]} onPress={() => {}}>
                        <Text style={styles.textTitle}>
                          {' '}
                          {Language.t('report.print')}
                        </Text>
                      </TouchableOpacity>}
                  </View>
                </View>
              </KeyboardAvoidingView>
            </ScrollView>
          </> : <View style={{
          width: deviceWidth,
          height: deviceHeight,
          opacity: 0.5,
          backgroundColor: Colors.backgroundLoginColorSecondary,
          alignSelf: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          position: 'absolute'
        }}></View>}

        {loading ? <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.45)',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
            <View style={{
            backgroundColor: Colors.backgroundColorSecondary,
            borderRadius: 16,
            paddingVertical: 28,
            paddingHorizontal: 36,
            alignItems: 'center',
            minWidth: deviceWidth * 0.55
          }}>
              <ActivityIndicator size="large" color={Colors.loadingColor} />
              <Text style={{
              marginTop: 16,
              fontSize: FontSize.medium,
              fontWeight: '600',
              color: Colors.fontColor
            }}>
                {loadingKind === 'print' ? Language.t('report.orderingPrint') : Language.t('report.loadingData')}
              </Text>
            </View>
          </View> : null}
      </ImageBackground>
    </View>
    </SelectOverlayProvider>;
};
const styles = StyleSheet.create({
  container1: {
    flex: 1,
    flexDirection: 'column'
  },
  body: {
    margin: 10,
    borderRadius: 15
  },
  body1e: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  body1: {
    marginTop: 20,
    flexDirection: 'row'
  },
  tabbar: {
    height: 70,
    padding: 5,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  footer: {
    position: 'absolute',
    justifyContent: 'center',
    padding: 10,
    left: 0,
    top: deviceHeight * 0.8,
    width: deviceWidth
  },
  table: {
    flex: 1,
    width: deviceWidth * 2,
    borderRadius: 15,
    backgroundColor: Colors.backgroundColorSecondary
  },
  tableView: {
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 10,
    width: deviceWidth * 2,
    flexDirection: 'row'
  },
  FaketableView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: deviceHeight * 0.4,
    width: deviceWidth * 2,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row'
  },
  tableHeader: {
    borderTopLeftRadius: 15,
    borderTopEndRadius: 15,
    padding: 10,
    flexDirection: 'row',
    backgroundColor: Colors.buttonColorPrimary
  },
  dorpdown: {
    justifyContent: 'center',
    fontSize: FontSize.medium
  },
  dorpdownTop: {
    justifyContent: 'flex-end',
    fontSize: FontSize.medium
  },
  textTitle: {
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.fontColor2
  },
  textTitleInfo: {
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.fontColor
  },
  image: {
    flex: 1
  },
  topImage: {
    height: deviceHeight / 2.6,
    width: deviceWidth
  },
  imageIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    marginTop: 10,
    height: deviceHeight * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonColorPrimary,
    borderRadius: 10
  },
  Cbutton: {
    marginTop: 10,
    height: deviceHeight * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.borderColor,
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
    marginLeft: 10,
    marginBottom: 20
  },
  checkbox: {
    alignSelf: 'center',
    borderBottomColor: '#ffff',
    color: '#ffff'
  },
  label: {
    margin: 8,
    color: '#ffff'
  },
  centeredView: {
    flex: 1,
    marginTop: deviceHeight * 0.3,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: deviceWidth
  },
  modalView: {
    backgroundColor: Colors.backgroundLoginColor,
    borderRadius: 20,
    padding: 10,
    width: 'auto',
    shadowColor: '#000'
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: Colors.fontColor2,
    fontSize: FontSize.medium
  }
});
const mapStateToProps = state => {
  return {};
};
const mapDispatchToProps = dispatch => {
  return {
    reduxMachineNum: payload => dispatch(registerActions.machine(payload))
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ReportScreen);