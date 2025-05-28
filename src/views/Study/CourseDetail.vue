<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const courseId = route.query.id

const allCourses = [
  { id: 1, title: 'Java 基础', desc: '面向对象、异常处理等', progress: 70, submodules: ['面向对象', '异常处理', '集合'] },
  { id: 2, title: '并发编程', desc: '线程、锁、并发工具类', progress: 50, submodules: ['线程基础', '锁机制', '并发工具类'] },
  { id: 3, title: 'Spring 框架', desc: 'IOC、AOP、事务管理', progress: 30, submodules: ['IOC', 'AOP', '事务管理'] },
  { id: 4, title: '数据库优化', desc: '索引、SQL调优、事务隔离级别', progress: 60, submodules: ['索引优化', 'SQL优化', '事务隔离'] },
  { id: 5, title: '操作系统', desc: '内存管理、进程线程、IO模型', progress: 20, submodules: ['内存管理', '进程线程', 'IO模型'] },
  { id: 6, title: '网络协议', desc: 'TCP/IP、HTTP、WebSocket', progress: 10, submodules: ['TCP/IP', 'HTTP', 'WebSocket'] },
]

const course = ref(null)

onMounted(() => {
  course.value = allCourses.find(c => c.id === parseInt(courseId))
})
</script>

<template>
  <div v-if="course" class="course-detail-layout">
    <!-- 左侧侧边栏 -->
    <el-aside class="sidebar">
      <h2>{{ course.title }}</h2>
      <p>{{ course.desc }}</p>
      <el-progress :percentage="course.progress" />
    </el-aside>

    <!-- 右侧子模块区域 -->
    <el-main class="submodules">
      <el-card
          v-for="(sub, index) in course.submodules"
          :key="index"
          class="submodule-card"
          shadow="hover"
      >
        <template #header>
          <h3>{{ sub }}</h3>
        </template>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <p>这里可以放 {{ sub }} 的介绍、进度或操作按钮</p>
          <el-button type="success">学习</el-button>
        </div>
      </el-card>
    </el-main>
  </div>
  <div v-else>
    <p>课程未找到</p>
  </div>
</template>

<style scoped>
.course-detail-layout {
  display: flex;
  padding: 20px;
}

.sidebar {
  width: 30%;
  height: 88vh;
  padding: 20px;
  background: #f9f9f9;
  border-right: 1px solid #ebeef5;
}

.submodules {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.submodule-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submodule-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
