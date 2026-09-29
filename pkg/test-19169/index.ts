import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import { ProductMetadata, ProductChildCustomPage, ProductChildGroup } from '@shell/core/plugin-products-external';

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
}
