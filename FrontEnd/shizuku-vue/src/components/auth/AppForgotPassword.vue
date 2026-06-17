<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
    forgotPasswordRequestCodeAPI,
    forgotPasswordVerifyCodeAPI,
    forgotPasswordResetAPI
} from '@/api/member'; // 請根據你專案中 member.js 的實際路徑調整

const router = useRouter();

// 流程狀態：1=輸入Email, 2=輸入驗證碼, 3=輸入新密碼
const step = ref(1);

// 表單資料
const email = ref('sealll4001@gmail.com');
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// 顯示/隱藏密碼
const isPasswordVisible = ref(false);
const isConfirmVisible = ref(false);

// 錯誤訊息與載入狀態
const errorMessage = ref('');
const isLoading = ref(false);

// 倒數計時狀態
const countdown = ref(60);
const isCounting = ref(false);
let timer = null;

// 密碼驗證規則
const passwordRules = computed(() => [
    { label: '8-16 個字元', valid: /^.{8,16}$/.test(newPassword.value) },
    { label: '至少一個小寫字母', valid: /[a-z]/.test(newPassword.value) },
    { label: '至少一個大寫字母', valid: /[A-Z]/.test(newPassword.value) },
    { label: '僅能使用英文、數字或標點符號', valid: /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;':",./<>?]+$/.test(newPassword.value) || newPassword.value === '' }
]);

const isPasswordFormValid = computed(() => {
    return passwordRules.value.every(r => r.valid)
        && newPassword.value.length > 0
        && newPassword.value === confirmPassword.value;
});

const startTimer = () => {
    isCounting.value = true;
    countdown.value = 60;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        if (countdown.value > 1) {
            countdown.value--;
        } else {
            clearInterval(timer);
            isCounting.value = false;
        }
    }, 1000);
};

// 步驟 1：發送驗證碼
const handleSendEmail = async () => {
    errorMessage.value = '';
    if (!email.value) {
        errorMessage.value = '請輸入 Email 地址';
        return;
    }

    isLoading.value = true;

    try {
        // 後端 DTO 預期為 { FEmail: email, FType: 3 } 之類的結構，請依後端實際欄位調整
        const res = await forgotPasswordRequestCodeAPI({
            fEmail: email.value,
            fType: 3 // 3 代表密碼型態
        });

        if (res.data && res.data.success) {
            step.value = 2;
            startTimer();
        } else {
            errorMessage.value = res.data?.message || '發送失敗';
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.message || '系統錯誤，請稍後再試';
    } finally {
        isLoading.value = false;
    }
};

// 步驟 2：驗證驗證碼
const handleVerifyCode = async () => {
    errorMessage.value = '';
    if (!code.value) {
        errorMessage.value = '請輸入驗證碼';
        return;
    }

    isLoading.value = true;

    try {
        const res = await forgotPasswordVerifyCodeAPI({
            fEmail: email.value,
            fCode: code.value,
            fType: 3
        });

        if (res.data && res.data.success) {
            step.value = 3;
        } else {
            errorMessage.value = res.data?.message || '驗證碼錯誤';
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.message || '驗證失敗，請確認驗證碼';
    } finally {
        isLoading.value = false;
    }
};

// 步驟 3：重設密碼提交
const handleResetSubmit = async () => {
    errorMessage.value = '';

    if (!isPasswordFormValid.value) {
        if (newPassword.value !== confirmPassword.value) {
            errorMessage.value = '兩次輸入的密碼不一致';
        } else {
            errorMessage.value = '請確認密碼符合所有規則';
        }
        return;
    }

    isLoading.value = true;

    try {
        // 【修改點】在傳送給後端的物件中，加上 fEmail 欄位
        const res = await forgotPasswordResetAPI({
            fEmail: email.value, // 加上這行，把當前步驟一留下來的 email 帶過去
            fNewPassword: newPassword.value,
            fConfirmPassword: confirmPassword.value,
            fVerifiedCode: code.value
        });

        if (res.data && res.data.success) {
            alert('密碼重設成功，請使用新密碼登入！');
            if (timer) clearInterval(timer);
            router.push({ name: 'Login' });
        } else {
            errorMessage.value = res.data?.message || '重設失敗';
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.message || '密碼重設失敗，請稍後再試';
    } finally {
        isLoading.value = false;
    }
};


const goBack = () => {
    if (step.value > 1 && !isLoading.value) {
        step.value--;
        errorMessage.value = '';
    }
};
</script>

<template>
    <div class="relative min-h-screen flex items-center justify-center p-6 bg-[#FCFBF9] font-serif text-stone-850">
        <!-- 簡約和風柔和漸變背景 -->
        <div class="absolute inset-0 bg-gradient-to-tr from-[#FCFBF9] via-[#FAF8F5] to-[#F3F0EC] opacity-80"></div>

        <div
            class="relative z-10 w-full max-w-lg bg-white border border-stone-200/50 p-10 md:p-12 rounded-2xl shadow-sm">

            <!-- 返回按鈕 -->
            <div v-if="step > 1" class="absolute left-8 top-10"
                :class="isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'" @click="goBack">
                <span class="text-xl text-[#8E9A86] hover:text-[#7d8b75] transition-colors">&larr; 回上一步</span>
            </div>

            <div class="text-center mb-10">
                <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] uppercase">Security</span>
                <h1 class="text-2xl font-light tracking-[0.15em] text-stone-850 uppercase mt-2">重設您的密碼</h1>
                <div class="w-8 h-[1px] bg-[#8E9A86] mx-auto mt-4"></div>
                <p class="text-stone-500 mt-4 text-sm font-light leading-relaxed">請跟隨步驟驗證您的身份並建立新密碼。</p>
            </div>

            <!-- 步驟 1：輸入 Email -->
            <div v-if="step === 1" class="space-y-6">
                <div>
                    <label class="block text-xs font-light text-stone-500 mb-2 ml-1 tracking-wider">輸入註冊時的電子信箱</label>
                    <input type="email" v-model="email" placeholder="example@shizuku.com" :disabled="isLoading"
                        class="w-full px-4 py-3.5 bg-white/50 border border-stone-200/80 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition placeholder:text-stone-400 text-stone-800 font-sans disabled:bg-stone-50 disabled:text-stone-400">
                </div>

                <button @click="handleSendEmail" :disabled="isLoading"
                    class="w-full py-4 bg-[#8E9A86] hover:bg-[#7d8b75] text-white rounded-full font-light tracking-widest transition duration-300 shadow-sm hover:shadow-md active:scale-98 text-base disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer">
                    <span v-if="isLoading">發送中...</span>
                    <span v-else>發送驗證碼</span>
                </button>
            </div>

            <!-- 步驟 2：輸入驗證碼 -->
            <div v-if="step === 2" class="space-y-6">
                <div class="text-center">
                    <p class="text-sm text-stone-500 mb-1 font-light">您的驗證碼已透過電子郵件傳送至</p>
                    <p class="text-sm text-stone-800 font-normal mb-4 font-sans">{{ email }}</p>
                </div>

                <div>
                    <input type="text" v-model="code" placeholder="請輸入 6 位數驗證碼" maxlength="6" :disabled="isLoading"
                        class="w-full h-14 border-b border-stone-300 text-2xl text-center tracking-[8px] focus:border-[#8E9A86] focus:outline-none bg-transparent box-border disabled:text-stone-400 text-stone-850 font-sans" />
                </div>

                <div class="text-xs text-center text-stone-400 font-light">
                    <span v-if="isCounting">{{ countdown }} 秒後重新傳送</span>
                    <span v-else class="underline"
                        :class="isLoading ? 'text-stone-400 cursor-not-allowed' : 'text-[#8E9A86] cursor-pointer'"
                        @click="!isLoading && handleSendEmail">重新傳送驗證碼</span>
                </div>

                <button @click="handleVerifyCode" :disabled="isLoading"
                    class="w-full py-4 bg-[#8E9A86] hover:bg-[#7d8b75] text-white rounded-full font-light tracking-widest transition duration-300 shadow-sm hover:shadow-md active:scale-98 text-base disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer">
                    <span v-if="isLoading">驗證中...</span>
                    <span v-else>下一步</span>
                </button>
            </div>

            <!-- 步驟 3：設定新密碼 -->
            <div v-if="step === 3" class="space-y-6">
                <div class="space-y-4">
                    <div class="relative">
                        <input :type="isPasswordVisible ? 'text' : 'password'" v-model="newPassword"
                            placeholder="請輸入新密碼" :disabled="isLoading"
                            class="w-full px-4 py-3.5 pr-10 bg-white/50 border border-stone-200/80 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition placeholder:text-stone-400 text-stone-800 font-sans disabled:bg-stone-50 disabled:text-stone-400" />
                        <i @click="isPasswordVisible = !isPasswordVisible"
                            :class="['pi cursor-pointer absolute right-3 top-4 text-stone-400', isPasswordVisible ? 'pi-eye-slash' : 'pi-eye']"></i>
                    </div>

                    <div class="relative">
                        <input :type="isConfirmVisible ? 'text' : 'password'" v-model="confirmPassword"
                            placeholder="再次確認新密碼" :disabled="isLoading"
                            class="w-full px-4 py-3.5 pr-10 bg-white/50 border border-stone-200/80 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition placeholder:text-stone-400 text-stone-800 font-sans disabled:bg-stone-50 disabled:text-stone-400" />
                        <i @click="isConfirmVisible = !isConfirmVisible"
                            :class="['pi cursor-pointer absolute right-3 top-4 text-stone-400', isConfirmVisible ? 'pi-eye-slash' : 'pi-eye']"></i>
                    </div>

                    <p v-if="confirmPassword && newPassword !== confirmPassword" class="text-red-500 text-xs pl-1">
                        兩次輸入的密碼不一致</p>

                    <ul class="text-sm space-y-2 bg-stone-50/50 p-4 rounded-xl border border-stone-200/50 font-light">
                        <li v-for="rule in passwordRules" :key="rule.label"
                            :class="['flex items-center gap-2 transition-colors', rule.valid ? 'text-[#8E9A86]' : 'text-stone-400']">
                            <i :class="['pi text-xs', rule.valid ? 'pi-check-circle' : 'pi-circle']"></i>
                            <span class="text-xs">{{ rule.label }}</span>
                        </li>
                    </ul>
                </div>

                <button @click="handleResetSubmit" :disabled="isLoading || !isPasswordFormValid"
                    class="w-full py-4 bg-[#8E9A86] hover:bg-[#7d8b75] text-white rounded-full font-light tracking-widest transition duration-300 shadow-sm hover:shadow-md active:scale-98 text-base disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer">
                    <span v-if="isLoading">儲存中...</span>
                    <span v-else>儲存變更</span>
                </button>
            </div>

            <!-- 後端回傳錯誤訊息 -->
            <p v-if="errorMessage" class="text-red-500 text-xs text-center mt-4 font-semibold font-sans">{{ errorMessage }}</p>

            <div class="mt-10 text-center text-sm border-t border-stone-200/50 pt-8 font-light">
                想起密碼了？ <RouterLink :to="{ name: 'Login' }"
                    class="font-normal text-[#8E9A86] hover:underline transition">返回登入頁面
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped></style>