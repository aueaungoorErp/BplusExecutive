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
import * as safe_Format from '../../../src/safe_Format';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const AP_Address = ({
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
  const [loading, setLoading] = useStateIfMounted(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [arrayObj, setArrayObj] = useState([]);
  const [start_date, setS_date] = useState(new Date());
  const [end_date, setE_date] = useState(new Date());
  const [sum, setSum] = useState(0);
  const [radioIndex1, setRadioIndex1] = useState(4);
  const [radioIndex2, setRadioIndex2] = useState(4);
  const [radioIndex3, setRadioIndex3] = useState(4);
  const radio_props = [{
    label: Language.t('report.filter.endOfLastMonth'),
    value: 'lastAmonth'
  }, {
    label: Language.t('report.filter.endOfLastYear'),
    value: 'lastAyear'
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
  useEffect(() => {}, []);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState([0]);
  var ser_die = true;
  useEffect(() => {
    InCome();
  }, []);
  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);
  useEffect(() => {}, [arrayObj]);
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
  };
  const fetchInCome = async tempGuid => {
    setModalVisible(!modalVisible);
    var sDate = safe_Format.setnewdateF(safe_Format.checkDate(start_date));
    var eDate = safe_Format.setnewdateF(safe_Format.checkDate(end_date));
    await fetch(databaseReducer.Data.urlser + '/LookupErp', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
        'BPAPUS-FUNCTION': 'Ap000130',
        'BPAPUS-PARAM': '',
        'BPAPUS-FILTER': 'AND (AP_KEY = ' + route.params.Obj + ')',
        'BPAPUS-ORDERBY': '',
        'BPAPUS-OFFSET': '0',
        'BPAPUS-FETCH': '0'
      })
    }).then(response => response.json()).then(json => {
      let responseData = JSON.parse(json.ResponseData);
      if (responseData.RECORD_COUNT > 0) {
        for (var i in responseData.Ap000130) {
          let jsonObj = {
            id: i,
            key: responseData.Ap000130[i].AP_KEY,
            code: responseData.Ap000130[i].AP_CODE,
            name: responseData.Ap000130[i].AP_NAME,
            arcat: responseData.Ap000130[i].AP_ARCAT,
            arcat_name: responseData.Ap000130[i].ARCAT_NAME,
            ars_alert_msg: responseData.Ap000130[i].ARS_ALERT_MSG,
            addb_key: responseData.Ap000130[i].ADDB_KEY,
            addb_company: responseData.Ap000130[i].ADDB_COMPANY,
            addb_branch: responseData.Ap000130[i].ADDB_BRANCH,
            addb_br_no: responseData.Ap000130[i].ADDB_BR_NO,
            addb_tax_id: responseData.Ap000130[i].ADDB_TAX_ID,
            addb_reg_no: responseData.Ap000130[i].ADDB_REG_NO,
            addb_addb_1: responseData.Ap000130[i].ADDB_ADDB_1,
            addb_addb_2: responseData.Ap000130[i].ADDB_ADDB_2,
            addb_addb_3: responseData.Ap000130[i].ADDB_ADDB_3,
            addb_sub_district: responseData.Ap000130[i].ADDB_SUB_DISTRICT,
            addb_district: responseData.Ap000130[i].ADDB_DISTRICT,
            addb_province: responseData.Ap000130[i].ADDB_PROVINCE,
            addb_post: responseData.Ap000130[i].ADDB_POST,
            addb_country: responseData.Ap000130[i].ADDB_COUNTRY,
            addb_cntry_code: responseData.Ap000130[i].ADDB_CNTRY_CODE,
            addb_phone: responseData.Ap000130[i].ADDB_PHONE,
            addb_fax: responseData.Ap000130[i].ADDB_FAX,
            addb_website: responseData.Ap000130[i].ADDB_WEBSITE,
            addb_remark: responseData.Ap000130[i].ADDB_REMARK,
            addb_search: responseData.Ap000130[i].ADDB_SEARCH,
            addb_email: responseData.Ap000130[i].ADDB_EMAIL,
            addb_gps_lat_s: responseData.Ap000130[i].ADDB_GPS_LAT_S,
            addb_gps_long_s: responseData.Ap000130[i].ADDB_GPS_LONG_S
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
  useEffect(() => {}, []);
  return <>
            <SafeAreaView style={container}>
                <StatusBar hidden={true} />
                <View style={tabbar}>
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
            color: Colors.fontColor2
          }}>{Language.t('executiveMenus.m3.showAddress')}</Text>
                    </View>
                    <View>
                    </View>
                </View>
                <View>
                {arrayObj.length > 0 ? <View style={{
          alignContent: 'space-between',
          marginTop: 30,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: 20
        }}>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.large,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.code')} : {arrayObj[0].code}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.name')} : {arrayObj[0].name}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.address')} : {arrayObj[0].addb_addb_1} {arrayObj[0].addb_addb_2} {arrayObj[0].addb_addb_3}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.subdistrict')} :  {arrayObj[0].addb_sub_district}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.district')} :  {arrayObj[0].addb_district}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.province')} :  {arrayObj[0].addb_province}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.postcode')} : {arrayObj[0].addb_post}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.country')} : {arrayObj[0].addb_country}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.phone')} : (+{arrayObj[0].addb_cntry_code}) {arrayObj[0].addb_phone}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>Fax : {arrayObj[0].addb_fax}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.alias')} : {arrayObj[0].arcat_name}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.branch')} : {arrayObj[0].addb_branch}</Text>
                            </View>
                            <View padding={10}>
                                <Text style={{
              FontSize: FontSize.medium,
              color: 'black',
              fontWeight: 'bold'
            }}>{Language.t('report.addressFields.taxId')} : {arrayObj[0].addb_tax_id}</Text>
                            </View>
                        </View> : null}

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
  table: {
    width: deviceWidth * 2
  },
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
    backgroundColor: Colors.backgroundLoginColor,
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
    color: Colors.backgroundColor
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: Colors.fontColor2,
    fontSize: FontSize.medium
  }
});
export default AP_Address;