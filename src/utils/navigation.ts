import { RootStackParamList } from '@/types/navigation';

// TODO: Implement navigation utilities
export function getReadyNavigationInstance() {
  // This would return the navigation instance
  // For now, return a mock object
  return {
    navigate: (
      _screen: string,
      _params?: RootStackParamList[keyof RootStackParamList],
    ) => {
      // Navigate to screen
    },
    goBack: () => {
      // Go back
    },
  };
}
