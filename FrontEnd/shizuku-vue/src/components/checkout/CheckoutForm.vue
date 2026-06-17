<script setup>
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { PAYMENT_METHOD } from '@/services/orderStatusManager'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  paymentOptions: {
    type: Array,
    required: true,
  },
  cartTotal: {
    type: Number,
    required: true,
  },
  addressList: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:form', 'submit', 'back'])

// 用來更新父元件的 form 資料（深層屬性）
const updateField = (field, value) => {
  emit('update:form', { ...props.form, [field]: value })
}

// 快速選擇常用地址
const selectSavedAddress = (addr) => {
  const fullAddress = `${addr.fCity}${addr.fArea}${addr.fAddressDetail}`
  emit('update:form', {
    ...props.form,
    receiverName: addr.fReceiverName,
    receiverPhone: addr.fReceiverPhone,
    receiverAddress: fullAddress,
  })
}

// 快速驗證與預開金流視窗 (防止瀏覽器非同步阻擋彈窗)
const handleSubmit = () => {
  console.log('[CheckoutForm] handleSubmit clicked. Form fields:', {
    receiverName: props.form.receiverName,
    receiverPhone: props.form.receiverPhone,
    receiverAddress: props.form.receiverAddress,
    paymentMethodId: props.form.paymentMethodId
  })

  // 1. 表單基本欄位預檢：若未填寫完整，則不開視窗，直接讓父元件顯示錯誤訊息
  if (!props.form.receiverName || !props.form.receiverPhone || !props.form.receiverAddress) {
    console.log('[CheckoutForm] Validation failed, emitting null window.')
    emit('submit', null)
    return
  }

  // 2. 非貨到付款 (COD) 且非行動端時，直接在原生點擊事件中開啟空白視窗，以獲得瀏覽器完全信任
  let paymentWindow = null
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
  
  if (props.form.paymentMethodId !== PAYMENT_METHOD.COD && !isMobile) {
    console.log('[CheckoutForm] Pre-opening blank window synchronously...')
    paymentWindow = window.open('about:blank', '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes')
    console.log('[CheckoutForm] Pre-opened window reference:', paymentWindow)
  }
  emit('submit', paymentWindow)
}
</script>

<template>
  <div class="p-6 sm:p-10 font-serif">
    <h2 class="text-lg font-light text-stone-850 mb-6 flex items-center gap-2.5 pb-4 border-b border-stone-200/50">
      <i class="pi pi-user text-[#8E9A86] text-lg"></i>
      <span>聯絡與配送資訊</span>
    </h2>

    <div class="flex flex-col gap-6">
      <!-- 常用收件資訊快速填入 -->
      <div v-if="props.addressList && props.addressList.length > 0" class="mb-2">
        <h3
          class="text-xs font-light text-stone-400 mb-3 tracking-wider flex items-center gap-1.5 uppercase"
        >
          <i class="pi pi-address-book text-[#8E9A86]"></i>常用地址
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="(addr, idx) in props.addressList"
            :key="idx"
            @click="selectSavedAddress(addr)"
            class="border border-stone-200/60 hover:border-[#8E9A86] rounded-xl p-4 cursor-pointer transition-all bg-stone-50/20 hover:bg-[#8E9A86]/5 flex flex-col gap-1.5 relative overflow-hidden group"
          >
            <div class="flex items-center gap-2">
              <span
                class="font-medium text-sm text-stone-800 group-hover:text-[#8E9A86] transition-colors"
                >{{ addr.fReceiverName }}</span
              >
              <span class="text-xs text-stone-200">|</span>
              <span class="text-xs text-stone-600 font-sans">{{ addr.fReceiverPhone }}</span>
              <span
                v-if="addr.fIsDefault"
                class="bg-[#8E9A86] text-white text-[9px] px-1.5 py-0.5 rounded font-light scale-90 origin-left"
              >
                預設
              </span>
            </div>
            <p class="text-xs text-stone-500 truncate">
              {{ addr.fCity }}{{ addr.fArea }}{{ addr.fAddressDetail }}
            </p>
          </div>
        </div>
      </div>

      <!-- 收件人姓名 -->
      <FloatLabel>
        <InputText
          id="name"
          :modelValue="props.form.receiverName"
          @update:modelValue="updateField('receiverName', $event)"
          class="w-full h-14 bg-white/70 !rounded-md border border-stone-200/80 shadow-sm focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] text-stone-850 transition"
        />
        <label for="name" class="text-stone-500 text-sm">收件人姓名 (Receiver Name)</label>
      </FloatLabel>

      <!-- 行動電話 -->
      <FloatLabel>
        <InputText
          id="phone"
          :modelValue="props.form.receiverPhone"
          @update:modelValue="updateField('receiverPhone', $event)"
          class="w-full h-14 bg-white/70 !rounded-md border border-stone-200/80 shadow-sm focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] text-stone-850 transition"
        />
        <label for="phone" class="text-stone-500 text-sm">行動電話 (Mobile Phone)</label>
      </FloatLabel>

      <!-- 完整地址 -->
      <FloatLabel>
        <InputText
          id="address"
          :modelValue="props.form.receiverAddress"
          @update:modelValue="updateField('receiverAddress', $event)"
          class="w-full h-14 bg-white/70 !rounded-md border border-stone-200/80 shadow-sm focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] text-stone-850 transition"
        />
        <label for="address" class="text-stone-500 text-sm">完整地址 (Shipping Address)</label>
      </FloatLabel>

      <!-- 運送方式選擇 -->
      <div class="mt-2">
        <h3 class="text-sm font-light text-stone-800 mb-3 tracking-wide">選擇運送方式</h3>
        <div
          class="border border-[#8E9A86] bg-[#8E9A86]/5 rounded-lg p-4 flex justify-between items-center cursor-pointer shadow-sm"
        >
          <div class="flex items-center gap-4">
            <i class="pi pi-truck text-xl text-[#8E9A86]"></i>
            <div>
              <p class="font-medium text-stone-850 text-sm">標準宅配</p>
              <p class="text-xs text-stone-500 mt-1">預計 2-3 個工作天送達</p>
            </div>
          </div>
          <span class="font-light text-stone-850 text-sm">{{
            props.cartTotal >= 1500 ? '免運費' : 'NT$ 60'
          }}</span>
        </div>
      </div>

      <!-- 付款方式選擇 -->
      <div class="mt-4">
        <h3 class="text-sm font-light text-stone-800 mb-3 tracking-wide">選擇付款方式</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 font-serif">
          <div
            v-for="option in props.paymentOptions"
            :key="option.id"
            @click="updateField('paymentMethodId', option.id)"
            :class="[
              'border rounded-lg p-4 cursor-pointer transition-all shadow-sm',
              props.form.paymentMethodId === option.id
                ? 'border-[#8E9A86] bg-[#8E9A86]/5'
                : 'border-stone-200 hover:border-stone-350 bg-white/70',
            ]"
          >
            <div class="flex flex-col items-center text-center gap-2">
              <i
                :class="[
                  'pi',
                  option.icon,
                  'text-2xl',
                  props.form.paymentMethodId === option.id ? 'text-[#8E9A86]' : 'text-stone-400',
                ]"
              ></i>
              <div>
                <p
                  :class="[
                    'font-medium text-sm',
                    props.form.paymentMethodId === option.id ? 'text-[#8E9A86]' : 'text-stone-600',
                  ]"
                >
                  {{ option.name }}
                </p>
                <p class="text-xs text-stone-400 mt-1 leading-relaxed">{{ option.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 運費提示 -->
        <div
          class="mt-4 p-4 rounded-lg text-sm flex items-start gap-3 border"
          :class="
            props.cartTotal >= 1500
              ? 'bg-[#8E9A86]/5 border-[#8E9A86]/10 text-stone-700'
              : 'bg-amber-50/50 border-amber-200/50 text-amber-850'
          "
        >
          <i class="pi pi-info-circle mt-0.5 flex-shrink-0 text-[#8E9A86]"></i>
          <span class="font-light">
            <template v-if="props.cartTotal >= 1500">
              本訂單已達免運門檻，免收運費！
            </template>
            <template v-else>
              訂單金額未滿
              <strong class="text-amber-950 font-normal">NT$ 1,500</strong>
              將加收 <strong class="text-amber-950 font-normal">NT$ 60</strong> 運費。
            </template>
          </span>
        </div>
      </div>

      <!-- 備註 -->
      <FloatLabel class="mt-2">
        <Textarea
          id="note"
          :modelValue="props.form.note"
          @update:modelValue="updateField('note', $event)"
          rows="3"
          class="w-full bg-white/70 !rounded-md border border-stone-200/80 shadow-sm focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] text-stone-850 transition resize-none pt-4"
        />
        <label for="note" class="text-stone-500 text-sm">給店家的備註</label>
      </FloatLabel>
    </div>

    <!-- 底部按鈕區 -->
    <div
      class="mt-10 pt-8 border-t border-stone-200/50 flex justify-end"
    >
      <button
        @click="handleSubmit"
        class="w-full sm:w-auto bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-12 py-4 rounded-full font-light tracking-widest transition duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md cursor-pointer"
      >
        確認送出 <i class="pi pi-arrow-right text-xs"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
