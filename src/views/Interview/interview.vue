<script setup lang="ts">
import { ref} from 'vue'
import { Microphone, Position, Plus,Document } from '@element-plus/icons-vue'
import { renderMarkdown } from '../../utils/markdown';
import { endInterview, getInterview, getInterviewQuestions, getUserOldInterviews, startInterview, submitAnswer } from '../../api/interview';

const Form = ref({
  title: '',
  position: '',
  model: 'hunyuan',
  techStack: ['Java'],
  resumeText: ''
})
const interviewForm = ref<HTMLElement | null>(null);
const userId = ref(Number(sessionStorage.getItem('userId')) || 0)
function startview(form:any){
  form.validate((valid:any) => {
    if (valid) {
      startInterview({
        interview_name: Form.value.title,
        position: Form.value.position,
        provider: Form.value.model,
        cv: Form.value.resumeText,
        user_id: userId.value
      }).then(res => {
        console.log('面试开始:', res);
        if (res.status === 200) {
          //console.log('面试开始2:', res);
          status.value = 'interviewing';
          interviewId.value = res.data.interview_id;
          messages.value = [
            { content: res.data.first_question.text, type: 'ai', loading: false }
          ];
        } 
        else {
          ElMessage({
            message: '面试开始失败，请稍后再试',
            type: 'error'
          })
        }
      }).catch(error => {
        ElMessage.error('面试开始失败，请稍后再试');
        console.error('Error in startview:', error);
    });
    } else {
      ElMessage.error('请填写所有必填字段');
      return false;
    }
  });
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
  console.log("Form:",form)
  Form.value = {
    title: '',
    position: '',
    model: 'hunyuan',
    techStack: ['Java'],
    resumeText: ''
  }
};
const messages = ref([
  { content: '', type: 'ai' , loading:false},
])
const status = ref('start')
const interviewId = ref(0)
const sendMessage = async () => {
  if (ContentText.value.trim()) {
    messages.value.push({ content: ContentText.value, type: 'user',loading:false})
    messages.value.push({ content: '', type: 'ai', loading: true });
    let msg = ContentText.value;
    ContentText.value = ''
    submitAnswer(interviewId.value,{
      answer: msg,
    }).then(res => {
      console.log('回答提交成功:', res);
      if(res.progress.length < 5 && res.next_question.is_followup === true){
      messages.value[messages.value.length - 1].loading = false; // 停止加载状态
      messages.value[messages.value.length - 1].content = res.next_question.text; // 更新AI消息内容
      }
      else if(res.next_question.is_followup === false){
        messages.value[messages.value.length - 1].loading = false; // 停止加载状态
        messages.value[messages.value.length - 1].content = res.next_question.text; // 更新AI消息内容
        endInterview(interviewId.value).then(res => {
          console.log('面试结束:', res);
          messages.value.push({
            content: '面试已结束，本次面试得分为'+res.final_score+'，感谢参与！', 
            type: 'ai', 
            loading: false
          });
          // 等待10秒
          setTimeout(() => {
            status.value = 'start'; // 重置状态
            messages.value = []; // 清空消息
            Form.value = {
              title: '',
              position: '',
              model: 'hunyuan',
              techStack: ['Java'],
              resumeText: ''
            };
          }, 10000);
        }).catch(error => {
          console.error('Error in endInterview:', error);
        });
      }
      else {
        endInterview(interviewId.value).then(res => {
          console.log('面试结束:', res);
          messages.value[messages.value.length - 1].loading = false; // 停止加载状态
          messages.value[messages.value.length - 1].content = '面试已结束，本次面试得分为'+res.final_score+'，感谢参与！'; // 更新AI消息内容
          //等待10秒
          ElMessage.success('面试已结束，感谢参与！将于10秒后返回主页');
          setTimeout(() => {
            status.value = 'start'; // 重置状态
            messages.value = []; // 清空消息
            Form.value = {
              title: '',
              position: '',
              model: 'hunyuan',
              techStack: ['Java'],
              resumeText: ''
            };
          }, 5000);
        }).catch(error => {
          console.error('Error in endInterview:', error);
        });
      }
    }).catch(error => {
      console.error('Error in sendMessage:', error);
    });

    
  }
}
const history_ids = ref<any[]>([]);
const historys = ref<any[]>([]);
function handlehistory() {
  status.value = 'history';
  getUserOldInterviews(userId.value).then(res => {
    console.log('获取面试历史:', res);
    //只接受ended_at有值的
    history_ids.value = res.filter((item:any) => item.ended_at !== null);
    historys.value = [];
    history_ids.value.map((interview:any) => {
      getInterview(interview.interview_id).then(res=> {
        //console.log('获取面试详情:', res);
        historys.value.push({
          interview_id: res.interview_id,
          interview_name: res.interview_name,
          position: res.position,
          started_at: res.started_at,
          ended_at: res.ended_at,
        });
      }).catch(error => {
        console.error('Error in getInterview:', error);
      });
      // getInterviewQuestions(interview.interview_id).then(res => {
      //   console.log('获取面试问题:', res);
      //   // 这里可以处理获取到的面试问题
      //   // 例如将其存储在一个变量中以供展示
      // }).catch(error => {
      //   console.error('Error in getInterviewQuestions:', error);
      // });
    });

    console.log('面试历史数据:', historys.value);
    // 这里可以处理获取到的面试历史数据
    // 例如将其存储在一个变量中以供展示
  }).catch(error => {
    console.error('Error in getUserOldInterviews:', error);
  });
  console.log('查看面试历史');
}
function handleReview(reviewingId:any) {
  status.value = 'reviewing_interview';
  messages.value = [];
  getInterviewQuestions(reviewingId).then(res => {
    console.log('获取面试问题:', res);
    // 将面试问题存储到 messages 中
    for (const chat of res) {
      if(chat.feedback!=null){
        messages.value.push({ content: `面试已结束，本次面试得分为 ${chat.final_score}，感谢参与！`, type: 'ai', loading: false });
        messages.value.push({ content: chat.feedback, type: 'ai', loading: false });
      }
      else {
        messages.value.push({ content: chat.question_text, type: 'ai', loading: false });
        messages.value.push({ content: chat.answer_text, type: 'user', loading: false });
      }
      
    }
    console.log('面试问题数据:', messages.value);
  }).catch(error => {
    console.error('Error in getInterviewQuestions:', error);
  });
}


// 语音录入
import { v4 as uuidv4 } from 'uuid';
import { onUnmounted } from 'vue';
const appkey = ref('90AfgPopPQbBvM68');
const token = ref('f1cebf5306b04b0784474859ae299776');
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
      //console.log(message.payload.result);
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
    audioContext = new (window.AudioContext || window.AudioContext)({
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


// import pdfjsLib from 'pdfjs-dist/build/pdf';
//import { readDocxFile } from 'docx4js';



const fileList = ref<any[]>([]);

const handleFileChange = (file:any) => {
  fileList.value = [file];
  parseResume(file);
};

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件');
};

const parseResume = async (file:any) => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    await parsePDF(file.raw);
  } else if (fileName.endsWith('.docx')) {
    await parseDOCX(file.raw);
  } else {
    ElMessage.error('只支持 PDF 和 DOCX 文件');
  }
};

const parsePDF = async (file:any) => {
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const pdfData = new Uint8Array(e.target?.result as ArrayBuffer);
      extractTextFromPDF(pdfData);
    }
    reader.readAsArrayBuffer(file);
  } catch (error) {
    ElMessage.error('解析 PDF 文件时出错');
    console.error(error);
  }
};
import PizZip, { LoadData } from "pizzip";
import Docxtemplater from "docxtemplater";
const parseDOCX = async (file:any) => {
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const docxData = e.target?.result as LoadData;
      const zip = new PizZip(docxData);
      const doc = new Docxtemplater(zip);
      try {
        doc.render();
        const content = doc.getFullText();
        Form.value.resumeText = content;
      } catch (error) {
        console.error('Error rendering docx:', error);
      }
      ElMessage.success('DOCX 简历解析成功');
    };
    reader.readAsArrayBuffer(file);
  } catch (error) {
    ElMessage.error('解析 DOCX 文件时出错');
    console.error(error);
  }
};

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.js',
    import.meta.url
).toString()
//读取pdf文件里的文字
const extractTextFromPDF = async (data:any) => {
  // PDFJS.getDocument(data)
  const pdf = await pdfjsLib.getDocument(data).promise;
  const textContent = [];
  const promises = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    promises.push(
      pdf.getPage(pageNumber).then((page: any) => {
        return page.getTextContent().then((content: any) => {
          let pageText = "";
          content.items.forEach((item: any) => {
            pageText += item.str + " ";
          });
          return pageText.trim();
        });
      })
    );
  }

  const pagesText = await Promise.all(promises);
  textContent.push(...pagesText);
  Form.value.resumeText = textContent.join("\n");
  console.log('PDF 简历解析成功:', Form.value.resumeText);

};
</script>

<template>
   <el-container class="interview-container">
    <el-container class="interview-main" v-if="status === 'start'">
      <div class="welcome-panel">
        <h2>模拟面试工具</h2>
        <p class="welcome-description">助你提前熟悉面试流程，提升面试表现，轻松斩获心仪 offer</p>
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
            @click="handlehistory">
            <el-icon><Document /></el-icon>
            面试历史
          </el-button>
        </div>
      </div>
    </el-container>

    <el-container class="interview-main" v-if="status === 'creating'">
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
              <el-radio label="DeepseekV3" value="deepseek"></el-radio>
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

          <!-- 添加提交简历部分 -->
          <el-form-item label="提交简历：" >
            <el-upload
              class="upload-demo"
              drag
              :action="''"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
              accept=".pdf,.docx"
              :limit="1"
              :on-exceed="handleExceed"
              >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">点击或拖拽文件到此处上传</div>
              <div class="el-upload__tip" slot="tip">只支持单个 PDF 或 DOCX 文件</div>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button @click="resetForm(interviewForm)">重置</el-button>
              <el-button type="primary" @click="startview(interviewForm)">开始面试</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-container>
    
    <el-container class="interview-main" v-if="status === 'history'">
      <div class="history-panel">
        <h3>面试历史</h3>
        <!-- <div class="history-list">
          <div class="history-item" v-for="(item, index) in ['Java面试模拟', '项目介绍场景']" :key="index">
            <div class="history-content">
              <p class="history-title">{{ item }}</p>
              <p class="history-date">2023-10-01 12:00</p>
            </div>
            <el-button link class="history-action">查看</el-button>
          </div>
        </div> -->
        <div class="history-list">
          <div class="history-item" v-for="(item, index) in historys" :key="index">
            <div class="history-content">
              <p class="history-title">面试标题：{{ item.interview_name }}</p>
              <p class="history-date">面试时间：{{ item.started_at }} - {{ item.ended_at }}</p>
            </div>
            <el-button link class="history-action" @click="handleReview(item.interview_id)">查看</el-button>
          </div>
        </div>
      </div>
    </el-container>
    
    <el-container class="interview-main" v-if="status === 'interviewing'">
      <!-- AI消息增加头像 -->
      <div v-for="(msg, index) in messages" :key="index"
      :class="['message-bubble', msg.type, { loading: msg.loading }]">
        <!-- AI消息头像 -->
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
      </div>
    </el-container>
    <el-container class="interview-main" v-if="status === 'reviewing_interview'">
      <!-- <div class="reply-panel">
        <h3 class="reply-title">面试问题</h3>
        <div v-for="(question, index) in messages" :key="index" class="reply-item reply-highlight">
          {{ question.content }}
        </div>
        <el-button type="primary" class="custom-btn" @click="status = 'interviewing'">返回面试</el-button>
      </div> -->
      <!-- AI消息增加头像 -->
      <div v-for="(msg, index) in messages" :key="index"
      :class="['message-bubble', msg.type, { loading: msg.loading }]">
        <!-- AI消息头像 -->
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
        </div>
      </div>
      <el-button type="primary" class="history-return-btn" @click="status = 'start'">返回面试</el-button>
    </el-container>
  </el-container>
</template>

<style scoped>
.interview-container {
  height: 90vh;
  display: flex;
}

.interview-sidebar {
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

.interview-main {
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

/* .chat-footer {
  display: flex;
  margin-top: 20px;
  height: 20vh;
  background: #f5f5f5;
  align-items: center;
  justify-content: space-between;
  width: 97%;
  padding: 0 20px;
}*/
.chat-footer {
  /* position: fixed; */
  margin-bottom: 0;
  display: flex;
  margin-top: auto;
  height: 150px;
  background: #f5f5f5;
  align-items: center;
  padding: 0px 20px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  width: 97%;
  z-index: 100;
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
  .interview-container {
    flex-direction: column;
  }
  
  .interview-sidebar {
    width: 100%;
    height: auto;
  }
  
  .interview-main {
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
/* 聊天消息气泡 */
.message-bubble {
  margin-bottom: 20vh;
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
.history-return-btn {
  margin-top: 20px;
  width: 100%;
  max-width: 200px;
  /* 靠右 */
  align-self: flex-end;
}
</style>