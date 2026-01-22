
<template>
  <div
    ref="dropdownMenuItem"
    dropdown-menu-item
    role="status"
    aria-live="polite"
    @mousedown.prevent="() => {/*We use this to prevent clicks from triggering the @focusin below. When we scroll on a click it prevents the action from occurring on the first click.*/}"
  >
    <slot name="before">
      <!--Empty slot content-->
    </slot>
    <slot name="default">
      <!--Empty slot content-->
    </slot>
  </div>
</template>

<style lang="scss" scoped>
  [dropdown-menu-item] {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 9px 8px;
    margin: 0 9px;
    border-radius: 4px;

    &[role="none"] {
      padding: 9px 8px;
      margin: 0 9px;
      line-height: normal;
    }

    &:focus-visible, &:focus {
      outline: none;
    }
  }
</style>
