// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
// Absolute path to your package
const packagePath =
    '/home/farhoud/workspace/functionland/box/libraries/rn-fula';

module.exports = {
    ...getDefaultConfig(__dirname),
    resolver: {
        nodeModulesPaths: [packagePath],
        // rest of metro resolver options...
    },// Absolute path to your package
    watchFolders: [packagePath],
    // rest of metro options...
};

module.exports = getDefaultConfig(__dirname);
