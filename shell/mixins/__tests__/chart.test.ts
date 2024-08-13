import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import ChartMixin from '@shell/mixins/chart';
import { OPA_GATE_KEEPER_ID } from '@shell/pages/c/_cluster/gatekeeper/index.vue';
import { defineComponent } from 'vue';

describe('chartMixin', () => {
  const testCases = {
    opa: [
      [null, 0],
      [OPA_GATE_KEEPER_ID, 1],
      ['any_other_id', 0]
    ],
    managedApps: [
      [false, false, 0],
      [true, null, 0],
      [true, true, 0],
      [true, false, 1],
    ],
  };

  it.each(testCases.opa)(
    'should add OPA deprecation warning properly', async(chartId, expected) => {
      const store = createStore({
        actions: { 'catalog/load': jest.fn().mockResolvedValue(undefined) },
        getters: {
          currentCluster:  () => ({}),
          isRancher:       () => true,
          'catalog/repo':  () => () => 'repo',
          'catalog/chart': () => () => ({ id: chartId }),
          'i18n/t':        () => jest.fn()
        }
      });

      const Component = defineComponent({
        template: '<div></div>',
        mixins:   [ChartMixin],
      });

      const wrapper = mount(Component, {
        global: {
          plugins: [store],
          mocks:   {
            $route: { query: { chart: 'chart_name' } },
            $store: store
          }
        }
      });

      await wrapper.vm.fetchChart();

      const warnings = wrapper.vm.warnings;

      expect(warnings).toHaveLength(expected);
    }
  );

  it.each(testCases.managedApps)(
    'should add managed apps warning properly', (isEdit, upgradeAvailable, expected) => {
      const id = 'cattle-fleet-local-system/fleet-agent-local';
      const data = isEdit ? { existing: { id, upgradeAvailable } } : undefined;

      const store = createStore({
        getters: {
          currentCluster:  () => ({}),
          isRancher:       () => true,
          'catalog/repo':  () => () => 'repo',
          'catalog/chart': () => () => ({ id }),
          'i18n/t':        () => jest.fn()
        }
      });

      const Component = defineComponent({
        template: '<div></div>',
        mixins:   [ChartMixin],
        data() {
          return data;
        }
      });

      const wrapper = mount(Component, {
        global: {
          plugins: [store],
          mocks:   {
            $route: { query: { chart: 'chart_name' } },
            $store: store
          }
        }
      });

      const warnings = (wrapper.vm as any).warnings;

      expect(warnings).toHaveLength(expected as number);
    }
  );
});
