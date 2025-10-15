export function useExpScreenCapture() {
  // Mock implementation - in real app this would check experimental features
  return {
    forceAllowScreenshot: false,
  };
}

export function useForceAllowScreenshot() {
  const { forceAllowScreenshot } = useExpScreenCapture();

  return {
    forceAllowScreenshot,
    setAllowScreenshot: (_allow: boolean) => {
      // Set allow screenshot
    },
  };
}
