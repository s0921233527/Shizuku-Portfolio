import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { getAddressesAPI } from '@/api/member';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('memberUser')) || null);
    const token = ref(localStorage.getItem('memberToken') || '');
    const addressList = ref([]);

    const isLogin = computed(() => user.value !== null);
    const userName = computed(() => user.value ? user.value.fName : '訪客');
    const userLevel = computed(() => user.value ? user.value.fLevel : null);
    const userPoints = computed(() => user.value ? user.value.fPoints : null);

    async function login(loginResultData) {
        if (!loginResultData) return false;

        const { token: userToken, ...userData } = loginResultData;

        user.value = userData;
        token.value = userToken || '';

        localStorage.setItem('memberUser', JSON.stringify(userData));
        if (userToken) {
            localStorage.setItem('memberToken', userToken);
        }
        return true;
    }

    async function fetchUserAddress() {
        const memberId = user.value?.fId || user.value?.fMemberId;
        if (!memberId) return;

        try {
            const res = await getAddressesAPI(memberId);
            if (res.data.success) {
                addressList.value = res.data.data;
                console.log("Store: 地址預載成功");
            }
        } catch (error) {
            console.error("Store: 抓取地址失敗", error);
            throw error;
        }
    }

    function logout() {
        user.value = null;
        token.value = '';
        addressList.value = []; // 清空地址
        localStorage.removeItem('memberUser');
        localStorage.removeItem('memberToken');
    }

    return {
        user,
        token,
        userName,
        userLevel,
        userPoints,
        isLogin,
        login,
        logout,
        addressList,
        fetchUserAddress
    };
});
