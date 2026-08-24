import { mount } from '@vue/test-utils';
import AddAuthProviderDialog from '@shell/dialog/AddAuthProviderDialog.vue';

const rows = [
  {
    id: 'okta', provider: 'Okta', sideLabel: 'SAML', configType: 'saml', icon: 'okta.svg'
  },
  {
    id: 'github', provider: 'GitHub', sideLabel: 'OAuth', configType: 'oauth', icon: 'github.svg'
  },
  {
    id: 'openldap', provider: 'OpenLDAP', sideLabel: 'LDAP', configType: 'ldap', icon: ''
  },
];

const createWrapper = (props = {}) => mount(AddAuthProviderDialog, {
  props: {
    rows, selectCb: jest.fn(), ...props
  }
});

const tileNames = (wrapper: any) => wrapper.findAll('.add-auth-provider__tile-name').map((n: any) => n.text());

describe('component: AddAuthProviderDialog', () => {
  it('should offer every provider type it is given', () => {
    expect(tileNames(createWrapper())).toStrictEqual(['Okta', 'GitHub', 'OpenLDAP']);
  });

  it('should narrow the grid by search term', async() => {
    const wrapper = createWrapper();

    await wrapper.find('[data-testid="add-auth-provider-search"]').setValue('git');

    expect(tileNames(wrapper)).toStrictEqual(['GitHub']);
  });

  it('should match the search term regardless of case', async() => {
    const wrapper = createWrapper();

    await wrapper.find('[data-testid="add-auth-provider-search"]').setValue('OKTA');

    expect(tileNames(wrapper)).toStrictEqual(['Okta']);
  });

  it('should narrow the grid by protocol', async() => {
    const wrapper = createWrapper();

    await wrapper.find('[data-testid="add-auth-provider-filter-saml"]').trigger('click');

    expect(tileNames(wrapper)).toStrictEqual(['Okta']);
  });

  it('should return to the full grid via the All filter', async() => {
    const wrapper = createWrapper();

    await wrapper.find('[data-testid="add-auth-provider-filter-saml"]').trigger('click');
    await wrapper.find('[data-testid="add-auth-provider-filter-all"]').trigger('click');

    expect(tileNames(wrapper)).toHaveLength(3);
  });

  // A filter that can only ever empty the grid is worse than no filter.
  it('should only offer protocols that are represented', () => {
    const wrapper = createWrapper({ rows: [rows[0]] });

    expect(wrapper.find('[data-testid="add-auth-provider-filter-saml"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-auth-provider-filter-oauth"]').exists()).toBe(false);
  });

  it('should say so when nothing matches', async() => {
    const wrapper = createWrapper();

    await wrapper.find('[data-testid="add-auth-provider-search"]').setValue('nothing');

    expect(tileNames(wrapper)).toStrictEqual([]);
    expect(wrapper.find('[data-testid="add-auth-provider-no-results"]').exists()).toBe(true);
  });

  it('should report the chosen type and close', async() => {
    const selectCb = jest.fn();
    const wrapper = createWrapper({ selectCb });

    await wrapper.find('[data-testid="add-auth-provider-tile-github"]').trigger('click');

    expect(selectCb).toHaveBeenCalledWith('github');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('should close without choosing when cancelled', async() => {
    const selectCb = jest.fn();
    const wrapper = createWrapper({ selectCb });

    await wrapper.find('button.variant-link').trigger('click');

    expect(selectCb).not.toHaveBeenCalled();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
