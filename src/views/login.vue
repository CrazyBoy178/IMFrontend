<template>
  <div class="login">
    <div class="container">
      <el-row class="layout">
        <el-col :span="15" class="col">
          <!--          背景-->
          <div class="bg">
            <img alt="" src="@/assets/image/login/Product-Demo-Photo.png">
          </div>
        </el-col>
        <el-col :span="9">
          <div class="form-container">
            <div class="logo">
              <!--图标-->
              <div class="ico">
                <img alt="" src="@/assets/image/login/logo.png">
              </div>
              <!--              标题-->
              <div class="title">
                即时通讯
              </div>
            </div>
            <div v-if="!isRegister" class="form">
              <div class="avatar">
                <img alt="" src="@/assets/image/login/avatar.png">
              </div>
              <div class="nickname">
                <el-input v-model="loginForm.uid"
                          :prefix-icon="Avatar"
                          clearable
                          placeholder="请输入用户名"
                          style="width: 250px"
                          @keyup.enter="submitCreate"/>
              </div>
              <div class="password">
                <el-input
                    v-model="loginForm.password"
                    :prefix-icon="Lock"
                    placeholder="请输入密码"
                    show-password
                    style="width: 250px"
                    type="password"/>
              </div>
              <div class="submit">
                <el-button type="success" @click="login()">登录</el-button>
                <el-button type="primary" @click="toggleInputs()">注册</el-button>
              </div>
<!--              <div class="auto-login-forget-password">-->
<!--                <div class="auto-login">-->
<!--                  <el-checkbox v-model="auto_login" label="自动登陆" size="large"/>-->
<!--                </div>-->
<!--                <div class="forget-password">-->
<!--                  <el-link :underline="false">忘记密码</el-link>-->
<!--                </div>-->
<!--              </div>-->
            </div>
            <div v-show="isRegister" class="form">
              <h2>注册</h2>
              <el-form ref="regForm" :model="form" :rules="rules" class="login-form" label-width="80px">
                <el-form-item label="用户名" prop="nickname">
                  <el-input v-model="form.nickname"
                            :prefix-icon="Avatar"
                            clearable
                            placeholder="请输入用户名"
                            style="width: 220px"
                           />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input
                      v-model="form.password"
                      :prefix-icon="Lock"
                      placeholder="请输入密码"
                      show-password
                      style="width: 220px"
                      type="password"/>
                </el-form-item>
                <el-form-item label="确认密码" prop="checkpassword">
                  <el-input
                      v-model="form.checkpassword"
                      :prefix-icon="Lock"
                      placeholder="请再次输入密码"
                      show-password
                      style="width:220px"
                      type="password"/>
                </el-form-item>
                <div class="submit">
                  <el-button type="success" @click="register">注册</el-button>
                  <el-button type="primary" @click="toggleInputs()">返回</el-button>
                </div>
              </el-form>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>

</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {Avatar, Lock} from "@element-plus/icons-vue";
import {useUser} from '../store/user';
import {useRouter} from "vue-router";
import {passwordCheck} from '@/assets/function/pwdCheck';

const router = useRouter()
const userStore = useUser()
import {ElNotification} from 'element-plus'
import axios from "axios";



const regForm = ref(null);
const auto_login = ref(false)
const isRegister = ref(false)
const form = ref({
  nickname: '',
  password: '',
  checkpassword: '',
});

let user=ref({
  nickname: '',
  password: '',
});

const loginForm = ref({
  uid:'',
  password: '',
});

const userInfo = ref({
  uid: '',
  nickname: '',
  avatar: '',
  jtime: '',
})



const login = async () => {
  if(loginForm.value.uid ===''||loginForm.value.password ===''){
    alert('请输入用户名或密码')
    return;
  }
  try {
    const response = await axios.post('http://localhost:8080/user/login', loginForm.value);
    // Check for a valid token in the response
    const token = response.data;
    localStorage.setItem("token", token);
    if (token) {
      alert('登录成功');
      try{
        const dectoken = await axios.post('http://localhost:8080/token/decodeToken', token);
        const info = dectoken.data;
        userInfo.value.uid = info.uid
        userInfo.value.nickname = info.nickname
        userInfo.value.avatar = info.avatar
        userInfo.value.jtime = info.jtime


        console.log(info.uid)
        console.log(info.nickname)
        console.log(info.avatar)
        submitCreate();

      }catch (error) {
        console.error('token请求失败', error);
      }

    } else {
      alert('用户名或密码错误');
    }
  } catch (error) {
    alert('Login failed');
    console.error('Login request failed', error);
  }
};

const register = async () => {
  if(form.value.nickname ===''||form.value.password ===''||form.value.checkpassword===''||form.value.checkpassword!==form.value.password|| passwordCheck(form.value.password)!==3){
    alert('请输入正确的信息')
    return;
  }
  user.value.nickname = form.value.nickname;
  user.value.password = form.value.password;
  try {
    const response = await axios.post('http://localhost:8080/user/register', user.value);

    // 处理后端响应
    const result = response.data;

    // 如果注册成功，result应该是token
    if (result !== '0') {
      let token = result;
      alert('注册成功')
      console.log('注册成功，Token:', token);
      try{
        const dectoken = await axios.post('http://localhost:8080/token/decodeToken', token);
        const info = dectoken.data;
        userInfo.value.uid = info.uid
        userInfo.value.nickname = info.nickname
        userInfo.value.avatar = info.avatar
        userInfo.value.jtime = info.jtime

        submitCreate();




      }catch (error) {
        console.error('token请求失败', error);
      }
    } else {
      alert('注册失败')
      console.error('注册失败');
    }
  } catch (error) {
    alert('注册失败')
    console.error('注册请求失败', error);
  }
};

const validateName = (rule, value, callback) => {
  // 异步验证用户名
  setTimeout(() => {
    if (!form.value.nickname) {
      return callback(new Error('请输入用户名'));
    }
    callback();
  }, 1000);
};

const validatorPassword = (rule, value, callback) => {
  // 异步验证密码
  if (!form.value.password) {
    callback(new Error('请输入密码'));
  } else {
    if (form.value.password !== '') {
      let result = passwordCheck(form.value.password);
      if (result !== 3) {
        callback(new Error('密码不合规至少8位包含大小写字母符号'));
      }
      callback();
    }
  }
};

const validateRepassword = (rule, value, callback) => {

  // 异步验证确认密码
  if (form.value.checkpassword === '') {
    callback(new Error('请再次输入密码'));
  } else if (form.value.checkpassword !== form.value.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};
const rules = {
  nickname: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {validator: validateName, trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {validator: validatorPassword, trigger: 'blur'},
  ],
  checkpassword: [
    {required: true, message: '请再次输入密码', trigger: 'blur'},
    {validator: validateRepassword, trigger: 'blur'},
  ],
};

const submitCreate = () => {
  if (userInfo.value.uid) {
    // 创建连接
    userStore.createWebSocket(userInfo.value.uid,userInfo.value.nickname,userInfo.value.avatar,userInfo.value.jtime).then(async (res: any) => {
      if (res) {
        ElNotification({
          title: 'Success',
          message: '欢迎 ' + userInfo.value.nickname + ' 回家~',
          type: 'success',
        })
        await router.push({
          name: 'home'
        })
        return
      } else {
        ElNotification({
          title: 'Warning',
          message: '登录失败，请重新尝试',
          type: 'warning',
        })
      }
    }).catch(async (error: any) => {
      ElNotification({
        title: 'Error',
        message: error,
        type: 'error',
      })
    })
  } else {
    ElNotification({
      title: 'Warning',
      message: '请输入用户账号或昵称',
      type: 'warning',
    })
  }
}

const toggleInputs = () => {
  isRegister.value = !isRegister.value
  regForm.value.resetFields();
  user.value.nickname = '';
  user.value.password = '';
  loginForm.value.uid='';
  loginForm.value.password='';
}


</script>

<style lang="scss" scoped>

.container {
  display: flex;
  width: 100%;

  .layout {
    width: 100%;

    .col {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-container {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;

      .logo {
        display: flex;
        align-items: center;

        .ico {
          width: 48px;
          height: 48px;

          img {
            width: 100%;
            height: 100%;
          }
        }
      }

      .title {
        color: #000;
        font-size: 32px;
        font-family: "DingTalkJinBuTi", serif;
      }

      .form {
        position: relative;
        border-radius: 20px;
        display: flex;
        width: 400px;
        height: 400px;
        background-color: rgba(255, 255, 255, 0.7);
        margin-top: 30px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(3px);
        font-family: "AlimamaDongFangDaKai", serif;

        h2 {
          font-family: "DingTalkJinBuTi", serif;
          display: flex;

        }

        :deep(.el-input__inner) {
          color: #000000;
          font-weight: 600;
          font-family: "AlimamaDongFangDaKai", serif;
        }

        button {
          font-family: "AlimamaDongFangDaKai", serif;
          width: 120px
        }

        .avatar {
          width: 84px;
          height: 84px;
          margin-bottom: 20px;

          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }

        .nickname {
          margin-bottom: 10px;


        }

        .password {
          margin-bottom: 10px;

          :deep(.el-input__inner) {
            color: #000000;
            font-weight: 600;
            font-family: "AlimamaDongFangDaKai", serif;
          }
        }

        .submit {
          margin-bottom: 20px;

          button {
            font-family: "AlimamaDongFangDaKai", serif;
            width: 120px
          }
        }

        .auto-login-forget-password {
          display: flex;
          width: 60%;
          align-items: center;
          margin-bottom: 20px;
          justify-content: space-between;

          .auto-login {
            font-family: "AlimamaDongFangDaKai", serif;

            :deep(.el-checkbox) {
              --el-checkbox-border-radius: 8px;
            }

            :deep(.el-checkbox__label) {
              font-size: 15px;
              color: rgba(37, 38, 43, .6)
            }


          }

          .forget-password {
            font-family: "AlimamaDongFangDaKai", serif;

            :deep(.el-link__inner) {
              font-size: 15px;
              color: rgba(37, 38, 43, .6)

            }

            :deep(.el-link__inner:hover) {
              color: #66ccff;

            }
          }

        }
      }
    }
  }

  .bg {
    width: 869px;
    height: 547px;

    img {
      width: 100%;
      height: 100%
    }
  }

}

.login {
  display: flex;
  width: 100%;
  height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #ecefff;

}

</style>