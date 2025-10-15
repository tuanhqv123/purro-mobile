import { TextStyle } from 'react-native';

const FONT_FAMILY = 'Figtree';

export interface TypographyVariant {
  fontFamily: string;
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  lineHeight: number;
  letterSpacing?: number;
}

export const Typography = {
  h1: {
    fontFamily: FONT_FAMILY,
    fontSize: 48,
    fontWeight: '600' as const,
    lineHeight: 55.2,
  },
  h4: {
    fontFamily: FONT_FAMILY,
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 35.2,
  },
  h5: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 30,
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 25.2,
  },
  button: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 25.2,
  },
  capline: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 22.5,
  },
  label20: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 25,
  },
  label16: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22.4,
  },
  label14: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 19.6,
  },
} as const;

export type TypographyKey = keyof typeof Typography;
