<script>
import { get } from '@shell/utils/object';
import isString from 'lodash/isString';
import { RcDropdown, RcDropdownTrigger, RcDropdownItem, RcDropdownLabel } from '@components/RcDropdown';
import { RcIcon } from '@components/RcIcon';

export default {
  emits: ['dd-button-action', 'click-action'],

  components: {
    RcDropdown,
    RcDropdownTrigger,
    RcDropdownItem,
    RcIcon,
    RcDropdownLabel,
  },

  props: {
    buttonLabel: {
      default: '',
      type:    String,
    },
    closeOnSelect: {
      default: true,
      type:    Boolean
    },
    disabled: {
      default: false,
      type:    Boolean,
    },
    // array of option objects containing at least a label and link, but also icon and action are available
    dropdownOptions: {
      // required: true,
      default: () => [],
      type:    Array,
    },
    optionKey: {
      default: null,
      type:    String,
    },
    optionLabel: {
      default: 'label',
      type:    String,
    },
    // sm, null(med), lg - no xs...its so small
    size: {
      default: null,
      type:    String,
    },
    value: {
      default: null,
      type:    String,
    },
    placement: {
      default: 'bottom-start',
      type:    String
    },
    selectable: {
      default: (opt) => {
        if ( opt ) {
          if ( opt.disabled || opt.kind === 'group' || opt.kind === 'divider' || opt.loading ) {
            return false;
          }
        }

        return true;
      },
      type: Function
    },
  },

  data() {
    return {
      focused: false,
      isOpen:  false
    };
  },

  computed: {
    isSmall() {
      return this.size === 'sm';
    }
  },

  methods: {
    getOptionLabel(option) {
      if (isString(option)) {
        return option;
      }

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

    onFocus() {
      return this.onFocusLabeled();
    },

    onFocusLabeled() {
      this.focused = true;
    },

    onBlur() {
      return this.onBlurLabeled();
    },

    onBlurLabeled() {
      this.focused = false;
    },

    ddButtonAction(option) {
      this.$emit('dd-button-action', option);
    },

    handleItemClick(option) {
      if (this.selectable(option)) {
        this.$emit('click-action', option);
        this.$emit('dd-button-action', option);
      }
    },
  },
};
</script>

<template>
  <rc-dropdown
    :placement="placement"
    @update:open="isOpen = $event"
  >
    <rc-dropdown-trigger
      :disabled="disabled"
      :aria-label="buttonLabel"
      secondary
      :small="isSmall"
    >
      {{ buttonLabel }}
      <template #after>
        <rc-icon
          type="chevron-down"
        />
      </template>
    </rc-dropdown-trigger>

    <template #dropdownCollection>
      <rc-dropdown-label
        v-if="!dropdownOptions.length"
        role="none"
        tabindex="-1"
      >
        <slot name="no-options">
          <!--Empty slot content-->
        </slot>
      </rc-dropdown-label>
      <rc-dropdown-item
        v-for="(option, index) in dropdownOptions"
        :key="optionKey ? get(option, optionKey) : index"
        :disabled="option.disabled || false"
        @click="handleItemClick(option)"
      >
        <span>{{ getOptionLabel(option) }}</span>
      </rc-dropdown-item>
    </template>
  </rc-dropdown>
</template>
