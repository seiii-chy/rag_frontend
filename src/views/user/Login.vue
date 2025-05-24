<script setup lang="ts">
import {ref, computed} from 'vue'
import {router} from '../../router'
import {userInfo, userLogin} from "../../api/user.ts"
import {ElMessage} from 'element-plus'

// 输入框值
const username = ref('')
const password = ref('')

// 校验
const hasUsernameInput = computed(() => username.value !== '')
const hasPasswordInput = computed(() => password.value !== '')

// 登录按钮是否禁用
const loginDisabled = computed(() => !(hasUsernameInput.value && hasPasswordInput.value))

function handleLogin() {
  userLogin({
    username: username.value,
    password: password.value
  }).then(res => {
    if (res.status === 200) {
      ElMessage({
        message: "登录成功！",
        type: 'success',
        center: true,
      })
      const token = res.data.token
      sessionStorage.setItem('token', token)

      userInfo().then(res => {
        console.log(res)
        sessionStorage.setItem('name', res.data.user_name)
        sessionStorage.setItem('role', res.data.user_type)
        const user = res.data
        sessionStorage.setItem('user', JSON.stringify(user))
        router.push({path: "/dashboard"})
      })
    } else {
      ElMessage({
        message: "登陆失败！",
        type: 'error',
        center: true,
      })
      password.value = ''
    }
  })
}
</script>

<template>
  <el-main class="main-frame bgimage">
    <el-card class="login-card">
      <div>
        <h1>登录您的账户</h1>
        <el-form>
          <el-form-item>
            <label for="username">用户名</label>
            <el-input id="username" v-model="username" placeholder="请输入用户名"/>
          </el-form-item>

          <el-form-item>
            <label for="password">密码</label>
            <el-input id="password" type="password" v-model="password" placeholder="请输入密码"/>
          </el-form-item>

          <span class="button-group">
            <el-button @click.prevent="handleLogin" :disabled="loginDisabled" type="primary">登录</el-button>
            <router-link to="/register" v-slot="{navigate}">
              <el-button @click="navigate">去注册</el-button>
            </router-link>
          </span>
        </el-form>
      </div>
    </el-card>
  </el-main>
</template>

<style scoped>
.main-frame {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}

.bgimage {
  background-image: url("../../assets/shopping-1s-1084px.svg");
}

.login-card {
  width: 60%;
  padding: 10px;
}

.error-warn {
  color: red;
}

.error-warn-input {
  --el-input-focus-border-color: red;
}

.button-group {
  padding-top: 10px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: center;
  justify-content: right;
}
</style>
