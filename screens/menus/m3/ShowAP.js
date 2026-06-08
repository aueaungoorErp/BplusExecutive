import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Dimensions,
    Text,
    View,
    Image,
    Button,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
    Platform,
    BackHandler,
    StatusBar,

    TouchableOpacity,
    Modal, Pressable,
} from 'react-native';
import CalendarScreen from '@blacksakura013/th-datepicker'
import CheckBox from '@react-native-community/checkbox';
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button'
import {
    ScrollView,
    TouchableNativeFeedback,
} from 'react-native-gesture-handler';

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
import tableStyles from '../tableStyles'
const ShowAP = ({ route }) => {
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
        buttonContainer,
    } = styles;

    const registerReducer = useSelector(({ registerReducer }) => registerReducer);
    const loginReducer = useSelector(({ loginReducer }) => loginReducer);
    const databaseReducer = useSelector(({ databaseReducer }) => databaseReducer);
    const [loading, setLoading] = useStateIfMounted(false);
    const [modalVisible, setModalVisible] = useState(true);
    const [arrayObj, setArrayObj] = useState([]);
    const [start_date, setS_date] = useState(new Date());
    const [end_date, setE_date] = useState(new Date())
    const [sum, setSum] = useState(0)
    const [textsearch, setSearch] = useState('')


    var ser_die = true
    useEffect(() => {

    }, [])
    const regisMacAdd = async () => {
        let tempGuid = await safe_Format._fetchGuidLog(databaseReducer.Data.urlser, loginReducer.serviceID, registerReducer.machineNum, loginReducer.userNameED, loginReducer.passwordED)
        await dispatch(loginActions.guid(tempGuid))
        fetchInSearch(tempGuid)
    };

    const InSearch = async () => {
        console.log('InSearch')
        setLoading(true)
        await fetchInSearch()

        setArrayObj(arrayResult)
    }
    const fetchInSearch = async (tempGuid) => {

        await fetch(databaseReducer.Data.urlser + '/LookupErp', {
            method: 'POST',
            body: JSON.stringify({
                'BPAPUS-BPAPSV': loginReducer.serviceID,
                'BPAPUS-LOGIN-GUID': tempGuid ? tempGuid : loginReducer.guid,
                'BPAPUS-FUNCTION': 'Ap000130',
                'BPAPUS-PARAM': '',
                'BPAPUS-FILTER': "AND (AP_NAME LIKE '%" + textsearch + "%')",
                'BPAPUS-ORDERBY': '',
                'BPAPUS-OFFSET': '0',
                'BPAPUS-FETCH': '0',
            }),
        })
            .then((response) => response.json())
            .then((json) => {
                let responseData = JSON.parse(json.ResponseData);
                if (responseData.RECORD_COUNT > 0) {
                    for (var i in responseData.Ap000130) {
                        let jsonObj = {
                            id: i,
                            name: responseData.Ap000130[i].AP_NAME,
                            key: responseData.Ap000130[i].AP_KEY,
                            code: responseData.Ap000130[i].AP_CODE,
                            phone: responseData.Ap000130[i].ADDB_PHONE,
                        };
                        arrayResult.push(jsonObj)
                    }
                } else {
                    Alert.alert("ไม่พบข้อมูล");
                }
            })
            .catch((error) => {
                if (ser_die) {
                    ser_die = false
                    regisMacAdd()
                } else {
                    console.log('Function Parameter Required');
                    let temp_error = 'error_ser.' + 610;
                    console.log('>> ', temp_error)
                    Alert.alert(
                        Language.t('alert.errorTitle'),
                        Language.t(temp_error), [{
                            text: Language.t('alert.ok'), onPress: () => navigation.dispatch(
                                navigation.replace('LoginScreen')
                            )
                        }]);
                    setLoading(false)
                }
                console.error('ERROR at fetchContent >> ' + error)
            })

        setLoading(false)

    }


    return (
        <>
            <SafeAreaView style={container}>
                <StatusBar hidden={true} />
                <View style={tableStyles.tabbar}>
                    <View style={{ flexDirection: 'row', }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}>
                             <Image
                                        style={{
                                            width: FontSize.large,
                                            height: FontSize.large,
                                        }}
                                        resizeMode="contain"
                                        source={require('../../../img/iconsMenu/arrow.png')}
                                    />
                        </TouchableOpacity>
                        <Text
                            style={{
                                marginLeft: 12,
                                fontSize: FontSize.medium,
                                color: 'black'
                            }}>{`ยอดเจ้าหนี้แต่ละราย`}</Text>
                    </View>
                </View>
                <View style={tabbar} >
                    <View style={{
                        backgroundColor: '#fff', alignSelf: 'center',
                        justifyContent: 'center', borderRadius: 20, flexDirection: 'row', borderWidth: 1, marginBottom: 10
                    }}>

                        <TextInput
                            style={{
                                flex: 8,
                                marginLeft: 10,
                                borderBottomColor: Colors.borderColor,
                                color: Colors.fontColor,
                                padding: 10,
                                fontSize: FontSize.medium,

                            }}

                            placeholderTextColor={Colors.fontColorSecondary}
                            value={textsearch}

                            placeholder={'ชื่อเจ้าหนี้'}
                            onChangeText={(val) => {
                                setSearch(val)
                            }} />

                        <TouchableOpacity style={{ padding: 10, }} onPress={() => InSearch()}>
                            <Image
                                style={{
                                    width: FontSize.large,
                                    height: FontSize.large,
                                }}
                                resizeMode="contain"
                                source={require('../../../img/iconsMenu/search.png')}
                            />
                        </TouchableOpacity>

                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <ScrollView horizontal={true}>
                        <View style={tableStyles.table}>
                            <View style={tableStyles.tableHeader}>
                                <View width={deviceWidth * 0.6} style={tableStyles.tableHeaderTitle}  ><Text style={{
                                    fontSize: FontSize.medium,
                                    color: Colors.fontColor2,
                                    alignSelf: 'center'
                                }}>ชื่อเจ้าหนี้</Text></View>
                                <View width={deviceWidth * 0.4} style={tableStyles.tableHeaderTitle}  ><Text style={{
                                    fontSize: FontSize.medium,
                                    color: Colors.fontColor2,
                                    alignSelf: 'center'
                                }}>เบอร์โทร</Text></View>

                            </View>
                            <ScrollView>
                                <KeyboardAvoidingView keyboardVerticalOffset={1} >
                                    <TouchableNativeFeedback>
                                        <View  >
                                            {arrayObj.map((item) => {
                                                return (
                                                    <>
                                                        <TouchableOpacity
                                                            onPress={() => navigation.navigate(route.params.routeName, {
                                                                Obj: item.key
                                                            })}>
                                                            <View style={tableStyles.tableCell}>
                                                                <View width={deviceWidth * 0.6} style={tableStyles.tableCellTitle}><Text style={{
                                                                    fontSize: FontSize.medium,
                                                                    color: Colors.fontColor,
                                                                    alignSelf: 'flex-start'
                                                                }} >{item.name}</Text></View>
                                                                <View width={deviceWidth * 0.4} style={tableStyles.tableCellTitle}><Text style={{
                                                                    fontSize: FontSize.medium,
                                                                    color: Colors.fontColor,
                                                                    alignSelf: 'flex-start'
                                                                }} >{item.phone ? item.phone : 'ไม่มีข้อมูล'}</Text></View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </>
                                                )
                                            })}
                                        </View>
                                    </TouchableNativeFeedback>
                                </KeyboardAvoidingView>
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>





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
                        }}>
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

            </SafeAreaView>


        </>
    );
};

const styles = StyleSheet.create({

    table: {
      
    },
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    container2: {
        width: deviceWidth,
        height: '100%',
        position: 'absolute',
        backgroundColor: 'white',
        flex: 1,
    },
    tableView: {


    },
    tableHeader: {
        justifyContent: 'space-between',
        backgroundColor: Colors.backgroundLoginColor,

    },
    tabbar: {
        height: 70,
        padding: 5,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        backgroundColor: Colors.backgroundColor,
        justifyContent: 'space-between',
        flexDirection: 'row',
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
        position: 'absolute', //Here is the trick
        bottom: 0, //Here is the trick
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
        color: Colors.fontColor,
    },
    imageIcon: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
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
        flexDirection: "row",
        marginLeft: 10,
        marginBottom: 20,
    },
    checkbox: {
        alignSelf: "center",
        borderBottomColor: '#ffff',
        color: '#ffff',
    },
    label: {
        margin: 8,
        color: '#ffff',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: deviceWidth,
    },
    modalView: {
        backgroundColor: Colors.backgroundLoginColor,
        borderRadius: 20,
        padding: 10,
        width: "auto",
        shadowColor: "#000",
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: Colors.backgroundLoginColor,
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: FontSize.mediumw,
        color: Colors.backgroundColor
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        color: Colors.fontColor2,
        fontSize: FontSize.medium
    }
});

export default ShowAP;
