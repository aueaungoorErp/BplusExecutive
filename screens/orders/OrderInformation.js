import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Text, View, Image, ImageBackground, TextInput, KeyboardAvoidingView, ActivityIndicator, Alert, Platform, BackHandler, StatusBar, ScrollView, TouchableNativeFeedback, TouchableOpacity, Pressable } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button';
import DeviceInfo from 'react-native-device-info';
import { NetworkInfo } from 'react-native-network-info';
import CalendarScreen from '@blacksakura013/th-datepicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { faAward } from '@fortawesome/free-solid-svg-icons';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
/** Fits date pickers inside the search modal sheet (padding + margins). */
const DATE_PICKER_WIDTH = Math.max(180, deviceWidth - 72);
const OrderInformation = ({
  route
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
  const [btn, setBtn] = useState([{
    name: 'ประวัติการซื้อ',
    state: true
  }, {
    name: 'ประวัติการขาย',
    state: false
  }, {
    name: 'จำนวนคงเหลือ',
    state: false
  }, {
    name: 'ราคาขาย',
    state: false
  }]);
  const [loading, setLoading] = useStateIfMounted(false);
  const [loading_backG, setLoading_backG] = useStateIfMounted(true);
  const [Sp000211Objloading, setSp000211Objloading] = useState([]);
  const [Oe404Objloading, setOe404Objloading] = useStateIfMounted(false);
  const [Oe304Objloading, setOe304Objloading] = useStateIfMounted(false);
  const [SHOWWLSKUQTYBYGOODSKEY, setSHOWWLSKUQTYBYGOODSKEY] = useState([]);
  const [arraySp000211, setArraySp000211] = useState([]);
  const [arrayOe404Obj, setArrayOe404Obj] = useState([]);
  const [arrayOe304Obj, setArrayOe304Obj] = useState([]);
  const [GoodsInfo, setGoodsInfo] = useState([]);
  const [data, setData] = useStateIfMounted({
    secureTextEntry: true
  });
  const [modalVisible, setModalVisible] = useState(true);
  const [radioIndex1, setRadioIndex1] = useState(6);
  const [radioIndex2, setRadioIndex2] = useState(6);
  const [radioIndex3, setRadioIndex3] = useState(6);
  const [start_date, setS_date] = useState(new Date());
  const [end_date, setE_date] = useState(new Date());
  const image = '../../images/UI/Asset35.png';
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
    setModalVisible(true);
    stacklode();
  }, []);
  const stacklode = async () => {
    await getSKUINFOBYGOODSCODE();
    for (var i in GoodsInfo.GOODSMASTER) {}
    await setLoading(false);
  };
  useEffect(() => {
    setRadio_menu3(1, radio_props[5].value);
  }, []);
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
  useEffect(() => {}, [registerReducer.machineNum]);
  const closeLoading = () => {
    setLoading(false);
  };
  const letsLoading = () => {
    setLoading(true);
  };
  const InCome = async () => {
    await letsLoading();
    await fetchInCome();

    //  setArrayObj(arrayResult)
  };
  const normalizePickerDate = value => safe_Format.checkDate(value);
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
  const SInCome = async () => {
    const fromDate = normalizePickerDate(start_date);
    const toDate = normalizePickerDate(end_date);
    if (fromDate.getTime() > toDate.getTime()) {
      Alert.alert(Language.t('alert.errorTitle'), Language.t('report.dateRangeInvalid'), [{
        text: Language.t('alert.ok')
      }]);
      return;
    }
    setS_date(fromDate);
    setE_date(toDate);
    setModalVisible(false);
    await fetchInCome();
  };
  const regisMacAdd = async () => {
    let tempGuid = await safe_Format._fetchGuidLog(databaseReducer.Data.urlser, loginReducer.serviceID, registerReducer.machineNum, loginReducer.userNameED, loginReducer.passwordED);
    await dispatch(loginActions.guid(tempGuid));
    fetchInCome(tempGuid);
  };
  const set_StateBtn = index => {
    let temp_stateBtn = [];
    for (var i in btn) {
      let ObjBtn = {};
      if (i == index) ObjBtn = {
        name: btn[i].name,
        state: true
      };else ObjBtn = {
        name: btn[i].name,
        state: false
      };
      temp_stateBtn.push(ObjBtn);
    }
    setBtn(temp_stateBtn);
  };
  const m1 = async tempGuid => {
    if (tempGuid) {
      await fetchOe404(tempGuid);
      await setOe404Objloading(false);
    } else {
      await fetchOe404();
      await setOe404Objloading(false);
    }
  };
  const m2 = async tempGuid => {
    if (tempGuid) {
      await fetchSHOWWLSKUQTYBYGOODSKEY(tempGuid);
      await closeLoading();
    } else {
      await fetchSHOWWLSKUQTYBYGOODSKEY();
      await closeLoading();
    }
  };
  const m3 = async tempGuid => {
    if (tempGuid) {
      await fetchOe304(tempGuid);
      await setOe304Objloading(false);
    } else {
      await fetchOe304();
      await setOe304Objloading(false);
    }
  };
  const m4 = async tempGuid => {
    if (tempGuid) {
      await fetchSp000211(tempGuid);
      await setSp000211Objloading(false);
    } else {
      await fetchSp000211();
      await setSp000211Objloading(false);
    }
  };
  const fetchInCome = async tempGuid => {
    setOe404Objloading(true);
    setOe304Objloading(true);
    if (tempGuid) {
      m1(tempGuid);
      m2(tempGuid);
      m3(tempGuid);
      m4(tempGuid);
    } else {
      m1();
      m2();
      m3();
      m4();
    }
  };
  const getSKUINFOBYGOODSCODE = async tempGuid => {
    await fetch(databaseReducer.Data.urlser + '/SetupErp', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'GETSKUINFOBYGOODSCODE',
        'BPAPUS-PARAM': '{"GOODS_CODE": "' + route.params.data.GOODS_CODE + '"}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(async json => {
      let responseData = JSON.parse(json.ResponseData);
      if (responseData.RECORD_COUNT > 0) {
        let obj = {
          DOCINFO: responseData.DOCINFO,
          GOODSMASTER: responseData.GOODSMASTER
        };
        setGoodsInfo(obj);
      }
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
      }
      console.error('ERROR at fetchContent >> ' + error);
    });
  };
  const fetchSHOWWLSKUQTYBYGOODSKEY = async tempGuid => {
    await fetch(databaseReducer.Data.urlser + '/Executive', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'SHOWWLSKUQTYBYGOODSKEY',
        'BPAPUS-PARAM': '{"TO_DATE": "' + safe_Format.setnewdateF(safe_Format.checkDate(end_date)) + '","GOODS_KEY": "' + route.params.data.GOODS_KEY + '"}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(json => {
      let responseData = JSON.parse(json.ResponseData);
      if (responseData.RECORD_COUNT > 0) {
        const unique = [...new Set(responseData.SHOWWLSKUQTYBYGOODSKEY.map(item => JSON.stringify(item)))].map(item => JSON.parse(item));
        setSHOWWLSKUQTYBYGOODSKEY(unique);
      }
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
      }
      console.error('ERROR at fetchContent >> ' + error);
    });
  };
  const fetchSp000211 = async tempGuid => {
    setArraySp000211([]);
    setSp000211Objloading(true);
    await fetch(databaseReducer.Data.urlser + '/LookupErp', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'Sp000211',
        'BPAPUS-PARAM': '',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(async json => {
      let responseData = JSON.parse(json.ResponseData);
      if (responseData.RECORD_COUNT > 0) {
        for (var i in responseData.Sp000211) {
          await fetchSp000221(tempGuid ? tempGuid : loginReducer.guid, responseData.Sp000211[i]);
        }
      }
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
      }
      console.error('ERROR at fetchContent >> ' + error);
    });
  };
  const fetchSp000221 = async (tempGuid, Sp211) => {
    let Sp000211 = arraySp000211;
    for (var i in GoodsInfo.GOODSMASTER) {
      await fetch(databaseReducer.Data.urlser + '/LookupErp', {
        method: 'POST',
        body: JSON.stringify({
          'BPAPUS-BPAPSV': loginReducer.serviceID,
          'BPAPUS-LOGIN-GUID': tempGuid,
          'BPAPUS-FUNCTION': 'Sp000221',
          'BPAPUS-PARAM': '',
          'BPAPUS-FILTER': "AND ( ARPRB_CODE ='" + Sp211.ARPRB_CODE + "') AND ( GOODS_CODE ='" + GoodsInfo.GOODSMASTER[i].GOODS_CODE + "')  ",
          'BPAPUS-ORDERBY': '',
          'BPAPUS-OFFSET': '0',
          'BPAPUS-FETCH': '0'
        })
      }).then(response => response.json()).then(async json => {
        let responseData = JSON.parse(json.ResponseData);
        if (responseData.RECORD_COUNT > 0) {
          let Sp000221 = responseData.Sp000221;
          if (Sp000221.length > 0) {
            let obj = {
              WPurcPrice: Sp211,
              Sp000221: Sp000221,
              SKU_STD_COST: await READSKU('SKU_STD_COST', GoodsInfo.DOCINFO.SKU_KEY),
              SKU_STD_COST_TY: Number(await READSKU('SKU_STD_COST', GoodsInfo.DOCINFO.SKU_KEY)) + Number(await READSKU('SKU_COST_TY', GoodsInfo.DOCINFO.SKU_KEY))
            };
            Sp000211.push(obj);
          }
        }
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
        }
        console.error('ERROR at fetchContent >> ' + error);
      });
    }
    const unique = [...new Set(Sp000211.map(item => JSON.stringify(item)))].map(item => JSON.parse(item));
    await setArraySp000211(unique);
  };
  const READSKU = async (SKU_FIELDNAME, SKU_KEY) => {
    let temReturnData = 0;
    await fetch(databaseReducer.Data.urlser + '/ReadErp', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': loginReducer.guid,
        'BPAPUS-FUNCTION': 'READSKUATTRBYSKUKEYANDATTRFIELDNAME',
        'BPAPUS-PARAM': '{"SKU_FIELDNAME":"' + SKU_FIELDNAME + '","SKU_KEY": "' + SKU_KEY + '"}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(json => {
      let responseData = JSON.parse(json.ResponseData);
      if (responseData.RECORD_COUNT > 0) {
        let READSKUATTR = responseData.READSKUATTRBYSKUKEYANDATTRFIELDNAME[0];
        if (SKU_FIELDNAME == 'SKU_STD_COST') temReturnData = READSKUATTR.SKU_STD_COST;
        if (SKU_FIELDNAME == 'SKU_COST_TY') temReturnData = READSKUATTR.SKU_COST_TY;
      }
    }).catch(error => {
      console.error(error);
      let temp_error = 'error_ser.' + 610;
      console.error('ERROR at fetchContent >> ' + error);
    });
    return temReturnData;
  };
  const fetchOe404 = async tempGuid => {
    setArrayOe404Obj([]);
    setOe404Objloading(true);
    await fetch(databaseReducer.Data.urlser + '/LookupErp', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'Oe000404',
        'BPAPUS-PARAM': '',
        'BPAPUS-FILTER': "AND ( DI_DATE  >='" + safe_Format.setnewdateF(safe_Format.checkDate(start_date)) + "') AND ( DI_DATE  <='" + safe_Format.setnewdateF(safe_Format.checkDate(end_date)) + "') ",
        'BPAPUS-ORDERBY': 'ORDER BY DI_DATE DESC',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(async json => {
      let responseData = JSON.parse(json.ResponseData);
      if (responseData.RECORD_COUNT > 0) {
        for (var i in responseData.Oe000404) {
          await GetReceiveDocinfo(tempGuid ? tempGuid : loginReducer.guid, responseData.Oe000404[i]);
        }
      }
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
      }
      console.error('ERROR at fetchContent >> ' + error);
    });
  };
  const GetReceiveDocinfo = async (tempGuid, Oe000404) => {
    let Oe404Obj = arrayOe404Obj;
    await fetch(databaseReducer.Data.urlser + '/UpdateErp', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid,
        'BPAPUS-FUNCTION': 'GetReceiveDocinfo',
        'BPAPUS-PARAM': '{"DI_KEY":"' + Oe000404.DI_KEY + '"}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(async json => {
      let responseData = JSON.parse(json.ResponseData);
      if (responseData.RECORD_COUNT > 0) {
        for (var i in GoodsInfo.GOODSMASTER) {
          let Transtkd = responseData.TRANSTKD.filter(Transtkd => {
            return Transtkd.GOODS_CODE == GoodsInfo.GOODSMASTER[i].GOODS_CODE;
          });
          if (Transtkd.length > 0) {
            let obj = {
              Oe000404: Oe000404,
              Docinfo: responseData.DOCINFO,
              Transtkh: responseData.TRANSTKH,
              Transtkd: Transtkd
            };
            Oe404Obj.push(obj);
          }
        }
      }
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
      }
      console.error('ERROR at fetchContent >> ' + error);
    });
    const unique = [...new Set(Oe404Obj.map(item => JSON.stringify(item)))].map(item => JSON.parse(item));
    await setArrayOe404Obj(unique);
  };
  const fetchOe304 = async tempGuid => {
    setArrayOe304Obj([]);
    setOe304Objloading(true);
    await fetch(databaseReducer.Data.urlser + '/LookupErp', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'Oe000304',
        'BPAPUS-PARAM': '',
        'BPAPUS-FILTER': "AND ( DI_DATE  >='" + safe_Format.setnewdateF(safe_Format.checkDate(start_date)) + "') AND ( DI_DATE  <='" + safe_Format.setnewdateF(safe_Format.checkDate(end_date)) + "') ",
        'BPAPUS-ORDERBY': 'ORDER BY DI_DATE DESC',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(async json => {
      let responseData = JSON.parse(json.ResponseData);
      if (responseData.RECORD_COUNT > 0) {
        for (var i in responseData.Oe000304) {
          await GetInvoiceDocinfo(tempGuid ? tempGuid : loginReducer.guid, responseData.Oe000304[i]);
        }
      }
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
      }
      console.error('ERROR at fetchContent >> ' + error);
    });
  };
  const GetInvoiceDocinfo = async (tempGuid, Oe000304) => {
    let Oe304Obj = arrayOe304Obj;
    await fetch(databaseReducer.Data.urlser + '/UpdateErp', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid,
        'BPAPUS-FUNCTION': 'GetInvoiceDocinfo',
        'BPAPUS-PARAM': '{"DI_KEY":"' + Oe000304.DI_KEY + '"}',
        'BPAPUS-FILTER': '',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(async json => {
      let responseData = JSON.parse(json.ResponseData);
      if (responseData.RECORD_COUNT > 0) {
        for (var i in GoodsInfo.GOODSMASTER) {
          let Transtkd = responseData.TRANSTKD.filter(Transtkd => {
            return Transtkd.GOODS_CODE == GoodsInfo.GOODSMASTER[i].GOODS_CODE;
          });
          if (Transtkd.length > 0) {
            let obj = {
              Oe000304: Oe000304,
              Docinfo: responseData.DOCINFO,
              Transtkh: responseData.TRANSTKH,
              Transtkd: Transtkd
            };
            Oe304Obj.push(obj);
          }
        }
      }
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
      }
      console.error('ERROR at fetchContent >> ' + error);
    });
    const unique = [...new Set(Oe304Obj.map(item => JSON.stringify(item)))].map(item => JSON.parse(item));
    await setArrayOe304Obj(unique);
  };
  const getNetPrice = (a, b) => {
    let allSell = Number(a);
    let tempB = [];
    if (b != '') {
      if (b.indexOf('+') > 1) {
        tempB = b.split('+');
        for (var i in tempB) if (i > 0) allSell -= sellC(allSell, tempB[i]);else allSell -= sellC(allSell, tempB[i]);
      } else if (b.indexOf(',') > 1) {
        tempB = b.split(',');
        for (var i in tempB) {
          if (i > 0) allSell -= sellC(allSell, tempB[i]);else allSell -= sellC(allSell, tempB[i]);
        }
      } else if (b.length > 1) {
        allSell -= sellC(allSell, b);
      }
      return allSell;
    } else {
      return Number(a);
    }
  };
  const sellPercent = (a, s) => {
    if (s.indexOf('%') > -1) return Number(a) * (Number(s.split('%')[0]) / 100);else return Number(a) * (Number(s) / 100);
  };
  const sellB = s => {
    if (s.indexOf('b') > -1) return Number(s.split('b')[0]);else if (s.indexOf('B') > -1) return Number(s.split('B')[0]);else if (s.indexOf('บ') > -1) return Number(s.split('บ')[0]);
  };
  const sellC = (a, s) => {
    if (s.indexOf('b') > -1 || s.indexOf('B') > -1 || s.indexOf('บ') > -1) return sellB(s);else if (s.indexOf('%') > -1) return sellPercent(a, s);else return sellPercent(a, s);
  };
  const getGPM = (NP, COF) => {
    return (NP - COF) / NP * 100;
  };
  return <SafeAreaView style={container1}>
      <StatusBar hidden={true} />
      <ImageBackground source={require(image)} onLoadEnd={() => {
      setLoading_backG(false);
    }} resizeMode="cover" style={styles.image}>
        {!loading_backG ? <View style={{
        flex: 1
      }}>
            <View style={tabbar}>
              <View style={{
            flexDirection: 'row',
            flex: 1,
            minWidth: 0
          }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Image style={{
                width: FontSize.large,
                height: FontSize.large
              }} resizeMode="contain" source={require('../../img/iconsMenu/goback.png')} />
                </TouchableOpacity>
                <Text numberOfLines={1} style={{
              marginLeft: 12,
              flex: 1,
              fontSize: FontSize.medium,
              color: Colors.fontColor2
            }}>
                  {route.params.header && `${route.params.header}`}
                </Text>
              </View>

              <View>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Image style={{
                width: FontSize.large,
                height: FontSize.large
              }} resizeMode="contain" source={require('../../img/iconsMenu/calendar.png')} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{
          flex: 1
        }}>
              <View style={{
            flexDirection: 'column'
          }}>
                <View style={{
              paddingBottom: 10,
              padding: 10
            }}>
                  <View style={{
                alignItems: 'center',
                flexDirection: 'row',
                paddingBottom: 5
              }}>
                    <Text style={{
                  width: deviceWidth / 4,
                  color: Colors.fontColor
                }}>
                      {'รหัสซื้อขาย'}
                    </Text>
                    <Text style={{
                  color: Colors.fontColor
                }}>
                      {route.params.data.GOODS_CODE}
                    </Text>
                  </View>
                  <View style={{
                alignItems: 'center',
                flexDirection: 'row',
                paddingBottom: 5
              }}>
                    <Text style={{
                  width: deviceWidth / 4,
                  color: Colors.fontColor
                }}>
                      {'ชื่อสินค้า'}
                    </Text>
                    <Text style={{
                  color: Colors.fontColor
                }}>
                      {route.params.data.SKU_NAME}
                    </Text>
                  </View>
                  <View style={{
                alignItems: 'center',
                flexDirection: 'row',
                paddingBottom: 5
              }}>
                    <Text style={{
                  width: deviceWidth / 4,
                  color: Colors.fontColor
                }}>
                      {'หน่วยนับ'}
                    </Text>
                    <Text style={{
                  color: Colors.fontColor
                }}>
                      {route.params.data.UTQ_NAME}
                    </Text>
                  </View>
                  <View style={{
                alignItems: 'center',
                flexDirection: 'row',
                paddingBottom: 5
              }}>
                    <Text style={{
                  width: deviceWidth / 4,
                  color: Colors.fontColor
                }}>
                      {'รหัสสินค้า'}
                    </Text>
                    <Text style={{
                  color: Colors.fontColor
                }}>
                      {route.params.data.SKU_CODE}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{
            flexDirection: 'row'
          }}>
                <ScrollView horizontal={true}>
                  {btn.map((Obj, index) => {
                return <TouchableOpacity onPress={() => set_StateBtn(index)} style={{
                  borderTopStartRadius: 20,
                  borderTopEndRadius: 20,
                  flexDirection: 'column',
                  padding: 10,
                  backgroundColor: Obj.state == true ? Colors.buttonColorPrimary : Colors.itemColor
                }}>
                        <Text style={{
                    color: Colors.buttonTextColor,
                    alignSelf: 'center',
                    fontSize: FontSize.medium,
                    fontWeight: 'bold'
                  }}>
                          {Obj.name}
                        </Text>
                      </TouchableOpacity>;
              })}
                </ScrollView>
              </View>

            <View style={{
            flex: 1,
            width: deviceWidth,
            borderBottomStartRadius: 20,
            borderBottomEndRadius: 20,
            flexDirection: 'column',
            padding: 10,
            backgroundColor: Colors.buttonColorPrimary
          }}>
              <View style={{
              flex: 1,
              borderRadius: 20,
              padding: 10,
              backgroundColor: Colors.backgroundColorSecondary
            }}>
                {btn[0].state && (Oe404Objloading ? <View style={{
                opacity: 0.5,
                alignSelf: 'center',
                justifyContent: 'center',
                alignContent: 'center'
              }}>
                      <ActivityIndicator style={{
                  borderRadius: 15,
                  backgroundColor: null,
                  width: 100,
                  height: 100,
                  alignSelf: 'center'
                }} animating={true} size="large" color={Colors.lightPrimiryColor} />
                    </View> : <ScrollView horizontal={true}>
                      <View style={{
                  flexDirection: 'column',
                  padding: 5
                }}>
                        {arrayOe404Obj.length > 0 ? <>
                            <View style={{
                      flexDirection: 'row',
                      borderBottomColor: Colors.fontColor,
                      borderBottomWidth: 1
                    }}>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  วันที่
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.4}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  เลขที่
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  รหัสเจ้าหนี้
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.2}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  บรรจุ
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ซื้อ
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  แถม
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ต่อหน่วย
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ส่วนลด
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  มูลค่า
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ลดรวม
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  สุทธิ
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ต่อหน่วย
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.5}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  ชื่อเจ้าหนี้
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  รหัสซื้อขาย
                                </Text>
                              </View>
                            </View>
                            <ScrollView>
                              {arrayOe404Obj.sort((a, b) => {
                        return b.Oe000404.DI_DATE - a.Oe000404.DI_DATE;
                      }).map(item => {
                        return item.Transtkd.map(Transtkditem => {
                          return <View style={{
                            flexDirection: 'row'
                          }}>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5
                              }}>
                                            {safe_Format.dateFormat(item.Oe000404.DI_DATE)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.4}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5
                              }}>
                                            {safe_Format.massageFormat(item.Oe000404.DI_REF)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5
                              }}>
                                            {safe_Format.massageFormat(item.Oe000404.AP_CODE)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.2}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.massageFormat(Transtkditem.TRD_UTQQTY)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.massageFormat(Transtkditem.TRD_QTY)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.massageFormat(Transtkditem.TRD_Q_FREE)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.currencyFormat(Transtkditem.TRD_K_U_PRC)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.massageFormat(Transtkditem.TRD_DSC_KEYIN)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.currencyFormat(Transtkditem.TRD_G_SELL)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.currencyFormat(Transtkditem.TRD_TDSC_KEYINV)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.currencyFormat(Transtkditem.TRD_N_SELL)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.currencyFormat(Number(Transtkditem.TRD_N_SELL) / (Number(Transtkditem.TRD_UTQQTY) * Number(Transtkditem.TRD_QTY)))}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.5}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5
                              }}>
                                            {safe_Format.massageFormat(item.Oe000404.AP_NAME)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5
                              }}>
                                            {safe_Format.massageFormat(Transtkditem.GOODS_CODE)}
                                          </Text>
                                        </View>
                                      </View>;
                        });
                      })}
                            </ScrollView>
                          </> : <View style={{
                    justifyContent: 'center',
                    alignContent: 'center'
                  }}>
                            <Text style={{
                      fontSize: fontSize.large
                    }}>
                              ไม่มีข้อมูล
                            </Text>
                          </View>}
                      </View>
                    </ScrollView>)}

                {btn[1].state && (Oe304Objloading ? <View style={{
                opacity: 0.5,
                alignSelf: 'center',
                justifyContent: 'center',
                alignContent: 'center'
              }}>
                      <ActivityIndicator style={{
                  borderRadius: 15,
                  backgroundColor: null,
                  width: 100,
                  height: 100,
                  alignSelf: 'center'
                }} animating={true} size="large" color={Colors.lightPrimiryColor} />
                    </View> : <ScrollView horizontal={true}>
                      <View style={{
                  flexDirection: 'column',
                  padding: 5
                }}>
                        {arrayOe304Obj.length > 0 ? <>
                            <View style={{
                      flexDirection: 'row',
                      borderBottomColor: Colors.fontColor,
                      borderBottomWidth: 1
                    }}>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  วันที่
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.4}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  เลขที่
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  รหัสลูกหนี้
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.2}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  บรรจุ
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ซื้อ
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  แถม
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ต่อหน่วย
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ส่วนลด
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  มูลค่า
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ลดรวม
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  สุทธิ
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ต่อหน่วย
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.5}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  ชื่อลูกหนี้
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  รหัสซื้อขาย
                                </Text>
                              </View>
                            </View>
                            <ScrollView>
                              {arrayOe304Obj.sort((a, b) => {
                        return b.Oe000304.DI_DATE - a.Oe000304.DI_DATE;
                      }).map(item => {
                        return item.Transtkd.map(Transtkditem => {
                          return <View style={{
                            flexDirection: 'row'
                          }}>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5
                              }}>
                                            {safe_Format.dateFormat(item.Oe000304.DI_DATE)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.4}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5
                              }}>
                                            {safe_Format.massageFormat(item.Oe000304.DI_REF)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5
                              }}>
                                            {safe_Format.massageFormat(item.Oe000304.AR_CODE)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.2}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.massageFormat(Transtkditem.TRD_UTQQTY)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.massageFormat(Transtkditem.TRD_QTY)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.massageFormat(Transtkditem.TRD_Q_FREE)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.currencyFormat(Transtkditem.TRD_K_U_PRC)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.massageFormat(Transtkditem.TRD_DSC_KEYIN)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.currencyFormat(Transtkditem.TRD_G_SELL)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.currencyFormat(Transtkditem.TRD_TDSC_KEYINV)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.currencyFormat(Transtkditem.TRD_N_SELL)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5,
                                alignSelf: 'flex-end'
                              }}>
                                            {safe_Format.currencyFormat(Number(Transtkditem.TRD_N_SELL) / (Number(Transtkditem.TRD_UTQQTY) * Number(Transtkditem.TRD_QTY)))}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.5}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5
                              }}>
                                            {safe_Format.massageFormat(item.Oe000304.AR_NAME)}
                                          </Text>
                                        </View>
                                        <View width={deviceWidth * 0.3}>
                                          <Text style={{
                                color: Colors.fontColor,
                                padding: 5
                              }}>
                                            {safe_Format.massageFormat(Transtkditem.GOODS_CODE)}
                                          </Text>
                                        </View>
                                      </View>;
                        });
                      })}
                            </ScrollView>
                          </> : <View style={{
                    justifyContent: 'center',
                    alignContent: 'center'
                  }}>
                            <Text style={{
                      fontSize: fontSize.large
                    }}>
                              ไม่มีข้อมูล
                            </Text>
                          </View>}
                      </View>
                    </ScrollView>)}
                {btn[2].state && <ScrollView horizontal={true}>
                    <View style={{
                  flexDirection: 'column',
                  padding: 5
                }}>
                      {SHOWWLSKUQTYBYGOODSKEY.length > 0 ? <>
                          <View style={{
                      flexDirection: 'row',
                      borderBottomColor: Colors.fontColor,
                      borderBottomWidth: 1
                    }}>
                            <View width={deviceWidth * 0.25}>
                              <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                คลัง
                              </Text>
                            </View>
                            <View width={deviceWidth * 0.35}>
                              <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                ตำแหน่งเก็บ
                              </Text>
                            </View>
                            <View width={deviceWidth * 0.3}>
                              <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                คงเหลือ
                              </Text>
                            </View>
                          </View>
                          <ScrollView>
                            {SHOWWLSKUQTYBYGOODSKEY.map(item => {
                        return <View style={{
                          flexDirection: 'row'
                        }}>
                                  <View width={deviceWidth * 0.25}>
                                    <Text style={{
                              color: Colors.fontColor,
                              padding: 5
                            }}>
                                      {safe_Format.massageFormat(item.WL_CODE)}
                                    </Text>
                                  </View>
                                  <View width={deviceWidth * 0.35}>
                                    <Text style={{
                              color: Colors.fontColor,
                              padding: 5
                            }}>
                                      {safe_Format.massageFormat(item.WL_NAME)}
                                    </Text>
                                  </View>
                                  <View width={deviceWidth * 0.3}>
                                    <Text style={{
                              color: Colors.fontColor,
                              padding: 5,
                              alignSelf: 'flex-end'
                            }}>
                                      {safe_Format.currencyFormat(item.SUM_QTY)}
                                    </Text>
                                  </View>
                                </View>;
                      })}
                          </ScrollView>
                        </> : <View style={{
                    justifyContent: 'center',
                    alignContent: 'center'
                  }}>
                          <Text style={{
                      fontSize: fontSize.large
                    }}>
                            ไม่มีข้อมูล
                          </Text>
                        </View>}
                    </View>
                  </ScrollView>}

                {btn[3].state && (Sp000211Objloading ? <View style={{
                opacity: 0.5,
                alignSelf: 'center',
                justifyContent: 'center',
                alignContent: 'center'
              }}>
                      <ActivityIndicator style={{
                  borderRadius: 15,
                  backgroundColor: null,
                  width: 100,
                  height: 100,
                  alignSelf: 'center'
                }} animating={true} size="large" color={Colors.lightPrimiryColor} />
                    </View> : <ScrollView horizontal={true}>
                      <View style={{
                  flexDirection: 'column',
                  padding: 5
                }}>
                        {arraySp000211.length > 0 ? <>
                            <View style={{
                      flexDirection: 'row',
                      borderBottomColor: Colors.fontColor,
                      borderBottomWidth: 1
                    }}>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  รหัสตารางราคา
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.4}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  ชื่อตารางราคา
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.4}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  รหัสซื้อขาย
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.2}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  บรรจุ
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.4}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5
                        }}>
                                  ป้ายราคา
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ราคาต่อหน่วย
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  %ส่วนลด
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ราคาสุทธิ
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ทุนฝ่ายขาย
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  ทุนรวมภพ.
                                </Text>
                              </View>
                              <View width={deviceWidth * 0.3}>
                                <Text style={{
                          color: Colors.fontColor,
                          fontWeight: 'bold',
                          padding: 5,
                          alignSelf: 'flex-end'
                        }}>
                                  กำไรขั้นต้น
                                </Text>
                              </View>
                            </View>
                            <ScrollView>
                              {arraySp000211.sort((a, b) => {
                        return a.WPurcPrice.ARPRB_CODE - b.WPurcPrice.ARPRB_CODE;
                      }).map(item => {
                        return (
                          // WPurcPrice
                          item.Sp000221.map(Sp000221items => {
                            return <View style={{
                              flexDirection: 'row'
                            }}>
                                          <View width={deviceWidth * 0.3}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5
                                }}>
                                              {safe_Format.massageFormat(item.WPurcPrice.ARPRB_CODE)}
                                            </Text>
                                          </View>
                                          <View width={deviceWidth * 0.4}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5
                                }}>
                                              {safe_Format.massageFormat(item.WPurcPrice.ARPRB_NAME)}
                                            </Text>
                                          </View>
                                          <View width={deviceWidth * 0.4}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5
                                }}>
                                              {safe_Format.massageFormat(Sp000221items.GOODS_CODE)}
                                            </Text>
                                          </View>
                                          <View width={deviceWidth * 0.2}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5,
                                  alignSelf: 'flex-end'
                                }}>
                                              {safe_Format.massageFormat(GoodsInfo.GOODSMASTER.filter(Gitem => {
                                    return Gitem.GOODS_CODE == Sp000221items.GOODS_CODE;
                                  })[0].UTQ_QTY)}
                                            </Text>
                                          </View>
                                          <View width={deviceWidth * 0.4}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5
                                }}>
                                              {safe_Format.massageFormat(GoodsInfo.GOODSMASTER.filter(Gitem => {
                                    return Gitem.GOODS_CODE == Sp000221items.GOODS_CODE;
                                  })[0].TAG_NAME)}
                                            </Text>
                                          </View>
                                          <View width={deviceWidth * 0.3}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5,
                                  alignSelf: 'flex-end'
                                }}>
                                              {Sp000221items.ARPLU_U_PRC == 0 ? '-' : safe_Format.currencyFormat(Sp000221items.ARPLU_U_PRC)}
                                            </Text>
                                          </View>
                                          <View width={deviceWidth * 0.3}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5,
                                  alignSelf: 'flex-end'
                                }}>
                                              {Sp000221items.ARPLU_U_PRC == 0 ? '-' : safe_Format.massageFormat(Sp000221items.ARPLU_U_DSC)}
                                            </Text>
                                          </View>
                                          <View width={deviceWidth * 0.3}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5,
                                  alignSelf: 'flex-end'
                                }}>
                                              {Sp000221items.ARPLU_U_PRC == 0 ? '-' : safe_Format.currencyFormat(getNetPrice(Sp000221items.ARPLU_U_PRC, Sp000221items.ARPLU_U_DSC))}
                                            </Text>
                                          </View>
                                          <View width={deviceWidth * 0.3}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5,
                                  alignSelf: 'flex-end'
                                }}>
                                              {Sp000221items.ARPLU_U_PRC == 0 ? '-' : safe_Format.currencyFormat(item.SKU_STD_COST * GoodsInfo.GOODSMASTER.filter(Gitem => {
                                    return Gitem.GOODS_CODE == Sp000221items.GOODS_CODE;
                                  })[0].UTQ_QTY)}
                                            </Text>
                                          </View>
                                          <View width={deviceWidth * 0.3}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5,
                                  alignSelf: 'flex-end'
                                }}>
                                              {Sp000221items.ARPLU_U_PRC == 0 ? '-' : safe_Format.currencyFormat(item.SKU_STD_COST_TY)}
                                            </Text>
                                          </View>
                                          <View width={deviceWidth * 0.3}>
                                            <Text style={{
                                  color: Colors.fontColor,
                                  padding: 5,
                                  alignSelf: 'flex-end'
                                }}>
                                              {Sp000221items.ARPLU_U_PRC == 0 ? '-' : safe_Format.currencyFormat(getGPM(getNetPrice(Sp000221items.ARPLU_U_PRC, Sp000221items.ARPLU_U_DSC), item.SKU_STD_COST * GoodsInfo.GOODSMASTER.filter(Gitem => {
                                    return Gitem.GOODS_CODE == Sp000221items.GOODS_CODE;
                                  })[0].UTQ_QTY)) + '%'}
                                            </Text>
                                          </View>
                                        </View>;
                          })
                        );
                      })}
                            </ScrollView>
                          </> : <View style={{
                    justifyContent: 'center',
                    alignContent: 'center'
                  }}>
                            <Text style={{
                      fontSize: fontSize.large
                    }}>
                              ไม่มีข้อมูล
                            </Text>
                          </View>}
                      </View>
                    </ScrollView>)}
              </View>
            </View>
            </View>

            <TouchableNativeFeedback onPress={() => navigation.goBack()}>
              <View style={{
            marginHorizontal: 10,
            marginTop: 6,
            marginBottom: Math.max(insets.bottom, 10),
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
          </View> : <View style={{
        width: deviceWidth,
        height: deviceHeight,
        opacity: 0.5,
        backgroundColor: 'black',
        alignSelf: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        position: 'absolute'
      }}></View>}

        {loading && !modalVisible && <View style={{
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

      {modalVisible ? <View style={styles.dateModalBackdrop} pointerEvents="box-none">
          <Pressable style={styles.dateModalBackdropPress} onPress={() => setModalVisible(false)} />
          <View style={styles.dateModalSheet}>
            <View style={styles.modalView}>
              <View style={{
            justifyContent: 'space-between',
            flexDirection: 'row'
          }}>
                <View width={20} />
                <Text style={styles.modalText}>{Language.t('report.selectSearch')}</Text>
                <Pressable style={{
              alignItems: 'flex-end'
            }} onPress={() => setModalVisible(false)}>
                  <Image style={{
                width: FontSize.large,
                height: FontSize.large
              }} resizeMode="contain" source={require('../../img/iconsMenu/cancel.png')} />
                </Pressable>
              </View>
              <View style={{
            backgroundColor: Colors.fontColor2,
            borderRadius: 20,
            padding: 10,
            width: '100%',
            overflow: 'hidden'
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
                  }}>
                        {radio_props[0].label}
                      </Text>
                    </RadioButton>
                    <RadioButton value={radio_props[1].value}>
                      <Text style={{
                    fontSize: FontSize.medium,
                    color: 'black',
                    fontWeight: 'bold'
                  }}>
                        {radio_props[1].label}
                      </Text>
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
                  }}>
                        {radio_props[2].label}
                      </Text>
                    </RadioButton>
                    <RadioButton value={radio_props[3].value}>
                      <Text style={{
                    fontSize: FontSize.medium,
                    color: 'black',
                    fontWeight: 'bold'
                  }}>
                        {radio_props[3].label}
                      </Text>
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
                  }}>
                        {radio_props[4].label}
                      </Text>
                    </RadioButton>
                    <RadioButton value={radio_props[5].value}>
                      <Text style={{
                    fontSize: FontSize.medium,
                    color: 'black',
                    fontWeight: 'bold'
                  }}>
                        {radio_props[5].label}
                      </Text>
                    </RadioButton>
                  </RadioGroup>
                </View>
                <View style={styles.dateFieldBlock}>
                  <Text style={styles.dateFieldLabel}>{Language.t('report.from')}</Text>
                  <CalendarScreen value={start_date} onChange={onChangeStartDate} language={Language.getLang()} era={'be'} format={'DD/MM/YYYY'} borderColor={Colors.primaryColor} linkTodateColor={Colors.itemColor} calendarModel={{
                backgroundColor: Colors.backgroundColor,
                buttonSuccess: {
                  backgroundColor: Colors.itemColor
                },
                pickItem: {
                  color: Colors.itemColor
                }
              }} borderWidth={1} icon={{
                color: Colors.primaryColor
              }} fontSize={FontSize.medium} fontColor={Colors.fontColor} width={DATE_PICKER_WIDTH} borderRadius={10} />
                </View>
                <View style={styles.dateFieldBlock}>
                  <Text style={styles.dateFieldLabel}>{Language.t('report.to')}</Text>
                  <CalendarScreen value={end_date} onChange={onChangeEndDate} language={Language.getLang()} era={'be'} format={'DD/MM/YYYY'} borderColor={Colors.primaryColor} linkTodateColor={Colors.itemColor} calendarModel={{
                backgroundColor: Colors.backgroundColor,
                buttonSuccess: {
                  backgroundColor: Colors.itemColor
                },
                pickItem: {
                  color: Colors.itemColor
                }
              }} borderWidth={1} icon={{
                color: Colors.primaryColor
              }} fontSize={FontSize.medium} fontColor={Colors.fontColor} width={DATE_PICKER_WIDTH} borderRadius={10} />
                </View>
                <Pressable style={[styles.button, styles.buttonClose]} onPress={() => SInCome()}>
                  <Text style={styles.textStyle}>{Language.t('alert.ok')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View> : null}
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container1: {
    flex: 1,
    flexDirection: 'column'
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
    backgroundColor: Colors.itemColor,
    color: Colors.fontColor2,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: deviceWidth
  },
  dateModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 16
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
  dateFieldBlock: {
    width: '100%',
    marginBottom: 10
  },
  dateFieldLabel: {
    fontSize: FontSize.medium,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 6
  },
  modalView: {
    backgroundColor: Colors.backgroundLoginColor,
    borderRadius: 20,
    padding: 10,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: '#F194FF'
  },
  buttonClose: {
    backgroundColor: Colors.backgroundLoginColor
  },
  textButton: {
    fontSize: FontSize.large,
    color: Colors.fontColor2
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.fontColor2
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: Colors.fontColor2,
    fontSize: FontSize.medium
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
export default OrderInformation;