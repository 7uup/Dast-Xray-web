import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  {
  path: '/task',
  component: Layout,
  name: 'Task',
  meta: { title: '漏洞扫描', icon: 'table', noCache: true },
  redirect: '/task/active',
  children: [
    {
      path: 'active',
      component: () => import('@/views/task/active'),
      name: 'ActiveScanTask',
      meta: { title: '主动扫描', noCache: true }
    },
    {
      path: 'openapiScan',
      component: () => import('@/views/task/openapiscan'),
      name: 'openapiScanTask',
      meta: { title: 'Openapi扫描',  noCache: true }
    },
    {
      path: 'detail/:id',
      component: () => import('@/views/task/detail'),
      name: 'TaskDetail',
      props: true,
      meta: { title: '任务详情', noCache: true },
      hidden: true 
    }
  ]
}
,
 {
  path: '/report',
  component: Layout,
  name: 'Report',
  meta: { title: '扫描报告', icon: 'el-icon-s-help', noCache: true },
  redirect: '/report/activeReport',
  children: [
    {
      path: 'activeReport',
      component: () => import('@/views/taskreport/activereport'),
      name: 'ActiveReport',
      meta: { title: '主动扫描报告', noCache: true }
    },
    {
      path: 'openapiReport',
      component: () => import('@/views/taskreport/openapireport'),
      name: 'openapiReport',
      meta: { title: 'Openapi扫描报告',  noCache: true }
    },
  ]
},
 {
  path: '/config_setting',
  component: Layout,
  name: 'ConfigSetting',
  meta: { title: '配置设置', icon: 'el-icon-s-help', noCache: true },
  redirect: '/config_setting/xray',
  children: [
    {
      path: 'xray',
      component: () => import('@/views/configsetting/xray'),
      name: 'xray',
      meta: { title: 'xray配置', noCache: true }
    },
    {
      path: 'tools',
      component: () => import('@/views/configsetting/tools'),
      name: 'tools',
      meta: { title: '工具配置',  noCache: true }
    },
  ]
},


  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
