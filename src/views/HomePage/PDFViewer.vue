<script setup>
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'

const route = useRoute()
const pdfUrl = ref(decodeURIComponent(route.query.url || ''))

onMounted(() => {
  console.log('加载 PDF：', pdfUrl.value)
})
</script>

<template>
  <div style="padding: 20px">
    <h2>文献预览</h2>
    <iframe
        v-if="pdfUrl"
        :src="pdfUrl"
        style="width: 100%; height: 90vh; border: none"
    />
    <p v-else>未指定 PDF 链接</p>
  </div>
</template>
