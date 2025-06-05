<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getDocumentUrl } from '../../api/search.ts'
import { useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
import {fetchKnowledgeFilesByCategory} from "../../api/knowledge.ts";

interface Submodule {
  name: string
  desc: string
}

interface Course {
  id: number
  title: string
  desc: string
  level: string
  submodules: Submodule[]
}

const route = useRoute()
const router = useRouter()

const allCourses: Course[] = [
  {
    id: 1,
    title: 'Java 基础',
    desc: '掌握 Java 的基本语法、面向对象编程、异常处理等，为进阶打好基础。',
    level: '基础',
    submodules: [
      { name: '面向对象', desc: '类、继承、多态、接口等核心概念' },
      { name: '异常处理', desc: 'try-catch、throws、Exception 体系' },
      { name: '集合', desc: 'List、Set、Map、遍历与使用场景' }
    ]
  },
  {
    id: 2,
    title: '并发编程',
    desc: '学习多线程基础、并发工具与锁机制，构建高并发能力。',
    level: '进阶',
    submodules: [
      { name: '线程基础', desc: 'Thread、Runnable、线程生命周期' },
      { name: '锁机制', desc: 'synchronized、ReentrantLock、死锁问题' },
      { name: '并发工具类', desc: 'CountDownLatch、Semaphore、Executor 框架' }
    ]
  },
  {
    id: 3,
    title: 'Spring 框架',
    desc: '掌握 Spring 的核心机制，如 IOC 容器、AOP 拦截与声明式事务。',
    level: '进阶',
    submodules: [
      { name: 'IOC', desc: '依赖注入、Bean 生命周期、配置方式' },
      { name: 'AOP', desc: '切面、通知类型、@Aspect 注解' },
      { name: '事务管理', desc: '声明式事务传播机制与隔离级别' }
    ]
  },
  {
    id: 4,
    title: '数据库优化',
    desc: '深入理解索引机制、SQL 性能调优以及事务隔离级别，提升数据库性能。',
    level: '高级',
    submodules: [
      { name: '索引优化', desc: 'B+ 树索引、覆盖索引、联合索引、最左前缀原则' },
      { name: 'SQL优化', desc: '执行计划分析、慢查询定位、查询重写技巧' },
      { name: '事务隔离', desc: '四种隔离级别、幻读/脏读/不可重复读、MVCC' }
    ]
  },
  {
    id: 5,
    title: '操作系统',
    desc: '掌握操作系统的核心机制，如内存管理、进程线程模型和 I/O 模型。',
    level: '基础',
    submodules: [
      { name: '内存管理', desc: '分页、分段、虚拟内存、内存置换算法' },
      { name: '进程线程', desc: '进程/线程区别、上下文切换、进程通信方式' },
      { name: 'IO模型', desc: '同步与异步、阻塞与非阻塞、select/poll/epoll' }
    ]
  },
  {
    id: 6,
    title: '网络协议',
    desc: '掌握计算机网络各层协议，深入理解 TCP/IP、HTTP 及 WebSocket 通信机制。',
    level: '基础',
    submodules: [
      { name: 'TCP/IP', desc: '三次握手、四次挥手、IP 分片与路由' },
      { name: 'HTTP', desc: '请求方法、状态码、Cookie/Session、HTTPS' },
      { name: 'WebSocket', desc: '建立握手、全双工通信、心跳机制与断线重连' }
    ]
  }
]

const course = ref<Course | null>(null)
const selectedSubmodule = ref<Submodule | null>(null)
const docs = ref<{file_name : string}[]>([])
const loading = ref(false)

onMounted(async () => {
  const found = allCourses.find(c => c.id === Number(route.query.id))
  if (found) {
    course.value = found
    selectedSubmodule.value = found.submodules[0]
    await fetchDocsBySubmodule(found.submodules[0])
  }
})

async function fetchDocsBySubmodule(sub: Submodule) {
  loading.value = true
  docs.value = []

  try {
    const result = await fetchKnowledgeFilesByCategory(sub.name)
    console.log(result)
    docs.value = result
  } catch (e) {
    ElMessage.error('获取文档失败')
  } finally {
    loading.value = false
  }
}

function selectSubmodule(sub: Submodule) {
  selectedSubmodule.value = sub
  fetchDocsBySubmodule(sub)
}

function getFileColor(name: string): string {
  if (name.endsWith('.pdf')) return '#f56c6c'
  if (name.endsWith('.md')) return '#409EFF'
  return '#909399'
}

async function handlePreview(fileName: string) {
  const url = await getDocumentUrl(fileName)
  if (fileName.endsWith('.pdf')) {
    await router.push({path: '/pdfViewer', query: {url: encodeURIComponent(url)}})
  } else if (fileName.endsWith('.md')) {
    await router.push({path: '/mdViewer', query: {url: encodeURIComponent(url)}})
  } else {
    // 默认处理
    ElMessage.warning('暂不支持该格式预览')
  }
}

</script>

<template>
  <div v-if="course" class="course-detail-layout">
    <!-- 左侧：课程信息 + 子模块导航 -->
    <el-aside class="sidebar">
      <div class="course-header">
        <h2>
          {{ course.title }}
          <el-tag size="small" type="success" style="margin-left: 8px;">{{ course.level }}</el-tag>
        </h2>
        <p class="course-desc">{{ course.desc }}</p>
      </div>
      <el-divider />
      <h4 style="margin-bottom: 10px;">子模块</h4>
      <el-menu class="submodule-list" :default-active="selectedSubmodule?.name" @select="(name) => {
        const sub = course?.submodules.find(s => s.name === name)
        if (sub) selectSubmodule(sub)
      }">
        <el-menu-item
            v-for="sub in course.submodules"
            :key="sub.name"
            :index="sub.name"
        >
          {{ sub.name }}
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧：子模块 -->
    <el-main class="submodules">
      <h3>{{ selectedSubmodule?.name }}</h3>
      <p class="sub-desc">{{ selectedSubmodule?.desc }}</p>

      <el-skeleton :loading="loading" animated :rows="6">
        <div class="doc-list">
          <div v-for="doc in docs" :key="doc.file_name" class="doc-item">
            <el-icon :style="{ color: getFileColor(doc.file_name) }" class="doc-icon">
              <Document />
            </el-icon>
            <el-tooltip :content="doc.file_name" placement="top">
              <span class="doc-name">{{ doc.file_name }}</span>
            </el-tooltip>
            <el-button size="default" type="primary" @click="handlePreview(doc.file_name)" style="margin-right: 10%">阅读</el-button>
          </div>
        </div>
      </el-skeleton>
    </el-main>
  </div>

  <div v-else style="padding: 40px; text-align: center;">
    <el-empty description="课程未找到" />
  </div>
</template>

<style scoped>
.course-detail-layout {
  display: flex;
  min-height: 90vh;
  background: #f7f8fa;
}

.sidebar {
  width: 30%;
  background: #fff;
  padding: 20px;
  border-right: 1px solid #ebeef5;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.03);
  min-width: 280px;
}

.course-header {
  margin-bottom: 20px;
}

.course-desc {
  font-size: large;
  color: #666;
  margin-top: 8px;
  line-height: 1.6;
}

.submodule-list {
  border-right: none;
}

.submodules {
  flex: 1;
  padding: 30px;
  min-width: 320px;
}

.sub-desc {
  margin-bottom: 20px;
  color: #666;
}

.doc-list {
  max-width: 100%;
  width: 100%;
}

.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  margin-left: 30px;
}

.doc-icon {
  font-size: 22px;
  margin-right: 12px;
  flex-shrink: 0;
}

.doc-name {
  flex-grow: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: default;
  user-select: none;
  margin-right: 20px;
}
</style>
