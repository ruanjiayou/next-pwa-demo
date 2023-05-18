import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import config from '~/config.js'
import createRule from './models/rule.js'
import createRecord from './models/record.js'
import createAttachment from './models/attachment.js'
import createChapter from './models/chapter.js'
import createImage from './models/image.js'
import createSegment from './models/segment.js'
import createVideo from './models/video.js'

/**
 * 遍历文件夹
 * @param {object} opt 参数
 * @param {function} cb 回调函数
 */
function loader(opt, cb = null) {
  scanner(opt.dir, cb, opt.filter, opt.recusive);
}

function scanner(dir, cb, filter, recusive) {
  fs.readdirSync(dir).forEach(file => {
    const fullpath = path.join(dir, file);
    const ext = path.extname(file).toLocaleLowerCase();
    const filename = file.substr(0, file.length - ext.length);
    if (recusive === true && fs.existsSync(fullpath) && fs.lstatSync(fullpath).isDirectory()) {
      scanner(fullpath, cb, filter, recusive);
    } else if (cb) {
      // filter处理
      cb({ fullpath, dir, filename, ext });
    }
  });
}

mongoose.connect(`mongodb://${config.mongo.user ? config.mongo.user + ':' + config.mongo.pass + '@' : ''}${config.mongo.host}:${config.mongo.port}/${config.mongo.db}?authSource=admin`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  return true;
}).catch(e => {
  console.log(e, 'mongo')
});

if (!global.models) {
  global.models = {
    Rule: createRule(),
    Attachment: createAttachment(),
    Chapter: createChapter(),
    Image: createImage(),
    Record: createRecord(),
    Segment: createSegment(),
    Video: createVideo(),
  }
}

export default global.models