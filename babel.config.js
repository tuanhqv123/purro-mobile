module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
        },
      },
    ],
    ['nativewind/babel', {}],
    ['@babel/plugin-transform-export-namespace-from'],
    // React Native Reanimated plugin - MUST be last
    'react-native-reanimated/plugin',
  ],
};
