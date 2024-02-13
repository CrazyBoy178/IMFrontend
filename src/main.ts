import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import pinia from './store'
import router from './router'
import axios from 'axios'
import 'element-plus/dist/index.css'
import * as ELementPLusIconsVue from '@element-plus/icons-vue'

const elementApp = createApp(App)
for (const [key, component] of Object.entries(ELementPLusIconsVue)) {
	elementApp.component(key, component)
}
elementApp.use(pinia)
elementApp.use(router)
elementApp.mount('#app')

const instance = axios.create({
	baseURL: 'http://localhost:8080',
	// 在这里可以添加其他 Axios 配置
});

elementApp.config.globalProperties.$axios = instance;
