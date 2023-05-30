import mongoose from 'mongoose'
import constant from '~/constant.js'
import Custom from '~/db/mongo/custom.js'
import { URL } from 'url'
import sparkmd5 from 'spark-md5'
import { match, compile } from 'path-to-regexp';
import qs from 'querystring'
import _ from 'lodash'

const Schema = mongoose.Schema;

export default function createRule() {
  const schema = new Schema({
    _id: {
      type: String,
      comment: '标识id'
    },
    type: {
      type: String,
      default: '',
      comment: 'single,page',
    },
    mode: {
      type: String,
      enum: ['browser', 'pupeeter', 'request'],
      comment: 'nas用不了代理,只能浏览器处理.一般都可以服务器里request',
      default: 'fetch'
    },
    proxy: {
      type: Number,
      default: 0
    },
    resource_type: String,
    name: {
      type: String,
      default: '',
    },
    desc: {
      type: String,
      default: '',
    },
    urls: {
      type: [{
        _id: false,
        url: String,
        enabled: Boolean
      }],
      comment: 'regpath格式',
    },
    pattern: {
      type: String,
    },
    script: {
      type: String,
      default: '// js business code here',
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: Number,
      default: constant.RULE.STATUS.WAITING,
    },
  }, {
    strict: true,
    collections: 'rule',
  });
  schema.loadClass(Custom);
  schema.loadClass(class Rule {
    /**
     * 获取统一格式的资源id
     * @param {string} source_id 
     * @returns string
     */
    getResourceId(source_id) {
      return sparkmd5.hash(this._id + '|' + source_id)
    }
    getUrlByParams(params) {
      const u = new URL(this.pattern);
      const fn = compile(u.pathname || '', { decode: decodeURIComponent });
      const pathname = fn(params);
      const query = {};
      [...u.searchParams.entries()].forEach(([key]) => {
        query[key] = params[key];
      })
      return u.origin + pathname + (_.isEmpty(query) ? '' : '?' + qs.stringify(query));
    }
    /**
     * 去掉url多余的参数
     * @param {string} url 
     * @returns string
     */
    getPureUrl(url) {
      const u = new URL(url);
      const o = new URL(this.pattern);
      const query = {};
      [...(o.searchParams.entries())].forEach(([key]) => {
        query[key] = u.searchParams.get(key);
      });
      return u.origin + u.pathname + (_.isEmpty(query) ? '' : '?' + qs.parse(query));
    }
    /**
     * 获取url中的参数,必定有id
     * @param {string} url 
     * @returns {id}
     */
    getParams(url) {
      const u = new URL(url);
      let params = {};
      const match_url = this.pattern;
      const fn = match(new URL(match_url).pathname || '', { decode: decodeURIComponent });
      const parsed = fn(u.pathname);
      if (parsed.params) {
        params = parsed.params;
        const arr = [...(new URL(match_url).searchParams.entries())]
        arr.forEach(([key, value]) => {
          if (value.startsWith(':')) {
            value = value.substring(1);
            params[value] = u.searchParams.get(key);
          }
        });
      }
      return _.isEmpty(params) ? null : params;
    }
  })
  return mongoose.model('rule', schema);
};