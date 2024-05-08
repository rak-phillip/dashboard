import { createApp } from 'vue';
import App from './App.vue';
import router from '../shell/config/router';
import defineIndex from '../shell/store/index';
import I18n from '../shell/plugins/i18n';
import { VCleanTooltip } from '../shell/plugins/clean-tooltip-directive';
import { cleanHtmlDirective } from '../shell/plugins/clean-html-directive';
import fetchMixin from '../shell/mixins/fetch.client';
// import defineActionMenu from '../shell/store/action-menu';
// import defineAuth from '../shell/store/auth';
// import defineAws from '../shell/store/aws';
// import defineCatalog from '../shell/store/catalog';
// import defineDigitalOcean from '../shell/store/digitalocean';
// import defineGithub from '../shell/store/github';
// import defineGitlab from '../shell/store/gitlab';
// import defineGrowl from '../shell/store/growl';
// import defineI18N from '../shell/store/i18n';
// import defineLinode from '../shell/store/linode';
// import definePlugins from '../shell/store/plugins';
// import definePnap from '../shell/store/pnap';
// import definePrefs from '../shell/store/prefs';
// import defineResourceFetch from '../shell/store/resource-fetch';
// import defineUiplugins from '../shell/store/uiplugins';
// import defineWm from '../shell/store/wm';
// import defineCustomisation from '../shell/store/customisation';

// const storeActionMenu = createStore(defineActionMenu);
// const storeAuth = createStore(defineAuth);
// const storeAws = createStore(defineAws);
// const storeCatalog = createStore(defineCatalog);
// const storeDigitalOcean = createStore(defineDigitalOcean);
// // const storeGithub = createStore(defineGithub);
// // const storeGitlab = createStore(defineGitlab);
// const storeGrowl = createStore(defineGrowl);
// const storeI18N = createStore(defineI18N);
// const storeLinode = createStore(defineLinode);
// const storePlugins = createStore(definePlugins);
// const storePnap = createStore(definePnap);
// const storePrefs = createStore(definePrefs);
// const storeResourceFetch = createStore(defineResourceFetch);
// const storeUiplugins = createStore(defineUiplugins);
// const storeWm = createStore(defineWm);
// const storeCustomisation = createStore(defineCustomisation);

createApp(App)
  .use(router)
  .use(defineIndex)
  .use(I18n, { greetings: { hello: 'Bonjour!' } })
  .directive('clean-tooltip', VCleanTooltip)
  .directive('clean-html', cleanHtmlDirective)
  .mixin(fetchMixin)
  .mount('#app');
