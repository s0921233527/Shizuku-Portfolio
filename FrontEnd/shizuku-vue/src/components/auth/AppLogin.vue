<script setup>
import { ref, onMounted } from 'vue'; // 擴充引入 onMounted
import { loginAPI, getCaptchaAPI, googleLoginAPI } from '@/api/member';// 新增引入 googleLoginAPI
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const email = ref('sealll4001@gmail.com');
const password = ref('Password123!1');
const isRemember = ref(false);
const isLoading = ref(false);
const router = useRouter();

// 驗證碼相關的響應式變數
const captchaAnswer = ref('');   // 使用者輸入的答案
const captchaId = ref('');       // 後端傳來的驗證碼 ID
const captchaImg = ref('');      // 驗證碼圖片的 Base64 網址
const showCaptcha = ref(false);  // 是否顯示驗證碼欄位 (預設隱藏)

// 向後端獲取新驗證碼的函式
const fetchCaptcha = async () => {
    try {
        const response = await getCaptchaAPI();
        const res = response.data;
        if (res.success) {
            captchaId.value = res.data.captchaId;
            captchaImg.value = res.data.imgBase64;
            captchaAnswer.value = ''; // 切換驗證碼時清空輸入框
        }
    } catch (error) {
        console.error("無法取得驗證碼:", error);
    }
};

const handleLogin = async () => {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
        // 送出的 DTO 加上驗證碼欄位 (若沒觸發，預設就是 null/空字串)
        const response = await loginAPI({
            fEmail: email.value,
            fPassword: password.value,
            captchaAnswer: captchaAnswer.value || null,
            captchaId: captchaId.value || null
        });

        const res = response.data;
        if (res.success) {
            // 將後端回傳含有 token 的整個物件傳進 store
            await authStore.login(res.data);

            try {
                await authStore.fetchUserAddress();
            } catch (e) {
                console.warn("預載地址失敗，但不影響登入流程");
            }

            alert('登入成功');
            router.push({ name: 'home' });
        } else {
            alert(res.message || '登入失敗，請檢查帳密');
        }
    } catch (error) {
        console.error("捕捉到錯誤:", error);

        // 攔截後端的 401 Unauthorized 狀態碼
        if (error.response && error.response.status === 401) {
            const apiMessage = error.response.data?.message || '認證失敗';
            alert(apiMessage); // 只留這一個 alert

            // 只有在後端訊息明確提到「驗證碼」時，才顯示圖形驗證
            if (apiMessage.includes('驗證碼')) {
                showCaptcha.value = true;
                await fetchCaptcha(); // 重新整理驗證碼圖片
            } else {
                // 如果是帳號被鎖定（訊息包含「上限」）或其他錯誤，一律隱藏圖形驗證
                showCaptcha.value = false;
            }
        } else if (error.code === 'ECONNABORTED') {
            alert('伺服器回應太久（逾時），請檢查後端是否掛掉');
        } else {
            const errorMsg = error.response?.data?.message || '系統連線錯誤';
            alert(errorMsg);
        }
    } finally {
        isLoading.value = false;
    }
};

const GOOGLE_CLIENT_ID = "20964198870-j15hs8a6k5sm0eii2j4n5fleukl8ql6p.apps.googleusercontent.com";
// 初始化 Google SDK 並渲染按鈕
const initializeGoogleSignIn = () => {
    if (window.google) {
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback, // 指定驗證成功後的 Callback
            auto_select: false,             // 不自動登入，讓用戶點選
            cancel_on_tap_outside: true,
        });
        // 渲染 Google 官方設計的精美按鈕，將其掛載到 ID 為 'google-btn' 的容器中
        window.google.accounts.id.renderButton(
            document.getElementById('google-btn'),
            {
                theme: 'outline',       // 按鈕風格：外框線條版
                size: 'large',          // 尺寸：大型
                width: '350',           // 寬度設定 (符合卡片寬度)
                text: 'signin_with',    // 顯示「使用 Google 帳戶登入」
                shape: 'pill',          // 形狀：膠囊圓角 (契合品牌 rounded-full 語彙)
            }
        );
    }
};
// 處理 Google 驗證成功回傳的 Credential (ID Token)
const handleGoogleCallback = async (response) => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
        const idToken = response.credential; // 取得 Google 簽發的 ID Token (JWT)
        // 傳送給您的後台 API 進行驗證與原生 JWT 換取
        const resObj = await googleLoginAPI({ idToken });
        const res = resObj.data;
        if (res.success) {
            // 完美對接您現有的 Pinia Store 登入機制與地址預載流程！
            await authStore.login(res.data);
            try {
                await authStore.fetchUserAddress();
            } catch (e) {
                console.warn("預載地址失敗，但不影響登入流程");
            }
            alert('Google 登入成功');
            router.push({ name: 'home' });
        } else {
            alert(res.message || 'Google 登入失敗');
        }
    } catch (error) {
        console.error("Google 登入出錯:", error);

        // 攔截後端回傳的異常訊息 (例如：帳號停用、金鑰過期)
        const errorMsg = error.response?.data?.message || 'Google 登入驗證失敗，請聯絡客服人員';
        alert(errorMsg);
    } finally {
        isLoading.value = false;
    }
};
// 組件掛載時，動態載入 Google Identity Services SDK
onMounted(() => {
    // 檢查是否已載入過 SDK，避免重複載入
    if (!document.getElementById('google-gsi-client')) {
        const script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn; // 載入完畢後進行初始化
        document.head.appendChild(script);
    } else {
        // 若已載入過，直接進行初始化渲染
        initializeGoogleSignIn();
    }
});


</script>


<template>
    <div class="relative min-h-screen flex items-center justify-center p-6 bg-[#FCFBF9] font-serif text-stone-850">
        <!-- 簡約和風柔和漸變背景 -->
        <div class="absolute inset-0 bg-gradient-to-tr from-[#FCFBF9] via-[#FAF8F5] to-[#F3F0EC] opacity-80"></div>

        <div
            class="relative z-10 w-full max-w-md bg-white border border-stone-200/50 p-10 rounded-2xl shadow-sm">

            <div class="text-center mb-10">
                <span class="text-xs text-[#8E9A86] font-medium tracking-[0.3em] uppercase">Welcome Back</span>
                <h1 class="text-3xl font-light tracking-[0.2em] text-stone-850 uppercase mt-2">Shizuku.</h1>
                <div class="w-8 h-[1px] bg-[#8E9A86] mx-auto mt-4"></div>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
                <div>
                    <label class="block text-xs font-light text-stone-500 mb-2 tracking-wider">電子信箱</label>
                    <input v-model="email" type="email" placeholder="example@shizuku.com"
                        class="w-full p-3.5 bg-white/50 border border-stone-200/85 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition placeholder:text-stone-400 text-stone-800 font-sans">
                </div>

                <div>
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-xs font-light text-stone-500 tracking-wider">密碼</label>
                    </div>
                    <input v-model="password" type="password" placeholder="請輸入您的密碼"
                        class="w-full p-3.5 bg-white/50 border border-stone-200/85 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition placeholder:text-stone-400 text-stone-800 font-sans">
                </div>

                <div v-if="showCaptcha" class="space-y-2 animate-fade-in">
                    <label class="block text-xs font-light text-stone-500 mb-2 tracking-wider">圖形驗證碼</label>
                    <div class="flex gap-3 items-center">
                        <!-- 驗證碼圖片，點擊可更換 -->
                        <img :src="captchaImg" @click="fetchCaptcha" alt="點擊更換驗證碼"
                            class="h-12 rounded-lg cursor-pointer hover:opacity-85 transition border border-stone-200/60 shadow-sm"
                            title="看不清？點擊換一張" />

                        <input v-model="captchaAnswer" type="text" placeholder="輸入 4 位驗證碼" maxLength="4"
                            class="flex-1 p-3 bg-white/50 border border-stone-200/85 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none transition placeholder:text-stone-400 uppercase font-sans tracking-widest text-center text-lg text-stone-800">
                    </div>
                    <p class="text-[11px] text-stone-400 font-light ml-1">看不清圖片？點擊圖片即可更換新驗證碼</p>
                </div>

                <div class="flex items-center justify-between text-xs text-stone-600 mt-2 font-light">
                    <label class="flex items-center gap-2 cursor-pointer hover:text-stone-800 transition">
                        <input v-model="isRemember" type="checkbox" class="accent-[#8E9A86] rounded border-stone-300">
                        記住我
                    </label>

                    <RouterLink :to="{ name: 'ForgotPassword' }"
                        class="hover:text-[#8E9A86] transition hover:underline">
                        忘記密碼？
                    </RouterLink>
                </div>

                <button type="submit" :disabled="isLoading"
                    class="w-full py-4 mt-2 bg-[#8E9A86] hover:bg-[#7d8b75] text-white rounded-full font-light tracking-widest transition duration-300 shadow-sm hover:shadow-md active:scale-98 disabled:bg-stone-300 cursor-pointer">
                    {{ isLoading ? '處理中...' : '登入帳號' }}
                </button>
            </form>
            <div class="my-8 flex items-center justify-between">
                <span class="border-b border-stone-200/60 w-1/5"></span>
                <span class="text-[10px] text-stone-400 uppercase tracking-widest font-light">或使用其他帳號登入</span>
                <span class="border-b border-stone-200/60 w-1/5"></span>
            </div>

            <div class="flex justify-center w-full">
                <div id="google-btn" class="w-full flex justify-center"></div>
            </div>
            <div class="mt-8 text-center text-sm text-stone-600 font-light">
                還不是會員？
                <RouterLink :to="{ name: 'Register' }" class="font-normal text-[#8E9A86] hover:underline">
                    立即註冊
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 讓驗證碼欄位跑出來時有個淡入效果 */
.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>