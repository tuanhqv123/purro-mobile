import React, { useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { RcIconEyeCC, RcIconEyeCloseCC } from '@/assets/icons/common';

const CLOSE_ICON_WRAPPER_WIDTH = 40;

type RenderCtx = {
  iconStyle: StyleProp<ViewStyle>;
  wrapperStyle: StyleProp<ViewStyle>;
  onPressCustom?: () => void;
};

export interface NextInputProps extends Omit<ViewStyle, 'children'> {
  fieldName?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputProps?: TextInputProps;
  inputStyle?: StyleProp<TextStyle>;
  fieldNameStyle?: StyleProp<TextStyle>;
  clearable?: boolean;
  customIcon?: React.ReactNode | ((ctx: RenderCtx) => React.ReactNode);
  onPressCustom?: () => void;
  hasError?: boolean;
  tipText?: string;
  disableFocusingStyle?: boolean;
}

export const NextInput = React.forwardRef<TextInput, NextInputProps>(
  (
    {
      fieldName,
      containerStyle,
      inputProps,
      inputStyle,
      fieldNameStyle,
      customIcon,
      onPressCustom,
      tipText,
      disableFocusingStyle = false,
      hasError = false,
      ...viewProps
    },
    ref,
  ) => {
    const [isFocusing, setIsFocusing] = React.useState(false);

    const onFocus = useCallback(
      (evt: any) => {
        setIsFocusing(true);
        inputProps?.onFocus?.(evt);
      },
      [inputProps],
    );

    const onBlur = useCallback(
      (evt: any) => {
        setIsFocusing(false);
        inputProps?.onBlur?.(evt);
      },
      [inputProps],
    );

    const _onPressCustom = useCallback(() => {
      onPressCustom?.();
    }, [onPressCustom]);

    const formattedCustomIcon = useMemo(() => {
      if (!customIcon) {
        return null;
      }

      const iconWrapperStyle: ViewStyle = {
        flexShrink: 0,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        width: CLOSE_ICON_WRAPPER_WIDTH,
        backgroundColor: 'transparent',
      };

      const iconStyle: ViewStyle = {
        width: 20,
        height: 20,
      };

      if (typeof customIcon === 'function') {
        return customIcon({
          iconStyle,
          wrapperStyle: iconWrapperStyle,
          onPressCustom: _onPressCustom,
        });
      }
      return customIcon;
    }, [customIcon, _onPressCustom]);

    const hasCustomIcon = !!formattedCustomIcon;

    return (
      <>
        <View
          {...viewProps}
          style={StyleSheet.flatten([
            styles.inputContainer,
            hasCustomIcon && styles.inputContainerWithIcon,
            hasError && styles.errorInputContainer,
            !disableFocusingStyle &&
              isFocusing &&
              !hasError &&
              styles.inputContainerFocusing,
            containerStyle,
            !!fieldName && styles.inputContainerWithFieldName,
          ])}
        >
          {fieldName && (
            <Text
              style={StyleSheet.flatten([styles.fieldName, fieldNameStyle])}
            >
              {fieldName}
            </Text>
          )}
          <TextInput
            {...inputProps}
            onFocus={onFocus}
            onBlur={onBlur}
            ref={ref}
            style={StyleSheet.flatten([
              styles.input,
              inputStyle,
              inputProps?.style,
              !!fieldName && styles.inputWithFieldName,
            ])}
          />
          {formattedCustomIcon}
        </View>
        {tipText && (
          <View style={styles.formFieldTipTextContainer}>
            <Text
              style={StyleSheet.flatten([
                styles.formFieldTipText,
                hasError && styles.formFieldErrorText,
              ])}
            >
              {tipText}
            </Text>
          </View>
        )}
      </>
    );
  },
);

NextInput.displayName = 'NextInput';

export const PasswordInput = React.forwardRef<
  TextInput,
  NextInputProps & {
    initialPasswordVisible?: boolean;
    iconColor?: string;
  }
>(({ initialPasswordVisible = false, iconColor, ...props }, ref) => {
  const [passwordVisible, setPasswordVisible] = React.useState(
    initialPasswordVisible,
  );

  const customIconProp = useMemo(() => {
    if (props.customIcon) {
      return props.customIcon;
    }

    return (ctx: RenderCtx) => (
      <TouchableOpacity
        style={ctx.wrapperStyle}
        onPress={() => {
          setPasswordVisible(prev => !prev);
        }}
        accessibilityRole="button"
        accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
      >
        {passwordVisible ? (
          <RcIconEyeCC
            width={20}
            height={16}
            color={iconColor || Colors.text.primary}
          />
        ) : (
          <RcIconEyeCloseCC
            width={20}
            height={20}
            color={iconColor || Colors.text.primary}
          />
        )}
      </TouchableOpacity>
    );
  }, [props.customIcon, iconColor, passwordVisible]);

  return (
    <NextInput
      {...props}
      ref={ref}
      inputProps={{
        ...props.inputProps,
        secureTextEntry: !passwordVisible,
        autoCapitalize: 'none',
        autoCorrect: false,
      }}
      customIcon={customIconProp}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border.primary,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: Colors.background.secondary,
  },
  inputContainerWithFieldName: {
    position: 'relative',
  },
  fieldName: {
    ...Typography.styles.label,
    fontSize: 12,
    color: Colors.text.secondary,
    position: 'absolute',
    left: 12,
    top: 8,
  },
  inputContainerFocusing: {
    borderColor: Colors.brand.primary,
  },
  inputContainerWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 0,
  },
  errorInputContainer: {
    borderColor: Colors.system.error,
  },
  input: {
    ...Typography.styles.body,
    flexShrink: 1,
    fontSize: 20,
    paddingHorizontal: 0,
    width: '100%',
    height: '100%',
    color: Colors.text.primary,
    padding: 0,
  },
  inputWithFieldName: {
    position: 'relative',
    top: 8,
  },
  formFieldTipTextContainer: {
    marginTop: 8,
  },
  formFieldTipText: {
    ...Typography.styles.label,
    color: Colors.text.secondary,
  },
  formFieldErrorText: {
    color: Colors.system.error,
  },
});

// Export as namespace like Rabby does
export const Input = {
  Base: NextInput,
  Password: PasswordInput,
};
