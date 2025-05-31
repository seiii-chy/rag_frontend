import {createRouter, createWebHashHistory} from "vue-router"

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        redirect: '/login',
    }, {
        path: '/login',
        component: () => import('../views/user/Login.vue'),
        meta: {title: '用户登录'}
    }, {
        path: '/register',
        component: () => import('../views/user/Register.vue'),
        meta: {title: '用户注册'}
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
                path: '/mdViewer',
                name: 'MarkdownViewer',
                component: () => import('../views/HomePage/MdViewer.vue'),
                meta: {title: '文献查看'}
            },
            {
                path: '/interview',
                name: 'Interview',
                component: () => import('../views/Interview/interview.vue'),
                meta: {title: '模拟面试'}
            },
            {
                path: '/study',
                name: 'Study',
                component: () => import('../views/Study/Study.vue'),
                meta: {title: '面试准备'}
            },
            {
                path: '/courseDetail',
                name: 'CourseDetail',
                component: () => import('../views/Study/CourseDetail.vue'),
                meta: {title: '课程信息'}
            },
            {
                path: '/knowledgeBase',
                name: 'KnowledgeBase',
                component: () => import('../views/KnowledgeBase/KnowledgeBase.vue'),
                meta: {title: '管理知识库'}
            },
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

router.beforeEach((to, _, next) => {
    const token: string | null = sessionStorage.getItem('token');
    const role: string | null = sessionStorage.getItem('role')

    if (to.meta.title) {
        document.title = to.meta.title
    }

    if (token) {
        if (to.meta.permission) {
            if (to.meta.permission.includes(role!)) {
                next()
            } else {
                next('/404')
            }
        } else {
            next()
        }
    } else {
        if (to.path === '/login') {
            next();
        } else if (to.path === '/register') {
            next()
        } else {
            next('/login')
            // next()
        }
    }
})

export {router}
