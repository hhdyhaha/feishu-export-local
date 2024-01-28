import axiosInstance from "@/utils/http";


// 获取文件夹清单
export const getFolderListApi = (params?:object,headers?:object)=>{
    return axiosInstance({
        url:'/files',
        method:'get',
        params: params,
        headers: headers,
        requestBaseUrl:'V1'
    })
}

// 获取文件夹元信息
export const folderMetaApi = (folderToken?:string,headers?:object)=>{
    return axiosInstance({
        url:`/folder/${folderToken}/meta`,
        method:'get',
        headers: headers,
        requestBaseUrl:'V2'
    })
}

// 创建导出任务
export const exportTaskApi = (params?:object,headers?:object)=>{
    return axiosInstance({
        url:'/export_tasks',
        method:'post',
        data: params,
        headers: headers,
        requestBaseUrl:'V1'
    })
}
// 查询导出任务结果

// 下载导出文件