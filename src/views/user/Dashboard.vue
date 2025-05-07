<script setup lang="ts">
import { ref, computed } from 'vue'
import { UserFilled } from "@element-plus/icons-vue"

const role = sessionStorage.getItem("role")
const name = ref('')
const email = ref('')
const regTime = ref()

const displayInfoCard = ref(false)

const password = ref('')
const confirmPassword = ref('')

const hasConfirmPasswordInput = computed(() => confirmPassword.value !== '')
const isPasswordIdentical = computed(() => password.value === confirmPassword.value)

const newName = ref('')
const newEmail = ref('')

function updatePassword(){

}

function updateInfo(){

}

</script>

<template>
  <el-main class="main-container">
    <el-card class="aside-card">
      <div class="avatar-area">
        <el-avatar :icon="UserFilled" :size="80" />
        <span class="avatar-text"> 欢迎您，{{ name }}</span>
      </div>

      <el-divider></el-divider>

      <el-descriptions :column="1" border title="个人信息">
        <template #extra>
          <el-button type="primary" @click="displayInfoCard = !displayInfoCard">
            <span v-if="displayInfoCard">修改密码</span>
            <span v-else>修改个人信息</span>
          </el-button>
        </template>

        <el-descriptions-item label="身份">
          <el-tag>{{ role }}</el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="邮箱">
          {{ email }}
        </el-descriptions-item>

        <el-descriptions-item label="注册时间">
          {{ regTime }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="!displayInfoCard" class="change-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
          <el-button @click="updatePassword" :disabled="!hasConfirmPasswordInput || !isPasswordIdentical">
            确认修改
          </el-button>
        </div>
      </template>

      <el-form>
        <el-form-item>
          <label for="password">密码</label>
          <el-input type="password" id="password" v-model="password" placeholder="•••••••••" required />
        </el-form-item>
        <el-form-item>
          <label v-if="!hasConfirmPasswordInput" for="confirm_password">确认密码</label>
          <label v-else-if="!isPasswordIdentical" for="confirm_password" class="error-warn">密码不一致</label>
          <label v-else for="confirm_password">确认密码</label>

          <el-input type="password" id="confirm_password" v-model="confirmPassword"
                    :class="{ 'error-warn-input': (hasConfirmPasswordInput && !isPasswordIdentical) }"
                    placeholder="•••••••••" required />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-else class="change-card">
      <template #header>
        <div class="card-header">
          <span>修改个人信息</span>
          <el-button @click="updateInfo">
            确认修改
          </el-button>
        </div>
      </template>

      <el-form>
        <el-form-item>
          <label for="newName">昵称</label>
          <el-input type="text" id="newName" v-model="newName" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item>
          <label for="newEmail">邮箱</label>
          <el-input type="email" id="newEmail" v-model="newEmail" placeholder="请输入邮箱" />
        </el-form-item>

      </el-form>
    </el-card>

  </el-main>
</template>

<style scoped>
.error-warn {
  color: red;
}

.error-warn-input {
  --el-input-focus-border-color: red;
}

.main-container {
  display: flex;
  flex-direction: row;
  padding: 15px;
  gap: 5px;
  justify-content: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.change-card {
  width: 66%;
}

.avatar-area {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 30px;
}

.avatar-text {
  font-size: x-large;
  font-weight: bolder;
  padding-right: 40px;
}
</style>
