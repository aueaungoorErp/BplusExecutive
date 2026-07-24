const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const radioGroupContextSource = `import React from 'react';

const RadioGroupContext = React.createContext({
  onSelect: () => {},
  size: 20,
  thickness: 1,
  color: '#007AFF',
  activeColor: null,
  highlightColor: null,
});

export default RadioGroupContext;
`;
const radioGroupSource = `import React, { Component } from 'react'
import {
  View,
} from 'react-native';

import RadioButton from './radioButton'
import RadioGroupContext from './context'

const defaultSize = 20
const defaultThickness = 1
const defaultColor = '#007AFF'

export default  class RadioGroup extends Component{
    constructor(props, context){
        super(props, context)

        this.state = {
            selectedIndex: this.props.selectedIndex,
        }
        this.prevSelected = this.props.selectedIndex
        this.onSelect = this.onSelect.bind(this)
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.selectedIndex != this.prevSelected){
            this.prevSelected = nextProps.selectedIndex
            this.setState({
                selectedIndex: nextProps.selectedIndex
            })
        }
	}

    onSelect(index, value){
        this.setState({
            selectedIndex: index
        })
        if(this.props.onSelect)
            this.props.onSelect(index, value)
    }

    render(){
        var radioButtons = React.Children.map(this.props.children, (radioButton, index) => {
            let isSelected = this.state.selectedIndex == index
            let color = isSelected && this.props.activeColor?this.props.activeColor:this.props.color
            return (
                <RadioButton
                    color={color}
                    activeColor={this.props.activeColor}
                    {...radioButton.props}
                    index={index}
                    isSelected={isSelected}
                >
                    {radioButton.props.children}
                </RadioButton>
            )
        })

        return(
            <RadioGroupContext.Provider
                value={{
                    onSelect: this.onSelect,
                    size: this.props.size,
                    thickness: this.props.thickness,
                    color: this.props.color,
                    activeColor: this.props.activeColor,
                    highlightColor: this.props.highlightColor,
                }}
            >
                <View style={this.props.style}>
                    {radioButtons}
                </View>
            </RadioGroupContext.Provider>
        )
    }
}

RadioGroup.defaultProps = {
    size: defaultSize,
    thickness: defaultThickness,
    color: defaultColor,
    highlightColor: null,
}
`;
const radioButtonSource = `import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback
} from 'react-native';
import RadioGroupContext from './context'

export default class RadioButton extends Component{
    static contextType = RadioGroupContext

    constructor(props){
        super(props)
    }

    componentWillReceiveProps(nextProps){
		this.setState({
			selectedIndex: nextProps.selectedIndex
		})
	}

    getRadioStyle(){
        const context = this.context || {}
        return {
            height: context.size,
	        width: context.size,
	        borderRadius: context.size / 2,
	        borderWidth: context.thickness,
	        borderColor: this.props.isSelected && this.props.activeColor?this.props.activeColor:context.color,
        }
    }

    getRadioDotStyle(){
        const context = this.context || {}
        return {
            height: context.size / 2,
            width: context.size / 2,
            borderRadius: context.size / 4,
            backgroundColor: this.props.color || this.props.activeColor,
        }
    }

    isSelected(){
        if(this.props.isSelected)
            return <View style={this.getRadioDotStyle()}/>
    }
    render(){
        var {children} = this.props
        return(
            <View style={{opacity: this.props.disabled?0.4:1}}>
                <TouchableWithoutFeedback
                    disabled={this.props.disabled}
                    onPress={() => this.context.onSelect(this.props.index, this.props.value)}
                >
                    <View style={[styles.container, this.props.style, this.props.isSelected?{backgroundColor: this.context.highlightColor}:null]}>
                        <View style={[styles.radio, this.getRadioStyle()]}>
                            {this.isSelected()}
                        </View>
                        <View style={styles.item}>
                            {children}
                        </View>
                    </View>
            </TouchableWithoutFeedback>
          </View>
        )
    }
}

let styles = StyleSheet.create({
  container:{
	  flexGrow: 1,
	  flexDirection: 'row',
	  padding: 10,
  },
  radio:{
	  alignItems: 'center',
	  justifyContent: 'center',
  },
  item: {
    marginLeft: 5,
    alignItems: 'center',
	justifyContent: 'center',
  }
})
`;

const qrScanReaderSource = `#import "QRScanReader.h"
#import <AVFoundation/AVFoundation.h>
#import <CoreImage/CoreImage.h>

@implementation QRScanReader
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(readerQR:(NSString *)fileUrl
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    NSString *result = [self readerQR:fileUrl];
    if (result) {
      resolve(result);
    } else {
      reject(@"not_found", @"No related QR code", nil);
    }
  });
}

-(NSString*)readerQR:(NSString*)fileUrl{
  fileUrl = [fileUrl stringByReplacingOccurrencesOfString:@"file://" withString:@""];

  CIContext *context = [CIContext contextWithOptions:nil];

  CIDetector *detector = [CIDetector detectorOfType:CIDetectorTypeQRCode context:context options:@{CIDetectorAccuracy:CIDetectorAccuracyHigh}];
  NSData *fileData = [[NSData alloc] initWithContentsOfFile:fileUrl];
  CIImage *ciImage = [CIImage imageWithData:fileData];
  NSArray *features = [detector featuresInImage:ciImage];
  if(!features || features.count==0){
    return nil;
  }
  CIQRCodeFeature *feature = [features objectAtIndex:0];
  NSString *scannedResult = feature.messageString;
  return scannedResult;
}

@end
`;

const qrScanReaderAndroidSource = `package com.lewin.qrcode;

import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.mlkit.vision.barcode.Barcode;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.common.InputImage;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by lewin on 2018/3/14,
 * Updated by stefanmajiros on 2021/6/15
 */

public class QRScanReader extends ReactContextBaseJavaModule  {

    public QRScanReader(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "QRScanReader";
    }

    @ReactMethod
    public void readerQR(String fileUrl, final Promise promise ) {
        // ML Vision : https://developers.google.com/ml-kit/vision/barcode-scanning/android#java
        try {
            Uri uri = Uri.parse(fileUrl);
            InputImage image = InputImage.fromFilePath(this.getReactApplicationContext(), uri);
            BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
                    .setBarcodeFormats(
                            Barcode.FORMAT_AZTEC,
                            Barcode.FORMAT_QR_CODE
                    )
                    .build();
            final BarcodeScanner scanner = BarcodeScanning.getClient(options);
            Task<List<Barcode>> result = scanner.process(image)
                    .addOnSuccessListener(new OnSuccessListener<List<Barcode>>() {
                        @Override
                        public void onSuccess(List<Barcode> barcodes) {
                            Log.d("OK", " " +  barcodes.toString());
                            List<String> rawValues = new LinkedList<>();
                            for (Barcode barcode: barcodes) {
                                String rawValue = barcode.getRawValue();
                                rawValues.add(rawValue);
                            }
                            scanner.close();
                            if (!rawValues.isEmpty()){
                                promise.resolve(rawValues.get(0));
                            } else {
                                promise.reject("NOT_OK", "Invalid or No related QR code");
                            }

                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            Log.d("NOT_OK", "" +  e.getMessage());
                            scanner.close();
                            promise.reject("NOT_OK", e.getMessage());

                        }
                    });
        } catch (IOException e) {
            Log.e("ERROR", "" + e.getMessage());
            e.printStackTrace();
            promise.reject("IO_ERROR", e.getMessage(), e);
        } catch (Exception e) {
            Log.e("ERROR", "" + e.getMessage());
            e.printStackTrace();
            promise.reject("QR_ERROR", e.getMessage(), e);
        }
    }
}
`;

const replacements = [
  [/^\s*jcenter\(\)\r?\n/gm, ''],
  [/\bcompile\s+(['"])/g, 'implementation $1'],
  [
    /implementation\s+"com\.android\.support:appcompat-v7:\$supportLibVersion"/g,
    'implementation "androidx.appcompat:appcompat:1.7.0"',
  ],
  [/^\s*def DEFAULT_SUPPORT_LIB_VERSION\s*=\s*"[^"]+"\r?\n/gm, ''],
  [
    /^\s*def supportLibVersion = rootProject\.hasProperty\('supportLibVersion'\) \? rootProject\.supportLibVersion : DEFAULT_SUPPORT_LIB_VERSION\r?\n/gm,
    '',
  ],
  [
    /@react-native-community\/masked-view/g,
    '@react-native-masked-view/masked-view',
  ],
];

function findAndroidBuildGradleFiles(dir, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (!entry.isDirectory()) {
      continue;
    }

    const androidBuildGradle = path.join(entryPath, 'android', 'build.gradle');
    if (fs.existsSync(androidBuildGradle)) {
      results.push(androidBuildGradle);
    }

    if (entry.name.startsWith('@')) {
      findAndroidBuildGradleFiles(entryPath, results);
    }
  }

  return results;
}

for (const filePath of findAndroidBuildGradleFiles(
  path.join(root, 'node_modules'),
)) {
  const relativePath = path.relative(root, filePath).replace(/\\/g, '/');

  if (!fs.existsSync(filePath)) {
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }

  content = content.replace(/repositories\s*\{([\s\S]*?)\n\s*\}/g, match => {
    if (match.includes('mavenCentral()')) {
      return match;
    }

    return match.replace('{', '{\n        mavenCentral()');
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Patched ${relativePath}`);
  }
}

const flexiRadioFiles = [
  ['node_modules/react-native-flexi-radio-button/lib/context.js', radioGroupContextSource],
  ['node_modules/react-native-flexi-radio-button/lib/radioGroup.js', radioGroupSource],
  ['node_modules/react-native-flexi-radio-button/lib/radioButton.js', radioButtonSource],
];

for (const [relativeFilePath, source] of flexiRadioFiles) {
  const filePath = path.join(root, relativeFilePath);

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
    fs.writeFileSync(filePath, source);
    console.log(`Created ${relativeFilePath.replace(/\\/g, '/')}`);
    continue;
  }

  const current = fs.readFileSync(filePath, 'utf8');
  if (current !== source) {
    fs.writeFileSync(filePath, source);
    console.log(`Patched ${relativeFilePath.replace(/\\/g, '/')}`);
  }
}

const qrScanReaderPath =
  'node_modules/react-native-qr-decode-image-camera/ios/QrCode/QRScanReader.m';
const qrScanReaderFilePath = path.join(root, qrScanReaderPath);
if (fs.existsSync(qrScanReaderFilePath)) {
  const currentQrScanReader = fs.readFileSync(qrScanReaderFilePath, 'utf8');
  if (currentQrScanReader !== qrScanReaderSource) {
    fs.writeFileSync(qrScanReaderFilePath, qrScanReaderSource);
    console.log(`Patched ${qrScanReaderPath}`);
  }
}

const qrScanReaderAndroidPath =
  'node_modules/react-native-qr-decode-image-camera/android/src/main/java/com/lewin/qrcode/QRScanReader.java';
const qrScanReaderAndroidFilePath = path.join(root, qrScanReaderAndroidPath);
if (fs.existsSync(qrScanReaderAndroidFilePath)) {
  const currentQrScanReaderAndroid = fs.readFileSync(
    qrScanReaderAndroidFilePath,
    'utf8',
  );
  if (currentQrScanReaderAndroid !== qrScanReaderAndroidSource) {
    fs.writeFileSync(qrScanReaderAndroidFilePath, qrScanReaderAndroidSource);
    console.log(`Patched ${qrScanReaderAndroidPath}`);
  }
}

const patchTextInFile = (relativeFilePath, search, replacement) => {
  const filePath = path.join(root, relativeFilePath);
  if (!fs.existsSync(filePath)) {
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const normalized = content.replace(/\r\n/g, '\n');
  if (!normalized.includes(search)) {
    return;
  }
  const patched = normalized.replace(search, replacement);
  fs.writeFileSync(filePath, patched);
  console.log(`Patched ${relativeFilePath.replace(/\\/g, '/')}`);
};

patchTextInFile(
  'node_modules/use-state-if-mounted/useIsComponentMounted.js',
  `    return function () {
      return isMounted.current = false;
    };`,
  `    return function () {
      isMounted.current = false;
    };`,
);

const wavedphBackHandlerOld = `  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [backAction]);`;

const wavedphBackHandlerNew = `  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => subscription.remove();
  }, [backAction]);`;

for (const relativeFilePath of [
  'node_modules/@wavedph/react-native-picker-with-modal/src/Picker/index.tsx',
  'node_modules/@wavedph/react-native-picker-with-modal/lib/module/Picker/index.js',
  'node_modules/@wavedph/react-native-picker-with-modal/lib/commonjs/Picker/index.js',
]) {
  patchTextInFile(relativeFilePath, wavedphBackHandlerOld, wavedphBackHandlerNew);
  patchTextInFile(
    relativeFilePath,
    `  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [backAction]);`,
    `  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
  }, [backAction]);`,
  );
  patchTextInFile(
    relativeFilePath,
    `  (0, _react.useEffect)(() => {
    _reactNative.BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => _reactNative.BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [backAction]);`,
    `  (0, _react.useEffect)(() => {
    const subscription = _reactNative.BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
  }, [backAction]);`,
  );
}

const thDatepickerCalendar =
  'node_modules/@blacksakura013/th-datepicker/react-native-datepicker-th/components/CalendarScreen.tsx';

patchTextInFile(
  thDatepickerCalendar,
  `    const [modalVisible, setModalVisible] = useState(false);
    console.log(\`\${monthIndex} , \${yearIndex}\`)
    useEffect(() => {`,
  `    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {`,
);

patchTextInFile(
  thDatepickerCalendar,
  `        let data = Calendars.getFulldate(dateIndex, monthIndex, yearIndex)
        data = data.split('-')
        props.onChange(new Date(\`\${data[1]}/\${data[0]}/\${data[2]}\`))`,
  `        props.onChange(new Date(Number(yearIndex), Number(monthIndex), Number(dateIndex)))`,
);

patchTextInFile(
  thDatepickerCalendar,
  `    useEffect(() => {

        set_showDate(Calendars.setDateFormat(props.format && (props.format), props.era && (props.era), velLanguage, temp_dateIndex, temp_monthIndex, temp_yearIndex))
        setvelLanguage(props.language ? props.language : RNLocalize.getLocales().languageCode)
        if (props.value)
            if (typeof (props.value) == 'object') {
                let newDate = props.value
                if (newDate.toString().toUpperCase() != 'INVALID DATE') {
                    set_DateIndex(newDate.getDate())
                    set_MonthIndex(newDate.getMonth())
                    set_yearIndex(newDate.getFullYear())
                }
            }
            else if (typeof (props.value) == 'string') {
                let tempDate = props.value
                if (tempDate.search('-')) {
                    tempDate = tempDate.split('-')
                }
                else if (tempDate.search('/')) {
                    tempDate = tempDate.split('/')
                }
                let newDate = new Date('')
                if (newDate.toString().toUpperCase() != 'INVALID DATE') {
                    set_DateIndex(newDate.getDate())
                    set_MonthIndex(newDate.getMonth())
                    set_yearIndex(newDate.getFullYear())
                }
            }
        //backsakura013
    }, [props]);
    useEffect(() => {`,
  `    useEffect(() => {`,
);

patchTextInFile(
  thDatepickerCalendar,
  `    }, [props.value])`,
  `    }, [props.value, props.format, props.era, props.language])`,
);

patchTextInFile(
  'node_modules/react-native-image-picker/android/src/main/java/com/imagepicker/Utils.java',
  `            if (Arrays.asList(declaredPermissions).contains(Manifest.permission.CAMERA)
                    && ActivityCompat.checkSelfPermission(activity, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }`,
  `            if (Arrays.asList(declaredPermissions).contains(Manifest.permission.CAMERA)
                    && ActivityCompat.checkSelfPermission(activity, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(activity, new String[]{Manifest.permission.CAMERA}, 4815);
                return false;
            }`,
);

patchTextInFile(
  'node_modules/react-native-image-picker/android/src/main/java/com/imagepicker/ImagePickerModuleImpl.java',
  `        final Activity currentActivity = this.reactContext.getCurrentActivity();
        if (currentActivity == null) {
            callback.invoke(getErrorMap(errOthers, "Activity error"));
            return;
        }

        if (!isCameraPermissionFulfilled(reactContext, currentActivity)) {
            callback.invoke(getErrorMap(errOthers, cameraPermissionDescription));
            return;
        }`,
  `        final Activity currentActivity = this.reactContext.getCurrentActivity();
        if (currentActivity == null) {
            this.reactContext.runOnUiQueueThread(new Runnable() {
                @Override
                public void run() {
                    Activity activity = reactContext.getCurrentActivity();
                    if (activity == null) {
                        callback.invoke(getErrorMap(errOthers, "Activity error"));
                        return;
                    }
                    launchCameraWithActivity(activity, options, callback);
                }
            });
            return;
        }

        launchCameraWithActivity(currentActivity, options, callback);
    }

    private void launchCameraWithActivity(Activity currentActivity, final ReadableMap options, final Callback callback) {
        if (!isCameraPermissionFulfilled(reactContext, currentActivity)) {
            callback.invoke(getErrorMap(errPermission, cameraPermissionDescription));
            return;
        }`,
);

patchTextInFile(
  'node_modules/react-native-image-picker/android/src/main/java/com/imagepicker/ImagePickerModuleImpl.java',
  `    public void launchImageLibrary(final ReadableMap options, final Callback callback) {
        final Activity currentActivity = this.reactContext.getCurrentActivity();
        if (currentActivity == null) {
            callback.invoke(getErrorMap(errOthers, "Activity error"));
            return;
        }`,
  `    public void launchImageLibrary(final ReadableMap options, final Callback callback) {
        final Activity currentActivity = this.reactContext.getCurrentActivity();
        if (currentActivity == null) {
            this.reactContext.runOnUiQueueThread(new Runnable() {
                @Override
                public void run() {
                    Activity activity = reactContext.getCurrentActivity();
                    if (activity == null) {
                        callback.invoke(getErrorMap(errOthers, "Activity error"));
                        return;
                    }
                    launchImageLibraryWithActivity(activity, options, callback);
                }
            });
            return;
        }

        launchImageLibraryWithActivity(currentActivity, options, callback);
    }

    private void launchImageLibraryWithActivity(Activity currentActivity, final ReadableMap options, final Callback callback) {`,
);
