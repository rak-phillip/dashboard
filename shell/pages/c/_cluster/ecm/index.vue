<script>

export default {
  layout: 'desktop',

  mounted() {
    const link = this.$store.getters['backToRancherLink'];

    window.location.href = link;
  }
};
</script>

<template>
  <div>Redirecting...</div>
</template>
