<template>
  <el-header class="header-container">
    <div class="nav-content">
      <!-- 品牌LOGO区域 -->
      <router-link to="/dashboard" class="brand">
        <span class="logo-text">AI</span>
        <h1 class="brand-text">智能面试助手</h1>
      </router-link>

      <!-- 主导航菜单 -->
      <el-menu 
        mode="horizontal"
        :default-active="activeIndex"
        @select="handleSelect"
        class="nav-menu"
      >
        <el-menu-item index="/homepage">
          <el-icon><Search /></el-icon>
          <span>智能检索</span>
        </el-menu-item>
        
        <el-menu-item index="/study">
          <el-icon><Notebook /></el-icon>
          <span>面试准备</span>
        </el-menu-item>
        
        <el-menu-item index="/exam">
          <el-icon><ChatLineRound /></el-icon>
          <span>模拟面试</span>
        </el-menu-item>
      </el-menu>

      <!-- 右侧功能区 -->
      <div class="right-panel">
        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索知识库..."
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <el-button type="primary" @click="router.push('/knowledgeBase');" v-if="isAdmin">管理知识库</el-button>

        <!-- 用户操作按钮 -->
        <el-tooltip content="个人中心" placement="bottom">
          <router-link to="/dashboard" class="action-btn">
            <el-icon><User /></el-icon>
          </router-link>
        </el-tooltip>

        <el-tooltip content="退出登录" placement="bottom">
          <div class="action-btn" @click="logout">
            <el-icon><SwitchButton /></el-icon>
          </div>
        </el-tooltip>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { 
  Search, 
  User, 
  SwitchButton, 
  Notebook, 
  ChatLineRound 
} from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

const router = useRouter();
const activeIndex = ref<string>(router.currentRoute.value.path);
const searchQuery = ref<string>("");

const isAdmin = sessionStorage.getItem('role') === 'root'

/**
 * 处理菜单选择
 * @param key - 路由路径
 */
const handleSelect = (key: string): void => {
  activeIndex.value = key;
  router.push(key);
};

/**
 * 处理搜索操作
 */
const handleSearch = (): void => {
  if (searchQuery.value.trim()) {
    console.log("搜索内容：", searchQuery.value);
    // 实际搜索逻辑可在此处添加
  }
};

/**
 * 退出登录确认
 */
const logout = (): void => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    center: true
  }).then(() => {
    sessionStorage.removeItem("token");
    router.push("/login");
  }).catch(() => {
    // 取消操作
  });
};
</script>

<style>
/* 全局CSS变量 */
:root {
  --primary-blue: #3a86ff;
  --dark-blue: #2667cc;
  --accent-yellow: #b8ee4c;
  --hover-yellow: #b8ee4c;
  --text-white: rgba(255, 255, 255, 0.9);
  --hover-white: rgba(255, 255, 255, 0.15);
}

.header-container {
  height: 70px;
  background: linear-gradient(135deg, var(--primary-blue), var(--dark-blue));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 0 0 20px 20px;
  position: relative;
  z-index: 10;
}

.nav-content {
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 32px;
}

/* 品牌LOGO样式 */
.brand {
  display: flex;
  align-items: center;
  margin-right: 48px;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.brand:hover {
  transform: translateX(5px);
}

.logo-text {
  background: var(--hover-yellow);
  color: #3540b5;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 800;
  font-size: 1.4rem;
  margin-right: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.brand-text {
  color: white;
  font-size: 1.6rem;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 导航菜单样式 */
.nav-menu {
  flex: 1;
  background: transparent !important;
  border-bottom: none !important;
}

.nav-menu .el-menu-item {
  color: var(--text-white);
  font-size: 1rem;
  height: 50px;
  margin: 0 16px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* .nav-menu .el-menu-item:hover {
  background: var(--hover-white) !important;
  transform: translateY(-2px);
} */

.nav-menu .el-menu-item.is-active {
  color: var(--accent-yellow) !important;
  font-weight: 600;
}

.nav-menu .el-menu-item.is-active::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: var(--accent-yellow);
  border-radius: 2px;
}

/* 右侧功能区 */
.right-panel {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: auto;
}

/* 搜索框样式 */
.search-box {
  width: 240px;
  transition: width 0.3s ease;
}

.search-box:hover {
  width: 280px;
}

.search-input .el-input__wrapper {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: none;
  padding: 0 18px;
  transition: all 0.3s ease;
}

.search-input .el-input__wrapper:hover {
  background: rgba(255, 255, 255, 0.25);
}

.search-input .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 2px rgba(255, 190, 11, 0.3) !important;
}

.search-input .el-input__inner {
  color: white;
  font-size: 0.95rem;
}

.search-input .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-icon {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin-right: 8px;
}

/* 操作按钮 */
.action-btn {
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
  color: var(--accent-yellow);
}

.action-btn .el-icon {
  font-size: 1.4rem;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .header-container {
    --primary-blue: #2a5fc7;
    --dark-blue: #1a4bb3;
  }
}

/* 响应式调整 */
@media (max-width: 992px) {
  .nav-content {
    padding: 0 20px;
  }
  
  .brand {
    margin-right: 24px;
  }
  
  .brand-text {
    font-size: 1.4rem;
  }
  
  .right-panel {
    gap: 16px;
  }
  
  .search-box {
    width: 180px;
  }
  
  .search-box:hover {
    width: 200px;
  }
}
</style>
