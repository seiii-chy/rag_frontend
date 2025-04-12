<script setup>
import { ref } from 'vue'
import { ElCollapseTransition } from 'element-plus'
import { useRouter } from 'vue-router'

const isFilterVisible = ref(false)
const router = useRouter()

const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value
}

const knowledgePoints = ref([
  { title: 'Java 基础', desc: '面向对象、异常处理等', id: 1 },
  { title: '并发编程', desc: '线程、锁、并发工具类', id: 2 },
  { title: 'Spring 框架', desc: 'IOC、AOP、事务管理', id: 3 },
  { title: '数据库优化', desc: '索引、SQL调优、事务隔离级别', id: 4 },
  { title: '操作系统', desc: '内存管理、进程线程、IO模型', id: 5 },
  { title: '网络协议', desc: 'TCP/IP、HTTP、WebSocket', id: 6 },
])

const goToCourse = (id) => {
  router.push(`/course/${id}`)
}
</script>

<template>
  <div class="interview-prep-page">
    <!-- 筛选按钮 -->
    <div class="filter-toggle">
      <el-button @click="toggleFilter" type="primary" plain>
        {{ isFilterVisible ? '收起筛选' : '展开筛选' }}
      </el-button>
    </div>

    <!-- 筛选面板 -->
    <el-collapse-transition>
      <div v-show="isFilterVisible" class="filter-panel">
        <el-form inline>
          <el-form-item label="分类">
            <el-select placeholder="请选择分类" style="width: 180px">
              <el-option label="后端" value="backend" />
              <el-option label="前端" value="frontend" />
              <el-option label="基础知识" value="base" />
            </el-select>
          </el-form-item>
          <el-form-item label="难度">
            <el-select placeholder="请选择难度" style="width: 180px">
              <el-option label="初级" value="easy" />
              <el-option label="中级" value="medium" />
              <el-option label="高级" value="hard" />
            </el-select>
          </el-form-item>
          <el-button type="primary">筛选</el-button>
        </el-form>
      </div>
    </el-collapse-transition>

    <!-- 模块标题 -->
    <div class="section-title">
      <h2>按模块学习</h2>
      <el-divider />
    </div>

    <!-- 卡片区域 -->
    <div class="card-grid">
      <el-card
          v-for="item in knowledgePoints"
          :key="item.id"
          class="knowledge-card"
          shadow="hover"
          @click="goToCourse(item.id)"
      >
        <template #header>
          <h3>{{ item.title }}</h3>
        </template>
        <p>{{ item.desc }}</p>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.interview-prep-page {
  padding: 20px;
  background-color: #fafafa;
}

.filter-toggle {
  text-align: right;
  margin-bottom: 10px;
}

.filter-panel {
  background: #f4f4f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.section-title {
  margin-bottom: 20px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.knowledge-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 160px;
  font-size: 16px;
  padding: 20px;
}

.knowledge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
