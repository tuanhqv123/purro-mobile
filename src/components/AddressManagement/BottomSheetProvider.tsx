import React from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

interface BottomSheetProviderProps {
  children: React.ReactNode;
}

export const BottomSheetProvider: React.FC<BottomSheetProviderProps> = ({
  children,
}) => {
  return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>;
};
