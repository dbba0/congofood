module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Nécessaire pour les stores Zustand et les animations
      'react-native-reanimated/plugin',
    ],
  };
};
