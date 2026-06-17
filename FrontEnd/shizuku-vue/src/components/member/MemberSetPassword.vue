<script setup>
import { ref, computed } from 'vue';

const password = ref('');
const isPasswordVisible = ref(false);

// 定義驗證規則
const validationRules = computed(() => [
    { label: '8-16 個字元', valid: /^.{8,16}$/.test(password.value) },
    { label: '至少一個小寫字母', valid: /[a-z]/.test(password.value) },
    { label: '至少一個大寫字母', valid: /[A-Z]/.test(password.value) },
    { label: '僅能使用英文、數字或標點符號', valid: /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;':",./<>?]+$/.test(password.value) || password.value === '' }
]);

// 檢查是否所有規則都通過
const isFormValid = computed(() => {
    return validationRules.value.every(rule => rule.valid) && password.value.length > 0;
});

const toggleVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
};

const handleNext = () => {
    if (isFormValid.value) {
        console.log('準備發送 API:', password.value);
        // 這裡接你的下一步驗證邏輯
    }
};
</script>

<template>
    <div class="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 class="text-xl font-bold mb-6 text-slate-800">建立新密碼</h2>

        <div class="relative mb-4">
            <input :type="isPasswordVisible ? 'text' : 'password'" v-model="password" placeholder="密碼"
                class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            <i @click="toggleVisibility"
                :class="['pi cursor-pointer absolute right-3 top-4 text-slate-400', isPasswordVisible ? 'pi-eye-slash' : 'pi-eye']"></i>
        </div>

        <ul class="text-sm space-y-1 mb-8">
            <li v-for="rule in validationRules" :key="rule.label"
                :class="['flex items-center gap-2 transition-colors', rule.valid ? 'text-green-600' : 'text-slate-400']">
                <i :class="['pi', rule.valid ? 'pi-check-circle' : 'pi-circle']"></i>
                {{ rule.label }}
            </li>
        </ul>

        <button @click="handleNext" :disabled="!isFormValid"
            :class="['w-full py-3 rounded-lg font-bold transition-all', isFormValid ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed']">
            下一步
        </button>
    </div>
</template>