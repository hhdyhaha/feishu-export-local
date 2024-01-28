<script setup lang="ts">
import {type Ref, ref} from 'vue'
import {Search} from '@element-plus/icons-vue'
import {getFolderListApi} from "@/api";

const userAccessToken: Ref<string> = ref('')

interface headerParam {
  UserAgent: string,
  Authorization: string
}

interface params {
  folder_token: string
}

// 点击按钮事件
function getFolderList() {
  let params: params = {
    folder_token: ""
  }
  let headers: headerParam = {
    UserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    Authorization: 'Bearer ' + userAccessToken.value
  }
  if (userAccessToken.value === '') {
    ElMessage({
      message: '请输入user_access_token',
      type: 'warning'
    })
    return
  } else {
    // 获取文件夹列表
    getFiles(params,headers)
  }

}

// 递归遍历文件夹
function getFiles(params, headers) {
  getFolderListApi(params, headers).then(item => {
    // 判断返回数据是否是0，如果是0表示成功，非0表示失败
    if (item.data.code === 0) {
      const files = item.data.data.files
      if (files.length > 0) {
        // 判断文件类型，如果type === 'folder'，表示是文件夹，如果是docx，表示是文本文档
        for (let i = 0; i < files.length; i++) {
          if (files[i].type === 'folder') {
            console.log('是文件夹', files[i])
            params.folder_token = files[i].token
            getFiles(params, headers)
          } else if (files[i].type === 'docx') {
            console.log('是新版文档', files[i])
          }
        }
      } else {
        ElMessage({
          message: '没有文件',
          type: 'warning'
        })
      }
    } else {
      ElMessage({
        message: item.data.msg,
        type: 'error'
      })
    }
  })
}

</script>

<template>
  <el-card class="box-card" shadow="always">
    <div class="user-access-token-div">
      <p>请输入user_access_token</p>
      <el-input
          v-model="userAccessToken"
          size="large"
          placeholder="请输入user_access_token"
          :prefix-icon="Search"
      />
      <el-button
          type="primary"
          text
          bg
          @click="getFolderList"
      >下载
      </el-button
      >
    </div>

  </el-card>
</template>
<style lang="scss">
#app {
  display: flex;
  justify-content: center;
  align-items: center;

}

.box-card {
  width: 88%;
  height: 88%;
  text-align: center;
}

.user-access-token-div {
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    white-space: nowrap;
    margin-right: 1%;
  }

  button {
    margin-left: 1%;
  }
}
</style>