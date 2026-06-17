<script setup>
import { ref, onMounted } from 'vue'
import ToggleSwitch from 'primevue/toggleswitch'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { updateSystemConfig, getSystemConfig } from '@/api/adminSystem'

const toast = useToast()

// 狀態管理：預設結構
const configs = ref([
    {
        fConfigKey: 'Captcha',
        fFailedAttemptsThreshold: 3,
        fIsActive: true,
        fDescription: '圖形驗證碼機制（錯誤達門檻需輸入驗證碼，可由後台關閉）'
    },
    {
        fConfigKey: 'Lockout',
        fFailedAttemptsThreshold: 6,
        fIsActive: true,
        fDescription: '帳號硬鎖定機制（錯誤達門檻直接凍結帳號）'
    }
])

const loading = ref(false)
const fakeFailedCount = ref(0)
const testMessage = ref('')
const testSeverity = ref('info')
const showFakeCaptcha = ref(false)
const isAccountLocked = ref(false)

// 撈取資料庫最新設定（已對接你寫的前台方法）
const loadConfigsFromApi = async () => {
    loading.value = true
    try {
        const response = await getSystemConfig()
        const res = response.data

        // 完美對接你的 ApiResponse<T> 格式
        if (res.success && res.data) {
            // 找到陣列中的 Captcha 物件並賦值
            const captcha = configs.value.find(c => c.fConfigKey === 'Captcha')
            if (captcha) {
                captcha.fIsActive = res.data.isCaptchaActive
                captcha.fFailedAttemptsThreshold = res.data.captchaThreshold
            }

            // 找到陣列中的 Lockout 物件並賦值
            const lockout = configs.value.find(c => c.fConfigKey === 'Lockout')
            if (lockout) {
                lockout.fIsActive = res.data.isLockoutActive
                lockout.fFailedAttemptsThreshold = res.data.lockoutThreshold
            }
        }
    } catch (error) {
        console.error('讀取設定失敗', error)
        toast.add({ severity: 'error', summary: '錯誤', detail: '無法取得系統設定資料', life: 3000 })
    } finally {
        loading.value = false
    }
}

// 元件載入時，先去資料庫撈資料
onMounted(() => {
    loadConfigsFromApi()
})

// 實際呼叫後端 API 更新設定
const handleConfigChange = async (config) => {
    resetTest()

    const payload = {
        configKey: config.fConfigKey,
        failedAttemptsThreshold: config.fFailedAttemptsThreshold,
        isActive: config.fIsActive
    }

    try {
        const response = await updateSystemConfig(payload)

        if (response.data.success) {
            toast.add({
                severity: 'success',
                summary: '更新成功',
                detail: `已同步更新 ${config.fConfigKey} 機制`,
                life: 3000
            })
        } else {
            toast.add({
                severity: 'warn',
                summary: '更新失敗',
                detail: response.data.message,
                life: 3000
            })
        }
    } catch (error) {
        console.error('API 連線失敗：', error)
        toast.add({
            severity: 'error',
            summary: '連線錯誤',
            detail: '系統配置同步失敗，請檢查網路或後端服務',
            life: 3000
        })
    }
}

const refreshConfigs = () => {
    loadConfigsFromApi()
}

const simulateFailedLogin = () => {
    if (isAccountLocked.value) {
        testSeverity.value = 'error'
        testMessage.value = '您的帳號已被鎖定或停用，請聯繫客服人員處理。'
        return
    }

    fakeFailedCount.value++

    const captchaConfig = configs.value.find(c => c.fConfigKey === 'Captcha')
    const lockoutConfig = configs.value.find(c => c.fConfigKey === 'Lockout')

    if (lockoutConfig.fIsActive && fakeFailedCount.value >= lockoutConfig.fFailedAttemptsThreshold) {
        isAccountLocked.value = true
        showFakeCaptcha.value = false
        testSeverity.value = 'error'
        testMessage.value = '密碼錯誤次數已達上限，帳號已被鎖定，請聯繫客服人員處理。'
        return
    }

    if (captchaConfig.fIsActive && fakeFailedCount.value >= captchaConfig.fFailedAttemptsThreshold) {
        showFakeCaptcha.value = true
        testSeverity.value = 'warn'
        testMessage.value = '電子信箱或密碼輸入錯誤，下次登入請輸入驗證碼。'
        return
    }

    testSeverity.value = 'secondary'
    testMessage.value = '電子信箱或密碼輸入錯誤。'
}

const resetTest = () => {
    fakeFailedCount.value = 0
    testMessage.value = ''
    showFakeCaptcha.value = false
    isAccountLocked.value = false
}
</script>

<template>
    <div class="p-6 max-w-7xl mx-auto space-y-6">
        <Toast position="top-right" />

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-slate-800 tracking-wide">系統安全機制設定</h1>
                <p class="text-sm text-slate-500 mt-1">
                    <span class="text-amber-600 font-medium">正式環境設定：</span>變更將即時套用至全站登入系統。您可於下方沙盒區驗證邏輯。
                </p>
            </div>

            <div class="flex items-center gap-3">
                <button @click="refreshConfigs" :disabled="loading"
                    class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-60 transition-all duration-200 shadow-sm">
                    <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
                    <span>同步最新設定</span>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="config in configs" :key="config.fConfigKey"
                class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-md">

                <div class="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span
                            class="font-mono font-bold text-base text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-sm">
                            {{ config.fConfigKey }}
                        </span>
                        <span class="inline-flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full"
                                :class="config.fIsActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'"></span>
                            <span class="text-xs font-medium"
                                :class="config.fIsActive ? 'text-emerald-600' : 'text-slate-400'">
                                {{ config.fIsActive ? '運作中' : '已停用' }}
                            </span>
                        </span>
                    </div>

                    <ToggleSwitch v-model="config.fIsActive" @change="handleConfigChange(config)" />
                </div>

                <div class="p-6 space-y-5">
                    <div>
                        <label
                            class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">機制描述</label>
                        <p class="text-sm text-slate-600 leading-relaxed">{{ config.fDescription }}</p>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                            <label class="text-sm font-medium text-slate-700 block">觸發失敗次數門檻</label>
                            <span class="text-xs text-slate-400">當登入連續失敗達此上限時觸發</span>
                        </div>

                        <InputNumber v-model="config.fFailedAttemptsThreshold" showButtons buttonLayout="horizontal"
                            :min="1" :max="20" @update:modelValue="handleConfigChange(config)"
                            :disabled="!config.fIsActive" class="custom-input-number"
                            inputClass="w-12 text-center !py-1.5 !border-slate-200 text-sm font-medium" />
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-slate-50 border border-slate-200/60 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-lg font-bold text-slate-800">安全機制模擬沙盒</h2>
                    <p class="text-xs text-slate-500 mt-0.5">點擊下方按鈕模擬密碼錯誤，<span
                            class="text-indigo-600 font-medium">此區測試不會影響資料庫與真實帳號</span>。</p>
                </div>
                <button @click="resetTest"
                    class="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                    重置沙盒狀態
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div
                    class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">目前模擬失敗次數</span>
                    <span class="text-4xl font-black text-slate-800 font-mono">{{ fakeFailedCount }}</span>

                    <button @click="simulateFailedLogin"
                        class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm active:scale-[0.98]">
                        模擬登入失敗 1 次
                    </button>
                </div>

                <div class="md:col-span-2 space-y-4">
                    <div class="min-h-[52px]">
                        <Message v-if="testMessage" :severity="testSeverity" class="!rounded-xl !m-0" :closable="false">
                            {{ testMessage }}
                        </Message>
                        <div v-else
                            class="text-sm text-slate-400 italic border border-dashed border-slate-200 rounded-xl p-4 text-center bg-white/50">
                            暫無系統回傳訊息，請點擊左側按鈕開始測試
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
                        <span
                            class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">前台登入防禦狀態預覽</span>

                        <div class="p-4 rounded-xl border flex items-center justify-between"
                            :class="isAccountLocked ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-600'">
                            <span class="text-sm font-medium">帳號控制狀態：</span>
                            <span class="text-sm font-bold">{{ isAccountLocked ? '帳號已被硬鎖定（前台將拒絕登入）' : '正常運作中' }}</span>
                        </div>

                        <div v-if="showFakeCaptcha"
                            class="p-4 bg-amber-50/50 border border-amber-200/70 rounded-xl space-y-2 animate-fade-in">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-bold text-amber-800">觸發安全防禦：請輸入圖形驗證碼</span>
                                <span
                                    class="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-mono">驗證碼已啟用</span>
                            </div>
                            <div
                                class="h-10 bg-slate-200 rounded flex items-center justify-center text-slate-500 font-mono tracking-widest font-bold select-none border border-slate-300">
                                A 8 F 9
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.custom-input-number .p-inputnumber-button) {
    background-color: #ffffff !important;
    border-color: #e2e8f0 !important;
    color: #64748b !important;
}

:deep(.custom-input-number .p-inputnumber-button:hover) {
    background-color: #f8fafc !important;
    color: #4f46e5 !important;
}

:deep(.custom-input-number .p-inputnumber-increment-button) {
    border-top-right-radius: 0.75rem !important;
    border-bottom-right-radius: 0.75rem !important;
}

:deep(.custom-input-number .p-inputnumber-decrement-button) {
    border-top-left-radius: 0.75rem !important;
    border-bottom-left-radius: 0.75rem !important;
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
    background-color: #10b981 !important;
}

.animate-fade-in {
    animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(2px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>