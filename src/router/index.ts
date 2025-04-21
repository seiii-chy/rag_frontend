import {createRouter, createWebHashHistory} from "vue-router"

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        redirect: '/home',
    }, {
        path: '/home',
        redirect: '/homepage',
        component: () => import('../views/Home.vue'),
        children: [
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: () => import('../views/user/Dashboard.vue'),
                meta: {title: '个人信息'}
            },
            {
                path: '/homepage',
                name: 'HomePage',
                component: () => import('../views/HomePage/HomePage.vue'),
                meta: {title: 'AI检索'}
            },
            {
                path: '/pdfViewer',
                name: 'PDFViewer',
                component: () => import('../views/HomePage/PDFViewer.vue'),
                meta: {title: '文献查看'}
            },
            {
                path: '/exam',
                name: 'Exam',
                component: () => import('../views/Exam/Exam.vue'),
                meta: {title: '模拟面试'}
            },
            {
                path: '/study',
                name: 'Study',
                component: () => import('../views/Study/Study.vue'),
                meta: {title: '面试准备'}
            }
        ]
    }, {
        path: '/404',
        name: '404',
        component: () => import('../views/NotFound.vue'),
        meta: {title: '404'}
    }, {
        path: '/:catchAll(.*)',
        redirect: '/404'
    }]
})

// router.beforeEach((to, _, next) => {
//     const token: string | null = sessionStorage.getItem('token');
//     const role: string | null = sessionStorage.getItem('role')

//     if (to.meta.title) {
//         document.title = to.meta.title
//     }
//     next()
// })

export {router}
