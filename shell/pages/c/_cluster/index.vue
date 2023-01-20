<script>
import { NAME as EXPLORER } from '@shell/config/product/explorer';

export default {
  layout({ $config }) {
    console.log('C', { config: $config });

    return 'desktop';

    // return $config.rancherEnv === 'desktop' ? 'desktop' : 'plain';
  },

  middleware({ redirect, route } ) {
    return redirect({
      name:   'c-cluster-product',
      params: {
        ...route.params,
        product: EXPLORER,
      }
    });
  }
};
</script>
