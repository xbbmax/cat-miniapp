export default defineAppConfig({
  pages: [
    // Tab页面
    'pages/index/index',
    'pages/pets/index/index',
    'pages/vaccines/index/index',
    'pages/medications/index/index',
    'pages/products/index/index',

    // 认证
    'pages/auth/login/index',
    'pages/auth/register/index',
    'pages/auth/forgot-password/index',
    'pages/auth/reset-password/index',

    // 用户协议与隐私政策
    'pages/agreement/terms/index',
    'pages/agreement/privacy/index',

    // 会员
    'pages/membership/index',
    'pages/membership/open/index',

    // 宠物
    'pages/pets/add/index',
    'pages/pets/detail/index',

    // 产品
    'pages/products/add/index',
    'pages/products/detail/index',

    // 疫苗
    'pages/vaccines/add/index',
    'pages/vaccines/detail/index',

    // 用药
    'pages/medications/add/index',
    'pages/medications/detail/index',

    // 健康计划
    'pages/plans/index/index',
    'pages/plans/add/index',
    'pages/plans/detail/index',

    // 健康记录
    'pages/records/index/index',
    'pages/records/detail/index',

    // 设置
    'pages/settings/index/index',
    'pages/settings/feedback/index',
    'pages/settings/password/index',

    // 个人资料编辑
    'pages/notifications/index/index',
    'pages/profile/index/index',
    'pages/profile/edit/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '宠爱有期',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F8F9FA',
  },
  tabBar: {
    color: '#6B7280',
    selectedColor: '#FF6B5B',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
      },
      {
        pagePath: 'pages/pets/index/index',
        text: '宠物',
        iconPath: 'assets/icons/pet.png',
        selectedIconPath: 'assets/icons/pet-active.png',
      },
      {
        pagePath: 'pages/vaccines/index/index',
        text: '疫苗',
        iconPath: 'assets/icons/vaccine.png',
        selectedIconPath: 'assets/icons/vaccine-active.png',
      },
      {
        pagePath: 'pages/medications/index/index',
        text: '用药',
        iconPath: 'assets/icons/medication.png',
        selectedIconPath: 'assets/icons/medication-active.png',
      },
      {
        pagePath: 'pages/products/index/index',
        text: '商品',
        iconPath: 'assets/icons/product.png',
        selectedIconPath: 'assets/icons/product-active.png',
      },
    ],
  },
  permission: {},
  requiredPrivateInfos: [],
  __usePrivacyCheck__: true,
})
