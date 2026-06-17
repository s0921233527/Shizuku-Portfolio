<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiMemberRegister, apiVerifyCode } from '@/api/member';

const router = useRouter();
const isLoading = ref(false);
const errorMessage = ref('');

// 驗證碼燈箱控制
const showVerifyModal = ref(false);
const isVerifying = ref(false);
const verifyErrorMessage = ref('');
const savedMemberId = ref(null); // 用來暫存後端傳回的 responseData.fId

// 驗證碼輸入框綁定
const verifyCode = ref('');

// 依據 DTO 結構定義響應式表單
const form = reactive({
    fName: '張明祥',
    fEmail: 'sealll4002@gmail.com',
    fPhone: '0978854654',
    fGender: 1,
    fBirthday: '2000-09-01',
    fPassword: 'Password123!1',
    confirmPassword: 'Password123!1'
});

const handleRegister = async () => {
    // 1. 基本前端檢查
    if (form.fPassword !== form.confirmPassword) {
        errorMessage.value = '兩次密碼輸入不一致';
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
        const response = await apiMemberRegister(form);

        // 處理後端 ApiResponse 結構
        if (response.data.success) {
            // 儲存後端傳回的流水號主鍵 fId
            savedMemberId.value = response.data.data.fId;

            // 提示使用者，並彈出驗證碼 Modal (不切頁)
            alert(response.data.message || '註冊成功！驗證碼已發送。');
            showVerifyModal.value = true;
        }
    } catch (error) {
        // 錯誤處理 (抓取後端 BadRequest 或 Conflict 的訊息)
        if (error.response && error.response.data) {
            errorMessage.value = error.response.data.message || '註冊失敗';
        } else {
            errorMessage.value = '連線伺服器失敗，請檢查網路狀況';
        }
    } finally {
        isLoading.value = false;
    }
};

// 處理驗證碼送出
const handleVerify = async () => {
    if (!verifyCode.value) {
        verifyErrorMessage.value = '請輸入 6 位數驗證碼';
        return;
    }

    isVerifying.value = true;
    verifyErrorMessage.value = '';

    try {
        // 配合後端 VerifyRequestDto 結構
        const payload = {
            memberId: savedMemberId.value,
            code: verifyCode.value
        };

        const response = await apiVerifyCode(payload);

        if (response.data.success) {
            alert(response.data.message || '驗證成功！');
            showVerifyModal.value = false; // 關閉燈箱
            router.push({ name: 'Login' }); // 引導至登入頁
        } else {
            // 處理後端回傳 success: true 但內容有錯的情況 (若是拋例外會進 catch)
            verifyErrorMessage.value = response.data.message || '驗證失敗';
        }
    } catch (error) {
        if (error.response && error.response.data) {
            verifyErrorMessage.value = error.response.data.message || '驗證發生錯誤';
        } else {
            verifyErrorMessage.value = '連線伺服器失敗，請稍後再試';
        }
    } finally {
        isVerifying.value = false;
    }
};
</script>

<template>
    <div class="relative min-h-screen flex items-center justify-center p-6 bg-[#FCFBF9] font-serif text-stone-850 pt-24">
        <!-- 簡約和風柔和漸變背景 -->
        <div class="absolute inset-0 bg-gradient-to-tr from-[#FCFBF9] via-[#FAF8F5] to-[#F3F0EC] opacity-80"></div>

        <div class="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- 左側文字區 -->
            <div class="hidden lg:flex flex-col text-stone-800 space-y-6 p-8">
                <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] uppercase">Join Us</span>
                <h1 class="text-5xl font-light tracking-[0.2em] uppercase">Shizuku.</h1>
                <p class="text-lg text-stone-500 leading-relaxed font-light">
                    加入 Shizuku。<br>開啟您的專屬時尚探索之旅。
                </p>
                <div class="w-12 h-[1px] bg-[#8E9A86]"></div>
            </div>

            <!-- 右側表單區 -->
            <div
                class="w-full max-w-md bg-white border border-stone-200/50 p-8 rounded-2xl shadow-sm mx-auto lg:mx-0 overflow-y-auto max-h-[90vh] py-1">
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-light tracking-wider text-stone-800 mb-2">建立帳號</h2>
                    <p class="text-stone-500 text-sm">歡迎加入我們的行列</p>
                </div>

                <!-- 錯誤顯示區 -->
                <div v-if="errorMessage"
                    class="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm text-center">
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="handleRegister" class="space-y-4 font-serif">
                    <div>
                        <label class="block text-xs font-light text-stone-500 mb-1 ml-1 tracking-wider">名稱</label>
                        <input v-model="form.fName" type="text" required placeholder="請輸入您的暱稱"
                            class="w-full p-3 bg-white/50 border border-stone-200/85 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition text-stone-800 font-sans">
                    </div>

                    <div>
                        <label class="block text-xs font-light text-stone-500 mb-1 ml-1 tracking-wider">電子信箱</label>
                        <input v-model="form.fEmail" type="email" required placeholder="example@shizuku.com"
                            class="w-full p-3 bg-white/50 border border-stone-200/85 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition text-stone-800 font-sans">
                    </div>

                    <div>
                        <label class="block text-xs font-light text-stone-500 mb-1 ml-1 tracking-wider">電話號碼</label>
                        <input v-model="form.fPhone" type="tel" required placeholder="0912345678"
                            class="w-full p-3 bg-white/50 border border-stone-200/85 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition text-stone-800 font-sans">
                    </div>

                    <div>
                        <label class="block text-xs font-light text-stone-500 mb-1 ml-1 tracking-wider">性別</label>
                        <div class="flex space-x-6 p-1">
                            <label class="flex items-center cursor-pointer text-stone-600 text-sm font-light">
                                <input type="radio" v-model="form.fGender" :value="1" class="mr-2 accent-[#8E9A86]"> 男
                            </label>
                            <label class="flex items-center cursor-pointer text-stone-600 text-sm font-light">
                                <input type="radio" v-model="form.fGender" :value="0" class="mr-2 accent-[#8E9A86]"> 女
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-light text-stone-500 mb-1 ml-1 tracking-wider">生日日期</label>
                        <input v-model="form.fBirthday" type="date" required
                            class="w-full p-3 bg-white/50 border border-stone-200/85 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition text-stone-800 font-sans">
                    </div>

                    <div>
                        <label class="block text-xs font-light text-stone-500 mb-1 ml-1 tracking-wider">密碼</label>
                        <input v-model="form.fPassword" type="password" required minlength="6" placeholder="密碼長度至少需 6 碼"
                            class="w-full p-3 bg-white/50 border border-stone-200/85 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition text-stone-800 font-sans">
                    </div>

                    <div>
                        <label class="block text-xs font-light text-stone-500 mb-1 ml-1 tracking-wider">確認密碼</label>
                        <input v-model="form.confirmPassword" type="password" required placeholder="再次確認密碼"
                            class="w-full p-3 bg-white/50 border border-stone-200/85 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition text-stone-800 font-sans">
                    </div>

                    <button type="submit" :disabled="isLoading"
                        class="w-full py-4 mt-2 bg-[#8E9A86] hover:bg-[#7d8b75] text-white rounded-full font-light tracking-widest transition duration-300 shadow-sm hover:shadow-md active:scale-98 disabled:bg-stone-300 cursor-pointer">
                        <span v-if="isLoading">註冊中...</span>
                        <span v-else>立即註冊</span>
                    </button>
                </form>

                <div class="mt-6 text-center text-sm text-stone-600 font-light">
                    已經有帳號了？
                    <RouterLink :to="{ name: 'Login' }" class="font-normal text-[#8E9A86] hover:underline">返回登入
                    </RouterLink>
                </div>
            </div>
        </div>

        <!-- 驗證碼燈箱 -->
        <div v-if="showVerifyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-md"></div>

            <div
                class="relative z-10 w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-stone-100 text-center animate-fade-in">
                <h3 class="text-xl font-light text-stone-850 tracking-wider mb-2">輸入驗證碼</h3>
                <p class="text-stone-500 text-sm mb-6 font-light">
                    我們已發送信箱驗證碼至 <span class="font-normal text-[#8E9A86]">{{ form.fEmail }}</span>，請於 10 分鐘內輸入。
                </p>

                <div v-if="verifyErrorMessage"
                    class="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                    {{ verifyErrorMessage }}
                </div>

                <form @submit.prevent="handleVerify" class="space-y-4">
                    <div>
                        <input v-model="verifyCode" type="text" required maxlength="6" placeholder="請輸入 6 位數字"
                            class="w-full p-4 text-center text-2xl font-sans tracking-[10px] bg-[#FCFBF9] border border-stone-200/80 rounded-xl focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition text-stone-850">
                    </div>

                    <button type="submit" :disabled="isVerifying"
                        class="w-full py-4 bg-[#8E9A86] hover:bg-[#7d8b75] text-white rounded-full font-light tracking-widest transition duration-300 shadow-sm hover:shadow-md active:scale-98 disabled:bg-stone-300 cursor-pointer">
                        <span v-if="isVerifying">驗證中...</span>
                        <span v-else>確認驗證</span>
                    </button>
                </form>

                <p class="mt-4 text-xs text-stone-400 font-light">
                    沒收到信件？請檢查垃圾信箱，或確認輸入的 Email 是否正確。
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
}

/* 簡單的 Modal 登場動畫 */
.animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
