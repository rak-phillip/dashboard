<script>
import { LabeledInput } from '@components/Form/LabeledInput';
import AsyncButton from '@shell/components/AsyncButton';
import BrandImage from '@shell/components/BrandImage';
import { Checkbox } from '@components/Form/Checkbox';
import Password from '@shell/components/form/Password';
import { ref } from 'vue';

export default {
  name:       'Login',
  components: {
    LabeledInput,
    AsyncButton,
    Checkbox,
    BrandImage,
    Password,
  },

  setup() {
    const providers = ref([]);
    const hasLocal = ref(true);
    const hasOthers = ref(false);
    const singleProvider = ref('');

    const username = ref('user-test');
    const password = ref('test1234');
    const remember = ref(false);

    return {
      hasLocal,
      username,
      password,
      remember,
      providers,
      hasOthers,
      showLocal:       ref(true),
      firstLogin:      ref(false),
      hasLoginMessage: ref(false),
      singleProvider,
    };
  },
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
        <template v-if="hasLocal">
          <form
            v-if="showLocal"
            :class="{'mt-30': !hasLoginMessage}"
          >
            <div class="span-6 offset-3">
              <div class="mb-20">
                <LabeledInput
                  v-if="!firstLogin"
                  id="username"
                  v-model.trim="username"
                  data-testid="local-login-username"
                  :label="t('login.username')"
                  autocomplete="username"
                />
              </div>
              <div class="">
                <Password
                  id="password"
                  v-model="password"
                  data-testid="local-login-password"
                  :label="t('login.password')"
                  autocomplete="password"
                />
              </div>
            </div>
            <div class="mt-20">
              <div class="col span-12 text-center">
                <AsyncButton
                  id="submit"
                  data-testid="login-submit"
                  type="submit"
                  :action-label="t('login.loginWithLocal')"
                  :waiting-label="t('login.loggingIn')"
                  :success-label="t('login.loggedIn')"
                  :error-label="t('asyncButton.default.error')"
                  @click="loginLocal"
                />
                <div
                  v-if="!firstLogin"
                  class="mt-20"
                >
                  <Checkbox
                    v-model="remember"
                    :label="t('login.remember.label')"
                    type="checkbox"
                  />
                </div>
              </div>
            </div>
          </form>
          <div
            v-if="hasLocal && !showLocal"
            class="mt-20 text-center"
          >
            <a
              id="login-useLocal"
              data-testid="login-useLocal"
              role="button"
              @click="toggleLocal"
            >
              {{ t('login.useLocal') }}
            </a>
          </div>
          <div
            v-if="hasLocal && showLocal && providers.length"
            class="mt-20 text-center"
          >
            <a
              role="button"
              @click="toggleLocal"
            >
              {{ nonLocalPrompt }}
            </a>
          </div>
        </template>
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
