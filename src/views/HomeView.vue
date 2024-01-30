<script setup lang="ts">
import {type Ref, ref} from 'vue'
import {Search} from '@element-plus/icons-vue'
import {exportFileApi, exportTaskApi, exportTaskResultApi, folderMetaApi, getFolderListApi} from "@/api";

const userAccessToken: Ref<string> = ref('')

interface headerParam {
  UserAgent: string,
  Authorization: string
}

// 点击按钮事件
function getFolderList() {
  let params = {
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
    getFiles(params, headers)
  }

}

// 递归遍历文件夹
function getFiles(params: object, headers: object, parentId: string = '') {
  return getFolderListApi(params, headers).then(async item => {
    // 判断返回数据是否是0，如果是0表示成功，非0表示失败
    if (item.data.code === 0) {
      const files = item.data.data.files
      if (files.length > 0) {
        // 判断文件类型，如果type === 'folder'，表示是文件夹，如果是docx，表示是文本文档
        for (let i = 0; i < files.length; i++) {
          if (files[i].type === 'folder') {
            params['folder_token'] = files[i].token
            await getFiles(params, headers, files[i].parent_token)
          } else if (files[i].type === 'docx') {
            const params = {
              "file_extension": "docx",
              "token": files[i].token,
              "type": "docx"
            }
            // 获取文件夹元信息
            let fileParentName = await getFolderMeta(files[i].parent_token, headers)
            // 创建导出任务
            await createExportTask(params, headers, fileParentName)
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

// 获取文件夹元信息
function getFolderMeta(folderToken: string, headers: object) {
  return folderMetaApi(folderToken, headers).then(res => {
    const fileParentName = res.data.data.name
    if (res.data.code === 0) {
      return fileParentName
    } else {
      ElMessage({
        message: res.data.msg,
        type: 'error'
      })
      return false
    }
  })
}

// 创建导出任务
async function createExportTask(params: object, headers: object, fileParentName: string) {
  return await exportTaskApi(params, headers).then(async res => {
    if (res.data.code === 0) {
      const ticketInfo: string = res.data.data.ticket
      const getTaskResultParams = {
        "token": params['token']
      }
      await setTimeout(async () => {
        // 查询导出任务结果
        await getExportTaskResult(getTaskResultParams, ticketInfo, headers, fileParentName)
      }, 1000)

    } else {
      ElMessage({type: 'error', message: res.data.msg})
      return false
    }
  })
}

// 查询导出任务结果
async function getExportTaskResult(params: object, ticket: string, headers: object, fileParentName: string) {
  return await exportTaskResultApi(params, ticket, headers).then(async res => {
    if (res.data.code === 0 && res.data.data.result.job_status === 0) {
      const fileToken: string = res.data.data.result.file_token
      const fileName: string = res.data.data.result.file_name
      // 下载导出文件
      await downloadFile(fileToken, headers, fileName, fileParentName)
      return true
    } else {
      ElMessage({type: 'error', message: res.data.msg})
      return false
    }
  })
}

// 下载导出文件
function downloadFile(file_token: string, headers: object, fileName: string, fileParentName: string) {
  return exportFileApi(file_token, headers).then(res => {
    if (res.status === 200) {
      ElMessage.success('下载文件成功')
      const blob = new Blob([res.data], {type: 'application/octet-stream'})
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileParentName + '-' + fileName + '.docx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      setTimeout(() => {
        document.body.removeChild(a)
      }, 1000)
      return true
    } else {
      ElMessage({type: 'error', message: res.data.msg})
    }

  }).catch(err => {
    ElMessage({type: 'error', message: err})
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