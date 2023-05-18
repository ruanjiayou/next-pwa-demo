import mongoose from 'mongoose'
import constant from '~/constant.js'
import Custom from '~/db/mongo/custom.js'

const Schema = mongoose.Schema;

export default function createRecord() {
  const schema = new Schema({
    _id: {
      type: String,
      comment: 'spark(rule_id,source_id)'
    },
    url: {
      type: String,
      comment: '去除不必要参数的有效url', // animate.me 没有
    },
    raw: Object,
    source_id: {
      type: String,
      default: '',
    },
    rule_id: {
      type: String,
      default: '',
    },
    // 影视: 电影 电视剧 记录片 综艺
    resource_type: {
      // video short music 不在栏目分类里展示,可以在搜索分类
      type: String,
      enum: ['novel', 'article', 'anwser', 'gallery', 'movie', 'series', 'video', 'music'],
      comment: 'novel: 短篇',
    },
    types: {
      type: [String],
      comment: 'article: novel/ticker series: documentary/variat video: short movie,series: animation all: R18 private '
    },
    title: {
      type: String,
    },
    // class publish() craw() check()
    tasks: [{ _id: false, task: String, status: Number }], // attachment image cover detail extra transcode
    created_at: {
      type: Date,
      default: Date.now
    },
    status: {
      type: Number,
      default: constant.RECORD.STATUS.CREATED,
    },
    updating: {
      type: Number,
      default: 0, // 1 连载中 0 已完结
    },
    amount: Number, // chapters size
    available: {
      type: Number, // 0 下线 1 上线
      default: 0,
    },
    new: {
      type: Object
    }
  }, {
    strict: true,
    collections: 'record',
  });
  schema.loadClass(Custom);
  return mongoose.model('record', schema);
};