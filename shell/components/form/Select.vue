<script>
import { get } from '@shell/utils/object';
import LabeledFormElement from '@shell/mixins/labeled-form-element';
import VueSelectOverrides from '@shell/mixins/vue-select-overrides';
import { generateRandomAlphaString } from '@shell/utils/string';
import { LabeledTooltip } from '@components/LabeledTooltip';
import { onClickOption, calculatePosition } from '@shell/utils/select';
import { _VIEW } from '@shell/config/query-params';
import { useClickOutside } from '@shell/composables/useClickOutside';
import { ref } from 'vue';

export default {
  emits: ['update:value', 'createdListItem', 'on-open', 'on-close'],

  components: { LabeledTooltip },
  mixins:     [
    LabeledFormElement,
    VueSelectOverrides,
  ],
  props: {
    appendToBody: {
      default: true,
      type:    Boolean,
    },
    disabled: {
      default: false,
      type:    Boolean,
    },
    getKeyForOption: {
      default: null,
      type:    Function
    },
    mode: {
      default: 'edit',
      type:    String,
    },
    optionKey: {
      default: null,
      type:    String,
    },
    optionLabel: {
      default: 'label',
      type:    String,
    },
    placement: {
      default: null,
      type:    String,
    },
    placeholder: {
      type:    String,
      default: '',
    },
    popperOverride: {
      type:    Function,
      default: null,
    },
    reduce: {
      default: (e) => {
        if (e && typeof e === 'object' && e.value !== undefined) {
          return e.value;
        }

        return e;
      },
      type: Function,
    },
    tooltip: {
      type:    String,
      default: null,
    },

    hoverTooltip: {
      type:    Boolean,
      default: true,
    },

    status: {
      type:    String,
      default: null,
    },
    value: {
      default: null,
      type:    [String, Object, Number, Array, Boolean],
    },
    closeOnSelect: {
      type:    Boolean,
      default: true,
    },

    compact: {
      type:    Boolean,
      default: null
    },
    isLangSelect: {
      type:    Boolean,
      default: false
    }
  },
  setup() {
    const select = ref(null);
    const isOpen = ref(false);

    useClickOutside(select, () => {
      isOpen.value = false;
    });

    return { isOpen, select };
  },
  data() {
    return { generatedUid: `s-uid-${ generateRandomAlphaString(12) }` };
  },
  methods: {
    // resizeHandler = in mixin
    getOptionLabel(option) {
      if (this.$attrs['get-option-label']) {
        return this.$attrs['get-option-label'](option);
      }
      if (get(option, this.optionLabel)) {
        if (this.localizedLabel) {
          return this.$store.getters['i18n/t'](get(option, this.optionLabel));
        } else {
          return get(option, this.optionLabel);
        }
      } else {
        return option;
      }
    },

    positionDropdown(dropdownList, component, { width }) {
      if (this.popperOverride) {
        return this.popperOverride(dropdownList, component, { width });
      }

      calculatePosition(dropdownList, component, width, this.placement);
    },

    // Ensure we only focus on open, otherwise we re-open on close
    clickSelect(ev) {
      if (this.mode === _VIEW || this.loading === true || this.disabled === true) {
        return;
      }

      this.isOpen = !this.isOpen;

      if (this.isOpen) {
        this.focusSearch(ev);
      }
    },

    focusSearch() {
      this.$nextTick(() => {
        const el = this.$refs['select-input']?.searchEl;

        if ( el ) {
          el.focus();
        }
      });
    },

    focusWrapper() {
      this.$refs.select.focus();
    },

    get,

    onClickOption(option, event) {
      onClickOption.call(this, option, event);
    },
    selectable(opt) {
      // Lets you disable options that are used
      // for headings on groups of options.
      if ( opt ) {
        if ( opt.disabled || opt.kind === 'group' || opt.kind === 'divider' || opt.loading ) {
          return false;
        }
      }

      return true;
    },
    /**
     * Get a unique value to represent the option
     */
    getOptionKey(opt) {
      // Use the property from a component level key
      if (opt && this.optionKey) {
        return get(opt, this.optionKey);
      }

      // Use the property from an option level key
      // This doesn't seem right, think it was meant to represent the actual option key... rather than the key to find the option key
      // This approach also doesn't appear in LabeledSelect
      if (opt?.optionKey) {
        // opt.optionKey should in theory be optionKeyKey
        return get(opt, opt.optionKey);
      }

      // There's no configuration to help us get a sensible key. Fall back on ..
      // - the label
      // - something random

      const label = this.getOptionLabel(opt);

      // label may be type of object
      if (typeof label === 'string' || typeof label === 'number') {
        return label;
      } else {
        return Math.random(100000);
      }
    },

    report(e) {
      alert(e);
    },

    handleDropdownOpen(args) {
      if (!this.isOpen) {
        return false;
      }

      // function that prevents the "opening dropdown on focus"
      // default behaviour of v-select
      return args.noDrop || args.disabled ? false : args.open;
    },
    onOpen() {
      this.focusSearch();
      this.$emit('on-open');
      this.resizeHandler();
    },

    closeOnSelecting() {
      if (!this.closeOnSelect) {
        return;
      }

      this.close();
    },

    close() {
      this.isOpen = false;
      this.onClose();
    },

    onClose() {
      this.$emit('on-close');
      this.focusWrapper();
    },
  },
  computed: {
    requiredField() {
      // using "any" for a type on "rule" here is dirty but the use of the optional chaining operator makes it safe for what we're doing here.
      return (this.required || this.rules.some((rule) => rule?.name === 'required'));
    },
    validationMessage() {
      // we want to grab the required rule passed in if we can but if it's not there then we can just grab it from the formRulesGenerator
      const requiredRule = this.rules.find((rule) => rule?.name === 'required');
      const ruleMessages = [];
      const value = this?.value;

      if (requiredRule && this.blurred && !this.focused) {
        const message = requiredRule(value);

        if (!!message) {
          return message;
        }
      }

      for (const rule of this.rules) {
        const message = rule(value);

        if (!!message && rule.name !== 'required') { // we're catching 'required' above so we can ignore it here
          ruleMessages.push(message);
        }
      }
      if (ruleMessages.length > 0 && (this.blurred || this.focused)) {
        return ruleMessages.join(', ');
      } else {
        return undefined;
      }
    },
    canPaginate() {
      return false;
    },
    deClassedAttrs() {
      const { class: _, ...rest } = this.$attrs;

      return rest;
    }
  }
};
</script>

<template>
  <div
    ref="select"
    class="unlabeled-select"
    :class="{
      disabled: disabled || isView,
      focused,
      [mode]: true,
      [status]: status,
      taggable: $attrs.taggable,
      taggable: $attrs.multiple,
      'compact-input': compact,
      [$attrs.class]: $attrs.class
    }"
    :tabindex="disabled || isView ? -1 : 0"
    role="combobox"
    :aria-expanded="isOpen"
    :aria-label="$attrs['aria-label'] || undefined"
    :aria-labelledby="$attrs['aria-labelledby'] || undefined"
    :aria-describedby="$attrs['aria-describedby'] || undefined"
    @click="clickSelect"
    @keydown.self.enter="clickSelect"
    @keydown.self.down.prevent="clickSelect"
    @keydown.self.space.prevent="clickSelect"
  >
    <v-select
      ref="select-input"
      v-bind="deClassedAttrs"
      class="inline"
      :class="{'select-input-view': mode === 'view'}"
      :autoscroll="true"
      :append-to-body="appendToBody"
      :calculate-position="positionDropdown"
      :disabled="isView || disabled"
      :get-option-key="(opt) => getOptionKey(opt)"
      :get-option-label="(opt) => getOptionLabel(opt)"
      :label="optionLabel"
      :options="options"
      :close-on-select="false"
      :map-keydown="mappedKeys"
      :placeholder="placeholder"
      :reduce="(x) => reduce(x)"
      :searchable="isSearchable"
      :selectable="selectable"
      :modelValue="value != null ? value : ''"
      :dropdownShouldOpen="handleDropdownOpen"
      :tabindex="-1"
      role="listitem"
      :uid="generatedUid"
      :aria-label="'-'"
      @update:modelValue="$emit('update:value', $event)"
      @search:blur="onBlur"
      @search:focus="onFocus"
      @open="onOpen"
      @close="onClose"
      @option:created="(e) => $emit('createdListItem', e)"
      @option:selecting="closeOnSelecting"
      @option:selected="closeOnSelect && close"
      @keydown.enter.stop
    >
      <template
        #option="option"
      >
        <div
          :lang="isLangSelect ? option.value : undefined"
          @mousedown="(e) => onClickOption(option, e)"
        >
          {{ getOptionLabel(option.label) }}
        </div>
      </template>
      <!-- Pass down templates provided by the caller -->
      <template
        v-for="(_, slot) of $slots"
        :key="slot"
        v-slot:[slot]="scope"
      >
        <slot
          :name="slot"
          v-bind="scope"
        />
      </template>
    </v-select>
    <LabeledTooltip
      v-if="tooltip && !focused"
      :hover="hoverTooltip"
      :value="tooltip"
      :status="status"
    />
    <LabeledTooltip
      v-if="!!validationMessage"
      :hover="hoverTooltip"
      :value="validationMessage"
    />
  </div>
</template>

<style lang="scss" scoped>
  .unlabeled-select {
    position: relative;

    :deep() .v-select.select-input-view {
      .vs__actions {
        visibility: hidden;
      }
    }

    & .vs--multiple :deep() .vs__selected-options .vs__selected {
      width: auto;
    }

    :deep() .labeled-tooltip.error .status-icon {
      top: 7px;
      right: 2px;
    }

    :deep() .vs__selected-options {
      display: flex;
      margin: 3px;

      .vs__selected {
          width: initial;
      }
    }

    :deep() .v-select.vs--open {
      .vs__dropdown-toggle {
        color: var(--outline) !important;
      }
    }

    :deep() .v-select.vs--open {
      .vs__dropdown-toggle {
        color: var(--outline) !important;
      }
    }

    @include input-status-color;

    &.compact-input {
      min-height: $unlabeled-input-height;
      line-height: $input-line-height;
    }
  }
</style>
