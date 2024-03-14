/* eslint-disable jest/no-hooks */
import { shallowMount, Wrapper } from '@vue/test-utils';
import AppModal from '@shell/components/AppModal.vue';

let wrapper: Wrapper<InstanceType<typeof AppModal>>;

describe('appModal', () => {
  beforeEach(() => {
    wrapper = shallowMount(AppModal, {
      propsData: {
        clickToClose: true,
        width:        600,
      },
      slots: { default: '<div class="content">Modal content</div>' }
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('renders modal content', () => {
    expect(wrapper.find('.content').exists()).toBeTruthy();
  });

  it('emits close event when clicked outside', async() => {
    const overlay = wrapper.find('.modal-overlay');

    await overlay.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close event when escape key is pressed', async() => {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key:     'Escape',
      keyCode: 27,
    }));
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('does not emit close event when clickToClose is false', async() => {
    await wrapper.setProps({ clickToClose: false });
    const overlay = wrapper.find('.modal-overlay');

    await overlay.trigger('click');
    expect(wrapper.emitted('close')).toBeFalsy();

    document.dispatchEvent(new KeyboardEvent('keydown', {
      key:     'Escape',
      keyCode: 27,
    }));

    expect(wrapper.emitted('close')).toBeFalsy();
  });
});
