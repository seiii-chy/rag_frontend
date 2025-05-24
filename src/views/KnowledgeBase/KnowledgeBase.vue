<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { fetchKnowledgeFiles, uploadKnowledgeFile } from '../../api/knowledge.ts'
import type { AxiosError } from 'axios'

const fileList = ref<{ name: string }[]>([])
const uploading = ref(false)

const pageSize = 5
const currentPage = ref(1)

const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return fileList.value.slice(start, start + pageSize)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const loadFiles = async () => {
  try {
    fileList.value = (await fetchKnowledgeFiles()).map((name: string) => ({ name }))
  } catch (err) {
    ElMessage.error('获取文件列表失败')
  }
}

const uploadFile = async (options: any) => {
  const { file } = options
  try {
    uploading.value = true
    await uploadKnowledgeFile(file)
    ElMessage.success('上传成功')
    await loadFiles()
  } catch (err) {
    const error = err as AxiosError
    const errorMsg = (error.response?.data as any)?.error || '上传失败'
    ElMessage.error(errorMsg)
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  loadFiles()
})
</script>

<template>
  <el-main class="container">
    <div class="title_box">
      <p>知识库管理</p>
    </div>
    <div class="outer_border">
      <!-- 左侧：上传文件 -->
      <div class="left_div">
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
              <div class="el-upload__text">
                拖拽或点击上传文件
              </div>
              <el-icon class="el-icon--upload">
                <UploadFilled />
              </el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>

      <!-- 中间分割线 -->
      <div class="divider"></div>

      <!-- 右侧：文件列表 -->
      <div class="right_div">
        <el-card class="file_list_card" shadow="hover">
          <template #header>
            <span class="text-lg font-semibold">已有文件</span>
          </template>

          <el-empty v-if="paginatedFiles.length === 0" description="暂无文件" />

          <div v-else class="file-list-wrapper">
            <div
                v-for="(item, index) in paginatedFiles"
                :key="index"
                class="file-item"
            >
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ item.name }}</span>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
                background
                layout="prev, pager, next"
                :total="fileList.length"
                :page-size="pageSize"
                :current-page="currentPage"
                @current-change="handlePageChange"
                small
            />
          </div>
        </el-card>
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
.file_list_card {
  background-color: #fff;
  border-radius: 6px;
}
.file-list-wrapper {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.file-item {
  display: flex;
  align-items: center;
}
.file-item .el-icon {
  margin-right: 8px;
}
.file-name {
  font-size: 14px;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

</style>