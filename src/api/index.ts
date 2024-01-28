import axiosInstance from "@/utils/http";


export const getFolderListApi = (params?:object,headers?:object)=>{
    return axiosInstance({
        url:'/files',
        method:'get',
        params: params,
        headers: headers
    })
}