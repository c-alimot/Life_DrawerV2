const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Map of path aliases from tsconfig.json
// Metro needs these to resolve module names correctly
const pathAliases = {
  "@store": "./src/store",
  "@services": "./src/services",
  "@types": "./src/types",
  "@components": "./src/components",
  "@features": "./src/features",
  "@constants": "./src/constants",
  "@hooks": "./src/hooks",
  "@styles": "./src/styles",
  "@utils": "./src/utils",
  "@navigation": "./src/navigation",
};

// Create an extraNodeModules mapping that resolves aliases
const extraNodeModules = {};
for (const [alias, target] of Object.entries(pathAliases)) {
  const aliasName = alias.startsWith("@") ? alias.slice(1) : alias;
  extraNodeModules[aliasName] = path.resolve(__dirname, target);
}

// Apply to Metro config
config.resolver.extraNodeModules = extraNodeModules;

module.exports = config;
