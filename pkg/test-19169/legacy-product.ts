import { IPlugin } from '@shell/core/types';

// Review finding 1: a DSL-registered product whose group overview shares its route name with a
// sibling page, the two told apart only by the `page` param
export const NAME = 'test19193dsl';
export const PAGE_ROUTE = `c-cluster-${ NAME }-page`;

export function init(plugin: IPlugin, store: any): void {
  const {
    product, virtualType, basicType, labelGroup
  } = plugin.DSL(store, NAME) as any; // DSLReturnType does not declare virtualType or labelGroup

  product({
    inStore:             'cluster',
    icon:                'globe',
    removable:           false,
    showNamespaceFilter: false,
    to:                  { name: PAGE_ROUTE, params: { product: NAME, page: 'overview' } },
  });

  virtualType({
    label:      'Overview',
    namespaced: false,
    name:       `${ NAME }-overview`,
    weight:     100,
    route:      { name: PAGE_ROUTE, params: { page: 'overview' } },
    exact:      true,
    overview:   true,
  });

  virtualType({
    label:      'Other Page',
    namespaced: false,
    name:       `${ NAME }-other`,
    weight:     50,
    route:      { name: PAGE_ROUTE, params: { page: 'other' } },
  });

  basicType([`${ NAME }-overview`, `${ NAME }-other`], 'legacy-group');
  labelGroup('legacy-group', 'Legacy Group');
}
