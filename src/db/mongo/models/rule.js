import mongoose from 'mongoose'
import constant from '~/constant.js'
import Custom from '~/db/mongo/custom.js'

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
      type: [String],
      comment: 'regpath格式',
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
  return mongoose.model('rule', schema);
};