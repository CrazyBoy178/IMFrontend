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
              <el-icon @click="toManageFriend()">
                <Avatar/>
              </el-icon>
            </div>
            <div class="option">
              <el-icon >
                <HomeFilled />
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

      <el-col :span="22">
        <div class="container">
          <div class="title">
            <h1>交友大厅</h1>
          </div>

          <div class="table">
            <el-table :data="filterTableData" style="width: 100%">
              <el-table-column label="账号" prop="uid" />
              <el-table-column label="昵称" prop="nickname" />
              <el-table-column label="头像" align="center" >
                <template #default="{ row }">
                  <el-avatar :src="row.avatar" shape="square" style="width: 38px; height: 38px;" />
                </template>
              </el-table-column>
              <el-table-column label="加入时间" prop="jtime" />
              <el-table-column align="right">
                <template #header>
                  <el-input v-model="search" size="small" placeholder="搜索好友" />
                </template>
                <template #default="scope">
                  <el-button
                      type="primary"
                      @click="handleAdd(scope.$index, scope.row)"
                  >添加好友</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="pagination-container">
            <el-pagination
                v-model:current-page="currentPage1"
                layout="prev, pager, next,total"
                :total="total"
                @current-change="handleCurrentPageChange"
            >
            </el-pagination>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog
        v-model="confirm"
        title="提示"
        width="500"
    >
      <span>确认添加吗?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="confirm= false">取消</el-button>
          <el-button type="success" @click="handleConfirm(rowUid)">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

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
  CirclePlus, HomeFilled
} from "@element-plus/icons-vue";
import {onMounted, reactive, ref, toRefs, computed} from 'vue'
import {useNetwork} from '@vueuse/core'
import {useUser} from '../store/user';
import {storeToRefs} from 'pinia'
import axios from "axios";
import type { UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import router from "@/router";

const userStore = useUser()

let currentPage1 = ref<number>(1)
let total = ref<number>(0);
console.log(currentPage1.value)


const {uid,nickname,avatar,jointime, friendsInfo, friendsListInfo} = storeToRefs(userStore)
const regForm = ref(null);
const network = reactive(useNetwork())
const {isOnline} = toRefs(network)

const search = ref('')
const imageUrl = ref('')

let dialogFormVisible = ref(false)
let confirm = ref(false)



interface User {
  uid: string
  nickname: string
  avatar: string
  jtime: string
}
const userInfo = ref<User[]>([]);

let rowUid = ref<String>('')

const handleAdd = (index: number, row: User) => {
  confirm.value = true;
  rowUid.value = row.uid;
}


async function handleConfirm(value) {
  console.log(value);
  try {
    const resp = await axios.post("http://localhost:8080/friend/add", {
      userid: userStore.uid,
      friendid: value
    });
    if (resp.data===200){
      alert('添加成功');
    }else if(resp.data===201){
      alert('添加失败 好友信息不存在')
    }else if(resp.data===203){
      alert('添加失败不要重复添加');
    }else{
      alert('添加失败');
    }
    confirm.value = false;
  } catch (error) {
    console.error('添加失败', error);
    alert('添加失败');
  }
}


const filterTableData = computed(() =>
    userInfo.value.filter(
        (data) =>
            !search.value ||
            data.nickname.toLowerCase().includes(search.value.toLowerCase())
    )
)

function handleCurrentPageChange(newPage) {
  currentPage1 = newPage;
  console.log(currentPage1)
  fetchUser(userStore.uid,currentPage1);
}

const form = ref({
  uid: userStore.uid,
  nickname: userStore.nickname,
})

const logout = async () => {
  localStorage.clear()
  location.reload();

  await router.push('/')
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
  confirm.value = false
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


let modify = ref(false)

const back = async () => {
  modify.value=false

}
const beforesubmit = async () => {
  modify.value=true

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

const friendForm = ref({
  userId:'',
  friendId: '',
});

async function getInfo(value:any) {
  localStorage.setItem('token',value)
  try {
    const dectoken = await axios.post('http://localhost:8080/token/decodeToken', localStorage.getItem('token'));
    const info = dectoken.data;
    form.value.uid = info.uid
    form.value.nickname = info.nickname

    await userStore.initUser(info.uid, info.nickname, info.avatar, info.jtime)


  } catch (error) {
    console.error('token请求失败', error);
  }
}

onMounted(async () => {
  await getInfo(localStorage.getItem('token'));
  await fetchUser(userStore.uid,currentPage1.value);
});
const fetchUser = async (uid,page)=>{
  try {
    const response = await axios.get(`http://localhost:8080/user/${uid}/page/${page}`);
    const count = await axios.get(`http://localhost:8080/user/page/count`);
    console.log(response.data)

    userInfo.value = response.data
    total.value = count.data-1
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error; // You might want to handle this error in the calling code
  }
}



const submitFriends = async() => {
  friendForm.value.userId = userStore.uid;
  friendForm.value.friendId = search.value;

  const response = await axios.post('http://localhost:8080/friend/add', friendForm.value);
  if (response.data===200){
    alert('添加成功');
  }else if(response.data===201){
    alert('添加失败 好友信息不存在')
  }else if(response.data===203){
    alert('添加失败不要重复添加');
  }else{
    alert('添加失败');
  }
}

function toHomePage() {
  router.push('/home')
}

function toManageFriend (){
  router.push('/manageFriend')
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

      .option:hover, .option:nth-child(3) {
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

.container {
  display: flex;
  flex-direction: column; /* 垂直布局 */
  align-items: center; /* 水平居中 */

  .title{
    width: 100%;
    display: flex;
    justify-content: space-between; /* 左右对齐 */
    align-items: center; /* 水平居中 */
    h1{
      padding-left: 20px;
    }
    .button{
      padding-right: 20px;
    }

  }
  .table{
    width: 100%;
  }

  .pagination-container {
    position: fixed;
    bottom: 20px; /* 离页面底部的距离 */

    text-align: center; /* 水平居中 */
  }

}

.pagination-container {
  position: fixed;
  bottom: 20px; /* 离页面底部的距离 */

  text-align: center; /* 水平居中 */
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