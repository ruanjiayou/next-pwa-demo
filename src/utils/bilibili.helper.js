const shttp = require('../utils/shttp')
const table = [...'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'];
const s = [11, 10, 3, 8, 4, 6];
const xor = 177451812;
const add = 8728348608;

module.exports = {
  av2bv: (av) => {
    let num = NaN;
    if (Object.prototype.toString.call(av) === '[object Number]') {
      num = av;
    } else if (Object.prototype.toString.call(av) === '[object String]') {
      num = parseInt(av.replace(/[^0-9]/gu, ''));
    };
    if (isNaN(num) || num <= 0) {
      // 网页版直接输出这个结果了
      return '';
    };

    num = (num ^ xor) + add;
    let result = [...'BV1  4 1 7  '];
    let i = 0;
    while (i < 6) {
      // 这里改写差点犯了运算符优先级的坑
      // 果然 Python 也不是特别熟练
      // 说起来 ** 按照传统语法应该写成 Math.pow()，但是我个人更喜欢 ** 一些
      result[s[i]] = table[Math.floor(num / 58 ** i) % 58];
      i += 1;
    };
    return result.join('');
  },
  bv2av: (bv) => {
    let str = '';
    if (bv.length === 12) {
      str = bv;
    } else if (bv.length === 10) {
      str = `BV${bv}`;
      // 根据官方 API，BV 号开头的 BV1 其实可以省略
      // 不过单独省略个 B 又不行（
    } else if (bv.length === 9) {
      str = `BV1${bv}`;
    } else {
      return '';
    };
    if (!str.match(/[Bb][Vv][fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF]{10}/gu)) {
      return '';
    };

    let result = 0;
    let i = 0;
    while (i < 6) {
      result += table.indexOf(str[s[i]]) * 58 ** i;
      i += 1;
    };
    return `av${result - add ^ xor}`;
  },
  // 用于下载单p
  async getVideoInfo(id) {
    // 获取视频地址需要bvid
    if (id.startsWith('av')) {
      id = this.av2bv(id)
    }
    // const ps = await shttp.get(`https://api.bilibili.com/x/player/pagelist?bvid=${id}`).header('user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36').end()
    // let cid = '';
    // if (ps && ps.code === 0 && ps.data.length !== 0) {
    //   cid = ps.data[0].cid
    // }
    const aid = this.bv2av(id)
    const detail = await shttp.get(`https://api.bilibili.com/x/web-interface/view?aid=${aid.substr(2)}`).header('user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36').end()
    if (detail && detail.statusCode === 200) {
      if (detail.body.code === 0) {
        return detail.body.data
      } else {
        throw detail.body.message
      }
    } else {
      throw (detail ? detail.message : '获取B站视频失败')
    }
  },
  // 获取单p 下载地址
  // https://api.bilibili.com/x/player/playurl?avid=66333861&cid=%20115048060&qn=32
  async getPlayUrl({ id, cid, qn = 80, }) {
    const result = await shttp.get(`https://api.bilibili.com/x/player/playurl?avid=${id}&cid=${cid}&qn=${qn}`).end()
    return result.body;
  },
  async getTags({ id, cid }) {
    const result = await shttp.get(`https://api.bilibili.com/x/web-interface/view/detail/tag?aid=${id}&cid=${cid}`).end()
    console.log(result.body, result.status)
    return result.body;
  }
}