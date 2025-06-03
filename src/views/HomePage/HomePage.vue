<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { getDocumentUrl, createSSEConnection  } from '../../api/search.ts'
import {
  getConversations,
  getConversationDetail,
  createConversation,
  addMessageToConversation,
  deleteConversation
} from '../../api/conversation.ts'
import { useRouter } from 'vue-router'
import {MagicStick, Cpu, Food, Setting, DocumentCopy, Promotion, Position, Close} from '@element-plus/icons-vue'
import { renderMarkdown } from '../../utils/markdown';
import '../../styles/markdown.scss';

const models = ['混元', 'DeepseekV3', '豆包', '自定义模型']
const selectedModel = ref(models[0])

const curTitle = ref<string>('新建对话')
const userId = parseInt(sessionStorage.getItem('userId') as string);
const searchInput = ref('')
const conversations = ref<Conversation[]>([])
const currentConversationId = ref<number | null>(null)
const references = ref<Document[]>([])
const router = useRouter()
const loading = ref(false)

interface Message {
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  loading?: boolean;
  references?: any[];
}

interface Document {
  id: string;
  title: string;
  content: string;
  score: number;
  url: string;
}

interface Conversation {
  id: number;
  title: string;
}

const messages = ref<Message[]>([]);
// let cachedDocs: any[] = [];

let closeConnection = () => {};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.chat-box-wrapper')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制');
};

// 处理流式搜索
const handleStreamSearch = (query: string): Promise<Message> => {
  closeConnection();

  messages.value.push({
    type: 'user',
    content: query,
    timestamp: Date.now()
  });

  const aiMessage: Message = {
    type: 'ai',
    content: '',
    loading: true,
    references: [],
    timestamp: Date.now()
  };
  messages.value.push(aiMessage);
  const aiIndex = messages.value.length - 1;

  return new Promise((resolve) => {
    closeConnection = createSSEConnection(
        {
          query,
          top_k: 5,
          model: selectedModel.value
        },
        (data) => {
          try {
            const packet = JSON.parse(data);

            if (packet.type === 'docs') {
              const docs = packet.data;

              Promise.all(
                  docs.map(async (doc: Document) => {
                    try {
                      const res = await getDocumentUrl(doc.title);
                      return {
                        title: doc.title,
                        url: res,
                        source: doc.content.slice(0, 50) + '...'
                      };
                    } catch {
                      return {
                        title: doc.title,
                        url: '',
                        source: doc.content.slice(0, 50) + '...'
                      };
                    }
                  })
              ).then((result) => {
                const seen = new Set();
                references.value = result.filter(doc => {
                  if (seen.has(doc.title)) return false;
                  seen.add(doc.title);
                  return true;
                });
              });
            } else if (packet.type === 'content') {
              messages.value[aiIndex].content += packet.data;
              scrollToBottom();
            } else if (data === '[END]') {
              messages.value[aiIndex].loading = false;
              resolve(messages.value[aiIndex]);
            }
          } catch (e) {
            if (data === '[END]') {
              messages.value[aiIndex].loading = false;
              resolve(messages.value[aiIndex]);
            } else if (!data.startsWith('{')) {
              messages.value[aiIndex].content += data;
            }
          }
        },
        (error) => {
          console.error('SSE error:', error);
          messages.value[aiIndex].content += '\n\n[连接异常中断]';
          messages.value[aiIndex].loading = false;
          resolve(messages.value[aiIndex]);
        }
    );
  });
};


// 由于未实现，为了CI/CD绕过ts检查先注释掉 TODO
// const stopStream = () => {
//   closeConnection();
//   const lastAiMsg = [...messages.value].reverse().find(m => m.type === 'ai');
//   if (lastAiMsg) {
//     lastAiMsg.loading = false;
//     if (lastAiMsg.content === '') {
//       lastAiMsg.content = '生成已停止';
//     }
//   }
// };

const handleSearch = async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  searchInput.value = '';

  // 如果是新对话，先创建并设置 conversationId
  if (!currentConversationId.value) {
    const res = await createConversation({
      user_id: userId,
      content: query
    });
    currentConversationId.value = res.data.conversation_id;
    await loadConversationList();
  } else {
    await addMessageToConversation(currentConversationId.value, {
      role: 'user',
      content: query
    });
  }

  // 等待完整内容生成后再保存 ai 内容
  const aiMessage = await handleStreamSearch(query);

  await addMessageToConversation(currentConversationId.value as number, {
    role: 'ai',
    content: aiMessage.content
  });
};

const viewReference = (pdfUrl: string) => {
  router.push({
    path: '/pdfViewer',
    query: { url: encodeURIComponent(pdfUrl) }
  })
}

const changeModel = (val: string) => {
  console.log('当前选择模型:', val)
}

const loadConversationList = async () => {
  try {
    const res = await getConversations();
    conversations.value = res.data.conversations.map((conv: { id: number; title: string }) => ({
      id: conv.id,
      title: conv.title
    }));
  } catch (err) {
    conversations.value = [];
    console.error('获取对话列表失败:', err);
  }
};

const loadConversationMessages = async (id: number) => {
  const res = await getConversationDetail(id)
  curTitle.value = res.data.title
  currentConversationId.value = id
  messages.value = res.data.messages.map((m: any) => ({
    type: m.role,
    content: m.content,
    timestamp: new Date(m.timestamp).getTime()
  }))
  references.value = []
}

const startNewConversation = () => {
  currentConversationId.value = null;
  messages.value = [];
  references.value = [];
  curTitle.value = '新建对话';
};

const handleDelete = async (id: number) => {
  try {
    const res = await deleteConversation(id);

    if (res.status === 200) {
      // 如果删除的是当前对话，清空当前会话内容
      if (currentConversationId.value === id) {
        currentConversationId.value = null;
        messages.value = [];
        references.value = [];
        curTitle.value = ''
      }

      // 刷新会话列表
      await loadConversationList();

      ElMessage.success('删除成功');
    } else {
      ElMessage.error(`删除失败：${res.data.error || '未知错误'}`);
    }
  } catch (err) {
    ElMessage.error("删除失败！");
  }
};

onMounted(async () => {
  await loadConversationList()
})

</script>

<template>
  <el-container class="ai-search-container">
    <!-- 左侧：搜索历史 -->
    <el-aside width="15%" class="history-panel">
      <!-- 顶部工具栏：模型选择 -->
      <div class="model-selector">
        <div style="display: flex;">
          <el-text style="white-space: nowrap;">模型选择：</el-text>
          <el-select v-model="selectedModel" placeholder="选择AI模型" popper-class="model-select-dropdown"
                     @change="changeModel">
            <el-option v-for="model in models" :key="model" :label="model" :value="model">
            <span class="model-option">
              <el-icon v-if="model === '混元'" class="model-icon">
                <MagicStick />
              </el-icon>
              <el-icon v-else-if="model === 'DeepseekV3'" class="model-icon">
                <Cpu />
              </el-icon>
              <el-icon v-else-if="model === '豆包'" class="model-icon">
                <Food />
              </el-icon>
              <el-icon v-else class="model-icon">
                <Setting />
              </el-icon>
              {{ model }}
            </span>
            </el-option>
          </el-select>
        </div>
      </div>
      <h2>会话历史</h2>
      <div style="margin: 10px 0; text-align: center;">
        <el-button type="success" size="default" @click="startNewConversation">
          ➕新建对话
        </el-button>
      </div>
      <el-menu :default-active="String(currentConversationId)">
        <el-menu-item
            v-for="conv in conversations"
            :key="conv.id"
            :index="String(conv.id)"
            @click="loadConversationMessages(conv.id)"
        >
          <p style="overflow: hidden">{{ conv.title }}</p>
          <el-button type="danger" @click="handleDelete(conv.id)" size="small" style="position: absolute ;right: 5px">
            <el-icon><Close /></el-icon>
          </el-button>
        </el-menu-item>
      </el-menu>
    </el-aside>


    <!-- 中间：聊天区 -->
    <el-container>
      <el-main class="chat-main">
        <el-text style="font-size: x-large; font-weight: bold">{{curTitle}}</el-text>
        <div class="message-container">
          <div class="chat-box">
            <div v-for="(msg, index) in messages" :key="index"
              :class="['message-bubble', msg.type, { loading: msg.loading }]">
              <!-- AI消息增加头像 -->
              <div v-if="msg.type === 'ai'" class="ai-avatar">
                <svg-icon icon-class="ai" />
              </div>
              <!-- 用户消息头像 -->
              <div v-if="msg.type === 'user'" class="user-avatar">
                <svg-icon icon-class="user" />
              </div>
              <div class="bubble-content">
                <!-- 流式消息内容 -->
                <div class="message-text">
                  <div v-if="msg.type === 'ai'" class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
                  <template v-else>{{ msg.content }}</template>

                  <!-- 流式加载指示器 -->
                  <div v-if="msg.loading" class="stream-loader">
                    <div class="loader-dot"></div>
                    <div class="loader-dot"></div>
                    <div class="loader-dot"></div>
                  </div>
                </div>
                <!-- 消息底部区域 -->
                <div class="message-footer">
                  <!-- 时间戳 -->
                  <div class="message-time">{{ formatTime(msg.timestamp) }}</div>

                  <!-- 操作按钮 (只在AI消息且非加载状态显示) -->
                  <div v-if="msg.type === 'ai' && !msg.loading" class="message-actions">
                    <el-button size="small" @click="copyText(msg.content)" circle>
                      <el-icon>
                        <DocumentCopy />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-indicator">
            <div class="dot-flashing"></div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="fixed-input-bar">
          <div class="chat-input-bar">
            <el-input v-model="searchInput" placeholder="输入问题，按 Enter 发送" type="textarea" :rows="2"
              class="enhanced-input" @keyup.enter.native="handleSearch">
              <template #prefix>
                <el-icon>
                  <Promotion />
                </el-icon>
              </template>
            </el-input>
            <el-button type="primary" class="send-btn" :loading="loading" @click="handleSearch">
              <template #icon>
                <el-icon>
                  <Position />
                </el-icon>
              </template>
              发送
            </el-button>
          </div>
        </div>
      </el-main>
    </el-container>


    <!-- 右侧：文献展示 -->
    <el-aside width="20%" class="reference-panel">
      <h2>参考文献</h2>
      <el-text v-if="references.length === 0" style="font-size: large; margin-top: 100px">暂无</el-text>
      <el-card v-for="(ref, index) in references" :key="index" class="reference-card" shadow="hover">
        <div style="cursor: pointer;" @click="viewReference(ref.url)">
          <p style="font-size: x-large"><strong>{{ ref.title }}</strong></p>
          <el-button type="text" icon="Document" size="small">查看文献</el-button>
        </div>
      </el-card>
    </el-aside>
  </el-container>
</template>

<style scoped lang="scss">
.ai-search-container {
  height: 92vh;
  background: #f8fafc;
  display: flex;
  position: relative;
}

/* 聊天消息气泡 */
.message-bubble {
  max-width: 72%;
  min-width: 240px;
  margin: 12px 20px;
  display: flex;
  align-items: start;
  gap: 12px;
  transition: all 0.3s ease;

  &.user {
    flex-direction: row-reverse;
    margin-left: auto;

    .bubble-content {
      background: linear-gradient(135deg, #4CAF50, #43A047);
      color: white;
      border-radius: 18px 4px 18px 18px;
    }
  }

  &.ai {
    .bubble-content {
      background: white;
      color: #1a1a1a;
      border-radius: 4px 18px 18px 18px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.bubble-content {
  padding: 14px 18px;
  position: relative;
  line-height: 1.6;
}

.message-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 6px;
  text-align: right;
}

.ai .message-time {
  color: rgba(0, 0, 0, 0.5);
}

/* 头像样式 */
.ai-avatar,
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(45deg, #7f00ff, #e100ff);
  color: white;
}

.user-avatar {
  background: #4CAF50;
  color: white;
}

/* 输入栏美化 */
.enhanced-input {
  :deep(.el-textarea__inner) {
    border-radius: 24px;
    padding: 12px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:focus {
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
    }
  }
}

.send-btn {
  height: 48px;
  border-radius: 24px;
  padding: 0 28px;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }
}

/* 加载动画 */
.dot-flashing {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #4CAF50;
  color: #4CAF50;
  animation: dot-flashing 1s infinite linear alternate;
  animation-delay: 0.5s;

  &::before,
  &::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background-color: #4CAF50;
    color: #4CAF50;
    animation: dot-flashing 1s infinite alternate;
  }

  &::before {
    left: -12px;
    animation-delay: 0s;
  }

  &::after {
    left: 12px;
    animation-delay: 1s;
  }
}

@keyframes dot-flashing {
  0% {
    background-color: #4CAF50;
  }

  50%,
  100% {
    background-color: rgba(76, 175, 80, 0.2);
  }
}

/* 模型选择优化 */
:deep(.el-select) {
  .el-input__wrapper {
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .el-select-dropdown__item {
    padding: 12px 20px;
    border-radius: 12px;
    margin: 4px;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f9ff;
    }

    &.selected {
      background: linear-gradient(45deg, #4CAF50, #43A047);
      color: white;
    }
  }
}

.chat-input-bar {
  position: sticky;
  bottom: 0;
  background: #f8fafc;
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  z-index: 10;
}

/* 调整原有chat-box样式 */
.chat-box {
  // min-height: 100%;
  display: block;
  flex-direction: column;
}


.model-selector {
  padding: 16px 12px 24px;
  /* 下边距加大 */
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e4e7ed, transparent);
  }


  :deep(.el-input) {
    .el-input__wrapper {
      height: 40px;
      display: flex;
      align-items: center;

      .el-input__inner {
        line-height: 24px;
        padding-top: 2px;
        vertical-align: middle;
      }

      .el-input__suffix {
        display: flex;
        align-items: center;
      }
    }
  }
}

/* 选择框样式 */
:deep(.model-selector .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 8px 15px;
  border: 1px solid #ebeef5;

  &:hover {
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
  }
}

/* 下拉菜单样式 */
.model-select-dropdown {
  .el-select-dropdown__item {
    height: 40px;
    /* 固定选项高度 */
    display: flex;
    align-items: center;
    /* 垂直居中 */

    &.selected {
      background: linear-gradient(135deg, #f0f7ff, #e1f0ff);
      color: #409EFF;
    }
  }

  .model-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .model-icon {
    font-size: 16px;
    color: #409EFF;
  }
}

.history-panel {
  border-right: 2px solid #dcdfe6; /* 灰色分隔线 */
  padding: 10px;
}

/* 历史标题下移 */
.history-title {
  margin-top: 8px;
  padding: 0 12px;
  color: #606266;
  font-weight: 500;
}

.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  padding: 10px;
}

/* 消息容器设置 */
.message-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
  /* 给输入框留出空间 */
}

/* 固定在底部的输入栏 */
.fixed-input-bar {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
/* 消息气泡增强样式 */
.message-bubble {
  /* 原有样式保持不变 */

  &.loading {
    .bubble-content {
      border-color: #e4e7ed;
    }
  }
}

/* 消息底部区域 */
.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

/* 流式加载指示器 */
.stream-loader {
  display: inline-flex;
  gap: 6px;
  margin-left: 8px;
  vertical-align: middle;

  .loader-dot {
    width: 8px;
    height: 8px;
    background: #409EFF;
    border-radius: 50%;
    animation: pulse 1.4s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes pulse {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
}

/* 操作按钮样式 */
.message-actions {
  display: flex;
  gap: 8px;

  .el-button {
    padding: 4px;
    height: auto;
  }
}

.reference-panel{
  border-left: 1px solid #dcdfe6; /* 灰色分隔线 */
  padding: 10px;
}
</style>
