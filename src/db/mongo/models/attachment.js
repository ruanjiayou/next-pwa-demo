import mongoose from 'mongoose'
import constant from '~/constant.js'
import Custom from '~/db/mongo/custom.js'

const Schema = mongoose.Schema;
export default  function createAttachment() {
  const schema = new Schema({
    _id: {
      type: String,
      comment: 'guid'
    },
    resource_id: {
      type: String,
      default: '',
    },
    media_type: {
      type: String, // image,video,audio,file
    },
    more: {
      width: Number,
      height: Number,
      rotate: Number,
      size: Number,
      duration: Number,
    },
    title: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
      comment: 'audio/video的封面可以通过ffmpeg写到文件里,图片的缩略图',
    },
    url: {
      type: String,
      default: '',
    },
    filepath: {
      type: String,
      default: '',
    },
    temppath: {
      type: String, // 如果是需要转码.m3u8
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: Number,
      default: constant.ATTACHMENT.STATUS.CREATED,
    },
    message: String, // 错误信息
  }, {
    strict: true,
    collections: 'attachment',
  });
  schema.loadClass(Custom);
  return mongoose.model('attachment', schema);
};