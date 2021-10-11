<template>
  <section v-if="title">
    <h3>NOT FAIL: {{ title }}</h3>
    <section v-if="$slots.title||hasTitle">
      <slot name="title">
        {{ anotherProp }}: {{ title }}
      </slot>
    </section>
  </section>
</template>

<script>
export default {
  name: 'hello-world',
  props: {
    title: {
      type: String,
      default: 'Hello World'
    },
    anotherProp: {
      type: String,
      default: null
    }
  },
  computed: {
    hasTitle () {
      return this.title 
    }
  }
}
</script>