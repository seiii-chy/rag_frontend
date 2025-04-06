<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search, User, SwitchButton } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

const router = useRouter();
const activeIndex = ref(router.currentRoute.value.path); // 监听当前路径
const searchQuery = ref("");

// 退出登录
function logout() {
  ElMessageBox.confirm("是否要退出登录？", "提示", {
    customClass: "customDialog",
    confirmButtonText: "是",
    cancelButtonText: "否",
    type: "warning",
    showClose: false,
    roundButton: true,
    center: true,
  }).then(() => {
    sessionStorage.setItem("token", "");
    router.push({ path: "/login" });
  });
}

// 切换菜单项
const handleSelect = (key: string) => {
  activeIndex.value = key;
  console.log(activeIndex.value);
  console.log(key)
  router.push(key);
};

// 处理搜索
const handleSearch = () => {
  console.log("搜索内容：", searchQuery.value);
}
</script>

<template>
  <el-header class="custom-header" height="70px">
    <el-row :gutter="10" align="middle">
      <!-- 左侧标题 -->
      <el-col :span="3" class="header-icon">
        <router-link to="/dashboard" class="no-link">
          <h1 class="header-text">AI面试助手</h1>
        </router-link>
      </el-col>
      <el-col :span="2"></el-col>
      <!-- 菜单栏 -->
      <el-col :span="6">
        <el-menu
            mode="horizontal"
            :default-active="activeIndex"
            @select="handleSelect"
            background-color="#409eff"
            text-color="white"
            class="header-menu"
            active-text-color="yellow"
        >
          <el-menu-item
              index="/homepage"
              :class="{ 'active-menu-item': activeIndex === '/homepage' }"
              style="margin-right: 15px; font-size: large"
          >
            首页
          </el-menu-item>
          <el-menu-item
              index="/study"
              :class="{ 'active-menu-item': activeIndex === '/study' }"
              style="margin-right: 15px; font-size: large"
          >
            面试准备
          </el-menu-item>
          <el-menu-item
              index="/exam"
              :class="{ 'active-menu-item': activeIndex === '/exam' }"
              style="margin-right: 15px; font-size: large"
          >
            模拟面试
          </el-menu-item>
          <el-menu-item
              index="/chat"
              :class="{ 'active-menu-item': activeIndex === '/chat' }"
              style="margin-right: 15px; font-size: large"
          >
            AI问答
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="4"></el-col>
      <el-col :span="4">
        <el-input
            v-model="searchQuery"
            placeholder="输入搜索内容..."
            class="search-input"
            clearable
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </el-col>
      <el-col :span="2"></el-col>
      <!-- 右侧图标 -->
      <el-col :span="1" class="header-icon">
        <router-link to="/dashboard">
          <el-icon :size="35" color="white"><User /></el-icon>
        </router-link>
      </el-col>

      <el-col :span="1" class="header-icon">
        <a @click="logout">
          <el-icon :size="35" color="white"><SwitchButton /></el-icon>
        </a>
      </el-col>
    </el-row>
  </el-header>
</template>

<style scoped>
.custom-header {
  background-color: #409eff;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.no-link {
  text-decoration: none;
}

.header-text {
  color: white;
  font-size: x-large;
  margin: 15px 0;
}

/* 选中状态的菜单项文字加粗 */
.active-menu-item {
  font-weight: bold;
}

.header-menu {
  font-size: large;
}

/* 添加菜单项间距 */
.el-menu-item {
  margin-right: 15px;
}

/* 搜索框样式 */
.search-input {
  width: 100%;
}
</style>
