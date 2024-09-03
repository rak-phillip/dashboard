const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const VirtualModulesPlugin = require('webpack-virtual-modules');
const { generateTypeImport } = require('./auto-import');

module.exports = function(dir) {
  console.log('NOT FAIL');
  console.log('NOT FAIL');
  console.log('NOT FAIL');
  console.log('NOT FAIL');
  console.log('USING SHELL/PKG/VUE.CONFIG', { dir });
  console.log('NOT FAIL');
  console.log('NOT FAIL');
  console.log('NOT FAIL');
  console.log('NOT FAIL');
  const maindir = path.resolve(dir, '..', '..');
  // The shell code must be sym-linked into the .shell folder
  const SHELL = path.join(dir, '.shell');
  let COMPONENTS_DIR = path.join(SHELL, 'rancher-components');

  const stat = fs.lstatSync(SHELL);

  // If @rancher/shell is a symlink, then use the components folder for it
  if (stat.isSymbolicLink() && !fs.existsSync(COMPONENTS_DIR)) {
    const REAL_SHELL = fs.realpathSync(SHELL);

    COMPONENTS_DIR = path.join(REAL_SHELL, '..', 'pkg', 'rancher-components', 'src', 'components');
  }

  if (fs.existsSync(path.join(maindir, 'shell'))) {
    COMPONENTS_DIR = path.join(maindir, 'pkg', 'rancher-components', 'src', 'components');
  }

  return {
    css: {
      extract:       false,
      loaderOptions: { sass: { additionalData: `@use 'sass:math'; @import '${ SHELL }/assets/styles/base/_variables.scss'; @import '${ SHELL }/assets/styles/base/_functions.scss'; @import '${ SHELL }/assets/styles/base/_mixins.scss'; ` } }
    },

    chainWebpack: (config) => {
      const options = {
        analyzerMode: 'static',
        openAnalyzer: false,
      };

      config
        .plugin('webpack-bundle-analyzer')
        .use(BundleAnalyzerPlugin)
        .init((Plugin) => new Plugin(options));

      // Add support for TypeScript
      config.module
        .rule('ts')
        .test(/\.tsx?$/)
        .use('ts-loader')
        .loader('ts-loader')
        .options({
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly:    true
        });

      // Update Vue loader for Vue 3
      config.module
        .rule('vue')
        .use('vue-loader')
        .tap((options) => ({
          ...options,
          compilerOptions: { isCustomElement: (tag) => tag.startsWith('rancher-') }
        }));
    },

    configureWebpack: (config) => {
      const pkgName = dir.replace(`${ path.dirname(dir) }/`, '');

      // Alias updates
      config.resolve.alias['@shell'] = path.join(dir, '.shell');
      config.resolve.alias['~shell'] = path.join(dir, '.shell');
      // This should be udpated once we move to rancher-components as a dependency
      config.resolve.alias['@components'] = COMPONENTS_DIR;
      config.resolve.alias['./node_modules'] = path.join(maindir, 'node_modules');
      config.resolve.alias[`@pkg/${ pkgName }`] = dir;
      config.resolve.alias['@pkg'] = dir;
      config.resolve.alias['~pkg'] = dir;
      config.resolve.alias['~'] = maindir;
      delete config.resolve.alias['@'];

      // Prevent the dynamic importer and the model-loader-require from importing anything dynamically - we don't want all of the
      // models etc when we build as a library
      const dynamicImporterOverride = new webpack.NormalModuleReplacementPlugin(/dynamic-importer$/, (resource) => {
        resource.request = path.join(__dirname, 'dynamic-importer.lib.js');
      });
      const modelLoaderImporterOverride = new webpack.NormalModuleReplacementPlugin(/model-loader-require$/, (resource) => {
        const fileName = 'model-loader-require.lib.js';
        const pkgModelLoaderRequire = path.join(dir, fileName);

        resource.request = fs.existsSync(pkgModelLoaderRequire) ? pkgModelLoaderRequire : path.join(__dirname, fileName);
      });

      // Auto-generate module to import the types (model, detail, edit etc)
      const autoImportPlugin = new VirtualModulesPlugin({ 'node_modules/@rancher/auto-import': generateTypeImport('@pkg', dir) });

      config.plugins.unshift(dynamicImporterOverride);
      config.plugins.unshift(modelLoaderImporterOverride);
      config.plugins.unshift(autoImportPlugin);
      // config.plugins.unshift(debug);

      // These modules will be externalised and not included with the build of a package library
      // This helps reduce the package size, but these dependencies must be provided by the hosting application
      config.externals = {
        jquery:    '$',
        jszip:     '__jszip',
        'js-yaml': '__jsyaml'
      };

      // Prevent warning in log with the md files in the content folder
      config.module.rules.push({
        test: /\.md$/,
        use:  [
          {
            loader:  'url-loader',
            options: {
              name:     '[path][name].[ext]',
              limit:    1,
              esModule: false
            },
          }
        ]
      });

      config.resolve.extensions.push('.ts', '.tsx');

      config.module.rules.push({
        test:    /\.ya?ml$/i,
        loader:  'js-yaml-loader',
        options: { name: '[path][name].[ext]' },
      });

      // Update the webpack config to transpile @rancher/shell
      config.module.rules.forEach((rule) => {
        if (Array.isArray(rule.use)) {
          rule.use.forEach((loader) => {
            if (loader.loader === 'babel-loader') {
              rule.exclude = /node_modules\/(?!@rancher\/shell\/).*/;
            }
          });
        }
      });
    }
  };
};
