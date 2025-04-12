<script setup>
import { ref } from 'vue'
import { searchWithAI } from '../../api/search'

const models = ['GPT-4', 'Claude 3', 'Gemini Pro', '自定义模型']
const selectedModel = ref(models[0])

const searchInput = ref('')
const messages = ref([])
const history = ref([])
const activeHistory = ref(null)
const references = ref([])

const handleSearch = async () => {
  if (!searchInput.value.trim()) return
  const query = searchInput.value.trim()

  // 添加历史记录
  history.value.unshift({ query })
  activeHistory.value = 0

  // 用户消息显示
  messages.value.push({ type: 'user', content: query })

  try {
    const res = await searchWithAI({
      query,
      top_k: 5,
      model: selectedModel.value,
    })

    messages.value.push({ type: 'ai', content: res.answer })

    references.value = res.retrieved_docs.map(doc => ({
      title: doc.question,
      source: `匹配度: ${doc.score.toFixed(2)}`,
    }))
  } catch (err) {
    messages.value.push({
      type: 'ai',
      content: '抱歉，AI 搜索失败，请稍后再试。',
    })
    console.error(err)
  }

  searchInput.value = ''
}

const changeModel = (val) => {
  console.log('当前选择模型:', val)
}

const selectHistory = (index) => {
  activeHistory.value = index
  searchInput.value = history.value[index].query
  handleSearch()
}
</script>

<template>
  <el-container class="ai-search-container">
    <!-- 左侧：搜索历史 -->
    <el-aside width="15%" class="history-panel">
      <!-- 顶部工具栏：模型选择 -->
      <el-header class="toolbar">
        <el-select v-model="selectedModel" placeholder="选择模型" @change="changeModel">
          <el-option
              v-for="model in models"
              :key="model"
              :label="model"
              :value="model"
          />
        </el-select>
      </el-header>
      <h3>搜索历史</h3>
      <el-menu :default-active="activeHistory" class="history-menu">
        <el-menu-item
            v-for="(item, index) in history"
            :key="index"
            @click="selectHistory(index)"
        >
          {{ item.query }}
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 中间：AI 聊天窗口 -->
    <el-container>
      <!-- 聊天内容区 -->
      <el-main class="chat-main">
        <div class="chat-box" ref="chatBox">
          <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message', msg.type]"
          >
            <div class="message-content">{{ msg.content }}</div>
          </div>
        </div>

        <!-- 输入框 -->
        <div class="chat-input-bar">
          <el-input
              v-model="searchInput"
              placeholder="输入你的问题或关键词..."
              type="textarea"
              :rows="3"
              @keyup.enter.native="handleSearch"
          />
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
        </div>
      </el-main>
    </el-container>

    <!-- 右侧：文献展示 -->
    <el-aside width="20%" class="reference-panel">
      <h3>参考文献</h3>
      <el-card
          v-for="(ref, index) in references"
          :key="index"
          class="reference-card"
          shadow="hover"
      >
        <p><strong>{{ ref.title }}</strong></p>
        <p class="ref-meta">{{ ref.source }}</p>
      </el-card>
    </el-aside>
  </el-container>
</template>

<style scoped>
.ai-search-container {
  height: 92vh;
}

.toolbar {
  background-color: #f4f4f5;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fdfdfd;
  padding: 20px;
  height: 100%;
}

.chat-box {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 80%;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
}

.message.user {
  align-self: flex-end;
  background: #4caf50;
  color: white;
}

.message.ai {
  align-self: flex-start;
  background: #e1e1e1;
  color: black;
}

.chat-input-bar {
  display: flex;
  gap: 10px;
}

.history-panel {
  background: #fafafa;
  padding: 10px;
  border-right: 1px solid #ddd;
}

.history-menu {
  border: none;
  background: none;
}

.reference-panel {
  background: #fafafa;
  padding: 10px;
  border-left: 1px solid #ddd;
  overflow-y: auto;
}

.reference-card {
  margin-bottom: 10px;
}

.ref-meta {
  font-size: 12px;
  color: #666;
}
</style>

