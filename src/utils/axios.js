/**
 * Created by xusheng on 2018/7/10 0010.
 */
import qs from "qs";
import axios from "axios";
import store from "../store";
import router from "@/router";

axios.defaults.timeout = 30000;
axios.defaults.baseURL = process.env.VUE_APP_API_URL;
// axios.defaults.baseURL = "http://10.4.2.18:8000";
// axios.defaults.baseURL = "http://127.0.0.1:8080";
// axios.defaults.baseURL = "http://172.16.177.230:8080";

//http request 拦截器
axios.interceptors.request.use(
  (config) => {
    config.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.rst_token || ""}`,
    };
    config.cancelToken = new axios.CancelToken(e => {
      store.commit("addCancelToken", {
        cancel: e,
        url: config.url
      });
    });
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

//响应拦截器即异常处理
axios.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      switch (response.data.code) {
        case 401:
          localStorage.clear();
          sessionStorage.clear();
          router.push("/login");
          break;
      }
    }
    return response;
  },
  (err) => {
    if (axios.isCancel(err)) {
      // 请求取消
      console.warn(err);
      console.table([err.message.split("---")[0]], "cancel");
    } else {
    let errorText = "";
    if (err && err.response) {
      switch (err.response.status) {
        case 400:
          errorText = "错误请求";
          break;
        case 401:
          errorText = "未授权，请重新登录";
          break;
        case 403:
          errorText = "拒绝访问";
          break;
        case 404:
          errorText = "请求错误,未找到该资源";
          break;
        case 405:
          errorText = "请求方法未允许";
          break;
        case 408:
          errorText = "请求超时";
          break;
        case 500:
          errorText = "服务器端出错";
          break;
        case 501:
          errorText = "网络未实现";
          break;
        case 502:
          errorText = "网络错误";
          break;
        case 503:
          errorText = "服务不可用";
          break;
        case 504:
          errorText = "网络超时";
          break;
        case 505:
          errorText = "http版本不支持该请求";
          break;
        default:
          errorText = `连接错误${err.response.status}`;
      }
    } else {
      errorText = "连接到服务器失败";
    }
    return Promise.reject(errorText);
  }
  }
);

export async function HTTP(url = "", params = {}, methods = "post", nocode = false, timeout = 30000) {
  return new Promise((resolve, reject) => {
    // axios[methods](
    //   methods === "get"
    //     ? params
    //       ? `${url}?${qs.stringify(params)}`
    //       : url
    //     : url,
    //   params,
    // )
    axios({
      method: methods,
      url: methods === "get"
        ? params
          ? `${url}?${qs.stringify(params)}`
          : url
        : url,
      data: params,
      timeout: timeout
    })
      .then(({ data }) => {
        if (nocode) {
          resolve(data);
        } else {
          if (data.code !== 200) {
            reject(data.msg);
          } else {
            resolve(data);
          }
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function GetImage(url = "", params = {}) {
  return new Promise((resolve, reject) => {
    axios.post(url, params, {
      responseType: "blob",
    }).then((res) => {
      return res.data
    }).then(data => {
      resolve(data)
    }).catch(err => {
      reject(err)
    })
  });
}
