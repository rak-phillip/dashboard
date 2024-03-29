const config = require('./shell/vue.config');

// Excludes the following plugins if there's no .env file.
let defaultExcludes = 'rancher-components, harvester';

if (process.env.RANCHER_ENV === 'harvester') {
  defaultExcludes = defaultExcludes.replace(', harvester', '');
}
const excludes = process.env.EXCLUDES_PKG || defaultExcludes;

module.exports = config(__dirname, {
  excludes: excludes.replace(/\s/g, '').split(','),
  // excludes: ['fleet', 'example']
});

// const fs = require('fs');
// const path = require('path');

// const { defineConfig } = require('@vue/cli-service');

// const dev = (process.env.NODE_ENV !== 'production');
// const devPorts = dev || process.env.DEV_PORTS === 'true';
// const SHELL_ABS = path.join(__dirname, 'shell');
// const COMPONENTS_DIR = path.join(__dirname, 'pkg', 'rancher-components', 'src', 'components');

// console.log('NOT FAIL', { SHELL_ABS, COMPONENTS_DIR });

// module.exports = defineConfig({
//   transpileDependencies: true,
//   devServer:             {
//     https: (devPorts ? {
//       key:  fs.readFileSync(path.resolve(__dirname, 'shell/server/server.key')),
//       cert: fs.readFileSync(path.resolve(__dirname, 'shell/server/server.crt'))
//     } : null),
//     port: (devPorts ? 8005 : 80),
//     host: '0.0.0.0',
//   },
//   pages: {
//     index: {
//       entry:    path.resolve(__dirname, 'src/main.ts'),
//       template: path.resolve(__dirname, 'shell/public/index.html'),
//     }
//   },
//   configureWebpack(config) {
//     config.resolve.alias['~shell'] = SHELL_ABS;
//     config.resolve.alias['@shell'] = SHELL_ABS;
//     config.resolve.alias['@components'] = COMPONENTS_DIR;

//     const loaders = [
//       {
//         test:    /\.ya?ml$/i,
//         loader:  'js-yaml-loader',
//         options: { name: '[path][name].[ext]' },
//       },
//     ];

//     config.module.rules.push(...loaders);
//   },
//   css: {
//     extract:       false, // inline css styles instead of including with `<links`
//     loaderOptions: {
//       sass: {
//         // This is effectively added to the beginning of each style that's imported or included in a vue file. We may want to look into including these in app.scss
//         additionalData: `
//           @use 'sass:math';
//           @import "~shell/assets/styles/base/_variables.scss";
//           @import "~shell/assets/styles/base/_functions.scss";
//           @import "~shell/assets/styles/base/_mixins.scss";
//         `
//       }
//     }
//   },
// });
