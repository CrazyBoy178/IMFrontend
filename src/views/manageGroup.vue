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
              <el-icon @click="toGroup()">
                <ChatSquare />
              </el-icon>
            </div>
            <div class="option">
              <el-icon>
                <Avatar/>
              </el-icon>
            </div>
            <div class="option">
              <el-icon @click="toAddFriend()">
                <HomeFilled />
              </el-icon>
            </div>
            <div class="option">
              <el-icon>
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

      <el-col :span="22">

        <div class="container">
          <div class="title">
            <h1>群聊管理</h1>
          </div>
          <div class="table">
            <el-table :data="filterTableData" style="width: 100%">
              <el-table-column label="群聊ID" prop="groupId" />
              <el-table-column label="群聊名称" prop="groupName" />
              <el-table-column label="创建者" prop="groupOwner" />
              <el-table-column label="群聊成员" prop="groupMember" />

              <el-table-column align="right">
                <template #header>
                  <el-input v-model="search" size="small" placeholder="搜索群聊" />
                </template>
                <template #default="scope">

                  <el-button v-show="scope.row.groupOwner===userStore.uid"
                      type="danger"
                      @click="handleDelete(scope.$index, scope.row)"
                  >删除群聊</el-button>
                  <el-button v-show="scope.row.groupOwner!==userStore.uid"
                    type="danger"
                    @click="handleDelete1(scope.$index, scope.row)"
                >退出群聊</el-button>
                  <el-button
                      type="primary"
                      @click="handleDownload(scope.$index, scope.row)"
                  >下载记录</el-button>
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
      <span>确认删除吗?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="confirm= false">取消</el-button>
          <el-button type="danger" @click="handleConfirm(rowGroupId)">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
        v-model="confirm1"
        title="提示"
        width="500"
    >
      <span>确认退出吗?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="confirm1= false">取消</el-button>
          <el-button type="danger" @click="handleConfirm1(rowGroupId)">
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
import {Avatar, ChatSquare, Comment, HomeFilled, MessageBox, Plus, Tools} from "@element-plus/icons-vue";
import {computed, onMounted, reactive, ref, toRefs} from 'vue'
import {useNetwork} from '@vueuse/core'
import {useUser} from '../store/user';
import {storeToRefs} from 'pinia'
import axios from "axios";
import type {UploadProps} from 'element-plus'
import {ElMessage} from 'element-plus'
import router from "@/router";
import Group from "@/views/group.vue";

const userStore = useUser()

let currentPage1 = ref<number>(1)
let total = ref<number>(0);
console.log(currentPage1.value)


const {uid,nickname,avatar,jointime, friendsInfo, friendsListInfo} = storeToRefs(userStore)
const regForm = ref(null);
const network = reactive(useNetwork())
const {isOnline} = toRefs(network)

const search = ref('')
const search1 = ref('')
const search2 = ref('')
const imageUrl = ref('')
const groupname = ref('')

let dialogFormVisible = ref(false)
let dialogFormVisible2 = ref(false)
let dialogFormVisible3 = ref(false)
let dialogFormVisible4 = ref(false)
let confirm = ref(false)
let confirm1 = ref(false)



interface GroupInfo {
  groupId:string
  groupName:string
  roupOwner:string
  groupMember:string
}
const friendInfo = ref<GroupInfo[]>([]);

let rowGroupId = ref<String>('')

const handleDelete = (index: number, row: GroupInfo) => {
  confirm.value = true;
  rowGroupId.value = row.groupId;
  console.log(row.groupId)
}

const handleDelete1 = (index: number, row: GroupInfo) => {
  confirm1.value = true;
  rowGroupId.value = row.groupId;
}

const handleDownload = async (index: number, row: GroupInfo) => {
  try {
    // 发起 HTTP GET 请求获取文件路径
    const response = await axios.get(`http://localhost:8080/msgInfo/group/${row.groupId}`);
    const filePath: string = response.data;

    // 发起 HTTP POST 请求下载文件
    const resp = await axios.get(`http://localhost:8080/msgInfo/download?filePath=${encodeURIComponent(filePath)}`, {
      responseType: 'blob' // 告诉 axios 服务器返回的数据类型是 Blob
    });

    // 将文件内容转换为 Blob 对象
    const blob = new Blob([resp.data]);

    // 创建一个虚拟的<a>标签
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);

    // 从文件路径中提取文件名作为下载文件的文件名
    downloadLink.download = filePath.substring(filePath.lastIndexOf('/') + 1);

    // 模拟点击链接来下载文件
    downloadLink.click();
  } catch (error) {
    console.error('下载文件时出错:', error);
    alert("消息为空")
  }
}


async function handleConfirm(value) {
  console.log(value);
  try {
    await axios.get(`http://localhost:8080/group/delete/${userStore.uid}/${value}`);
    console.log('删除成功');
    console.log(currentPage1);


    await fetchGroups(userStore.uid, currentPage1.value);

    confirm.value = false;
  } catch (error) {
    console.error('删除失败', error);
    alert('删除失败');
  }
}

async function handleConfirm1(value) {
  console.log(value);
  try {
    await axios.get(`http://localhost:8080/group/deletegroup/${userStore.uid}/${value}`);
    console.log('删除成功');
    console.log(currentPage1);
    await fetchGroups(userStore.uid, currentPage1.value);
    confirm1.value = false;
  } catch (error) {
    console.error('删除失败', error);
    alert('删除失败');
  }
}


const filterTableData = computed(() =>
    friendInfo.value.filter(
        (data) =>
            !search.value ||
            data.group_name.toLowerCase().includes(search.value.toLowerCase())
    )
)

function handleCurrentPageChange(newPage) {
  currentPage1 = newPage;
  fetchGroups(userStore.uid,currentPage1);
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
  search1.value = ''
  reset()
  done()
}



const reset=()=>{
  dialogFormVisible.value = false
  dialogFormVisible2.value = false
  dialogFormVisible3.value = false
  dialogFormVisible4.value = false

  form.value.nickname = userStore.nickname;
  if (regForm.value !== null) { // 检查目标对象是否存在
    regForm.value.resetFields();
  }
  modify.value=false
  imageUrl.value = null
  confirm.value = false
  groupname.value = ''
  search1.value = ''
  search2.value = ''

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
    if(form.value.nickname===''){
      alert('请输入完整的信息')
      return
    }
    const resp = await axios.post(`http://localhost:8080/user/modify`,form.value);

    await getInfo(resp.data);
    window.location.reload();

  } catch (error) {
    alert('Failed to submit');
  }
  reset()
}

const friendForm = ref({
  userid:'',
  friendid: '',
});

async function getInfo(value:any) {
  localStorage.setItem('token',value)
  try {
    const dectoken = await axios.post('http://localhost:8080/token/decodeToken', localStorage.getItem('token'));
    const info = dectoken.data;
    await userStore.initUser(info.uid, info.nickname, info.avatar, info.jtime)
    form.value.uid = info.uid
    form.value.nickname = info.nickname
    console.log(uid.value)



  } catch (error) {
    console.error('token请求失败', error);
  }
}

onMounted(async () => {
  await getInfo(localStorage.getItem('token'));
  await fetchGroups(userStore.uid,currentPage1.value);
});
const fetchGroups = async (uid, page)=>{
  try {
    const response = await axios.get(`http://localhost:8080/group/getAllGroup/${uid}/page/${page}`);
    const count = await axios.get(`http://localhost:8080/group/getAllGroup/${uid}`);
    console.log(response.data)
    friendInfo.value = response.data
    total.value = count.data
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error; // You might want to handle this error in the calling code
  }
}

function toGroup(){
  router.push('/group')
}

function toHomePage() {
  router.push('/home')
}

function toAddFriend (){
  router.push('/addFriend')
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

      .option:hover, .option:nth-child(5) {
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