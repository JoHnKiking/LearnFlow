import React from 'react';
import { TextInput, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';

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
        placeholderTextColor={COLORS.TEXT_SECONDARY}
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
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  input_disabled: {
    backgroundColor: COLORS.BACKGROUND,
    color: COLORS.TEXT_SECONDARY,
  },
  input_error: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.ERROR,
    marginTop: SPACING.SMALL,
  },
});

export default Input;