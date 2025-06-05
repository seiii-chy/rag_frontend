<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const knowledgePoints = ref([
  { title: 'Java 基础', desc: '面向对象、异常处理等', id: 1, level: '基础' },
  { title: '并发编程', desc: '线程、锁、并发工具类', id: 2, level: '进阶' },
  { title: 'Spring 框架', desc: 'IOC、AOP、事务管理', id: 3, level: '进阶' },
  { title: '数据库优化', desc: '索引、SQL调优、事务隔离级别', id: 4, level: '高级' },
  { title: '操作系统', desc: '内存管理、进程线程、IO模型', id: 5, level: '基础' },
  { title: '网络协议', desc: 'TCP/IP、HTTP、WebSocket', id: 6, level: '基础' },
])

const generalStudy = ref({ title: '综合学习', desc: '计算机基本知识、中间件及工具使用、面试技巧、Java经典书籍、Java开发、个人笔记', id: 7, level: '高级' });

const goToCourse = (item: typeof knowledgePoints.value[number]) => {
  router.push({
    path: '/courseDetail',
    query: {
      id: item.id,
      title: item.title,
      desc: item.desc,
      level: item.level,
    },
  })
}

const slides = ref([
  {
    title: 'Java 基础 → Spring 框架',
    desc: '掌握 Java 面向对象基础，再深入理解 IOC/AOP 等核心概念。',
  },
  {
    title: '并发编程 → 操作系统',
    desc: '了解线程与锁机制，结合 OS 的调度与内存管理思维。',
  },
  {
    title: '数据库优化 → 网络协议',
    desc: '从 SQL 优化出发，深入理解服务间通信协议如 HTTP 和 TCP/IP。',
  }
])

</script>

<template>
  <div class="interview-prep-page">
    <el-carousel :interval="5000" type="card" height="160px" class="guide-carousel">
      <el-carousel-item v-for="(item, index) in slides" :key="index">
        <div class="carousel-content">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </el-carousel-item>
    </el-carousel>
    <div class="section-title">
      <h2 style="white-space: nowrap;">综合学习</h2>
      <el-divider />
    </div>
    <div class="card-grid">
      <el-card
          class="knowledge-card"
          shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <h3>{{ generalStudy.title }}</h3>
            <el-tag type="success" size="small">{{ generalStudy.level }}</el-tag>
          </div>
        </template>
        <p>{{ generalStudy.desc }}</p>
        <el-button type="primary" size="small" @click="goToCourse(generalStudy)">开始学习</el-button>
      </el-card>
    </div>
    <div class="section-title">
      <h2 style="white-space: nowrap;">学习模块</h2>
      <el-divider />
    </div>

    <div class="card-grid">
      <el-card
          v-for="item in knowledgePoints"
          :key="item.id"
          class="knowledge-card"
          shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <h3>{{ item.title }}</h3>
            <el-tag type="success" size="small">{{ item.level }}</el-tag>
          </div>
        </template>
        <p>{{ item.desc }}</p>
        <el-button type="primary" size="small" @click="goToCourse(item)">开始学习</el-button>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.interview-prep-page {
  padding: 20px;
  background-color: #f9f9f9;
}

.guide-carousel {
  margin-bottom: 30px;
  border-radius: 10px;
  overflow: hidden;
}

.carousel-content {
  padding: 20px;
  color: #fff;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.carousel-content h3 {
  margin: 0 0 8px;
  font-size: 20px;
}

.carousel-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.section-title {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 固定三列 */
  gap: 24px;
}

.knowledge-card {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;
}

.knowledge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.knowledge-card p {
  margin: 10px 0 16px;
  color: #666;
  font-size: 14px;
}

</style>
