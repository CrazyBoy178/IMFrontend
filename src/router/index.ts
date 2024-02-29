import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import login from '../views/login.vue'



const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		component: login,
		meta: {requiresAuth: false}, // 设置路由元信息，标记是否需要登录
	},
	{
		path: '/home',
		name: 'home',
		component: () => import('../views/home.vue'),
		meta: {requiresAuth: true}, // 设置路由元信息，标记需要登录
	},
	{
		path: '/manageFriend',
		name: 'manageFriend',
		component: () => import('../views/manageFriend.vue'),
		meta: {requiresAuth: true}, // 设置路由元信息，标记需要登录
	},
	{
		path: '/addFriend',
		name: 'addFriend',
		component: () => import('../views/addFriend.vue'),
		meta: {requiresAuth: true}, // 设置路由元信息，标记需要登录
	},
	{
		path: '/manageGroup',
		name: 'manageGroup',
		component: () => import('../views/manageGroup.vue'),
		meta: {requiresAuth: true}, // 设置路由元信息，标记需要登录
	},
]
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

// 路由守卫
router.beforeEach((to, from, next) => {

	if (to.meta.requiresAuth && localStorage.getItem('token')===null) {
		// 如果需要登录而用户未登录，则跳转到登录页面
		next('/');
	} else {
		// 如果不需要登录或用户已登录，则继续导航
		next();
	}
});


export default router
