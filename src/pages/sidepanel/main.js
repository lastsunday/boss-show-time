import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import sidepanel from './App.vue'
import  router  from "./router";
import { initBridge } from '../../api/common';

async function init(){
    await initBridge();
    const app = createApp(sidepanel)
    app.use(ElementPlus)
    app.use(router)
    app.mount('#app');
}
init();