import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { PIXEL_COLORS, SPACING, PIXEL_BORDERS } from '../../utils/constants';

interface PixelInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const PixelInput: React.FC<PixelInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  autoCapitalize = 'none',
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        <View style={styles.shadowLayer} />
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={PIXEL_COLORS.PIXEL_LIGHT_GRAY}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          selectionColor={PIXEL_COLORS.PIXEL_CYAN}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.MEDIUM,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: PIXEL_COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
    letterSpacing: 1,
  },
  inputContainer: {
    position: 'relative',
  },
  inputContainerError: {
    borderColor: PIXEL_COLORS.ERROR,
  },
  shadowLayer: {
    position: 'absolute',
    bottom: -PIXEL_BORDERS.MEDIUM,
    right: -PIXEL_BORDERS.MEDIUM,
    width: '100%',
    height: '100%',
    backgroundColor: PIXEL_COLORS.PIXEL_DARK_BLUE,
    zIndex: 0,
  },
  input: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: PIXEL_COLORS.BACKGROUND_LIGHT,
    borderWidth: PIXEL_BORDERS.MEDIUM,
    borderColor: PIXEL_COLORS.PIXEL_GRAY,
    padding: SPACING.MEDIUM,
    color: PIXEL_COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: PIXEL_COLORS.ERROR,
    marginTop: SPACING.SMALL,
    fontWeight: '600',
  },
});

export default PixelInput;
