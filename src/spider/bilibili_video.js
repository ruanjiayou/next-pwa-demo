
const helper = require('../utils/spider.helper');
const models = require('../db/index');
const constant = require('../constant');
const { v4 } = require('uuid');
const got = require('got').default;
const table = [...'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'];
const s = [11, 10, 3, 8, 4, 6];
const xor = 177451812;
const add = 8728348608;

const BILIBILI = {
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
    const detail = await got(`https://api.bilibili.com/x/web-interface/view?aid=${aid.substr(2)}`, {
      method: 'GET',
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36'
      }
    }).json();
    if (detail.code === 0) {
      return detail.data
    } else {
      throw detail.message
    }
  },
  // 获取单p 下载地址
  // https://api.bilibili.com/x/player/playurl?avid=66333861&cid=%20115048060&qn=32
  async getPlayUrl({ id, cid, qn = 80, }) {
    const result = await got(`https://api.bilibili.com/x/player/playurl?avid=${id}&cid=${cid}&qn=${qn}`).json()
    return result;
  },
  async getTags({ id, cid }) {
    const result = await got(`https://api.bilibili.com/x/web-interface/view/detail/tag?aid=${id}&cid=${cid}`).json()
    return result;
  }
}

module.exports = async function (rule, url) {
  const params = helper.getUrlParamsByRule(rule, url);
  if (params) {
    const info = await BILIBILI.getVideoInfo(params.id);
    const source_type = rule.type;
    const source_id = info.aid;
    const resource_id = helper.genResourceId(rule._id, source_id)
    const doc = await models.Record.findOne({ source_id, rule_id: rule._id }).lean();
    if (!doc) {
      for (let i = 0; i < info.pages.length; i++) {
        const result = await BILIBILI.getPlayUrl({ id: info.aid, cid: info.pages[i].cid })
        const result2 = await BILIBILI.getTags({ id: info.aid, cid: info.pages[i].cid })
        info.pages[i].detail = result.data;
        info.pages[i].tags = result2.data;
      }
      await models.Record.updateOne({
        rule_id: rule._id,
        source_id,
      }, {
        $set: {
          params,
          raw: info,
          source_type,
          resource_id,
          url: `https://www.bilibili.com/video/${params.id}/`,
          title: info.title,
          cover: info.pic,
          content: '',
          desc: info.desc,
          status: constant.RECORD.STATUS.CREATED,
          creator: {
            name: info.owner.name,
            icon: info.owner.face,
          },
          region_code: 'zh-CN',
          lang: 'CN',
          createdAt: new Date(info.ctime * 1000),
          updatedAt: new Date(info.pubdate * 1000),
          crawledAt: new Date(),
          chapters: info.videos,
          count: info.duration,
          available: 0,
        },
        $setOnInsert: {
          _id: v4(),
          crawledAt: new Date(),
        },
      }, {
        upsert: true,
        new: true,
      });
      // video
      // cover thumbnail
      
    }
  }
}