import Vue from 'vue';
import store from '@/store';
import axios from 'axios';
import config from '../config';
import router from '../router';

const instance = axios.create({
  baseURL: config.baseURL || '/',
  timeout: 60000,
  responseType: 'json',
  withCredentials: false, // 是否允许带cookie这些
});

// 请求拦截
instance.interceptors.request.use(
  (config) => {
    if (config.method === 'get') {
      config.params &&
        Object.keys(config.params).forEach((item) => {
          if (
            config.params[item] === null ||
            config.params[item] === undefined
          ) {
            config.params[item] = '';
          }
        });
    } else {
      config.data &&
        Object.keys(config.data).forEach((item) => {
          if (config.data[item] === null || config.data[item] === undefined) {
            config.data[item] = '';
          }
        });
    }
    const token = Vue.ls.get('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    console.error({
      message: '提示',
      description: error,
    });
    return Promise.reject(error);
  }
);

// 响应拦截
instance.interceptors.response.use(
  (response) => {
    if (response.data.code === 200) {
      return response.data;
    } else if (response.data.code === 401) {
      store.dispatch('loginOut');
      router.replace({ name: 'login' });
      console.error({
        message: '提示',
        description: response.data.msg || response.data.message,
      });
      return Promise.reject(response.data);
    } else {
      if (
        !response.config.requestConfig ||
        !response.config.requestConfig.noErrorMsg
      ) {
        const msg = response.data.msg || response.data.message || '系统错误';
        console.error({
          message: '提示',
          description: msg,
        });
      }
      return Promise.reject(response.data);
    }
  },
  (error) => {
    if (error && error.response) {
      const data = error.response.data;
      const token = Vue.ls.get('token');
      if (error.response.status === 403) {
        console.error({
          message: 'Forbidden',
          description: data.message,
        });
      }
      if (
        error.response.status === 401 &&
        !(data.result && data.result.isLogin)
      ) {
        console.error({
          message: 'Unauthorized',
          description: 'Authorization verification failed',
        });
        if (token) {
          store.dispatch('Logout').then(() => {
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          });
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 *
 * @param {String} url 请求地址
 * @param {Object} data 请求数据,key/value格式
 * @param {String} method 请求方法(get|post|put|patch|delete...)
 * @param {Object} requestConfig 请求配置，（noErrorMsg:错误请求是否展示提示;）
 * @returns {Promise} 响应
 */
const request = (method, url, data, requestConfig) => {
  if (typeof method === 'object') {
    let config = method;
    url = config.url || '/';
    data = config.data || {};
    method = config.method || 'post';
    requestConfig = config.requestConfig || null;
  }
  const option = {
    url,
    method,
    requestConfig,
  };
  if (/put|post|patch/i.test(method)) {
    option.data = data;
  } else {
    option.params = data;
  }
  return instance(option);
};

export default request;
