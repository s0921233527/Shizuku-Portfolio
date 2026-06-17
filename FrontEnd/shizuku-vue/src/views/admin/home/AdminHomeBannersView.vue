<script setup>
import { ref, onMounted } from "vue";
import Toast from "primevue/toast";
import InputNumber from "primevue/inputnumber";
import { useToast } from "primevue/usetoast";
import {
  getHomeBanners,
  saveHomeBanners,
  uploadBannerImage,
} from "@/api/adminHome";

const toast = useToast();
const banners = ref([]);
const loading = ref(false);

// 編輯/新增視窗狀態
const showModal = ref(false);
const modalTitle = ref("編輯輪播圖");
const editingBanner = ref({
  fId: 0,
  fSubtitle: "",
  fTitle: "",
  fDescription: "",
  fImage: "",
  fSortOrder: 0,
});

const fileInput = ref(null);
const uploadingImage = ref(false);

// 載入 API base url 來解析相對路徑圖片
const apiBase =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7197/api";
const API_BASE_URL = apiBase.replace(/\/api$/, "");

const resolveImageUrl = (imgUrl) => {
  if (!imgUrl) return "";
  if (imgUrl.startsWith("http") || imgUrl.startsWith("data:")) {
    return imgUrl;
  }
  if (imgUrl.startsWith("/img/")) {
    return imgUrl;
  }
  return `${API_BASE_URL}${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;
};

const fetchBanners = async () => {
  loading.value = true;
  try {
    const response = await getHomeBanners();
    if (response.data.success) {
      banners.value = response.data.data.sort(
        (a, b) => a.fSortOrder - b.fSortOrder,
      );
    } else {
      toast.add({
        severity: "error",
        summary: "錯誤",
        detail: response.data.message || "載入失敗",
        life: 3000,
      });
    }
  } catch (err) {
    console.error("載入輪播圖失敗:", err);
    toast.add({
      severity: "error",
      summary: "載入失敗",
      detail: "無法連線後端 API",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBanners();
});

const openAddModal = () => {
  modalTitle.value = "新增輪播圖";
  editingBanner.value = {
    fId:
      banners.value.length > 0
        ? Math.max(...banners.value.map((b) => b.fId)) + 1
        : 1,
    fSubtitle: "",
    fTitle: "",
    fDescription: "",
    fImage: "",
    fSortOrder: banners.value.length + 1,
  };
  showModal.value = true;
};

const openEditModal = (banner) => {
  modalTitle.value = "編輯輪播圖";
  editingBanner.value = { ...banner };
  showModal.value = true;
};

// 處理圖片上傳
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      severity: "error",
      summary: "上傳失敗",
      detail: "圖片限制大小為 5MB 以下",
      life: 3000,
    });
    return;
  }

  uploadingImage.value = true;
  try {
    const response = await uploadBannerImage(file);
    if (response.data.success) {
      editingBanner.value.fImage = response.data.data;
      toast.add({
        severity: "success",
        summary: "上傳成功",
        detail: "圖片已成功上傳",
        life: 2000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "上傳失敗",
        detail: response.data.message || "上傳出錯",
        life: 3000,
      });
    }
  } catch (err) {
    console.error("上傳輪播圖失敗:", err);
    toast.add({
      severity: "error",
      summary: "上傳出錯",
      detail: "無法連接上傳伺服器",
      life: 3000,
    });
  } finally {
    uploadingImage.value = false;
  }
};

const handleDelete = async (bannerId) => {
  if (!confirm("確定要刪除此張輪播圖嗎？")) return;

  const updated = banners.value.filter((b) => b.fId !== bannerId);
  // 重新編排排序欄位
  updated.forEach((b, index) => {
    b.fSortOrder = index + 1;
  });

  try {
    const response = await saveHomeBanners(updated);
    if (response.data.success) {
      toast.add({
        severity: "success",
        summary: "刪除成功",
        detail: "已同步更新首頁輪播",
        life: 3000,
      });
      fetchBanners();
    } else {
      toast.add({
        severity: "error",
        summary: "儲存失敗",
        detail: response.data.message || "儲存出錯",
        life: 3000,
      });
    }
  } catch (err) {
    console.error("刪除輪播圖失敗:", err);
    toast.add({
      severity: "error",
      summary: "刪除失敗",
      detail: "後端連線異常",
      life: 3000,
    });
  }
};

const saveBanner = async () => {
  if (!editingBanner.value.fImage) {
    toast.add({
      severity: "warn",
      summary: "資料不完整",
      detail: "請上傳或設定輪播圖圖片網址",
      life: 3000,
    });
    return;
  }
  if (!editingBanner.value.fTitle) {
    toast.add({
      severity: "warn",
      summary: "資料不完整",
      detail: "請輸入標題",
      life: 3000,
    });
    return;
  }

  let updatedList = [...banners.value];
  const index = updatedList.findIndex((b) => b.fId === editingBanner.value.fId);

  if (index > -1) {
    // 編輯更新
    updatedList[index] = { ...editingBanner.value };
  } else {
    // 新增
    updatedList.push({ ...editingBanner.value });
  }

  // 依據 SortOrder 重新排序
  updatedList.sort((a, b) => a.fSortOrder - b.fSortOrder);

  try {
    loading.value = true;
    const response = await saveHomeBanners(updatedList);
    if (response.data.success) {
      toast.add({
        severity: "success",
        summary: "儲存成功",
        detail: "已同步更新首頁輪播圖設定",
        life: 3000,
      });
      showModal.value = false;
      fetchBanners();
    } else {
      toast.add({
        severity: "error",
        summary: "儲存失敗",
        detail: response.data.message || "儲存出錯",
        life: 3000,
      });
    }
  } catch (err) {
    console.error("儲存輪播圖失敗:", err);
    toast.add({
      severity: "error",
      summary: "儲存失敗",
      detail: "後端連線異常",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const moveOrder = async (index, direction) => {
  if (direction === "up" && index === 0) return;
  if (direction === "down" && index === banners.value.length - 1) return;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const updated = [...banners.value];

  // 交換 sortOrder
  const tempOrder = updated[index].fSortOrder;
  updated[index].fSortOrder = updated[targetIndex].fSortOrder;
  updated[targetIndex].fSortOrder = tempOrder;

  try {
    loading.value = true;
    const response = await saveHomeBanners(updated);
    if (response.data.success) {
      fetchBanners();
    } else {
      toast.add({
        severity: "error",
        summary: "排序儲存失敗",
        detail: response.data.message,
        life: 3000,
      });
    }
  } catch (err) {
    console.error("排序更新失敗:", err);
    toast.add({
      severity: "error",
      summary: "連線錯誤",
      detail: "無法保存排序異動",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <Toast position="top-right" />

    <!-- 頂部標頭列 -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1
          class="text-2xl font-bold text-slate-800 tracking-wide flex items-center gap-2"
        >
          <i class="pi pi-images text-indigo-600 text-xl"></i>
          <span>首頁輪播設定</span>
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          管理前台首頁頂部的雜誌感輪播橫幅。您可以設定每張圖的副標、主標、說明與排序順位。
        </p>
      </div>

      <div>
        <button
          @click="openAddModal"
          class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <i class="pi pi-plus text-xs"></i>
          <span>新增輪播圖</span>
        </button>
      </div>
    </div>

    <!-- 載入中骨架 -->
    <div
      v-if="loading && banners.length === 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 animate-pulse"
      >
        <div class="w-full h-40 bg-slate-100 rounded-xl"></div>
        <div class="h-4 bg-slate-100 rounded w-1/3"></div>
        <div class="h-6 bg-slate-100 rounded w-3/4"></div>
        <div class="h-4 bg-slate-100 rounded w-full"></div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div
      v-else-if="banners.length === 0"
      class="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm"
    >
      <i class="pi pi-images text-5xl text-slate-200 mb-4 block"></i>
      <h3 class="text-slate-700 font-bold text-base">目前尚無輪播圖</h3>
      <p class="text-slate-400 text-xs mt-1">
        請點選右上角「新增輪播圖」按鈕開始上傳您的第一張橫幅。
      </p>
    </div>

    <!-- 輪播圖網格卡片 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(banner, index) in banners"
        :key="banner.fId"
        class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-md hover:border-slate-200 transition-all duration-200 relative"
      >
        <!-- 順序與控制角標 -->
        <div
          class="absolute top-3.5 left-3.5 z-10 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono shadow-sm"
        >
          <span>順位 {{ banner.fSortOrder }}</span>
        </div>

        <!-- 輪播預覽圖 -->
        <div
          class="relative w-full h-44 bg-slate-100 overflow-hidden flex-shrink-0"
        >
          <img
            :src="resolveImageUrl(banner.fImage)"
            :alt="banner.fTitle"
            class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"
          ></div>
        </div>

        <!-- 卡片內容區 -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <span
              class="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider font-mono"
            >
              {{ banner.fSubtitle || "無副標題" }}
            </span>
            <h3 class="text-base font-bold text-slate-800 line-clamp-1">
              {{ banner.fTitle }}
            </h3>
            <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {{ banner.fDescription || "無描述內容。" }}
            </p>
          </div>

          <!-- 操作區 -->
          <div
            class="flex items-center justify-between pt-3 border-t border-slate-50"
          >
            <div class="flex items-center gap-1.5">
              <button
                @click="moveOrder(index, 'up')"
                :disabled="index === 0"
                class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors"
                title="往上移"
              >
                <i class="pi pi-arrow-up text-[10px]"></i>
              </button>
              <button
                @click="moveOrder(index, 'down')"
                :disabled="
                  index === banners.value?.length - 1 ||
                  index === banners.length - 1
                "
                class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors"
                title="往下移"
              >
                <i class="pi pi-arrow-down text-[10px]"></i>
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="openEditModal(banner)"
                class="px-3.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
              >
                <i class="pi pi-pencil text-[9px]"></i>
                <span>編輯</span>
              </button>
              <button
                @click="handleDelete(banner.fId)"
                class="px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 hover:text-red-500 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
              >
                <i class="pi pi-trash text-[9px]"></i>
                <span>刪除</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯/新增 Modal 燈箱 -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <!-- Modal 標頭 -->
        <div
          class="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"
        >
          <h2 class="text-base font-bold text-slate-800">{{ modalTitle }}</h2>
          <button
            @click="showModal = false"
            class="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Modal 內容 (滾動區) -->
        <div class="p-6 space-y-5 overflow-y-auto flex-1">
          <!-- 圖片上傳區 -->
          <div class="space-y-2">
            <label
              class="text-xs font-bold text-slate-400 uppercase tracking-wider block"
              >輪播圖圖片</label
            >
            <div
              class="relative w-full h-44 rounded-xl border border-dashed border-slate-200 bg-slate-50 overflow-hidden flex flex-col items-center justify-center group"
            >
              <img
                v-if="editingBanner.fImage"
                :src="resolveImageUrl(editingBanner.fImage)"
                class="w-full h-full object-cover absolute inset-0"
              />

              <div
                class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
              >
                <button
                  @click="triggerFileInput"
                  type="button"
                  class="px-4 py-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl text-xs font-semibold shadow flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <i class="pi pi-upload text-[10px]"></i>
                  <span>更換圖片</span>
                </button>
              </div>

              <div v-if="!editingBanner.fImage" class="text-center space-y-2.5">
                <i class="pi pi-image text-3xl text-slate-300"></i>
                <div class="space-y-1">
                  <button
                    @click="triggerFileInput"
                    type="button"
                    class="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    上傳 Banner 圖片
                  </button>
                  <p class="text-[10px] text-slate-400">
                    支援 JPG, PNG, WEBP格式，5MB以下
                  </p>
                </div>
              </div>

              <!-- 上傳中遮罩 -->
              <div
                v-if="uploadingImage"
                class="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-2"
              >
                <i class="pi pi-spin pi-spinner text-indigo-600 text-2xl"></i>
                <span class="text-xs text-slate-650 font-medium"
                  >圖片上傳中...</span
                >
              </div>

              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                accept="image/*"
                class="hidden"
              />
            </div>
          </div>

          <!-- 手動網址輸入 (備用) -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-slate-400 uppercase tracking-wider block"
              >或輸入外部圖片網址</label
            >
            <input
              v-model="editingBanner.fImage"
              type="text"
              placeholder="https://..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-colors"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- 副標題 -->
            <div class="space-y-1.5">
              <label
                class="text-xs font-bold text-slate-400 uppercase tracking-wider block"
                >副標題 (Subtitle)</label
              >
              <input
                v-model="editingBanner.fSubtitle"
                type="text"
                placeholder="例: 2026 New Collection"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-colors"
              />
            </div>

            <!-- 順序 -->
            <div class="space-y-1.5">
              <label
                class="text-xs font-bold text-slate-400 uppercase tracking-wider block"
                >播放順序 (Sort Order)</label
              >
              <InputNumber
                v-model="editingBanner.fSortOrder"
                :min="1"
                :max="99"
                showButtons
                buttonLayout="horizontal"
                class="w-full custom-input-number"
                inputClass="w-full text-center !py-2.5 !border-slate-200 text-sm font-medium"
              />
            </div>
          </div>

          <!-- 主標題 -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-slate-400 uppercase tracking-wider block"
              >主標題 (Title) <span class="text-red-500">*</span></label
            >
            <input
              v-model="editingBanner.fTitle"
              type="text"
              placeholder="例: 溫柔流淌的針織光影"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-colors"
            />
          </div>

          <!-- 描述 -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-slate-400 uppercase tracking-wider block"
              >簡介描述 (Description)</label
            >
            <textarea
              v-model="editingBanner.fDescription"
              rows="3"
              placeholder="為此橫幅輪播圖增添簡短說明介紹..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-colors"
            ></textarea>
          </div>
        </div>

        <!-- Modal 頁尾 -->
        <div
          class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50"
        >
          <button
            @click="showModal = false"
            type="button"
            class="px-4 py-2.5 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
          >
            取消
          </button>
          <button
            @click="saveBanner"
            type="button"
            :disabled="loading"
            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow transition-colors"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner text-xs"></i>
            <span>儲存設定</span>
          </button>
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

.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.99) translateY(2px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
