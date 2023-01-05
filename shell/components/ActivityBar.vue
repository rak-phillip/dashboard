<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'ActivityBar',
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
    menuClick() {
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
        @click="menuClick"
      >
        <span class="icon icon-2x icon-menu" />
      </div>
    </div>
    <div class="body">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="activity"
      >
        <div
          class="activity-icon"
          :class="{ active: activity.active }"
        >
          <span
            class="icon icon-2x"
            :class="[activity.icon]"
          />
        </div>
        <span
          v-if="isExpanded"
          class="activity-text"
          :class="{ active: activity.active }"
        >
          {{ activity.label }}
        </span>
      </div>
    </div>
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

    .body {
      display: flex;
      gap: 1rem;
      flex-direction: column;

      .activity {
        display: flex;
        gap: 1rem;
        align-items: center;
        cursor: pointer;

        &:hover {
          .activity-icon {
            color: var(--primary-hover-text);
            border-color: var(--primary-hover-text);
          }

          .activity-text {
            color: var(--primary-hover-text);
          }
        }

        .activity-text {
          color: #BCBCBC;
          flex-shrink: 0;

          &.active {
            color: var(--darker-text);
          }
        }

        .activity-icon {
          &.active {
            border: 1px solid var(--activity-icon-active-background);
            background-color: var(--activity-icon-active-background);
            color: var(--activity-icon-color);
          }

          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          min-height: 36px;
          border: 1px solid #BCBCBC;
          color: #BCBCBC;
          border-radius: 8px;
          opacity: 1;
        }
      }
    }
  }
</style>
