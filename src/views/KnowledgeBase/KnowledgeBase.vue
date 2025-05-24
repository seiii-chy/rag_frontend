<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { fetchKnowledgeFiles, uploadKnowledgeFile } from '../../api/knowledge.ts'
import type { AxiosError } from 'axios'
import {useRouter} from "vue-router";
import {getDocumentUrl} from "../../api/search.ts";

const router = useRouter()

const fileList = ref<{ name: string }[]>([])
const uploading = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = 5
const activeFile = ref('')
const selectedFile = ref('')

const filteredFiles = computed(() =>
    fileList.value.filter(file =>
        file.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
)

const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredFiles.value.slice(start, start + pageSize)
})

function handlePageChange(page: number) {
  currentPage.value = page
}

function handleFileSelect(fileName: string) {
  activeFile.value = fileName
  selectedFile.value = fileName
}

function handleDelete(){

}

const loadFiles = async () => {
  try {
    fileList.value = (await fetchKnowledgeFiles()).map((name: string) => ({ name }))
  } catch (err) {
    ElMessage.error('获取文件列表失败')
  }
}

const uploadFile = async (options: any): Promise<void> => {
  const { file } = options
  try {
    uploading.value = true
    const res = await uploadKnowledgeFile(file)
    console.log(res)
    if (res.status === 200 && res.data.success) {
      ElMessage.success(`上传成功：${res.data.saved_files.join(', ')}`)
      await loadFiles()
    } else {
      ElMessage.error(res.data?.error || '上传失败')
    }
  } catch (err) {
    console.log(123)
    const error = err as AxiosError
    const errorMsg = (error.response?.data as any)?.error || '上传失败'
    ElMessage.error(errorMsg)
  } finally {
    uploading.value = false
  }
}

function getFileColor(name: string): string {
  if (name.endsWith('.pdf')) return '#f56c6c'
  if (name.endsWith('.md')) return '#409EFF'
  return '#909399'
}

async function previewFile(name: string) {
  if (name.endsWith('.pdf')) {
    const pdfUrl = await getDocumentUrl(name);
    await router.push({
      path: '/pdfViewer',
      query: {url: encodeURIComponent(pdfUrl)}
    })
  } else if (name.endsWith('.md')) {
    // TODO
  }
}

onMounted(() => {
  loadFiles()
})
</script>

<template>
  <el-main class="container">
    <div class="title_box"><p>知识库管理</p></div>
    <div class="outer_border horizontal-layout">
      <!-- 左侧栏 -->
      <div class="left_div">
        <!-- 上传 -->
        <p class="upload_title">上传文档（支持 .pdf / .md）</p>
        <el-form class="upload_box">
          <el-form-item>
            <el-upload
                class="upload-demo"
                drag
                :http-request="uploadFile"
                :show-file-list="false"
                accept=".pdf,.md"
            >
              <div class="el-upload__text">拖拽或点击上传文件</div>
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>

        <!-- 已上传文档 -->
        <el-card class="uploaded-list" shadow="never">
          <template #header><b>📁 已上传文档</b></template>
          <div style="display: flex; align-items: center;">
            <el-text style="margin-right: 8px; white-space: nowrap;">搜索文件名：</el-text>
            <el-input
                v-model="searchText"
                placeholder="搜索文件名"
                size="default"
                clearable
                prefix-icon="Search"
                class="search-input"
            />
          </div>

          <div v-if="filteredFiles.length === 0" class="no-files">暂无文件</div>
          <el-scrollbar class="file-scroll">
            <el-menu
                :default-active="activeFile"
                class="file-list"
                @select="handleFileSelect"
            >
              <el-menu-item
                  v-for="item in paginatedFiles"
                  :key="item.name"
                  :index="item.name"
              >
                <el-icon :size="36" class="file-icon" :style="{ color: getFileColor(item.name) }" @click="previewFile(item.name)">
                  <Document />
                </el-icon>
                <span>{{ item.name }}</span>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>
          <div style="display: flex; justify-content: center; width: 100%;">
            <el-pagination
                background
                layout="prev, pager, next"
                :total="filteredFiles.length"
                :page-size="pageSize"
                :current-page="currentPage"
                @current-change="handlePageChange"
                small
            />
          </div>

        </el-card>
      </div>

      <div class="divider"></div>

      <!-- 右侧详情 -->
      <div class="right_div">
        <el-card v-if="selectedFile" class="preview-card">
          <template #header><b>📄 文档详情</b></template>
          <p><b>文件名：</b>{{ selectedFile }}</p>
          <p><b>全名：</b>{{ selectedFile }}</p>
          <el-button
              type="danger"
              icon="Delete"
              @click="handleDelete"
              size="small"
          >删除文档</el-button>
        </el-card>
        <el-empty v-else description="请选择左侧文档查看详情" />
      </div>
    </div>
  </el-main>
</template>


<style scoped>
.container {
  padding: 20px;
}
.title_box p {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}
.outer_border {
  display: flex;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
}
.left_div {
  width: 35%;
  height: 78vh;
  padding-right: 20px;
}
.upload-demo{
  width: 100%;
}
.divider {
  width: 1px;
  background-color: #e4e7ed;
  margin: 0 20px;
}
.right_div {
  width: 65%;
  height: 78vh;
}
.upload_title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}
.upload_box {
  background-color: #fafafa;
  padding: 10px;
  border-radius: 6px;
}

.file-icon {
  margin-bottom: 8px;
}

.horizontal-layout {
  display: flex;
  gap: 16px;
}

.uploaded-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-scroll {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}

.search-input {
  margin-bottom: 8px;
  background: white;
  border: 1px solid #dcdfe6; /* Element Plus 默认边框色 */
  border-radius: 4px;
  color: #000; /* 黑色文字 */
  padding: 4px 11px; /* 增加内边距，提升可读性 */
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.05);
}

.search-input ::v-deep(.el-input__inner) {
  color: #000;
  background: white;
  padding: 4px 11px;
}


</style>