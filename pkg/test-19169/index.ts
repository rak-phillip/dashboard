import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import { ProductMetadata, ProductChildCustomPage, ProductChildGroup } from '@shell/core/plugin-products-external';
import { NAME as EXPLORER } from '@shell/config/product/explorer';
import * as legacyProduct from './legacy-product';

// Manual test from rancher/dashboard#19193: a product whose group has an overview page
export default function(plugin: IPlugin): void {
  importTypes(plugin);

  plugin.metadata = require('./package.json');

  const overviewPage: ProductChildCustomPage = {
    name:      'child',
    label:     'Child Page',
    component: () => import('./TestPage.vue'),
  };

  const adminGroup: ProductChildGroup = {
    name:      'admin',
    label:     'Admin',
    component: () => import('./TestPage.vue'),
    sideMenu:  {
      weight:   100,
      children: [overviewPage],
    },
  };

  const testProduct: ProductMetadata = {
    name:  'test19169',
    label: 'Test 19169',
  };

  plugin.addProduct(testProduct, [adminGroup]);

  // Review finding 1: see legacy-product.ts
  plugin.addProduct(legacyProduct as any);
  plugin.addRoute({
    name:      legacyProduct.PAGE_ROUTE,
    path:      `c/:cluster/${ legacyProduct.NAME }/page/:page`,
    component: () => import('./TestPage.vue'),
    meta:      { product: legacyProduct.NAME },
  });

  // Review finding 2: an Explorer group with an overview weighted below other types, so a starred
  // overview is not the first child of Starred. Its overview's type id is `explorer-demo-19193`.
  const demoGroup: ProductChildGroup = {
    name:      'demo-19193',
    label:     'Demo 19193',
    component: () => import('./TestPage.vue'),
    sideMenu:  {
      weight:   -10,
      children: [{
        name:      'demo-19193-child',
        label:     'Demo Child',
        component: () => import('./TestPage.vue'),
      }],
    },
  };

  plugin.extendProduct(EXPLORER, [demoGroup]);
}
