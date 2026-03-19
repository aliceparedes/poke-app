const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Prevent Metro from crawling up into the parent directory
// which has its own node_modules and app.json.
config.watchFolders = [projectRoot];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
