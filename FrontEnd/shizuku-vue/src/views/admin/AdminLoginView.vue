<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { employeeLoginAPI } from '@/api/employee'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import Message from 'primevue/message'

const router = useRouter()
const adminStore = useAdminStore()

const form = ref({
  fNumber: '',
  fPassword: '',
})
const errorMessage = ref('')
const isLoading = ref(false)

// 一鍵填入測試管理員帳密
const quickFill = () => {
  form.value.fNumber = 'EMP001'
  form.value.fPassword = '123'
}

// 【新增】生命週期檢查：如果已登入，直接跳轉儀表板
onMounted(() => {
  if (adminStore.isLogin) {
    router.replace({ name: 'admin-dashboard' })
  }
})

const handleLogin = async () => {
  if (!form.value.fNumber || !form.value.fPassword) {
    errorMessage.value = '請填寫員工編號與密碼'
    return
  }
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await employeeLoginAPI({
      fNumber: form.value.fNumber,
      fPassword: form.value.fPassword,
    })
    if (data.success) {
      // 這裡要傳入 data.data (員工物件) 和 token
      adminStore.login(data.data, data.token || '')

      // 使用 replace 防止使用者點選「回上一頁」回到登入畫面
      router.replace({ name: 'admin-dashboard' })
    } else {
      errorMessage.value = data.message || '帳號或密碼錯誤'
    }
  } catch (error) {
    errorMessage.value = '無法連線至伺服器，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- 左側品牌視覺區 (代碼同前，略) -->
    <div
      class="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col items-center justify-center p-16 relative overflow-hidden">
      <!-- ... -->
      <h1 class="text-4xl font-black text-white tracking-widest uppercase mb-4">Shizuku</h1>
      <p class="text-indigo-300 text-lg font-medium mb-2">後台管理系統</p>
    </div>

    <!-- 右側登入表單區 -->
    <div class="w-full lg:w-1/2 flex flex-col items-center justify-center bg-slate-50 px-8 py-16">
      <div class="w-full max-w-md">
        <div class="mb-10">
          <h2 class="text-3xl font-black text-slate-800">員工登入</h2>
          <p class="text-slate-500 text-sm mt-2">請使用您的員工帳號進行身份驗證</p>
        </div>

        <div class="flex flex-col gap-7">
          <FloatLabel>
            <InputText id="fNumber" v-model="form.fNumber" class="w-full" @keyup.enter="handleLogin" />
            <label for="fNumber">員工編號</label>
          </FloatLabel>

          <FloatLabel>
            <Password id="fPassword" v-model="form.fPassword" :feedback="false" toggleMask class="w-full"
              inputClass="w-full" @keyup.enter="handleLogin" />
            <label for="fPassword">密碼</label>
          </FloatLabel>

          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <Button label="登入後台" icon="pi pi-sign-in" iconPos="right" :loading="isLoading" :disabled="isLoading"
            class="w-full !py-3 !bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700 hover:!border-indigo-700"
            @click="handleLogin" />

          <!-- 一鍵填入測試管理員帳密 -->
          <div class="flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>*專案演示測試帳號</span>
            <button
              type="button"
              @click="quickFill"
              class="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline hover:no-underline"
            >
              一鍵填入測試帳密
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>