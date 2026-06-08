const fs = require('fs');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = fs.realpathSync.native(__dirname);
const watchFolders = projectRoot === __dirname ? [] : [__dirname];

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  projectRoot,
  watchFolders,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
