<template>
  <div class="home">
    <el-row class="layout">
      <el-col :span="2">
        <div class="grid-content options">
          <div class="avatar">
            <img alt="" :src=avatar>
            <div class="online-state"></div>
            <div class="ava-nickname">{{ nickname }}</div>
          </div>

          <div class="feature">
            <div class="option">
              <el-icon @click="toHomePage()">
                <Comment/>
              </el-icon>
            </div>
            <div class="option">
              <el-icon >
                <ChatSquare />
              </el-icon>
            </div>
            <div class="option">
              <el-icon @click="toManageFriend()">
                <Avatar/>
              </el-icon>
            </div>
            <div class="option">
              <el-icon @click="toAddFriend()">
                <HomeFilled />
              </el-icon>
            </div>
            <div class="option">
              <el-icon @click="toManageGroup()">
                <MessageBox />
              </el-icon>
            </div>
            <div class="settings" @click="dialogFormVisible = true">
              <el-icon>
                <Tools/>
              </el-icon>
            </div>

          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="grid-content friend-list">
          <div v-infinite-scroll="friendListLoadInfiniteScroll" class="infinite-scroll">
            <div v-for="(group,index) in groups" :key="index" class="friend" @click="selectGroup(group)">
              <div class="message">
                <div class="nickname">
                  <div>{{ group.groupName }}</div>
                  <div class="badge" v-if="group.unreadMessagesCount > 0">
                    {{ group.unreadMessagesCount < 99 ? group.unreadMessagesCount : '99+' }}
                  </div>
                </div>
                <div class="new-message">
                  {{ group.latestNews }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="16">
        <div class="grid-content chats">
          <div class="top">
            <div class="top-nickname">
              {{ groupInfo.groupName }}
            </div>
          </div>

          <div class="middle">
            <div class="chat">
              <div v-infinite-scroll="chatLoadInfiniteScroll" class="infinite-scroll1">
                <div v-for="(message,index) in groupInfo.messages" :key="index">
                  <div v-if="message.type === 'friend'" class="left">
                    <div class="left-avatar">
                      <img alt="" :src=message.sendAvatar>
                    </div>
                    <div class="left-message">
                      {{ message.message }}
                      <div class="triangle"></div>
                    </div>

                  </div>
                  <div v-else class="right">
                    <div class="right-message">
                      {{ message.message }}
                      <div class="triangle"></div>
                    </div>
                    <div class="right-avatar">
                      <img alt="" :src="avatar">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bottom">
            <div class="bottom-left">
              <div class="emoji">
                <img alt="" src="@/assets/image/home/svg/smile.svg">
              </div>
              <div class="file">
                <el-icon>
                  <Folder/>
                </el-icon>
              </div>
            </div>
            <div class="bottom-middle">
              <el-input v-model="message" :rows="1" placeholder="现在可以开始聊天了" type="textarea"
                        @keyup.enter="sendMessages"/>
            </div>
            <div class="bottom-right">
              <el-button round type="primary" @click="sendMessages">发送</el-button>
            </div>
          </div>

        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogFormVisible"  title="信息查看" :before-close="handleClose">
      <el-form ref="regForm" :model="form" :rules="rules" label-width='100px'>
        <el-form-item label="账号" style="width: 300px">
          <el-input v-model="form.uid" disabled />
        </el-form-item>
        <el-form-item label="昵称"  prop="nickname" style="width: 300px">
          <el-input v-model="form.nickname" :disabled="!modify" />
        </el-form-item>
        <el-form-item label="头像" >
          <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/file/upload"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>

        </el-form-item>
        <el-form-item label="加入时间" style="width: 300px" >
          <el-input v-model="userStore.jointime" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button type="danger" @click="logout">退出登录</el-button>
        <el-button v-show="!modify" @click="reset">取消</el-button>
        <el-button v-show="modify" @click="back">返回</el-button>
        <el-button v-show="!modify" type="primary" @click="beforesubmit">
          修改信息
        </el-button>
         <el-button v-show="modify" type="success" @click="submit">
          提交
        </el-button>
      </span>
      </template>
    </el-dialog>

  </div>
</template>


<script lang="ts" setup>
import {
  Avatar,
  CirclePlusFilled,
  Comment,
  Folder,
  Search,
  Tools,
  WalletFilled,
  Plus,
  CirclePlus, HomeFilled, MessageBox, ChatSquare
} from "@element-plus/icons-vue";
import {onMounted, reactive, Ref, ref, toRefs} from 'vue'
import {useNetwork} from '@vueuse/core'
import {useUser} from '../store/user';
import {storeToRefs} from 'pinia'
import axios from "axios";
import type { UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import router from "@/router";


const userStore = useUser()

const {uid,nickname,avatar,jointime, friendsInfo, friendsListInfo, groupInfo , groupsListInfo} = storeToRefs(userStore)
const regForm = ref(null);
const network = reactive(useNetwork())
const {isOnline} = toRefs(network)

const search = ref('')
const imageUrl = ref('')

let dialogFormVisible = ref(false)


const form = ref({
  uid: userStore.uid,
  nickname: userStore.nickname,
})



let groups: Ref<GroupInfo[]> = ref([])

interface GroupInfo {
  groupId: string
  groupName: string
  groupOwner: string
  groupMember:string

}


function selectGroup(group) {
  // 设置当前选中的好友信息
  userStore.groupInfo = group;
  console.log(group)
  console.log(info)
  userStore.createGroupWebSocket(info.value.uid,group.groupId, info.value.nickname, info.value.avatar, info.value.jtime)
  // 清零未读消息数
  userStore.clearUnreadGroupMessages(group);

}



const validateName = (rule, value, callback) => {
  // 异步验证用户名
  setTimeout(() => {
    if (!form.value.nickname) {
      return callback(new Error('请输入用户名'));
    }
    callback();
  }, 1000);
};

const rules = {
  nickname: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {validator: validateName, trigger: 'blur'},
  ],
};

const handleClose = (done: () => void) => {
  reset()
  done()

}

const reset=()=>{
  dialogFormVisible.value = false
  form.value.nickname = userStore.nickname;
  regForm.value.resetFields();
  modify.value=false
  imageUrl.value = null
}

const handleAvatarSuccess: UploadProps['onSuccess'] = async (
    response,
    uploadFile
) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
  try {
    const resp = await axios.post("http://localhost:8080/file/change", {
      uid: userStore.uid,
      avatar: response
    })
    await getInfo(resp.data)
    alert('头像修改成功')
    window.location.reload()

  } catch {
    alert('修改失败')
  }
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('图片格式为 JPG 或者 PNG 格式!')
    return false
  } else if (rawFile.size / 2048 / 2048 > 2) {
    ElMessage.error('图片过大,无法上传')
    return false
  }
  return true
}


const friendListLoadInfiniteScroll = () => {}

const chatLoadInfiniteScroll = () => {}

const message = ref('')

let modify = ref(false)

const back = async () => {
  modify.value=false

}
const beforesubmit = async () => {
  modify.value=true

}

const logout = async () => {
  localStorage.clear()
  location.reload();

  await router.push('/')
}

const submit = async () => {
  try {
    const resp = await axios.post(`http://localhost:8080/user/modify`,form.value);

    await getInfo(resp.data);
    window.location.reload();

  } catch (error) {
    alert('Failed to submit');
  }
  reset()
}
const info = ref({
  uid: userStore.uid,
  nickname: userStore.nickname,
  avatar: userStore.avatar,
  jtime: userStore.jointime,
})

async function getInfo(value:any) {
  localStorage.setItem('token',value)
  try {
    const dectoken = await axios.post('http://localhost:8080/token/decodeToken', localStorage.getItem('token'));
    info.value = dectoken.data;
    form.value.uid = info.value.uid
    form.value.nickname = info.value.nickname

    // await userStore.createWebSocket(info.uid, info.nickname, info.avatar, info.jtime)


  } catch (error) {
    console.error('token请求失败', error);
  }
}

onMounted(async () => {
  await getInfo(localStorage.getItem('token'));

  await fetchGroups(userStore.uid);
});
const fetchGroups = async (uid)=>{
  try {
    const response = await axios.get(`http://localhost:8080/group/getUserGroups/${uid}`);
    console.log(response.data)
    groups.value = response.data
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error; // You might want to handle this error in the calling code
  }
}

const sendMessages = async () => {
  if (message.value) {
    if (await userStore.sendGroupMessages(message.value)) {
      message.value = ''
    }
  }
}

function toHomePage() {
  router.push('/home')
}

function toManageFriend (){
  router.push('/manageFriend')
}
function toAddFriend (){
  router.push('/addFriend')
}

function toManageGroup(){
  router.push('/manageGroup')
}

</script>


<style lang="scss" scoped>
.home {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #ECEFFF;
  align-items: center;
  justify-content: center;
}

.layout {
  width: 100%;
  height: 100vh;

  .grid-content {
    height: 100%;
    background: #303842
  }


  .options {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;


    .avatar {
      position: relative;
      width: 100px;
      height: 100px;
      margin-bottom: 35px;
      color: #ffffff;
      margin-top:10px;
      font-size: 16px;
      font-family: "DingTalkJinBuTi", serif;

      img {
        border-radius: 50%;
        width: 100%;
        height: 100%;
      }

      .online-state {
        position: absolute;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background-color: green;
        right: 1%;
        bottom: -2%;
      }
    }

    .feature {
      position: relative;
      display: flex;
      width: 100%;
      height: 100%;
      color: #747bff;
      flex-direction: column;

      .option {
        justify-content: center;
        align-items: center;
        display: flex;
        height: 48px;
        font-size: 30px;
        border-right: 5px solid #303842;
      }

      .option:hover, .option:nth-child(2) {
        cursor: pointer;
        color: #ecefff;
        background: #363F48;
        border-right: 5px solid #77fd59;
      }

      .settings {
        position: absolute;
        height: 48px;
        display: flex;
        font-size: 30px;
        bottom: 20px;
        width: 100%;
        justify-content: center;
        align-items: center;
      }

      .settings:hover {
        cursor: pointer;
        color: #ecefff;
        background: #363F48;
      }

    }
  }
}

.friend-list {
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: column;
  background: #563f48 !important;

  .navigation {
    display: flex;
    width: 100%;
    height: 70px;
    align-items: center;
    justify-content: space-evenly;
    background: #3A434A;

    .search {
      :deep(.el-input__inner) {
        color: #ffffff;
        font-weight: 600;
        font-family: "Alimama DongFangDaKai", serif;
      }

      :deep(.el-input__wrapper) {
        background: #303842;
        border-radius: 50px;
      }
    }

    .add {
      display: flex;
      cursor: pointer;
      font-size: 36px;
      align-items: center;
      justify-content: center;
      color: #747bff;
    }

    .add:hover {
      color: #ffffff;
    }
  }

  .infinite-scroll {
    max-height: 100vh;
    overflow-y: auto; /* 当内容超过容器高度时显示垂直滚动条 */
    height: 100%;
    width: 100%;

    .friend {
      display: flex;
      height: 75px;
      color: #ffffff;
      cursor: pointer;
      align-items: center;

      justify-content: space-evenly;

      .friend-avatar {
        display: flex;
        width: 60px;
        align-items: center;
        justify-content: center;


        img {
          border-radius: 50%;
          width: 100%;
          height: 100%;
        }
      }


      .message {
        display: flex;
        width: 70%;
        text-align: left;
        flex-direction: column;

        .nickname {
          display: flex;
          font-size: 20px;
          font-family: "Alimama DongFangDaKai", serif;
          justify-content: space-between;
          align-items: center;

          .badge {
            display: flex;
            width: 22px;
            height: 22px;
            font-size: 10px;
            font-family: "DingTalkJinBuTi", serif;
            background: red;
            border-radius: 50%;
            text-align: center;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }

    .friend:hover {
      background: #444c56;
    }
  }
}

.chats {
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: column;
  background: #ECEFFF !important;

  .top {
    display: flex;
    width: 100%;
    height: 60px;
    background: #F7FCFF;
    font-size: 20px;
    align-items: center;
    justify-content: center;

    .top-nickname {
      color: #000;
      font-family: "DingTalkJinBuTi", serif;

    }

    .top-status {
      display: flex;
      align-items: center;
      justify-content: center;

      .state {
        width: 15px;
        height: 15px;
        margin: 0 8px;
        background: #77fd59;
        border-radius: 50%;
      }

      .online-or-offline {
        color: #606266;
        font-size: 15px;
        font-family: "DingTalkJinBuTi", serif;
      }
    }
  }

  .middle {
    display: flex;
    width: 100%;
    height: 100%;

    .chat {
      display: flex;
      width: 100%;

      .infinite-scroll1 {
        width: 100%;
        height: 100%;
        overflow: auto;

        .left {
          position: relative;
          display: flex;
          margin-top: 20px;
          align-items: center;
          padding-left: 6px;

          .left-avatar {
            width: 48px;
            height: 48px;
            margin-right: 6px;

            img {
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }

          .left-message {
            position: relative;
            display: flex;
            color: #000;
            height: 36px;
            font-size: 24px;
            padding: 3px 8px;
            background: #ffffff;
            font-family: "DingTalkJinBuTi", serif;
            border-radius: 4px;
            align-items: center;
            margin-top: 10px;
            margin-left: 8px;
            box-shadow: 0 0 12px rgba(0, 0, 0, .12);

            .triangle {
              position: absolute;
              border-right: 8px solid #fff;
              border-top: 6px solid transparent;
              border-bottom: 6px solid transparent;
              left: -6px;
              top: 6px;
            }
          }
        }

        .right {
          position: relative;
          display: flex;
          margin-top: 20px;
          align-items: center;
          padding-right: 6px;
          justify-content: flex-end;

          .right-avatar {
            width: 48px;
            height: 48px;
            margin-left: 6px;

            img {
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }

          .right-message {
            position: relative;
            display: flex;
            color: #000;
            height: 36px;
            font-size: 24px;
            padding: 3px 8px;
            background: #55D58B;
            font-family: "DingTalkJinBuTi", serif;
            border-radius: 4px;
            align-items: center;
            margin-top: 10px;
            margin-right: 8px;
            box-shadow: 0 0 12px rgba(0, 0, 0, .12);

            .triangle {
              position: absolute;
              border-top: 6px solid transparent;
              border-left: 8px solid #55D58B;
              border-bottom: 6px solid transparent;
              right: -6px;
              top: 6px;
            }
          }
        }
      }
    }
  }

  .bottom {
    display: flex;
    width: 100%;
    height: 70px;
    font-size: 20px;
    align-items: center;
    justify-content: space-evenly;
    background: #F7FCFF;

    .bottom-left {
      display: flex;
      align-items: center;
      justify-content: center;

      .emoji {
        width: 28px;
        height: 28px;
        cursor: pointer;
        margin-right: 12px;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .file {
        display: flex;
        color: #A9ACAF;
        cursor: pointer;
        font-size: 28px;
        font-weight: 400;
        align-items: center;
        justify-content: center;
      }

    }

    .bottom-middle {
      width: 80%;

      :deep(.el-input__inner) {
        color: #000;
        font-weight: 600;
        font-family: "Alimama DongFangDaKai", serif;
      }
    }

    .bottom-right {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }



}
.avatar-uploader .el-upload {
  border: 2px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}



</style>