import Vue from 'vue'
import Router from 'vue-router'
import Detail from '@/components/Detail'
import Form from '@/components/Form'
import Sign from '@/components/Sign'
import Success from '@/components/Success'
import StoreList from '@/components/store-list'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/detail/:actCode/:storeCode/:storeType',
            name: 'detail',
            component: Detail
        },
        {
            // sign签到还是报名 0 签到 | 1 报名
            path: '/enroll/:actCode/:storeCode/:storeType/:sign',
            name: 'enroll',
            component: Form
        },
        {
            path: '/sign/:actCode/:storeCode/:storeType',
            name: 'sign',
            component: Sign
        },
        {
            path: '/success/:actCode/:sign',
            name: 'success',
            component: Success
        },
        {
            path: '/store-list/:actCode',
            name: 'storeList',
            component: StoreList
        }
    ]
})
