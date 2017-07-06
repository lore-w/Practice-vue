import Vue from 'vue'
import Router from 'vue-router'
import Detail from '@/components/Detail'
import Form from '@/components/Form'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/detail/:actCode/:storeCode/:storeType',
            name: 'Detail',
            component: Detail
        },
        {
            path: '/form/:actCode/:storeCode/:storeType/:needLogin',
            name: 'Form',
            component: Form
        }
    ]
})
