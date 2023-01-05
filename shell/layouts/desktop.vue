<script>
import ActivityBar from '@shell/components/ActivityBar';
import Brand from '@shell/mixins/brand';
import BrowserTabVisibility from '@shell/mixins/browser-tab-visibility';
import { mapState } from 'vuex';

export default {
  name: 'LayoutDesktop',

  components: { ActivityBar },

  mixins: [Brand, BrowserTabVisibility],

  middleware: ['authenticated'],

  computed: { ...mapState(['managementReady']) },
};
</script>

<template>
  <div class="dashboard-root">
    <div class="dashboard-content">
      <activity-bar class="activity-bar" />
      <div>Mock Header</div>
      <main class="main-layout">
        <nuxt class="outlet" />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .dashboard-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .dashboard-content {
    display: grid;
    flex-grow:1;

    grid-template-areas:
      "activity-bar header"
      "activity-bar main";

    grid-template-columns: max(57px) auto;
    grid-template-rows:    var(--header-height) auto;

    > HEADER {
      grid-area: header;
    }
  }

  MAIN {
    grid-area: main;
    overflow: auto;

    .outlet {
      min-height: 100%;
      padding: 0;
    }
  }

  .activity-bar {
    grid-area: activity-bar;
  }
</style>
