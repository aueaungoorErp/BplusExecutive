import {
    StyleSheet,
    Dimensions
} from 'react-native';
import Colors from '../../src/Colors';
import { FontSize } from '../../components/FontSizeHelper';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
export default   StyleSheet.create({

    tabbar: {
        height: FontSize.large * 2,
        padding: 5,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        backgroundColor: Colors.backgroundColor,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    tableView: {


    },
    
    table: {
        margin: 0,

        height: deviceHeight - FontSize.large * 2
    },
    tableHeader: {

        flexDirection: 'row',

    },
    tableHeaderTitle: {
        backgroundColor: Colors.backgroundLoginColor,
        padding: 10,
        borderWidth: 1,
        borderColor: 'black'
    },
    tableCell: {

        flexDirection: 'row',

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
    },
    textTitle2: {
        alignSelf: 'center',
        flex: 2,
        fontSize: FontSize.medium,
        fontWeight: 'bold',
        color: Colors.fontColor,
    },
    
});
