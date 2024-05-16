import { createApp } from 'vue';
import App from './App.vue';
import router from '../shell/config/router';
import defineIndex from '../shell/store/index';
import I18n from '../shell/plugins/i18n';
import { VCleanTooltip } from '../shell/plugins/clean-tooltip-directive';
import { cleanHtmlDirective } from '../shell/plugins/clean-html-directive';
import fetchMixin from '../shell/mixins/fetch.client';
import { installPlugins } from '../shell/initialize/plugins';
import { setContext } from '../shell/utils/nuxt';

const store = defineIndex;
const routerDef = router;

const app = {
  store,
  router: routerDef,
  nuxt:   {
    err:     null,
    dateErr: null,
    error(err: any) {
      // err = err || null;
      // app.context._errored = Boolean(err);
      // err = err ? normalizeError(err) : null;
      // let nuxt = app.nuxt; // to work with @vue/composition-api, see https://github.com/nuxt/nuxt.js/issues/6517#issuecomment-573280207

      // if (this) {
      //   nuxt = this.nuxt || this.$options.nuxt;
      // }
      // nuxt.dateErr = Date.now();
      // nuxt.err = err;

      return err;
    }
  },
  ...App
};

// Set context to app.context
await setContext(app, {
  store,
  route:   undefined,
  next:    undefined,
  error:   app.nuxt.error.bind(app),
  payload: undefined,
  req:     undefined,
  res:     undefined
});

const vueApp = createApp(app);

console.log('NOT FAIL');
console.log('NOT FAIL');
console.log('NOT FAIL');
console.log('NOT FAIL');
console.log('NOT FAIL');
console.log('APP', { app, vueApp });
console.log('NOT FAIL');
console.log('NOT FAIL');
console.log('NOT FAIL');
console.log('NOT FAIL');
console.log('NOT FAIL');

await installPlugins(app, vueApp);

vueApp
  .use(routerDef)
  .use(store)
  // .use(I18n, { greetings: { hello: 'Bonjour!' } })
  .directive('clean-tooltip', VCleanTooltip)
  .directive('clean-html', cleanHtmlDirective)
  .mixin(fetchMixin)
  .mount('#app');
