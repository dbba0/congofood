// Champ de saisie CongoFood — label, error, hint, focus coloré
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  type KeyboardTypeOptions,
  type ViewStyle,
} from 'react-native';

export interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

export function TextInput({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  hint,
  leftElement,
  rightElement,
  secureTextEntry,
  keyboardType,
  autoFocus,
  editable = true,
  multiline,
  numberOfLines,
  style,
}: TextInputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? '#EF4444' : focused ? '#E85D04' : '#2D2D3D';

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}

      <View style={[styles.inputRow, { borderColor }]}>
        {leftElement && <View style={styles.sideElement}>{leftElement}</View>}

        <RNTextInput
          style={[
            styles.input,
            multiline && { height: (numberOfLines ?? 3) * 22, textAlignVertical: 'top' },
            !editable && styles.inputDisabled,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#4B5563"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {rightElement && <View style={styles.sideElement}>{rightElement}</View>}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {!error && hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'DMSans-Medium',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'DMSans-Regular',
    paddingVertical: 12,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  sideElement: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'DMSans-Regular',
  },
  hint: {
    fontSize: 12,
    color: '#4B5563',
    fontFamily: 'DMSans-Regular',
  },
});
