import fs from 'fs'
import path from 'path'
import { mkdirp } from 'mkdirp';
import crypto from 'crypto'

export default {
  /**
   * 根据格式生成path
   * @param {date} date 日期
   * @param {string} format 格式
   * @param {string} filename 文件名
   */
  formater(date, format, filename) {
    var res = format,
      m = '',
      stack = [],
      reg = /\{(\w+)\}/g;
    let segs = filename.split('.');
    let ext = segs.pop();
    let name = segs.join('.');
    while ((m = reg.exec(format)) !== null) {
      if (stack.indexOf(m[1]) === -1) {
        stack.push(m[1]);
      }
    }
    for (var i = 0; i < stack.length; i++) {
      var k = stack[i];
      let attr = k;
      var bLong = (k.length === 2 && k[0].toLowerCase() === k[1].toLowerCase()) ? true : false;
      var v = null;
      if (bLong) {
        k = k[0];
      }
      if (['y', 'q', 'm', 'h', 'i', 's'].includes(k)) {
        k = k.toUpperCase();
      }
      switch (k) {
        case 'Y':
          v = date.getFullYear();
          if (!bLong) {
            v = v % 100;
          }
          break;
        case 'Q':
          v = Math.floor((date.getMonth() + 3) / 3);
          break;
        case 'M':
          v = date.getMonth() + 1;
          break;
        case 'M':
          v = date.getMonth() + 1;
          break;
        case 'W':
          v = date.getDay();
          break;
        case 'D':
          v = date.getDate();
          break;
        case 'H':
          v = date.getHours();
          break;
        case 'I':
          v = date.getMinutes();
          break;
        case 'S':
          v = date.getSeconds();
          break;
        case 'ext':
          v = ext;
          break;
        case 'name':
          v = name;
          break;
        default: break;
      }
      if (bLong && k != 'Y' && v < 10) {
        v = `0${v}`;
      }
      if (/^\d+$/.test(k)) {
        // 随机字符串
        k = parseInt(k);
        v = this.random(k, 'imix');
      }
      res = res.replace(new RegExp('[{]' + attr + '[}]', 'g'), v);
    }
    return res;
  },
  /**
   * 判断路径是否合法
   * @param {string} path - 路径
   * @return {boolean} - true 路径合法 false - 路径不合法
   */
  isValidPath(path) {
    return /[<>"/?\\*|':]/.test(path);
  },
  /**
  * 去掉路径中不合法的字符
  * @param {string} path - 路径
  * @return {string} - 返回合法的字符
  */
  toValidPath(path) {
    return path.replace(/[<>"/?\\*|':]/g, ' ');
  },

  /**
  * 生成16位长度的GUID
  */
  GUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).toUpperCase();
  },

  /**
   * 生成随机字符串
   * @param {int} $len 长度,默认32,最小长度为6
   * @param {string} $type 类型,number,imix,mix,char,ichar
   */
  random(len, type = 'number') {
    let chs = '';
    let res = '';
    if (type === 'mix') {
      chs = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';
    } else if (type === 'imix') {
      chs = '1234567890ABCDEFGHIJKLOMNOPQRSTUVWXYZ';
    } else if (type === 'char') {
      chs = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';
    } else if (type === 'ichar') {
      chs = 'ABCDEFGHIJKLOMNOPQRSTUVWXYZ';
    } else {
      chs = '1234567890';
    }
    if (len < 6) {
      len = 6;
    }
    for (let i = 0, l = chs.length - 1; i < len; i++) {
      let ran = Math.round(Math.random() * l);
      res += chs[ran];
    }
    return res;
  },

  /**
  * 判断文件是否存在
  * @param {string} path - 文件路径
  * @return {boolean} - true 文件存在 false 文件不存在
  */
  isFileExists(path) {
    return fs.existsSync(path) && !fs.lstatSync(path).isDirectory();
  },
  /**
  * 判断目录是否存在
  * @param {string} dir - 目录路径
  * @return {boolean} - true 目录存在 false 目录不存在
  */
  isDirExists(dir) {
    return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
  },

  getPathInfo(filepath) {
    filepath = filepath.replace(new RegExp('[\]', 'g'), '/');
    const arr = filepath.split('/');
    let [key, ext] = arr.pop().split('.');
    const info = {
      dir: arr.join('/'),
      key: key,
      ext: ext === undefined ? '' : ext,
      fullpath: filepath
    };
    return info;
  },
  /**
   * 生成随机时间字符串
   * @param {string} format 格式
   */
  generatePath(format, filename) {
    return this.formater(new Date(), format, filename);
  },
  /**
  * 遍历目录文件方法
  * @param {string} dir 目录
  * @param {AsyncFunction} cb 回调函数
  * @param {AsyncFunction} [filter] 过滤函数
  */
  async eachAsync(dir, cb, filter) {
    let files = fs.readdirSync(dir);
    for (let i = 0; i < files.length; i++) {
      let file = path.join(dir, files[i]);
      if (this.isDirExists(file)) {
        await this.eachAsync(file, cb, filter);
      } else if (void 0 === filter || true === await filter(file)) {
        await cb(file);
      }
    }
  },
  /**
  * 同步读取文件文本
  * @param {string} path - 文件绝对路径
  * @return {string} - 字符串
  */
  readTxt(path) {
    var res = '';
    if (this.isFileExists(path)) {
      res = fs.readFileSync(path, 'utf-8');
    }
    return res;
  },
  /**
  * 写入文件
  * @param {string} path - 文件路径
  * @param {*} txt - 字符串
  * @return {boolean} - true 写入完成 false 写入失败
  */
  writeTxt(path, txt) {
    try {
      fs.writeFileSync(path, txt);
      return true;
    }
    catch (e) {
      return false;
    }
  },
  /**
  * 追加写入文本
  * @param {string} path - 文件路径
  * @param {*} txt - 字符串
  * @return {boolean} - true 写入完成 false 写入失败
  */
  addTxt(path, txt) {
    try {
      fs.writeFileSync(path, txt, { flag: 'a+' });
      return true;
    }
    catch (e) {
      return false;
    }
  },
  moveFile(oldPath, newPath) {
    let dir = path.dirname(newPath);
    if (!this.isDirExists(dir)) {
      this.mkdirs(dir);
    }
    fs.renameSync(oldPath, newPath);
    return true;
  },
  /**
  * 删除文件
  * @param {string} path 
  */
  delFile(path) {
    try {
      if (this.isFileExists(path)) {
        fs.unlinkSync(path);
      }
      return true;
    } catch (err) {
      return false;
    }
  },
  /**
  * 删除文件夹及所有子文件文件
  * @param {string} path 
  */
  delFolder(path) {
    if (!this.isDirExists(path)) {
      return true;
    }
    let files = fs.readdirSync(path);//读取该文件夹
    files.forEach(function (file) {
      var stats = fs.statSync(path + '/' + file);
      if (stats.isDirectory()) {
        this.delFolder(path + '/' + file);
      } else {
        fs.unlinkSync(path + '/' + file);
      }
    });
    fs.rmdirSync(path);
    return true;
  },
  clearEmptyFolder(dir) {
    let files = fs.readdirSync(dir);
    if (files.length === 0) {
      this.delFolder(dir);
    }
    for (let i = 0; i < files.length; i++) {
      let file = path.join(dir, files[i]);
      if (this.isDirExists(file)) {
        this.clearEmptyFolder(file);
      }
    }
  },
  /**
   * 生成文件的md5
   * @param {string} filepath 
   */
  async getFileMD5(filepath) {
    return new Promise(function (resolve, reject) {
      let rs = fs.createReadStream(filepath);
      let hash = crypto.createHash('md5');
      let hex = '';
      rs.on('data', hash.update.bind(hash));

      rs.on('end', function () {
        hex = hash.digest('hex').toUpperCase();
        resolve(hex);
      });
    });
  },
  /**
  * 创建文件夹
  * @param {string|array} dir 文件夹
  * @returns {boolean} 是否创建成功
  */
  mkdirs(dir) {
    mkdirp.sync(dir);
    return true;
  },
  /**
  * 字数统计:
  */
  count(str) {
    let res = {
      bytes: 0,
      chinese: 0,
      english: 0,
      num: 0,
      punctuation: 0
    };
    for (let i = 0; i < str.length; i++) {
      let c = str.charAt(i);
      if (/[\u4e00-\u9fa5]/.test(c)) {
        // 中文
        res.chinese++;
      } else if (/[^\x00-\xff]/.test(c)) {
        // 标点?
        res.punctuation++;
      } else {
        // 英文
        res.english++;
      }
      if (/[0-9]/.test(c)) {
        // 数字
        res.num++;
        res.english--;
      }
    }
    res.bytes = (res.chinese + res.punctuation) * 2 + res.english + res.num;
    return res;
  },
};