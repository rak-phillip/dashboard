import { createApp } from 'vue';
import App from './App.vue';
import router from '../shell/config/router';
import store from '../shell/store/index';
import { createStore } from 'vuex';
// import store from './store'

const someStore = createStore(store);

createApp(App)
  .use(router)
  .use(someStore)
  .mount('#app');
