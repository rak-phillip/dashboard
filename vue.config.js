const fs = require('fs');
const path = require('path');

const { defineConfig } = require('@vue/cli-service')

const dev = (process.env.NODE_ENV !== 'production');
const devPorts = dev || process.env.DEV_PORTS === 'true';

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    https: (devPorts ? {
      key:  fs.readFileSync(path.resolve(__dirname, 'shell/server/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'shell/server/server.crt'))
    } : null),
    port:   (devPorts ? 8005 : 80),
    host:   '0.0.0.0',
  },
  pages: {
    index: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      template: path.resolve(__dirname, 'shell/public/index.html'),
    }
  }
})
