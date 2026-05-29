import React from 'react';
import { TextInput, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, PIXEL_COLORS } from '../../utils/constants';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  error?: string;
  onSubmitEditing?: () => void;
}

const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  disabled = false,
  error,
  onSubmitEditing,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          disabled && styles.input_disabled,
          error && styles.input_error,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={PIXEL_COLORS.PIXEL_LIGHT_GRAY}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        onSubmitEditing={onSubmitEditing}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.MEDIUM,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: PIXEL_COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.PIXEL_GRAY,
    borderRadius: 8,
    paddingHorizontal: SPACING.MEDIUM,
    backgroundColor: PIXEL_COLORS.BACKGROUND_LIGHT,
    fontSize: 16,
    color: PIXEL_COLORS.TEXT_PRIMARY,
  },
  input_disabled: {
    backgroundColor: PIXEL_COLORS.PIXEL_GRAY,
    color: PIXEL_COLORS.TEXT_SECONDARY,
  },
  input_error: {
    borderColor: PIXEL_COLORS.ERROR,
  },
  errorText: {
    fontSize: 14,
    color: PIXEL_COLORS.ERROR,
    marginTop: SPACING.SMALL,
  },
});

export default Input;