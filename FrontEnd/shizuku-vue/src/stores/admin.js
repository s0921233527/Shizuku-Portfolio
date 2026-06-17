import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAdminStore = defineStore('admin', () => {
    // 狀態 (State)
    const adminUser = ref(JSON.parse(localStorage.getItem('adminUser')) || null);
    const adminToken = ref(localStorage.getItem('adminToken') || '');

    // 修飾語 (Getters)
    const isLogin = computed(() => adminUser.value !== null);
    // 確保 fName 存在，否則顯示管理員
    const adminName = computed(() => adminUser.value?.fName || '管理員');

    // 動作 (Actions)
    function login(userData, userToken = '') {
        adminUser.value = userData;
        adminToken.value = userToken;

        localStorage.setItem('adminUser', JSON.stringify(userData));
        if (userToken) {
            localStorage.setItem('adminToken', userToken);
        }
    }

    function logout() {
        // 重置所有響應式變數
        adminUser.value = null;
        adminToken.value = '';

        // 移除儲存空間
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');

        // 可選：如果你有其他後台相關的快取也可以在這裡清空
    }

    return { adminUser, adminToken, adminName, isLogin, login, logout };
});