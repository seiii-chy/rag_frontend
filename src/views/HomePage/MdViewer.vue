<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { router } from '../../router'
import Vue3MarkdownIt from 'vue3-markdown-it'

const route = useRoute()
const markdownContent = ref('')
const fileUrl = decodeURIComponent(route.query.url || '')

onMounted(async () => {
  if (!fileUrl) return
  try {
    const res = await fetch(fileUrl)
    markdownContent.value = await res.text()
  } catch (err) {
    console.error('加载 Markdown 出错:', err)
    markdownContent.value = '# 加载失败 😢'
  }
})
</script>

<template>
  <el-button type="primary" @click="router.back()" class="returnButton">返回</el-button>
  <div class="markdown-viewer-container">
    <h2>文献预览</h2>
    <div class="markdown-content">
      <Vue3MarkdownIt :source="markdownContent" />
    </div>
  </div>
</template>

<style scoped>
.returnButton {
  position: relative;
  width: 5%;
  left: 20px;
  top: 10px;
}

.markdown-viewer-container {
  padding: 20px;
  position: relative;
  height: 84vh;
  top: 10px;
  overflow-y: auto;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
}

.markdown-content {
  background-color: white;
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  font-size: 16px;
  line-height: 1.6;
}
</style>
