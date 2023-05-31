import got from 'got'
import SparkMD5 from 'spark-md5';

class Bili {
  static table = [...'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'];
  static s = [11, 10, 3, 8, 4, 6];
  static xor = 177451812;
  static incr = 8728348608;
  static av2bv(av) {
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

    num = (num ^ Bili.xor) + Bili.incr;
    let result = [...'BV1  4 1 7  '];
    let i = 0;
    while (i < 6) {
      // 这里改写差点犯了运算符优先级的坑
      // 果然 Python 也不是特别熟练
      // 说起来 ** 按照传统语法应该写成 Math.pow()，但是我个人更喜欢 ** 一些
      result[Bili.s[i]] = Bili.table[Math.floor(num / 58 ** i) % 58];
      i += 1;
    };
    return result.join('');
  }
  static bv2av(bv) {
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
      result += Bili.table.indexOf(str[Bili.s[i]]) * 58 ** i;
      i += 1;
    };
    return `av${result - Bili.incr ^ Bili.xor}`;
  }
  static async getVideoInfo(id) {
    // 获取视频地址需要bvid
    const bvid = id.startsWith('av') ? this.av2bv(id) : id;
    const avid = id.startsWith('av') ? id : this.bv2av(id);
    const detail = await got.get(`https://api.bilibili.com/x/web-interface/view?aid=${avid.substring(2)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36'
        }
      }).json();
    return detail;
  }
  // 获取单p 下载地址
  // https://api.bilibili.com/x/player/playurl?avid=66333861&cid=%20115048060&qn=32
  static async getPlayUrl({ id, cid, qn = 80 }) {
    return got.get(`https://api.bilibili.com/x/player/playurl?avid=${id}&cid=${cid}&qn=${qn}`).json();
  }
  static async getTags({ id, cid }) {
    return got.get(`https://api.bilibili.com/x/web-interface/view/detail/tag?aid=${id}&cid=${cid}`).json();
  }
}

module.exports = async ({
  constant,
  models,
  rule,
  url,
  preview,
}) => {
  const params = rule.getParams(url);

  const resource_id = rule.getResourceId(params.id);
  const source_id = params.id;
  const source_type = 'video';
  const doc = await models.Record.findOne({ source_id, rule_id: rule._id }).lean();
  if (doc) {
    throw ('数据已存在');
  }
  console.log(`crawler: ${url}`)
  const info = await Bili.getVideoInfo(source_id)
  const poster = ''; // md5?
  const attachments = [], videos = [];
  attachments.push({
    id: SparkMD5.hash(info.pic),
    url: info.pic,
    media_type: 'poster',
  })
  const data = {
    title: info.title,
    params,
    poster,
    creator: {},
    url,
    raw: info,
    createdAt: new Date(info.ctime * 1000),
    crawledAt: new Date(),
    region_code: 'zh-CN',
    lang: 'CN',
    size: info.duration,
    chapters: info.pages.length, // size words/duration/filesize chapters videos/novel chapters/images/
    retry: 0,
    available: 0,
    update_status: constant.RECORD.UPDATE_STATUS.FINISHED,
    status: constant.RECORD.UPDATE_STATUS.CREATED,
  };
  for (let i = 0; i < info.pages; i++) {
    const page = info.pages[i];
    const play = await Bili.getPlayUrl({ id: info.aid, cid: page.cid });
    const tags = await Bili.getTags({ id: info.aid, cid: page.cid });
    videos.push({
      resource_id,
      more: page.dimension,
      title: page.part || '',
      nth: i+1,
      status: constant.ATTACHMENT.STATUS.CREATED,
      v_id: SparkMD5.hash(`${info.aid}|${page.cid}`),
      url: page.data.durl[0].url,
      path: '',
      media_type: 'video'
    })
  }
}


const av = Bili.bv2av('BV1yM41117WL')
console.log(av)
console.log(Bili.av2bv(av));
(async () => {
  const data = await Bili.getVideoInfo('BV1yM41117WL');
  console.log(data)
})();
