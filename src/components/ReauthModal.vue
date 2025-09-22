<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
      <h3 class="mb-2 text-lg font-semibold">Confirm to continue</h3>
      <p class="mb-4 text-sm text-gray-600">
        Enter your {{ requirePassword ? 'password' : 'PIN' }} to approve this transfer.
      </p>

      <form @submit.prevent="onConfirm">
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium">
            {{ requirePassword ? 'Password' : 'PIN' }}
          </label>
          <input
            :type="requirePassword ? 'password' : 'password'"
            autocomplete="current-password"
            v-model.trim="secret"
            class="w-full rounded border px-3 py-2 outline-none focus:ring"
            :placeholder="requirePassword ? 'Enter your password' : '••••'"
            :maxlength="requirePassword ? 128 : 6"
            required
          />
          <small v-if="!requirePassword" class="text-gray-500">6 digits</small>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button type="button" class="rounded border px-3 py-2" @click="$emit('update:modelValue', false)">Cancel</button>
          <button type="submit" class="rounded bg-indigo-600 px-3 py-2 text-white" :disabled="submitting">
            {{ submitting ? 'Confirming...' : 'Confirm' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  requirePassword: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const secret = ref('');
const submitting = ref(false);

watch(() => props.modelValue, (open) => {
  if (!open) secret.value = '';
});

async function onConfirm() {
  if (!secret.value) return;
  try {
    submitting.value = true;
    emit('confirm', secret.value);
  } finally {
    submitting.value = false;
    emit('update:modelValue', false);
  }
}
</script>

<style scoped>
/* minimal */
</style>
