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
