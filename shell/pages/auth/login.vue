<script>
import BrandImage from '@shell/components/BrandImage';

export default {
  name:       'Login',
  components: { BrandImage },
  mounted() {
    console.log('STORE', { store: this.$store, that: this });
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <main
    v-else
    class="main-layout login"
  >
    <div class="row gutless mb-20">
      <div class="col span-6 p-20">
        <p class="text-center">
          {{ t('login.howdy') }}
        </p>
      </div>
      <BrandImage
        class="col span-6 landscape"
        data-testid="login-landscape__img"
        file-name="login-landscape.svg"
      />
    </div>
  </main>
</template>

<style lang="scss" scoped>
  .login {
    overflow: hidden;

    .row {
      align-items: center;
    }

    .landscape {
      height: 100vh;
      margin: 0;
      object-fit: cover;
    }

    .login-welcome {
      margin: 0
    }

    .login-messages {
      display: flex;
      justify-content: center;
      align-items: center;

      .banner {
        margin: 5px;
      }
      h4 {
        margin: 0;
      }
      &--hasContent {
        min-height: 70px;
      }

      .text-error, .banner {
        max-width: 80%;
      }
    }

    .first-login-message {
      .banner {
        margin-bottom: 0;
        border-left: 0;

        :deep() code {
          font-size: 12px;
          padding: 0;
        }
      }
    }
  }

  .gutless {
    height: 100vh;
    & > .span-6 {
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      height: 100%;
      place-content: center;
    }
  }
  .locale-elector {
    position: absolute;
    bottom: 30px;
  }
</style>
