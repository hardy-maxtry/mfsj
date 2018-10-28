import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken, getToken2 } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.ECOM_API, // api的base_url
  timeout: 15000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    // debugger
    if (store.getters.token) {
      // config.headers['X-Token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
      config.headers['token'] = getToken2().token; // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    const res = response.data
    // return res;
    if (res.code != 200) {
      
      if(res.code == 400){
        if(res.msg){
          Message({
            message: res.msg,
            type: 'error',
            duration: 5 * 1000
          })
        }else{
          Message({
            message: '网络请求出错，请联系管理员',
            type: 'error',
            duration: 5 * 1000
          })
        }
        
        return Promise.reject(res);
      }else{
        Message({
          message: '网络请求出错，请联系管理员',
          type: 'error',
          duration: 5 * 1000
        })
        return;
      }
      
      // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm(
          '你已被登出，可以取消继续留在该页面，或者重新登录',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        })
      }
      return Promise.reject(res);
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
