import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { FontSize } from './FontSizeHelper';
import Colors from '../src/Colors';

export const PICKER_CONTROL_HEIGHT = 36;
export const PICKER_BOX_PADDING_V = 3;
export const PICKER_BOX_MIN_HEIGHT =
  PICKER_CONTROL_HEIGHT + PICKER_BOX_PADDING_V * 2;
export const PICKER_LABEL_FONT_SIZE = FontSize.medium;
export const PICKER_HALF_BOX = { flex: 1, minWidth: 0 };
export const PICKER_DROPDOWN_ICON_WIDTH = 28;
export const PICKER_SURFACE_WHITE = '#FFFFFF';

export const pickerFieldBox = (extra, borderColor) => ({
  borderColor: borderColor ?? Colors.itemColor,
  backgroundColor: PICKER_SURFACE_WHITE,
  borderWidth: 1,
  paddingHorizontal: 8,
  paddingVertical: PICKER_BOX_PADDING_V,
  borderRadius: 10,
  minHeight: PICKER_BOX_MIN_HEIGHT,
  justifyContent: 'center',
  overflow: 'hidden',
  ...extra,
});

const pickerFieldStyle = (width, textColor) => ({
  color: textColor ?? Colors.itemColor,
  width,
  height: PICKER_CONTROL_HEIGHT,
  marginVertical: 0,
  backgroundColor: PICKER_SURFACE_WHITE,
});

/** Styles for items in the native Android/iOS picker list */
export const pickerListItemProps = (
  fontSize = FontSize.medium,
  textColor = '#000000',
) => ({
  color: textColor,
  ...(Platform.OS === 'android'
    ? {
        style: {
          backgroundColor: PICKER_SURFACE_WHITE,
          color: textColor,
        },
      }
    : Platform.OS === 'ios'
      ? {
          style: {
            color: textColor,
            fontSize,
          },
        }
      : {}),
});

const DropdownPickerField = ({
  selectedLabel,
  pickerWidth,
  boxStyle,
  labelColor,
  iconColor,
  borderColor,
  labelFontSize,
  androidPickerMode = 'dropdown',
  children,
  ...pickerProps
}) => {
  const textColor = labelColor ?? Colors.itemColor;
  const chevronColor = iconColor ?? textColor;
  const boxBorderColor = borderColor ?? textColor;
  const overlayFontSize = labelFontSize ?? PICKER_LABEL_FONT_SIZE;
  const pickerMode =
    Platform.OS === 'android' ? androidPickerMode : 'dropdown';

  return (
    <View style={pickerFieldBox(boxStyle, boxBorderColor)}>
      {Platform.OS === 'android' ? (
        <Text
          pointerEvents="none"
          numberOfLines={1}
          style={{
            position: 'absolute',
            left: 10,
            right: 10 + PICKER_DROPDOWN_ICON_WIDTH,
            height: PICKER_BOX_MIN_HEIGHT,
            lineHeight: PICKER_BOX_MIN_HEIGHT,
            color: textColor,
            fontSize: overlayFontSize,
            zIndex: 2,
            backgroundColor: PICKER_SURFACE_WHITE,
          }}
        >
          {selectedLabel}
        </Text>
      ) : null}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 6,
          top: 0,
          bottom: 0,
          width: PICKER_DROPDOWN_ICON_WIDTH,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <FontAwesomeIcon
          icon={faChevronDown}
          size={14}
          color={chevronColor}
        />
      </View>
      <Picker
        {...pickerProps}
        mode={pickerMode}
        dropdownIconColor={chevronColor}
        itemStyle={
          Platform.OS === 'ios'
            ? {
                fontSize: overlayFontSize,
                height: PICKER_CONTROL_HEIGHT,
                color: textColor,
              }
            : undefined
        }
        style={{
          ...pickerFieldStyle(pickerWidth, textColor),
          ...(Platform.OS === 'android'
            ? {
                opacity: 0,
                backgroundColor: PICKER_SURFACE_WHITE,
                color: 'transparent',
              }
            : {}),
        }}
      >
        {children}
      </Picker>
    </View>
  );
};

export default DropdownPickerField;
