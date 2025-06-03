<script setup lang="ts">
import {ref, computed} from 'vue'
import {router} from '../../router'
import {userRegister} from "../../api/user.ts"
import {ElMessage} from 'element-plus'

// 输入框值
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const userType = ref('')

// 校验
const hasUsernameInput = computed(() => username.value !== '')
const hasPasswordInput = computed(() => password.value !== '')
const hasConfirmPasswordInput = computed(() => confirmPassword.value !== '')
const hasEmailInput = computed(() => email.value !== '')
const hasUserTypeChosen = computed(() => userType.value !== '')
const isPasswordIdentical = computed(() => password.value === confirmPassword.value)

// 注册按钮是否禁用
const registerDisabled = computed(() => {
  return !(hasUsernameInput.value && hasPasswordInput.value && hasConfirmPasswordInput.value &&
      hasEmailInput.value && hasUserTypeChosen.value && isPasswordIdentical.value)
})

function handleRegister() {
  userRegister({
    username: username.value,
    password: password.value,
    email: email.value,
    user_type: userType.value,
  }).then(res => {
    console.log(res)
    if (res.status === 200) {
      ElMessage({
        message: "注册成功！请登录账号",
        type: 'success',
      })
      router.push({path: "/login"})
    } else {
      ElMessage({
        message: res.data.msg,
        type: 'error',
      })
    }
  })
}
</script>

<template>
  <el-main class="main-frame bgimage">
    <div class="title-box">
      <span class="logo-text">AI</span>
      <el-text class="app-title">智能面试助手</el-text>
    </div>
    <el-card class="login-card">
      <div>
        <h1>创建一个新账户</h1>
        <el-form>
          <el-form-item>
            <label for="username">用户名</label>
            <el-input id="username" v-model="username" placeholder="请输入用户名"/>
          </el-form-item>

          <el-form-item>
            <label for="email">邮箱</label>
            <el-input id="email" v-model="email" placeholder="请输入邮箱"/>
          </el-form-item>

          <el-form-item>
            <label for="userType">身份</label>
            <el-select id="userType" v-model="userType" placeholder="请选择身份" style="width: 100%;">
              <el-option value="normal" label="普通用户"/>
<!--              <el-option value="root" label="管理员"/>-->
            </el-select>
          </el-form-item>

          <el-form-item>
            <label for="password">密码</label>
            <el-input type="password" id="password" v-model="password" placeholder="请输入密码"/>
          </el-form-item>

          <el-form-item>
            <label v-if="!hasConfirmPasswordInput">确认密码</label>
            <label v-else-if="!isPasswordIdentical" class="error-warn">密码不一致</label>
            <label v-else>确认密码</label>
            <el-input type="password" id="confirm-password"
                      v-model="confirmPassword"
                      :class="{'error-warn-input': (hasConfirmPasswordInput && !isPasswordIdentical)}"
                      placeholder="请再次输入密码"/>
          </el-form-item>

          <span class="button-group">
            <el-button @click.prevent="handleRegister" :disabled="registerDisabled" type="primary">
              创建账户
            </el-button>
            <router-link to="/login" v-slot="{navigate}">
              <el-button @click="navigate">去登录</el-button>
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bgimage {
  background: rgba(58,255,153,0.45);
}

.title-box{
  display: flex;
  margin-bottom: 2%;
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

.app-title{
  font-size: xx-large;
  font-weight: bolder;
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
