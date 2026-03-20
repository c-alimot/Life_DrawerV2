const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Babel plugin module-resolver handles the path aliases at transform time,
// so we don't need custom resolver logic here. Just use the default config.
