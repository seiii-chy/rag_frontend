<template>
  <el-button type="primary" @click="router.back()" class="returnButton">返回</el-button>
  <div style="padding: 20px; position: relative; height: 85vh;">
    <h2>文献预览</h2>
    <div ref="containerRef" class="pdfViewerContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { PDFViewer, EventBus } from 'pdfjs-dist/web/pdf_viewer'
import 'pdfjs-dist/web/pdf_viewer.css'
import {router} from "../../router/index.ts";

const route = useRoute()
const pdfUrl = decodeURIComponent(route.query.url || '')
const containerRef = ref(null)

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.js',
    import.meta.url
).toString()

onMounted(async () => {
  if (!pdfUrl) return

  const container = containerRef.value
  if (!container) return

  try {
    container.innerHTML = `<div class="pdfViewer"></div>`

    const loadingTask = pdfjsLib.getDocument(pdfUrl)
    const pdf = await loadingTask.promise

    const eventBus = new EventBus();

    const viewer = new PDFViewer({
      container: container,
      viewer: container.querySelector('.pdfViewer'),
      eventBus: eventBus,
    })
    viewer.setDocument(pdf)
  } catch (err) {
    console.error('加载 PDF 出错:', err)
  }
})
</script>

<style scoped>
.returnButton{
  position: relative;
  width: 5%;
  height: auto;
  left: 20px;
  top: 10px;
}

.pdfViewerContainer {
  position: absolute;
  top: 10px; left: 0; right: 0; bottom: 0;
  overflow: auto;
  border: 1px solid #ccc;
  background: #fff;
}
.pdfViewer {
  min-height: 100vh;
}
</style>