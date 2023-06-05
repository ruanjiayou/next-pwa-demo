import mongoose from 'mongoose'
import constant from '~/constant.js'
import Custom from '~/db/mongo/custom.js'

const Schema = mongoose.Schema;

export default function createRecord() {
  const schema = new Schema({
    url: {
      type: String,
      comment: '去除不必要参数的有效url',
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
    _id: { // resource_id
      type: String,
      comment: 'spark(rule_id|source_id)'
    },
    uid: String,
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
    desc: {
      type: String,
    },
    content: String,
    tags: [String],
    peoples: [
      { type: String, _id: false, people: [String] }
    ],
    // series 运营字段
    // poster/thumbnail 在attachment
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
    size: Number,
    chapters: Number,
    region: String,

    available: {
      type: Number, // 0 下线 1 上线
      default: 0,
    },
    resources: [
      { _id: false, id: String, type: String }
    ],
    // class publish() craw() check()
    tasks: [{ _id: false, task: String, status: Number }], // attachment image cover detail extra transcode
  }, {
    strict: true,
    collections: 'record',
  });
  schema.loadClass(Custom);
  return mongoose.model('record', schema);
};