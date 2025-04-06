<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const courses = ref([
  { title: 'LeetCode 热题 100', desc: '精选最受欢迎的100题', color: '#7e5bef', id: 1 },
  { title: '面试经典 150 题', desc: '覆盖所有知识点', color: '#00b894', id: 2 },
  { title: '动态规划（基础版）', desc: '让入门更简单', color: '#00cec9', id: 3 },
])

const categories = ['推荐', '算法', '数据库', '题目交流', '职业发展', '竞赛', '前端', '后端']

const posts = ref([
  {
    id: 101,
    title: '13天突破 C 语言',
    content: '打破传统学习方式，带你快速入门 C 语言',
    image: 'https://fakeimg.pl/120x80/?text=C',
    author: 'LeetCode',
  },
  {
    id: 102,
    title: '2000积分的会员，速通学习计划！',
    content: '这个会员太香了！',
    author: 'calmyself',
  },
  {
    id: 103,
    title: '校招内推｜暑期实习内推',
    content: '涵盖投递方式、岗位分类和薪资待遇汇总',
    author: 'Nice VolhardoHQ',
  },
])

const goToCourse = (id) => {
  router.push(`/course/${id}`)
}

const goToPost = (id) => {
  router.push(`/post/${id}`)
}
</script>

<template>
  <div class="home-page">
    <section class="course-section">
      <h2 class="section-title">学习计划</h2>
      <div class="course-list">
        <el-card
            v-for="course in courses"
            :key="course.id"
            class="course-card"
            :style="{ backgroundColor: course.color }"
            shadow="hover"
            @click="goToCourse(course.id)"
        >
          <h3 class="card-title">{{ course.title }}</h3>
          <p class="card-desc">{{ course.desc }}</p>
        </el-card>
      </div>
    </section>

    <div class="category-nav">
      <el-button
          v-for="cat in categories"
          :key="cat"
          type="text"
          class="category-btn"
      >{{ cat }}</el-button>
    </div>

    <section class="post-section">
      <h2 class="section-title">推荐帖子</h2>
      <div class="post-list">
        <el-card
            v-for="post in posts"
            :key="post.id"
            class="post-card"
            shadow="hover"
            @click="goToPost(post.id)"
        >
          <div class="post-content">
            <div class="post-text">
              <h3>{{ post.title }}</h3>
              <p class="author">by {{ post.author }}</p>
              <p>{{ post.content }}</p>
            </div>
            <img v-if="post.image" :src="post.image" alt="preview" class="post-image" />
          </div>
        </el-card>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  padding: 20px;
  color: #fff;
  min-height: 100vh;
}

.section-title {
  font-size: 20px;
  margin-bottom: 12px;
  font-weight: bold;
}

.course-section {
  margin-bottom: 30px;
}

.course-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.course-card {
  width: 240px;
  color: white;
  cursor: pointer;
  border-radius: 12px;
}

.card-title {
  font-size: 16px;
  margin-bottom: 5px;
}

.card-desc {
  font-size: 13px;
  opacity: 0.9;
}

.category-nav {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 30px;
  padding: 10px 0;
  border-bottom: 1px solid #444;
}

.category-btn {
  color: #ccc;
}

.category-btn:hover {
  color: #fff;
  text-decoration: underline;
}

.post-section {
  margin-bottom: 60px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: #a8e9ff;
  cursor: pointer;
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s;
}

.post-card:hover {
  background: #aaaaaa;
}

.post-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.post-text {
  max-width: 70%;
}

.author {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 5px;
}

.post-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
