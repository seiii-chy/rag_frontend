<script setup>
import { ref, nextTick } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

// 模拟数据
const userMessage = ref('')
const messages = ref([
  { content: '请介绍一下Java的并发实现机制？', type: 'ai' },
])

// 模拟发送方法
const sendMessage = async () => {
  if (userMessage.value.trim()) {
    messages.value.push({ content: userMessage.value, type: 'user' })
    let msg = userMessage.value
    userMessage.value = ''

    await nextTick(() => {
      const container = document.querySelector('.chat-messages')
      container.scrollTop = container.scrollHeight
    })

    // 模拟 AI 回复
    setTimeout(() => {
      messages.value.push({
        content: 'Java并发机制主要依赖于线程、synchronized、volatile、线程池、Lock等工具。',
        type: 'ai',
      })
    }, 500)
  }
}
</script>

<template>
  <el-container class="exam-container">
    <el-container class="exam-sidebar">
      <el-aside width="100%" class="aside-panel">
        <el-button type="primary" class="full-width">+ 新建面试</el-button>
        <div class="interview-list">
          <div class="interview-section">
            <p>今天</p>
            <el-button class="full-width" plain>Java面试模拟</el-button>
          </div>
          <div class="interview-section">
            <p>三天前</p>
            <el-button class="full-width" plain>项目介绍场景</el-button>
          </div>
        </div>
      </el-aside>
    </el-container>

    <el-container class="exam-main">
      <div class="chat-messages">
        <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message', message.type]"
        >
          <div class="message-content">
            {{ message.content }}
            <span
                v-if="message.type === 'ai'"
                class="reference-answer"
            >
              参考答案
            </span>
          </div>
        </div>
      </div>

      <div class="chat-footer">
        <div class="chat-input">
          <el-input
              v-model="userMessage"
              placeholder="请输入你的回答"
              type="textarea"
              :rows="5"
              class="input-box"
              @keyup.enter="sendMessage"
          />
          <el-button type="primary" circle @click="sendMessage">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>

        <div class="reply-panel">
          <el-button type="text" class="reference-button">参考答案</el-button>
          <div class="reply-list">
            <p class="reply-title">常用</p>
            <p class="reply-item">1. 抱歉，我不太清楚</p>
            <p class="reply-item">2. 可以给一点提示吗</p>
            <el-link type="primary">&lt;&lt; 展开 --&gt;&gt;</el-link>
            <el-button class="custom-btn">自定义...</el-button>
          </div>
        </div>
      </div>
    </el-container>
  </el-container>
</template>

<style scoped>
.exam-container {
  height: 90vh;
  display: flex;
}

.exam-sidebar {
  width: 15%;
  background: #4caf50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.aside-panel {
  padding: 10px;
  border-right: 1px solid #ddd;
  width: 100%;
}

.full-width {
  width: 100%;
  margin-bottom: 10px;
}

.interview-section p {
  font-weight: bold;
  margin: 5px 0;
}

.exam-main {
  display: flex;
  flex-direction: column;
  width: 85%;
  padding: 20px;
  background-color: #f9f9f9;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 60vh;
  background: red;
}

.message {
  max-width: 70%;
  font-size: 14px;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background-color: #4caf50;
  color: white;
  border-radius: 12px;
  padding: 12px 16px;
}

.message.ai {
  align-self: flex-start;
  background-color: #e1e1e1;
  color: black;
  border-radius: 12px;
  padding: 12px 16px;
}

.message-content {
  position: relative;
  padding-bottom: 20px;
}

.reference-answer {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 12px;
  color: #4caf50;
  cursor: pointer;
}

.chat-footer {
  display: flex;
  margin-top: 20px;
  height: 20vh;
  background: #4caf50;
  align-items: center;
  justify-content: space-between;
  width: 97%;
  padding: 0 20px;
}

.chat-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 60%;
}

.input-box {
  flex: 1;
  resize: none;
}

.reply-panel {
  background: #f4f4f5;
  padding: 10px;
  border-top: 1px solid #ddd;
  width: 30%;
  border-radius: 8px;
}

.reference-button {
  float: right;
  margin-bottom: 10px;
}

.reply-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.reply-item {
  color: #333;
  margin: 5px 0;
}

.custom-btn {
  float: right;
  margin-top: 10px;
}

</style>
