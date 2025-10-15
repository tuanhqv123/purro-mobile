import { ViewStyle } from 'react-native';

export const Shadow = {
  xs: {
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 3,
  } as ViewStyle,
  sm: {
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  md: {
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle,
  lg: {
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  } as ViewStyle,
} as const;

export type ShadowKey = keyof typeof Shadow;
