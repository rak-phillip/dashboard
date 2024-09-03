import $ from 'jquery';
import JSZip from 'jszip';
import jsyaml from 'js-yaml';
import { h } from 'vue';

// Load any plugins that are present as npm modules
// The 'dynamic' module is generated in webpack to load each package

const dynamicLoader = require('@rancher/dynamic');

export default function({
  app,
  store,
  $axios,
  redirect,
  $plugin,
}, inject) {
  if (dynamicLoader) {
    console.log('PLUGINS-LOADER', { dynamicLoader, $plugin });
    dynamicLoader.default($plugin);
  }

  // The libraries we build have Vue externalised, so we need to expose Vue as a global for
  // them to pick up - see: https://cli.vuejs.org/guide/build-targets.html#library
  // window.Vue = Vue;
  window.vueApp = app;
  window.h = h;

  // Global libraries - allows us to externalise these to reduce package bundle size
  window.$ = $;
  window.__jszip = JSZip;
  window.__jsyaml = jsyaml;
}
