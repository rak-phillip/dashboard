<script>
import ActivityBar from '@shell/components/ActivityBar';
import Brand from '@shell/mixins/brand';
import BrowserTabVisibility from '@shell/mixins/browser-tab-visibility';
import { mapState } from 'vuex';
import NavigationSecondary from '@shell/components/NavigationSecondary';
import Header from '@shell/components/nav/Header';

export default {
  name: 'LayoutDesktop',

  components: {
    ActivityBar,
    NavigationSecondary,
    Header
  },

  mixins: [Brand, BrowserTabVisibility],

  middleware: ['authenticated'],

  computed: { ...mapState(['managementReady']) },
};
</script>

<template>
  <div class="dashboard-root">
    <div class="dashboard-content">
      <activity-bar class="activity-bar" />
      <!-- <div class="header">
        <Header />
      </div> -->
      <div class="side-nav">
        <navigation-secondary />
      </div>
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
      "activity-bar header header"
      "activity-bar side-nav main";

    grid-template-columns: max(4rem) auto 1fr;
    grid-template-rows: min-content 1fr;
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

  .header {
    grid-area: header;
  }

  .side-nav {
    grid-area: side-nav;
    max-width: var(--nav-width);
    height: 100%;
  }

  .main-layout {
    // padding: 1.5rem;
  }
</style>
