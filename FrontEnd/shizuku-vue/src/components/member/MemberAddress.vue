<script setup>
import { ref, onMounted, reactive } from 'vue';
import { getAddressesAPI, updateAddressesAPI } from '@/api/member';

// 1. 狀態管理
const addressList = ref([]);
const loading = ref(false);
const showModal = ref(false); // 控制彈窗顯示
const isEdit = ref(false);    // 判斷是新增還是修改
const editIndex = ref(-1);    // 正在編輯哪一筆

// 2. 表單資料模型
const addressForm = reactive({
  fReceiverName: '',
  fReceiverPhone: '',
  fCity: '',
  fArea: '',
  fAddressDetail: '',
  fZipCode: '',
  fIsDefault: false
});

// 關鍵修正：確保 memberId 在所有函數中都能被讀取
const getMemberId = () => {
  const userData = localStorage.getItem('memberUser');
  if (userData) {
    const user = JSON.parse(userData);
    return user.fId || user.fMemberId || user.FMemberId;
  }
  return null;
};

// 3. 取得地址列表
const fetchAddresses = async () => {
  const memberId = getMemberId(); // 這裡獲取沒問題
  if (!memberId) return;
  loading.value = true;
  try {
    const res = await getAddressesAPI(memberId);
    if (res.data.success) {
      addressList.value = res.data.data;
    }
  } finally {
    loading.value = false;
  }
};

// 4. 開啟新增彈窗
const openAddModal = () => {
  isEdit.value = false;
  Object.assign(addressForm, {
    fReceiverName: '',
    fReceiverPhone: '',
    fCity: '',
    fArea: '',
    fAddressDetail: '',
    fZipCode: '',
    fIsDefault: false
  });
  showModal.value = true;
};

// 5. 開啟編輯彈窗
const openEditModal = (addr, index) => {
  isEdit.value = true;
  editIndex.value = index;
  Object.assign(addressForm, { ...addr });
  showModal.value = true;
};

// 6. 儲存地址 (修正點：新增 memberId 獲取)
const saveAddress = async () => {
  const memberId = getMemberId();
  if (!memberId) {
    alert('請先登入');
    return;
  }

  const newList = [...addressList.value];

  if (isEdit.value) {
    newList[editIndex.value] = { ...addressForm };
  } else {
    if (newList.length === 0) addressForm.fIsDefault = true;
    newList.push({ ...addressForm });
  }

  if (addressForm.fIsDefault) {
    newList.forEach((item, idx) => {
      const currentIdx = isEdit.value ? editIndex.value : newList.length - 1;
      if (idx !== currentIdx) item.fIsDefault = false;
    });
  }

  try {
    const res = await updateAddressesAPI(memberId, newList);
    if (res.data.success) {
      addressList.value = newList;
      showModal.value = false;
      alert(isEdit.value ? '修改成功' : '新增成功');
    }
  } catch (error) {
    alert('操作失敗，請檢查網路連線');
  }
};

// 7. 設為預設地址 (修正點：新增 memberId 獲取)
const setDefault = async (index) => {
  const memberId = getMemberId();
  const newList = addressList.value.map((addr, i) => ({
    ...addr,
    fIsDefault: i === index
  }));

  try {
    const res = await updateAddressesAPI(memberId, newList);
    if (res.data.success) {
      addressList.value = newList;
      alert("預設地址已更新");
    }
  } catch (error) {
    console.error('更新失敗:', error);
  }
};

// 8. 刪除地址 (新增：預設地址不可刪除邏輯)
const deleteAddress = async (index) => {
  const targetAddress = addressList.value[index];

  // 關鍵檢查：如果是預設地址，不允許刪除
  if (targetAddress.fIsDefault) {
    alert('「預設地址」不能被刪除。請先將其他地址設為預設，再嘗試刪除此地址。');
    return;
  }

  const memberId = getMemberId();
  if (!confirm('確定要刪除此地址嗎？')) return;
  const newList = [...addressList.value];
  newList.splice(index, 1);

  try {
    const res = await updateAddressesAPI(memberId, newList);
    if (res.data.success) {
      addressList.value = newList;
    }
  } catch (error) {
    console.error('刪除失敗:', error);
  }
};

onMounted(fetchAddresses);
</script>

<template>
  <main class="w-full bg-transparent p-0">
    <div class="flex justify-between items-center mb-8 border-b border-stone-200/50 pb-6">
      <div>
        <h2 class="text-xl font-light tracking-wider text-stone-850">我的地址</h2>
        <p class="text-stone-500 text-xs mt-1 font-light">管理收件地址，提升結帳效率</p>
      </div>
      <button @click="openAddModal"
        class="bg-[#8E9A86] hover:bg-[#7d8b75] text-white px-5 py-2.5 rounded-full font-light tracking-wider flex items-center gap-2 shadow-sm transition active:scale-98 cursor-pointer">
        <i class="pi pi-plus text-xs"></i>
        新增地址
      </button>
    </div>

    <div v-if="loading" class="text-center py-10 text-stone-400">載入中...</div>

    <div v-else class="space-y-6">
      <div v-if="addressList.length === 0"
        class="text-center py-20 text-stone-400 border border-dashed border-stone-200 rounded-xl font-light">
        <i class="pi pi-map-marker text-4xl mb-3 block text-stone-300"></i>
        目前沒有儲存的地址
      </div>

      <div v-for="(addr, index) in addressList" :key="index"
        class="border border-stone-200/60 rounded-xl p-6 hover:border-[#8E9A86] transition-all duration-300 bg-white/40 group">

        <div class="flex justify-between items-start">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <h3 class="font-medium text-base text-stone-800">{{ addr.fReceiverName }}</h3>
              <span class="text-stone-200">|</span>
              <span class="text-stone-600 font-sans text-sm">{{ addr.fReceiverPhone }}</span>
              <span v-if="addr.fIsDefault" class="bg-[#8E9A86]/10 text-[#8E9A86] text-xs px-2 py-0.5 rounded-md font-light">
                預設地址
              </span>
            </div>
            <p class="text-stone-600 text-sm mt-2 font-light">{{ addr.fCity }}{{ addr.fArea }}{{ addr.fAddressDetail }}</p>
            <p class="text-stone-400 text-xs font-sans">{{ addr.fZipCode }}</p>
          </div>

          <div class="flex items-center gap-4 text-xs font-light">
            <button v-if="!addr.fIsDefault" @click="setDefault(index)"
              class="text-stone-500 hover:text-[#8E9A86] transition-colors cursor-pointer">設為預設</button>
            <button @click="openEditModal(addr, index)"
              class="text-stone-500 hover:text-[#8E9A86] transition-colors cursor-pointer">編輯</button>
            <button @click="deleteAddress(index)" :disabled="addr.fIsDefault"
              :class="addr.fIsDefault ? 'text-stone-200 cursor-not-allowed' : 'text-stone-500 hover:text-red-600'"
              :title="addr.fIsDefault ? '預設地址不可刪除' : ''" class="transition-colors cursor-pointer">
              刪除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 地址編輯彈窗 (Modal) -->
    <div v-if="showModal" class="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div class="bg-white border border-stone-200/50 p-8 rounded-2xl w-full max-w-md shadow-md font-serif">
        <h3 class="text-lg font-light tracking-wide mb-6 text-stone-850">{{ isEdit ? '修改收件地址' : '新增收件地址' }}</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-light text-stone-500 mb-1.5 tracking-wider">收件人姓名</label>
            <input v-model="addressForm.fReceiverName" type="text"
              class="w-full bg-white/70 border border-stone-200/80 p-2.5 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 transition font-sans"
              placeholder="請輸入姓名" />
          </div>
          <div>
            <label class="block text-xs font-light text-stone-500 mb-1.5 tracking-wider">聯絡電話</label>
            <input v-model="addressForm.fReceiverPhone" type="text"
              class="w-full bg-white/70 border border-stone-200/80 p-2.5 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 transition font-sans"
              placeholder="請輸入電話" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-light text-stone-500 mb-1.5 tracking-wider">城市</label>
              <input v-model="addressForm.fCity" placeholder="如：台北市"
                class="w-full bg-white/70 border border-stone-200/80 p-2.5 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 transition font-sans" />
            </div>
            <div>
              <label class="block text-xs font-light text-stone-500 mb-1.5 tracking-wider">地區</label>
              <input v-model="addressForm.fArea" placeholder="如：大安區"
                class="w-full bg-white/70 border border-stone-200/80 p-2.5 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 transition font-sans" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-light text-stone-500 mb-1.5 tracking-wider">詳細地址</label>
            <input v-model="addressForm.fAddressDetail" placeholder="道路名稱與門牌號碼"
              class="w-full bg-white/70 border border-stone-200/80 p-2.5 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 transition font-sans" />
          </div>
          <div>
            <label class="block text-xs font-light text-stone-500 mb-1.5 tracking-wider">郵遞區號</label>
            <input v-model="addressForm.fZipCode" placeholder="如：106"
              class="w-full bg-white/70 border border-stone-200/80 p-2.5 rounded-lg focus:border-[#8E9A86] focus:ring-1 focus:ring-[#8E9A86] outline-none text-stone-800 transition font-sans" />
          </div>
          <div class="flex items-center gap-2 pt-2">
            <input type="checkbox" v-model="addressForm.fIsDefault" id="isDefault" class="w-4 h-4 accent-[#8E9A86] rounded" />
            <label for="isDefault" class="text-sm text-stone-600 cursor-pointer font-light">設為預設地址</label>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="showModal = false"
            class="px-6 py-2.5 text-stone-500 hover:bg-[#8E9A86]/5 hover:text-[#8E9A86] rounded-full transition cursor-pointer text-sm">取消</button>
          <button @click="saveAddress"
            class="px-6 py-2.5 bg-[#8E9A86] hover:bg-[#7d8b75] text-white rounded-full transition shadow-sm hover:shadow-md cursor-pointer text-sm font-light tracking-wider">儲存地址</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 根據您的要求，CSS 放在最下方 */
</style>