<script setup lang="ts">
import { RcItemCardAction } from '@components/RcItemCard';

interface FooterItem {
  icon?: string;
  iconTooltip?: Record<{key?: string, text?: string}>;
  labels: string[];
}

const emit = defineEmits<{(e: 'click:item', type: string, label: string): void; }>();

defineProps<{
  items: FooterItem[];
}>();

function onClickItem(type: string, label: string) {
  emit('click:item', type, label);
}

</script>

<template>
  <div class="app-chart-card-footer">
    <div
      v-for="(footerItem, i) in items"
      :key="i"
      class="app-chart-card-footer-item"
      data-testid="app-chart-card-footer-item"
    >
      <i
        v-if="footerItem.icon"
        v-clean-tooltip="t(footerItem.iconTooltip?.key)"
        :class="['icon', 'app-chart-card-footer-item-icon', footerItem.icon]"
      />
      <rc-item-card-action
        v-for="(label, j) in footerItem.labels"
        :key="j"
        class="app-chart-card-footer-item-text secondary-text-link"
        data-testid="app-chart-card-footer-item-text"
        tabindex="0"
        :aria-label="t('catalog.charts.appChartCard.footerItem.ariaLabel')"
        @click="onClickItem(footerItem.type, label)"
        @keydown.enter="onClickItem(footerItem.type, label)"
        @keydown.space.prevent="onClickItem(footerItem.type, label)"
      >
        {{ label }}<span v-if="footerItem.labels.length > 1 && j !== footerItem.labels.length - 1">, </span>
      </rc-item-card-action>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-chart-card-footer {
  display: flex;
  flex-wrap: wrap;

  &-item {
    display: flex;
    align-items: center;
    color: var(--link-text-secondary);
    margin-top: 8px;
    margin-right: 8px;

    &-text {
      text-transform: capitalize;
      margin-right: 8px;
    }

    &-icon {
      width: 20px;
      height: 20px;
      display: flex;
      font-size: 19px;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
    }
  }
}
</style>
