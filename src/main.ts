import { createApp } from 'vue'
import {router} from './router'
import App from './App.vue'
import axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import Vue3MarkdownIt from 'vue3-markdown-it';

axios.defaults.baseURL = ("http://172.29.4.151:5000")
// axios.defaults.baseURL = ("http://localhost:5000")
axios.defaults.timeout = 60000;
axios.defaults.withCredentials = true

createApp(App).use(ElementPlus).use(Vue3MarkdownIt).use(router).mount('#app')
