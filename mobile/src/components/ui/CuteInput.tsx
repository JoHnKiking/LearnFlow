import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { CUTE_COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

interface CuteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

const CuteInput: React.FC<CuteInputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  style,
  inputStyle,
}) => {
  return (
    <TextInput
      style={[
        styles.input,
        style,
        inputStyle,
        multiline ? styles.multiline : null,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={CUTE_COLORS.GRAY}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      selectionColor={CUTE_COLORS.PINK}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: CUTE_COLORS.LIGHT_PINK,
    backgroundColor: CUTE_COLORS.WHITE,
    paddingHorizontal: SPACING.MEDIUM,
    fontSize: 16,
    color: CUTE_COLORS.DARK_GRAY,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  multiline: {
    height: 120,
    paddingVertical: SPACING.MEDIUM,
    textAlignVertical: 'top',
  },
});

export default CuteInput;
