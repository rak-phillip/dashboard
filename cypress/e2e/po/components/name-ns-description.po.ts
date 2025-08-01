import ComponentPo from '@/cypress/e2e/po/components/component.po';
import LabeledInputPo from '@/cypress/e2e/po/components/labeled-input.po';
import LabeledSelectPo from '@/cypress/e2e/po/components/labeled-select.po';

export default class NameNsDescription extends ComponentPo {
  name() {
    return new LabeledInputPo(this.self().find('[data-testid="name-ns-description-name"] input'));
  }

  description() {
    return new LabeledInputPo(this.self().find('[data-testid="name-ns-description-description"] input'));
  }

  namespace() {
    return new LabeledSelectPo(this.self().find('[data-testid="name-ns-description-namespace"]'));
  }

  project() {
    return new LabeledInputPo(this.self().find('[data-testid="name-ns-description-project"] input'));
  }
}
