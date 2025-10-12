import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Colors } from '@/constants/colors';
import { PasswordInput as PasswordInputComponent } from '@/components/Input';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  isPassword?: boolean;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  inputRef?: React.RefObject<TextInput | null>;
  onSubmitEditing?: () => void;
  errorMessage?: string;
  warningMessage?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  isPassword = false,
  onFocus,
  onBlur,
  isFocused,
  inputRef,
  onSubmitEditing,
  errorMessage,
  warningMessage,
}) => {
  const hasValue = value.length > 0;

  return (
    <View style={styles.inputWithWarning}>
      <View style={styles.inputContainer}>
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>{label}</Text>
        </View>
        {isPassword ? (
          <PasswordInputComponent
            ref={inputRef}
            containerStyle={[
              styles.inputField,
              isFocused && styles.inputFieldFocused,
              hasValue && styles.inputFieldFilled,
            ]}
            inputStyle={styles.textInput}
            inputProps={{
              placeholder,
              placeholderTextColor: Colors.text.secondary,
              value,
              onChangeText,
              onFocus,
              onBlur,
              returnKeyType: onSubmitEditing ? 'done' : 'next',
              onSubmitEditing,
            }}
            hasError={!!errorMessage}
            tipText={errorMessage || warningMessage}
          />
        ) : (
          <View
            style={[
              styles.inputField,
              isFocused && styles.inputFieldFocused,
              hasValue && styles.inputFieldFilled,
            ]}
          >
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={placeholder}
              placeholderTextColor={Colors.text.secondary}
              value={value}
              onChangeText={onChangeText}
              onFocus={onFocus}
              onBlur={onBlur}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType={onSubmitEditing ? 'done' : 'next'}
              onSubmitEditing={onSubmitEditing}
            />
          </View>
        )}
      </View>

      {/* Warning/Error container - only for non-password inputs */}
      {!isPassword && (
        <View style={styles.warningContainer}>
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          {warningMessage && !errorMessage && (
            <Text style={styles.warningText}>{warningMessage}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWithWarning: {
    gap: 8,
  },
  warningContainer: {
    minHeight: 20,
    justifyContent: 'flex-start',
  },
  inputContainer: {
    gap: 10,
  },
  inputLabelContainer: {
    paddingHorizontal: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  inputField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 48,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.background.secondary,
  },
  inputFieldFocused: {
    borderColor: Colors.brand.primary,
  },
  inputFieldFilled: {
    // Filled state styling
  },
  textInput: {
    color: Colors.text.primary,
    flex: 1,
    padding: 0,
    margin: 0,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    height: 20,
    textAlignVertical: 'center',
  },
  warningText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#EBAB16',
    textAlign: 'left',
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FF6B6B',
    textAlign: 'left',
    paddingHorizontal: 8,
  },
});
