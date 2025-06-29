import { mount } from '@vue/test-utils';
import YamlTab from '@shell/components/Drawer/ResourceDetailDrawer/YamlTab.vue';
import { createStore } from 'vuex';

import Tab from '@shell/components/Tabbed/Tab.vue';
import { _VIEW } from '@shell/config/query-params';
import CodeMirror from '@shell/components/CodeMirror.vue';
import { nextTick } from 'vue';

jest.mock('@shell/components/CodeMirror.vue', () => ({
  template: `<div>CodeMirror</div>`,
  props:    {
    value: {
      type:     String,
      required: true
    },
    mode: {
      type:     String,
      required: true
    },
  },
  methods: { refresh: jest.fn() }
}));

describe('component: ResourceDetailDrawer/ConfigTab', () => {
  const resource = { resource: 'RESOURCE' };
  const yaml = 'YAML';
  const global = {
    provide: {
      addTab: jest.fn(), removeTab: jest.fn(), sideTabs: false, store: createStore({})
    },
    directives: { 'clean-tooltip': jest.fn() }

  };

  it('should render container with yaml-tab class and correct label and name', async() => {
    const wrapper = mount(YamlTab, {
      props: { resource, yaml },
      global
    });

    const component = wrapper.getComponent(Tab);

    expect(wrapper.classes().includes('yaml-tab')).toBeTruthy();
    expect(component.props('label')).toStrictEqual('component.drawer.resourceDetailDrawer.yamlTab.title');
    expect(component.props('name')).toStrictEqual('yaml-tab');
  });

  it('should render a CodeMirror component and pass the correct props', () => {
    const wrapper = mount(YamlTab, {
      props: { resource, yaml },
      global
    });

    const component = wrapper.getComponent(CodeMirror);

    expect(component.props('value')).toStrictEqual(yaml);
    expect(component.props('mode')).toStrictEqual(_VIEW);
  });

  it('should refresh yaml editor when tab is activated', async() => {
    const wrapper = mount(YamlTab, {
      props: { resource, yaml },
      global
    });

    const tabComponent = wrapper.getComponent(Tab);

    expect(CodeMirror.methods?.refresh).toHaveBeenCalledTimes(0);
    tabComponent.vm.$emit('active');
    await nextTick();

    expect(CodeMirror.methods?.refresh).toHaveBeenCalledTimes(1);
  });
});
