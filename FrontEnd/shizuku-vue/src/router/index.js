import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // 會員登入狀態 Store
import axios from 'axios'

// --- Layouts (版面配置) ---
import Basic from '@/layout/Basic.vue'
import AuthLayout from '@/layout/AuthLayout.vue'

// --- Views (頁面組件) ---
import HomeView from '@/views/HomeView.vue'
import OrdersListView from '@/views/OrdersListView.vue'
import OrderDetailView from '@/views/OrderDetailView.vue'
import CartDetailView from '@/views/CartDetailView.vue'
import PaymentListView from '@/views/PaymentListView.vue'
import PaymentDetailView from '@/views/PaymentDetailView.vue'
import CustomerView from '@/views/CustomerView.vue'
import FaqView from '@/views/FaqView.vue'
import AboutView from '@/views/AboutView.vue'
import GuideView from '@/views/GuideView.vue'
import ShippingPolicyView from '@/views/ShippingPolicyView.vue'
import ReturnPolicyView from '@/views/ReturnPolicyView.vue'
import PrivacyPolicyView from '@/views/PrivacyPolicyView.vue'
import TermsOfServiceView from '@/views/TermsOfServiceView.vue'
import ProductView from '@/views/ProductView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import PaymentSuccessView from '@/views/PaymentSuccessView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  // 統一管理頁面切換時的滾動行為
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },

  routes: [
    // =========================================================================
    // 1. 一般前台頁面專區 (使用 Basic Layout，帶有導覽列與頁尾)
    // =========================================================================
    {
      path: '/',
      component: Basic,
      children: [
        // 首頁
        { path: '', name: 'home', component: HomeView },

        // 訂單與支付相關
        { path: 'orders', name: 'orders', component: OrdersListView },
        { path: 'orders/:id', name: 'order-detail', component: OrderDetailView },
        { path: 'orders/:id/payments', name: 'payment-list', component: PaymentListView },
        { path: 'PaymentList', name: 'payment-list-root', component: PaymentListView },
        {
          path: 'orders/:id/payments/:transactionId',
          name: 'payment-detail',
          component: PaymentDetailView,
        },

        // 購物車
        { path: 'cart', name: 'cart', component: CartDetailView },

        // 商品頁面
        { path: 'all', name: 'ProductView', component: ProductView },
        {
          path: 'product/:id',
          name: 'product-detail',
          component: () => import('@/views/ProductDetail.vue'),
        },

        // 政策與資訊頁面
        { path: 'about', name: 'about', component: AboutView },
        { path: 'guide', name: 'guide', component: GuideView },
        { path: 'shipping-policy', name: 'shippingPolicy', component: ShippingPolicyView },
        { path: 'return-policy', name: 'returnPolicy', component: ReturnPolicyView },
        { path: 'faq', name: 'faq', component: FaqView },
        { path: 'privacy-policy', name: 'privacyPolicy', component: PrivacyPolicyView },
        { path: 'terms-of-service', name: 'termsOfService', component: TermsOfServiceView },

        // 會員中心子路由 (巢狀路由 Nested Routes)
        {
          path: 'member',
          component: () => import('@/views/MemberView.vue'),
          children: [
            { path: '', redirect: { name: 'MemberProfile' } },
            {
              path: 'profile',
              name: 'MemberProfile',
              component: () => import('@/components/member/MemberProfile.vue'),
            },
            {
              path: 'paymentmetod',
              name: 'MemberPayMentmetod',
              component: () => import('@/components/member/MemberPaymentMethods.vue'),
            },
            {
              path: 'address',
              name: 'MemberAddress',
              component: () => import('@/components/member/MemberAddress.vue'),
            },
            {
              path: 'password',
              name: 'MemberSetPassword',
              component: () => import('@/components/member/MemberSetPassword.vue'),
            },
            {
              path: 'notificationset',
              name: 'MemberNotificationSet',
              component: () => import('@/components/member/MemberNotificationSet.vue'),
            },
            {
              path: 'privacysetting',
              name: 'MemberPrivacySetting',
              component: () => import('@/components/member/MemberPrivacySetting.vue'),
            },
            {
              path: 'pointsdashboard',
              name: 'MemberPointsDashboard',
              component: () => import('@/components/member/MemberPointsDashboard.vue'),
            },
            {
              path: 'vouchers',
              name: 'MemberVouchers',
              component: () => import('@/components/member/MemberVouchers.vue'),
            },
            {
              path: '/security',
              name: 'security',
              component: () => import('@/components/member/MemberProfileSecurity.vue'),
            },
            {
              path: 'orders',
              redirect: { name: 'MemberOrders' },
            },
            {
              path: 'MemberOrders',
              name: 'MemberOrders',
              component: () => import('@/components/member/MemberOrders.vue'),
            },
            {
              path: 'orders/:id',
              name: 'MemberOrderDetail',
              component: OrderDetailView,
            },
            {
              path: 'empty',
              name: 'MemberEmpty',
              component: () => import('@/components/member/MemberEmpty.vue'),
            },
            {
              path: 'tickets', 
              name: 'MemberTickets', 
              component: () => import('@/components/member/MemberTickets.vue'), 
            },
          ],
        },
        {
          path: '/point-store',
          name: 'point-store',
          component: () => import('@/components/member/MemberStore.vue'),
        },
      ],
    },

    // =========================================================================
    // 2. 前台 會員登入/註冊專區 (使用獨立的 AuthLayout)
    // =========================================================================
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        { path: '', redirect: { name: 'Login' } },
        { path: 'login', name: 'Login', component: () => import('@/components/auth/AppLogin.vue') },
        {
          path: 'register',
          name: 'Register',
          component: () => import('@/components/auth/AppRegister.vue'),
        },
        {
          path: 'forgot-password',
          name: 'ForgotPassword',
          component: () => import('@/components/auth/AppForgotPassword.vue'),
        },
      ],
    },

    // 前台獨立版面頁面
    { path: '/customer', name: 'customer', component: CustomerView },
    { path: '/checkout', name: 'checkout', component: CheckoutView },

    // LINE Pay 金流非同步回傳跳轉目的地
    {
      path: '/payment/success',
      name: 'PaymentSuccess',
      component: PaymentSuccessView,
      meta: {
        title: '付款處理中 - Shizuku',
      },
    },

    // =========================================================================
    // 3. 後台 獨立登入頁面 (不帶任何後台 Sidebar 的乾淨畫面)
    // =========================================================================
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/AdminLoginView.vue'),
    },

    // =========================================================================
    // 4. 後台 管理核心專區 (統一使用 AdminView 作為內層佈局主架構)
    // =========================================================================
    {
      path: '/admin',
      component: () => import('@/views/AdminView.vue'),
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'members',
          name: 'admin-members',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/member/AdminMembersView.vue'),
        },
        {
          path: 'members/block',
          name: 'admin-members-block',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/member/AdminMembersBlockView.vue'),
        },
        {
          path: 'system/vertify/settings',
          name: 'admin-system-settings',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/system/AdminSystemConfigsView.vue'),
        },
        {
          path: 'system/logs',
          name: 'admin-system-logs',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/system/AdminSystemLogsView.vue'),
        },
        {
          path: 'home/banners',
          name: 'admin-home-banners',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/home/AdminHomeBannersView.vue'),
        },
        {
          path: 'products',
          name: 'admin-products',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/AdminProductsView.vue'),
        },
        {
          path: 'products/create',
          name: 'admin-products-create',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/AdminProductCreateView.vue'),
        },
        {
          path: 'products/:id/edit',
          name: 'admin-products-edit',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/AdminProductEditView.vue'),
        },
        {
          path: 'inventory',
          name: 'admin-inventory',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/AdminInventoryView.vue'),
        },
        {
          path: 'inventory/create',
          name: 'admin-inventory-create',
          meta: { requiresAdmin: true }, // 確保後台新增功能同樣受到系統安全守護
          component: () => import('@/views/admin/AdminPurchaseCreateView.vue'),
        },
        {
          path: 'inventory/scan',
          name: 'admin-inventory-scan',
          meta: { requiresAdmin: true }, // 確保掃碼入庫功能安全
          component: () => import('@/views/admin/AdminProductScanView.vue'),
        },
        {
          path: 'categories',
          name: 'admin-categories',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/AdminCategoriesView.vue'),
        },
        // ── 後台：訂單管理模組（3 大核心子頁面）──
        {
          path: 'orders/all',
          name: 'admin-orders-all',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/order/AdminAllOrdersView.vue'),
        },
        {
          path: 'orders/shipping',
          name: 'admin-orders-shipping',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/order/AdminShippingHubView.vue'),
        },
        {
          path: 'orders/anomaly',
          name: 'admin-orders-anomaly',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/order/AdminAnomalyOrdersView.vue'),
        },
        // ── 後台：金流/財務管理模組（3 大核心子頁面）──
        {
          path: 'payments/all',
          name: 'admin-payments-all',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/payment/AdminAllPaymentsView.vue'),
        },
        {
          path: 'payments/revenue',
          name: 'admin-payments-revenue',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/payment/AdminRevenueView.vue'),
        },
        {
          path: 'payments/refund',
          name: 'admin-payments-refund',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/payment/AdminRefundView.vue'),
        },
        // 後台：客服與工單系統
        {
          path: 'customer-service',
          name: 'admin-customer-service',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/AdminCustomerServiceView.vue'),
        },
        {
          path: 'ticket-list',
          name: 'admin-ticket-list',
          meta: { requiresAdmin: true },
          component: () => import('@/views/admin/AdminTicketList.vue'),
        },
      ],
    },

    // =========================================================================
    // 5. 萬用防空路由處理 (當使用者亂打網址或輸入錯誤路由時，永遠自動導回首頁。必須置於最尾端)
    // =========================================================================
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// =========================================================================
// 🛡️ 終極全域路由守衛 (前台會員防禦 + 後台管理員權限防禦 完美合併版)
// =========================================================================
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 1.【第一道防線：後台高階權限安全審查】
  // 如果目標路由標註了 requiresAdmin（代表它是電商機密後台）
  if (to.meta.requiresAdmin) {
    const adminUser = JSON.parse(localStorage.getItem('adminUser'))
    
    // 檢查是否有後台人員登入憑證，且 isEmployee 身分必須為 true（充血模型驗證）
    if (!adminUser || !adminUser.isEmployee) {
      // 驗證失敗，當場就地攔截！強制移送至後台專屬登入頁
      return next({ name: 'admin-login' })
    }
    // 驗證成功，直接通關放行
    return next()
  }

  // 2. 🛒 【第二道防線：前台一般會員與結帳安全審查】
  // 辨識使用者是否正要前往前台會員中心路徑 (/member) 或進入最終結帳流程
  const isMemberPage = to.path.startsWith('/member') || to.name === 'checkout'
  // 辨識使用者是否正要前往登入、註冊專區 (/auth)
  const isAuthPage = to.path.startsWith('/auth')

  if (isMemberPage && !authStore.isLogin) {
    // 企圖未登入擅闖會員私領域 -> 彈出視窗警告，並強制踢回一般會員登入頁
    alert('請先登入會員')
    return next({ name: 'Login' })
  } 
  
  if (isAuthPage && authStore.isLogin) {
    // 已經是登入狀態的使用者，禁止重複造訪登入/註冊頁面 -> 直接強制原地保送回首頁
    return next({ name: 'home' })
  }

  // 3. ✨ 【第三道防線：萬用安全放行】
  // 如果造訪的是普通公開網頁（首頁、商品列表、常見問題頁面等），直接全面給予權限通行
  next()
})

// 頁面瀏覽追蹤日誌
router.afterEach((to) => {
  if (to.path && to.path !== '/empty') {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://shizuku-backend.onrender.com/api';
    
    // 取得 token (優先後台管理員，次之前台會員)
    let token = localStorage.getItem('adminToken');
    if (!token) {
      token = localStorage.getItem('memberToken');
    }
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    axios.post(`${baseURL}/SystemApi/log-pageview`, 
      { path: to.fullPath }, 
      { headers }
    ).catch(() => {});
  }
});

export default router