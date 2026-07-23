import React, { createContext, useCallback, useContext, useState } from 'react';
import { View, Text, Pressable, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontSize } from './FontSizeHelper';
import Colors from '../src/Colors';
const SURFACE_WHITE = '#FFFFFF';
const LIST_MAX_HEIGHT = Dimensions.get('window').height * 0.55;
const SelectOverlayContext = createContext(null);

/**
 * Wrap a screen root so dropdown lists render above ScrollView / ImageBackground.
 */
export const SelectOverlayProvider = ({
  children
}) => {
  const [overlay, setOverlay] = useState(null);
  const showOverlay = useCallback(config => setOverlay(config), []);
  const hideOverlay = useCallback(() => setOverlay(null), []);
  return <SelectOverlayContext.Provider value={{
    showOverlay,
    hideOverlay
  }}>
      <View style={styles.providerRoot}>
        {children}
        {overlay ? <View style={styles.backdrop} pointerEvents="box-none">
            <Pressable style={styles.backdropPress} onPress={hideOverlay} />
            <View style={styles.sheet}>
              {overlay.title ? <Text style={styles.sheetTitle}>{overlay.title}</Text> : null}
              <FlatList data={overlay.options} keyExtractor={(item, index) => `${String(item.value)}-${index}`} style={styles.list} keyboardShouldPersistTaps="handled" renderItem={({
            item
          }) => {
            const isSelected = item.value === overlay.selectedValue;
            return <TouchableOpacity activeOpacity={0.65} style={[styles.row, isSelected ? styles.rowSelected : null]} onPress={() => {
              overlay.onSelect?.(item.value);
              hideOverlay();
            }}>
                      <Text numberOfLines={3} style={[styles.rowText, isSelected ? styles.rowTextSelected : null]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>;
          }} />
            </View>
          </View> : null}
      </View>
    </SelectOverlayContext.Provider>;
};

/**
 * Select field that opens a custom list overlay (white background, no native Picker).
 * Must be used under SelectOverlayProvider on the screen.
 * options: { label: string, value: string | number }[]
 */
const ModalSelectField = ({
  selectedLabel,
  options = [],
  selectedValue,
  onSelect,
  enabled = true,
  labelColor = '#000000',
  labelFontSize = FontSize.medium,
  modalTitle,
  placeholder = ''
}) => {
  const overlayApi = useContext(SelectOverlayContext);
  const openModal = () => {
    if (!enabled || !options.length) {
      return;
    }
    if (!overlayApi) {
      return;
    }
    overlayApi.showOverlay({
      title: modalTitle,
      options,
      selectedValue,
      onSelect
    });
  };
  return <Pressable onPress={openModal} disabled={!enabled} style={({
    pressed
  }) => [styles.field, pressed && enabled ? styles.fieldPressed : null, !enabled ? styles.fieldDisabled : null]}>
      <Text numberOfLines={1} style={[styles.fieldText, {
      color: labelColor,
      fontSize: labelFontSize
    }]}>
        {selectedLabel || placeholder}
      </Text>
      <FontAwesomeIcon icon={faChevronDown} size={15} color={enabled ? Colors.fontColor : Colors.borderColor} />
    </Pressable>;
};
const styles = StyleSheet.create({
  providerRoot: {
    flex: 1
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE_WHITE,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10
  },
  fieldPressed: {
    opacity: 0.85
  },
  fieldDisabled: {
    opacity: 0.6
  },
  fieldText: {
    flex: 1,
    marginRight: 8,
    color: '#000000'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    elevation: 2000,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)'
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject
  },
  sheet: {
    backgroundColor: SURFACE_WHITE,
    borderRadius: 14,
    paddingTop: 16,
    paddingBottom: 8,
    maxHeight: LIST_MAX_HEIGHT + 56,
    overflow: 'hidden',
    zIndex: 2001,
    elevation: 2001
  },
  sheetTitle: {
    fontSize: FontSize.medium,
    fontWeight: '600',
    color: Colors.fontColor,
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  list: {
    maxHeight: LIST_MAX_HEIGHT
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: SURFACE_WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderColor
  },
  rowSelected: {
    backgroundColor: '#F0F4FF'
  },
  rowText: {
    fontSize: FontSize.medium,
    color: '#000000'
  },
  rowTextSelected: {
    fontWeight: '600',
    color: Colors.itemColor
  }
});
export default ModalSelectField;