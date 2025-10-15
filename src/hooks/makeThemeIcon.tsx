import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeIconProps } from '@/types/components';

// Mock implementation - in real app this would create themed icons
export function makeThemeIconFromCC(
  Component: React.ComponentType<ThemeIconProps>,
  theme: string,
) {
  const themeColor = theme === 'orange-default' ? '#FFA500' : '#666';
  return (props: ThemeIconProps) => (
    <View style={styles.container}>
      {/* Placeholder for icon */}
      <View
        style={[
          styles.icon,
          {
            width: props.width || 24,
            height: props.height || 24,
            backgroundColor: themeColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    borderRadius: 12,
  },
});
