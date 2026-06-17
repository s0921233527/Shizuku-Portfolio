<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
    sendSecurityCodeAPI,
    verifySecurityCodeAPI,
    updatePhoneWithCodeAPI,
    updateBirthdayWithCodeAPI,
    updatePasswordWithCodeAPI
} from '@/api/member';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 流程狀態：1=輸入Email驗證, 2=輸入驗證碼, 3=輸入新資料
const step = ref(1);

// 根據路由參數（例如 /security/update?type=birthday）動態判斷目前是改什麼
// 1 = 修改手機, 2 = 修改生日, 3 = 修改密碼
const currentType = ref(1);

// 動態標題與輸入框提示字
const titleMap = { 1: '重新設定手機', 2: '重新設定生日', 3: '重新設定密碼' };
const step3TitleMap = { 1: '建立新手機號碼', 2: '設定新出生日期', 3: '建立新密碼' };
const titleText = computed(() => titleMap[currentType.value] || '重新設定');
const step3TitleText = computed(() => step3TitleMap[currentType.value] || '設定新資料');
const inputPlaceholder = computed(() => currentType.value === 1 ? '請輸入新手機號碼' : '請選擇出生日期');

// 表單資料
const email = ref('sealll4001@gmail.com');
const code = ref('');
const newPhone = ref('');
const newBirthday = ref(''); // 新增生日綁定變數
const newPassword = ref('');  // 新密碼
const confirmPassword = ref('');  // 確認密碼
const isPasswordVisible = ref(false);  // 密碼顯示/隱藏
const isConfirmVisible = ref(false);

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
const errorMessage = ref('');

// 全局非同步請求載入狀態
const isLoading = ref(false);

// 倒數計時狀態
const countdown = ref(60);
const isCounting = ref(false);
let timer = null;

onMounted(() => {
    const queryType = route.query.type;
    switch (queryType) {
        case 'phone':
            currentType.value = 1;
            break;
        case 'birthday':
            currentType.value = 2;
            break;
        case 'password':
            currentType.value = 3;
            break;
        default:
            // 預設防呆：如果網址沒帶 type 或亂打，預設回歸手機號碼修改 (1)
            currentType.value = 1;
            break;
    }
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

// 步驟 1：點選「下一個」 -> 發送 Email 驗證碼
const handleSendEmail = async () => {
    errorMessage.value = '';
    if (!email.value) {
        errorMessage.value = '請輸入 Email 地址';
        return;
    }

    isLoading.value = true; // 開啟讀取中狀態

    try {
        const res = await sendSecurityCodeAPI({
            fEmail: email.value,
            fType: currentType.value
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
        isLoading.value = false; // 關閉讀取中狀態
    }
};

// 步驟 2：點選「下一步」 -> 驗證驗證碼
const handleVerifyCode = async () => {
    errorMessage.value = '';
    if (!code.value) {
        errorMessage.value = '請輸入驗證碼';
        return;
    }

    isLoading.value = true;

    try {
        const res = await verifySecurityCodeAPI({
            fEmail: email.value,
            fCode: code.value,
            fType: currentType.value
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

// 步驟 3：點選「儲存變更」 -> 依據 type 分流處理最後的寫入
const handleUpdateSubmit = async () => {
    errorMessage.value = '';

    if (currentType.value === 1) {
        // 處理手機更動
        if (!newPhone.value) {
            errorMessage.value = '請輸入新手機號碼';
            return;
        }

        isLoading.value = true;

        try {
            const res = await updatePhoneWithCodeAPI({
                fNewPhone: newPhone.value,
                fVerifiedCode: code.value
            });

            if (res.data && res.data.success) {
                alert('手機號碼修改成功！');
                if (timer) clearInterval(timer);

                if (authStore.user) {
                    authStore.user.fPhone = newPhone.value;
                    localStorage.setItem('memberUser', JSON.stringify(authStore.user));
                }
                router.push({ name: 'MemberProfile' });
            } else {
                errorMessage.value = res.data?.message || '變更失敗';
            }
        } catch (error) {
            errorMessage.value = error.response?.data?.message || '變更失敗，請稍後再試';
        } finally {
            isLoading.value = false;
        }
    } else if (currentType.value === 2) {
        // 處理生日更動
        if (!newBirthday.value) {
            errorMessage.value = '請選擇新出生日期';
            return;
        }

        isLoading.value = true;

        try {
            const res = await updateBirthdayWithCodeAPI({
                fNewBirthday: newBirthday.value,
                fVerifiedCode: code.value
            });

            if (res.data && res.data.success) {
                alert('生日修改成功！');
                if (timer) clearInterval(timer);

                if (authStore.user) {
                    authStore.user.fBirthday = newBirthday.value;
                    localStorage.setItem('memberUser', JSON.stringify(authStore.user));
                }
                router.push({ name: 'MemberProfile' });
            } else {
                errorMessage.value = res.data?.message || '變更失敗';
            }
        } catch (error) {
            errorMessage.value = error.response?.data?.message || '變更失敗，請稍後再試';
        } finally {
            isLoading.value = false;
        }
    } else if (currentType.value === 3) {
        // 處理密碼更動
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
            const res = await updatePasswordWithCodeAPI({
                fEmail: email.value,
                fNewPassword: newPassword.value,
                fConfirmPassword: confirmPassword.value,
                fVerifiedCode: code.value
            });

            if (res.data && res.data.success) {
                alert('密碼修改成功！');
                if (timer) clearInterval(timer);
                router.push({ name: 'MemberProfile' });
            } else {
                errorMessage.value = res.data?.message || '變更失敗';
            }
        } catch (error) {
            errorMessage.value = error.response?.data?.message || '密碼變更失敗，請稍後再試';
        } finally {
            isLoading.value = false;
        }
    }
};

const goBack = () => {
    if (step.value > 1 && !isLoading.value) { // 發送中不允許返回，避免狀態衝突
        step.value--;
        errorMessage.value = '';
    }
};
</script>

<template>
    <div
        class="relative max-w-[480px] mx-auto my-[40px] p-8 md:p-10 bg-[#FAF8F5]/80 border border-stone-200/50 rounded-2xl shadow-sm text-center backdrop-blur-md">
        <!-- 當載入中時，停用返回按鈕 -->
        <div v-if="step > 1" class="absolute left-[24px] top-[30px]"
            :class="isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'" @click="goBack">
            <i class="pi pi-arrow-left text-sm text-stone-500 hover:text-[#8E9A86] transition-colors"></i>
        </div>

        <!-- 步驟 1：輸入 Email -->
        <div v-if="step === 1">
            <h3 class="text-lg font-light tracking-wider text-stone-850 mt-2 mb-6">{{ titleText }}</h3>
            <div class="mb-6">
                <input type="email" v-model="email" placeholder="請輸入原帳號 Email" :disabled="isLoading"
                    class="w-full h-12 px-5 bg-white/70 border border-stone-200/80 rounded-full focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 text-sm transition disabled:bg-stone-50 disabled:text-stone-400 font-sans" />
            </div>
            <button
                class="w-full h-12 bg-[#8E9A86] hover:bg-[#7d8b75] text-white rounded-full text-sm font-light tracking-widest transition-all duration-300 cursor-pointer disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed flex items-center justify-center shadow-xs"
                :disabled="isLoading" @click="handleSendEmail">
                <span v-if="isLoading">發送中...</span>
                <span v-else>下一個</span>
            </button>
        </div>

        <!-- 步驟 2：輸入驗證碼 -->
        <div v-if="step === 2">
            <h3 class="text-lg font-light tracking-wider text-stone-850 mt-2 mb-4">輸入驗證碼</h3>
            <p class="text-xs text-stone-400 mb-1 font-light">您的驗證碼已透過電子郵件傳送至</p>
            <p class="text-sm text-stone-750 font-normal mb-6 font-sans">{{ email }}</p>

            <div class="mb-6">
                <input type="text" v-model="code" placeholder="請輸入 6 位數驗證碼" maxlength="6" :disabled="isLoading"
                    class="w-full h-14 border-b-2 border-stone-200 text-2xl text-center tracking-[8px] focus:border-[#8E9A86] focus:outline-none bg-transparent disabled:text-stone-300 font-sans" />
            </div>

            <div class="text-xs text-stone-400 mb-6 font-light">
                <span v-if="isCounting">{{ countdown }} 秒後重新傳送</span>
                <!-- 在發送中時，阻斷重新傳送的點擊 -->
                <span v-else class="underline"
                    :class="isLoading ? 'text-stone-300 cursor-not-allowed' : 'text-[#8E9A86] hover:text-[#7d8b75] cursor-pointer'"
                    @click="!isLoading && handleSendEmail">重新傳送驗證碼</span>
            </div>

            <button
                class="w-full h-12 bg-[#8E9A86] hover:bg-[#7d8b75] text-white rounded-full text-sm font-light tracking-widest transition-all duration-300 cursor-pointer disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed flex items-center justify-center shadow-xs"
                :disabled="isLoading" @click="handleVerifyCode">
                <span v-if="isLoading">驗證中...</span>
                <span v-else>下一步</span>
            </button>
        </div>

        <!-- 步驟 3：設定新資料 -->
        <div v-if="step === 3">
            <h3 class="text-lg font-light tracking-wider text-stone-850 mt-2 mb-6">{{ step3TitleText }}</h3>
            <div class="mb-6">
                <input v-if="currentType === 1" type="tel" v-model="newPhone" placeholder="請輸入新手機號碼"
                    :disabled="isLoading"
                    class="w-full h-12 px-5 bg-white/70 border border-stone-200/80 rounded-full focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 text-sm transition disabled:bg-stone-50 disabled:text-stone-400 font-sans" />

                <input v-if="currentType === 2" type="date" v-model="newBirthday" :disabled="isLoading"
                    class="w-full h-12 px-5 bg-white/70 border border-stone-200/80 rounded-full focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 text-sm transition disabled:bg-stone-50 disabled:text-stone-400 font-sans" />

                <!-- 密碼修改 -->
                <div v-if="currentType === 3" class="space-y-4">
                    <div class="relative">
                        <input :type="isPasswordVisible ? 'text' : 'password'" v-model="newPassword"
                            placeholder="請輸入新密碼" :disabled="isLoading"
                            class="w-full h-12 px-5 pr-10 bg-white/70 border border-stone-200/80 rounded-full focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 text-sm transition disabled:bg-stone-50 disabled:text-stone-400 font-sans" />
                        <i @click="isPasswordVisible = !isPasswordVisible"
                            :class="['pi cursor-pointer absolute right-4 top-3.5 text-stone-400 hover:text-stone-650 transition-colors', isPasswordVisible ? 'pi-eye-slash' : 'pi-eye']"></i>
                    </div>
                    <div class="relative">
                        <input :type="isConfirmVisible ? 'text' : 'password'" v-model="confirmPassword"
                            placeholder="再次確認新密碼" :disabled="isLoading"
                            class="w-full h-12 px-5 pr-10 bg-white/70 border border-stone-200/80 rounded-full focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 text-sm transition disabled:bg-stone-50 disabled:text-stone-400 font-sans" />
                        <i @click="isConfirmVisible = !isConfirmVisible"
                            :class="['pi cursor-pointer absolute right-4 top-3.5 text-stone-400 hover:text-stone-650 transition-colors', isConfirmVisible ? 'pi-eye-slash' : 'pi-eye']"></i>
                    </div>
                    <!-- 密碼不一致提示 -->
                    <p v-if="confirmPassword && newPassword !== confirmPassword" class="text-red-500 text-xs font-light tracking-wide text-left pl-2">兩次輸入的密碼不一致
                    </p>
                    <!-- 密碼規則提示 -->
                    <ul class="text-xs space-y-1.5 pt-2 text-left pl-2 font-light">
                        <li v-for="rule in passwordRules" :key="rule.label"
                            :class="['flex items-center gap-2 transition-colors', rule.valid ? 'text-[#8E9A86]' : 'text-stone-400']">
                            <i :class="['pi text-[10px]', rule.valid ? 'pi-check-circle text-[#8E9A86]' : 'pi-circle text-stone-300']"></i>
                            {{ rule.label }}
                        </li>
                    </ul>
                </div>
            </div>
            <button type="button"
                class="w-full h-12 bg-[#8E9A86] hover:bg-[#7d8b75] text-white rounded-full text-sm font-light tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed shadow-xs mt-6"
                :disabled="isLoading || (currentType === 3 && !isPasswordFormValid)" @click="handleUpdateSubmit">
                <span v-if="isLoading">儲存中...</span>
                <span v-else>儲存變更</span>
            </button>
        </div>

        <p v-if="errorMessage" class="text-red-500 text-xs font-light tracking-wide text-center mt-4">{{ errorMessage }}</p>
    </div>
</template>

<style scoped></style>