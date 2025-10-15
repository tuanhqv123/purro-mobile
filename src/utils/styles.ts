import { Colors } from '@/constants/colors';

export function createGetStyles<T>(
  fn: (colors: typeof Colors) => T,
): (colors: typeof Colors) => T {
  return fn;
}

export function makeDebugBorder(color = 'red', width = 1) {
  return {
    borderWidth: width,
    borderColor: color,
  };
}
