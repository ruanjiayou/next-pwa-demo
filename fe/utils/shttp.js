import axios from 'axios';

//基础URL，axios将会自动拼接在url前
//process.env.NODE_ENV 判断是否为开发环境 根据不同环境使用不同的baseURL 方便调试
let baseURL = process.env.NODE_ENV === 'development' ? '/api' : '/api';

//默认请求超时时间
const timeout = 10000;

//创建axios实例
const instance = axios.create({
  timeout,
  baseURL,
  //如需要携带cookie 该值需设为true
  withCredentials: false
});

//统一请求拦截 可配置自定义headers 例如 language、token等
instance.interceptors.request.use(
  (config) => {
    //配置自定义请求头
    // x-signature
    let customHeaders = {
      'Accept-Language': 'zh-CN',
      'Authorization': '',
    };
    config.headers = customHeaders;
    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
);

instance.interceptors.response.use(resp => {
  if (resp.status === 200) {
    return resp.data;
  } else {
    throw ('请求错误');
  }
}, function (error) {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  return Promise.reject(error);
})

export default instance;