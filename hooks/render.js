import redirectRootToPortal from './route-redirect-portal';

export default (nuxtConfig) => {
  const router = Reflect.has(nuxtConfig, 'router') ? nuxtConfig.router : {};
  const base = Reflect.has(router, 'base') ? router.base : process.env.ROUTER_BASE;

  return {
    /**
     * 'render:setupMiddleware'
     * {@link node_modules/nuxt/lib/core/renderer.js}
     */
    setupMiddleware(app) {
      app.use('/', redirectRootToPortal(base));
    }
  };
};
