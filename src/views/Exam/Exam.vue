<script setup lang="ts">
import { ref, nextTick, reactive } from 'vue'
import { Microphone, Position, Plus,Document } from '@element-plus/icons-vue'

// const title = ref('')
// const position = ref('')
// const model = ref('hunyuan')
// const techStack = ref(['Java'])
const Form = ref({
  title: '',
  position: '',
  model: 'hunyuan',
  techStack: ['Java']
})

const startInterview = (form:any) => {
  
  status.value = 'Examing';
  // form.value.validate((valid) => {
  //   if (valid) {
  //     // 开始模拟面试的逻辑
  //     console.log('模拟面试开始:', interviewForm);
  //     
  //   } else {
  //     ElMessage.error('请填写所有必填字段');
  //     return false;
  //   }
  // });
};

const rules = {
  title: [
    { required: true, message: '请输入面试标题', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请输入目标职位', trigger: 'blur' }
  ],
  model: [
    { required: true, message: '请选择模型', trigger: 'change' }
  ],
  techStack: [
    { required: true, message: '请至少选择一个技术方向', trigger: 'change', type: 'array' as const, min: 1 }
  ]
}



const resetForm = (form: any) => {
  Form.value = {
    title: '',
    position: '',
    model: 'hunyuan',
    techStack: ['Java']
  }
  console.log('表单已重置');
};
// 模拟数据
const messages = ref([
  { content: '请介绍一下Java的并发实现机制？', type: 'ai' },
])
const status = ref('start')
// 模拟发送方法
const sendMessage = async () => {
  if (ContentText.value.trim()) {
    messages.value.push({ content: ContentText.value, type: 'user' })
    let msg = ContentText.value
    ContentText.value = ''

    // await nextTick(() => {
    //   const container = document.querySelector('.chat-messages')
    //   container.scrollTop = container.scrollHeight
    // })

    // 模拟 AI 回复
    setTimeout(() => {
      messages.value.push({
        content: 'Java并发机制主要依赖于线程、synchronized、volatile、线程池、Lock等工具。',
        type: 'ai',
      })
      // 添加用户反馈
    }, 500)
  }
}

// 语音录入
import { v4 as uuidv4 } from 'uuid';
import { onMounted, onUnmounted } from 'vue';
const appkey = ref('90AfgPopPQbBvM68');
const token = ref('27cb85463b6e4616a01414fbc0553f76');
const isRecording = ref(false);
const ContentText = ref('');
const latestText= ref('');
let websocket: WebSocket | null = null;
let audioContext: AudioContext | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let audioInput: MediaStreamAudioSourceNode | null = null;
let audioStream: MediaStream | null = null;


function generateUUID(): string {
  return uuidv4().replace(/-/g, '');
}

function connectWebSocket() {
  const socketUrl = `wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1?token=${token.value}`;
  websocket = new WebSocket(socketUrl);
  websocket.onopen = () => {
    console.log('连接到 WebSocket 服务器');
    const startTranscriptionMessage = {
      header: {
        appkey: appkey.value,
        namespace: "SpeechTranscriber",
        name: "StartTranscription",
        task_id: generateUUID(),
        message_id: generateUUID()
      },
      payload: {
        "format": "pcm",
        "sample_rate": 16000,
        "enable_intermediate_result": true,
        "enable_punctuation_prediction": true,
        "enable_inverse_text_normalization": true
      }
    };

    websocket?.send(JSON.stringify(startTranscriptionMessage));
  };

  websocket.onmessage = (event) => {

    const message = JSON.parse(event.data);
    if (message.header.name === "TranscriptionResultChanged") {
      console.log(message.payload.result);
      ContentText.value = latestText.value + message.payload.result;
    } 
    else if (message.header.name === "SentenceBegin") {
      latestText.value = ContentText.value;
    } 
    
  };

  websocket.onerror = (event) => {
    console.log('WebSocket 错误: ' + event);
  };

  websocket.onclose = () => {
    console.log('与 WebSocket 服务器断开');
  };
}


async function startRecording() {
  connectWebSocket();
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000
    });
    audioInput = audioContext.createMediaStreamSource(audioStream);

    scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    scriptProcessor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const inputData16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; ++i) {
        inputData16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF; // PCM 16-bit
      }
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(inputData16.buffer);
        // logMessage('发送音频数据块');
      }
    };

    audioInput.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
    isRecording.value = true;
  } catch (e) {
    console.log('录音失败: ' + e);
  }
}

function stopRecording() {
  if (scriptProcessor) {
    scriptProcessor.disconnect();
  }
  if (audioInput) {
    audioInput.disconnect();
  }
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
  }
  if (audioContext) {
    audioContext.close();
  }
  isRecording.value = false;
}
const isActive = ref(false);

function toggleActive() {
  isActive.value = !isActive.value;
  if (isActive.value) {
    startRecording();
  } else {
    stopRecording();
  }
}

onUnmounted(() => {
  if (websocket) {
    websocket.close();
  }
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
  }
});


</script>

<template>
   <el-container class="exam-container">
    <!--<el-container class="exam-sidebar">
      <el-aside width="100%" class="aside-panel">
        <el-button type="primary" class="full-width">+ 新建面试</el-button>
        <div class="classinterview-list">
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
    </el-container> -->
    <el-container class="exam-main" v-if="status === 'creating'">
      <div class="interview-setup-panel">
        <div class="setup-header">
          <h2>创建模拟面试</h2>
          <p>请填写以下信息以为你设置适配您的模拟面试环境</p>
        </div>
        <el-form 
          ref="interviewForm"
          :model="Form"
          :rules="rules"
          label-width="120px" 
          class="interview-form">

          <el-form-item label="面试标题:" prop="title">
            <el-input 
              v-model="Form.title" 
              placeholder="例如: Java高级开发工程师面试" 
              class="form-input"
            ></el-input>
          </el-form-item>

          <el-form-item label="目标职位:" prop="position" >
            <el-input 
              v-model="Form.position" 
              placeholder="例如: 软件工程师" 
              class="form-input"></el-input>
          </el-form-item>
      
          <el-form-item label="选择模型:" prop="model">
            <el-radio-group v-model="Form.model">
              <el-radio label="混元" value="hunyuan"></el-radio>
              <el-radio label="DeepseekV3" value="DeepseekV3"></el-radio>
              <el-radio label="豆包" value="doubao"></el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="技术方向:" prop="techStack">
            <el-checkbox-group v-model="Form.techStack">
              <el-checkbox label="Java" value="Java"></el-checkbox>
              <el-checkbox label=".NET" value=".NET"></el-checkbox>
              <el-checkbox label="前端" value="front"></el-checkbox>
              <el-checkbox label="数据库" value="database"></el-checkbox>
              <el-checkbox label="系统设计" value="system-design"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button @click="resetForm('interviewForm')">重置</el-button>
              <el-button type="primary" @click="startInterview('interviewForm')">开始面试</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-container>
    <el-container class="exam-main" v-if="status === 'history'">
      <div class="history-panel">
        <h3>面试历史</h3>
        <div class="history-list">
          <div class="history-item" v-for="(item, index) in ['Java面试模拟', '项目介绍场景']" :key="index">
            <div class="history-content">
              <p class="history-title">{{ item }}</p>
              <p class="history-date">2023-10-01 12:00</p>
            </div>
            <el-button type="text" class="history-action">查看</el-button>
          </div>
        </div>
      </div>
    </el-container>
    <el-container class="exam-main" v-if="status === 'start'">
      <div class="welcome-panel">
        <h2>模拟面试工具</h2>
        <p class="welcome-description">新建一个的模拟面试或查看面试历史</p>
        <div class="welcome-actions">
          <el-button 
            type="primary" 
            class="new-interview-btn"
            @click="status = 'creating'">
            <el-icon><Plus /></el-icon>
            新建模拟面试
          </el-button>
          <el-button 
            type="info" 
            class="history-btn"
            @click="status = 'history'">
            <el-icon><Document /></el-icon>
            面试历史
          </el-button>
        </div>
      </div>
    </el-container>
    <el-container class="exam-main" v-if="status === 'Examing'">
      <div class="chat-messages">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.type]"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>
      </div>

      <div class="chat-footer">
        <div class="chat-input">
          <el-input
            v-model="ContentText"
            placeholder="请输入你的回答"
            type="textarea"
            :rows="5"
            class="input-box"
            @keyup.enter="sendMessage"
          />
          <el-button
            type="primary" 
            circle
            @click="toggleActive"
            :class="{ active: isActive, 'green-button': isActive }">
            <el-icon :size="32"><Microphone /></el-icon>
          </el-button>
          <el-button type="primary" circle @click="sendMessage">
            <el-icon :size="24"><Position /></el-icon>
          </el-button>
        </div>

        <!-- <div class="reply-panel">
          <div class="reply-list">
            <p class="reply-title">常用</p>
            <div class="reply-item" :class="{ 'reply-highlight': index === 0 }" v-for="(item, index) in ['抱歉，我不太清楚', '可以给一点提示吗']" :key="index">
              <el-icon><ArrowRight /></el-icon>
              {{ item }}
            </div>
            <el-link type="primary">&lt;&lt; 展开 --&gt;&gt;</el-link>
            <el-button class="custom-btn">自定义...</el-button>
          </div>
        </div> -->
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
  background: #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-right: 1px solid #e0e0e0;
}

.aside-panel {
  padding: 15px;
  width: 100%;
}

.full-width {
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 6px;
}

.interview-section p {
  font-weight: bold;
  margin: 10px 0;
  color: #333;
}

.exam-main {
  display: flex;
  flex-direction: column;
  width: 85%;
  padding: 20px;
  background-color: #f9f9f9;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 60vh;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.message {
  max-width: 70%;
  font-size: 14px;
  position: relative;
  margin-bottom: 10px;
}

.message.user {
  align-self: flex-end;
  background-color: #e8f5e9;
  color: #333;
  border-radius: 12px;
  padding: 12px 16px;
  border-left: 4px solid #4caf50;
}

.message.ai {
  align-self: flex-start;
  background-color: #e3f2fd;
  color: #333;
  border-radius: 12px;
  padding: 12px 16px;
  border-right: 4px solid #2196f3;
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
  background: #f5f5f5;
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
  width:95%;
}

.input-box {
  flex: 1;
  resize: none;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.reply-panel {
  background: white;
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  width: 30%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.reply-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  display: flex;
  align-items: center;
}

.reply-title::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #4caf50;
  margin-right: 8px;
  border-radius: 50%;
}

.reply-item {
  color: #555;
  margin: 8px 0;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reply-item:hover {
  background-color: #f5f5f5;
}

.reply-item.reply-highlight {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding-left: 24px;
}

.reply-item.reply-highlight::before {
  content: '✓';
  position: absolute;
  left: 12px;
  color: #4caf50;
}

.custom-btn {
  float: right;
  margin-top: 10px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .exam-container {
    flex-direction: column;
  }
  
  .exam-sidebar {
    width: 100%;
    height: auto;
  }
  
  .exam-main {
    width: 100%;
  }
  
  .chat-footer {
    flex-direction: column;
    height: auto;
  }
  
  .chat-input {
    width: 100%;
    margin-bottom: 15px;
  }
  
  .reply-panel {
    width: 100%;
  }
}
.green-button {
  background-color: #4caf50 !important; /* 绿色 */
  border-color: #4caf50 !important;
  color: white !important;
}

.welcome-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
  padding: 20px;
}

.welcome-description {
  color: #666;
  margin: 15px 0 30px;
  max-width: 500px;
}

.welcome-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.new-interview-btn, .history-btn {
  width: 220px;
  padding: 12px 24px;
  font-size: 16px;
}

.history-panel {
  width: 90%;
  max-width: 800px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.history-panel h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.history-list {
  margin-top: 15px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eaeaea;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.history-title {
  font-weight: bold;
  color: #333;
}

.history-date {
  font-size: 13px;
  color: #888;
}

.history-action {
  color: #4caf50;
  font-weight: 500;
}
.interview-setup-panel {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 25px;
}

.setup-header {
  text-align: center;
  margin-bottom: 30px;
}

.setup-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.setup-header p {
  color: #666;
  font-size: 14px;
}

.interview-form {
  width: 100%;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.form-input {
  width: 100%;
}
</style>