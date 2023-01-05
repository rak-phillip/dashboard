<script lang="ts">
import Vue from 'vue';
import ActivityBarBody from './ActivityBarBody.vue';

export default Vue.extend({
  name:       'ActivityBar',
  components: { ActivityBarBody },
  data() {
    return {
      isExpanded: false,
      activities: [
        {
          id:     'desktop',
          icon:   'icon-info',
          label:  'Desktop',
          active: false,
        },
        {
          id:     'dashboard',
          icon:   'icon-warning',
          label:  'Dashboard',
          active: true,
        },
      ]
    };
  },
  methods: {
    toggleExpansion() {
      this.isExpanded = !this.isExpanded;
    }
  },
});
</script>

<template>
  <div
    class="activity-bar"
    :class="{
      'activity-bar-expanded': isExpanded,
      'activity-bar-collapsed': !isExpanded
    }"
  >
    <div class="menu">
      <div
        class="menu-container"
        @click="toggleExpansion"
      >
        <span class="icon icon-2x icon-menu" />
      </div>
    </div>
    <activity-bar-body
      :activities="activities"
      :is-expanded="isExpanded"
    />
  </div>
</template>

<style lang="scss" scoped>
  .activity-bar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: var(--primary-900) 0% 0% no-repeat padding-box;
    box-shadow: 4px 3px 6px #00000029;
    opacity: 1;
    z-index: 99;
    padding: 0 0.75rem;
    width: 100%;
    transition: width 0.25s ease;
    overflow: hidden;

    &.activity-bar-expanded {
      width: 16rem;
    }

    &.activity-bar-collapsed {
      width: 100%;
    }

    .menu {
      display: flex;
      padding: 0.75rem 0;

      .menu-container {
        fill: var(--darker-text);
        color: var(--darker-text);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        min-height: 36px;
        opacity: 1;

        .menu-icon {
          color: var(--darker-text);
          min-width: 24px;
          min-height: 24px;
        }
      }

    }
  }
</style>
