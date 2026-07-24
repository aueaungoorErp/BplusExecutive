import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  FlatList,
  View,
  StyleSheet,
} from 'react-native';
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
const MODAL_ROW_HEIGHT = 49;

export const pickerFieldBox = (extra, borderColor) => ({
  borderColor: borderColor ?? Colors.itemColor,
  backgroundColor: PICKER_SURFACE_WHITE,
  borderWidth: 1,
  paddingHorizontal: 8,
  paddingVertical: PICKER_BOX_PADDING_V,
  borderRadius: 10,
  minHeight: PICKER_BOX_MIN_HEIGHT,
  justifyContent: 'center',
  flexDirection: 'row',
  alignItems: 'center',
  ...extra,
});

const childrenToPickerData = children =>
  React.Children.toArray(children)
    .map(child => {
      if (!child?.props) {
        return null;
      }
      const { label, value } = child.props;
      if (label == null || value == null) {
        return null;
      }
      return { label: String(label), value };
    })
    .filter(Boolean);

/** Styles for items in the native Android picker list */
export const pickerListItemProps = (
  fontSize = FontSize.medium,
  textColor = '#000000',
) => ({
  color: textColor,
  style: {
    backgroundColor: PICKER_SURFACE_WHITE,
    color: textColor,
    fontSize,
  },
});

const DropdownPickerField = ({
  selectedLabel,
  boxStyle,
  labelColor,
  iconColor,
  borderColor,
  labelFontSize,
  headerTitle = 'โปรดเลือก',
  children,
  ...pickerProps
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const listRef = useRef(null);
  const textColor = labelColor ?? Colors.itemColor;
  const chevronColor = iconColor ?? textColor;
  const boxBorderColor = borderColor ?? textColor;
  const overlayFontSize = labelFontSize ?? PICKER_LABEL_FONT_SIZE;
  const { selectedValue, onValueChange, enabled = true } = pickerProps;
  const options = childrenToPickerData(children);

  const closeModal = () => setModalVisible(false);
  const openModal = () => {
    if (enabled) {
      setModalVisible(true);
    }
  };

  useEffect(() => {
    if (!modalVisible) {
      return;
    }
    const selectedIndex = options.findIndex(
      option => option.value === selectedValue,
    );
    if (selectedIndex < 0) {
      return;
    }
    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: false,
        viewPosition: 0.35,
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [modalVisible, options, selectedValue]);

  const renderOption = ({ item: option }) => {
    const selected = option.value === selectedValue;
    return (
      <TouchableOpacity
        style={[styles.modalRow, selected && styles.modalRowSelected]}
        onPress={() => {
          onValueChange?.(option.value);
          closeModal();
        }}
      >
        <Text
          style={[
            styles.modalRowText,
            selected && styles.modalRowTextSelected,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!enabled}
        onPress={openModal}
        style={[
          pickerFieldBox(boxStyle, boxBorderColor),
          !enabled && styles.triggerDisabled,
        ]}
      >
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: textColor,
            fontSize: overlayFontSize,
            paddingRight: 4,
          }}
        >
          {selectedLabel}
        </Text>
        <FontAwesomeIcon icon={faChevronDown} size={14} color={chevronColor} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{headerTitle}</Text>
            <FlatList
              ref={listRef}
              data={options}
              keyExtractor={item => String(item.value)}
              style={styles.modalList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              getItemLayout={(_, index) => ({
                length: MODAL_ROW_HEIGHT,
                offset: MODAL_ROW_HEIGHT * index,
                index,
              })}
              onScrollToIndexFailed={info => {
                setTimeout(() => {
                  listRef.current?.scrollToOffset({
                    offset: info.averageItemLength * info.index,
                    animated: false,
                  });
                }, 50);
              }}
              renderItem={renderOption}
            />
            <TouchableOpacity style={styles.modalCancel} onPress={closeModal}>
              <Text style={styles.modalCancelText}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.backgroundColorSecondary,
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: FontSize.medium,
    fontWeight: 'bold',
    color: Colors.fontColor,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderColor,
  },
  modalList: {
    maxHeight: 420,
  },
  modalRow: {
    height: MODAL_ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderColor,
  },
  modalRowSelected: {
    backgroundColor: Colors.backgroundColor,
  },
  modalRowText: {
    fontSize: FontSize.medium,
    color: Colors.fontColor,
  },
  modalRowTextSelected: {
    color: Colors.itemColor,
    fontWeight: 'bold',
  },
  modalCancel: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderColor,
  },
  modalCancelText: {
    fontSize: FontSize.medium,
    color: Colors.fontColor,
  },
});

export default DropdownPickerField;
