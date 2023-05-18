const _ = require('lodash');
const got = require('got').default;
const cheerio = require('cheerio');
const helper = require('../utils/spider.helper');
const models = require('../db/index');
const constant = require('../constant');
const { v4 } = require('uuid');

module.exports = async function (rule, url) {
  const params = helper.getUrlParamsByRule(rule, url);
  const html = await got.get(url).text()
  const source_id = params.id;
  const source_type = rule.type;
  const resource_id = helper.genResourceId(rule._id, source_id);

  const $ = cheerio.load(html, { decodeEntities: false });
  // 获取JSON数据
  const title = $('h1').text();
  const wrap = $('.sinfo p').first();
  const wrap2 = $('.sinfo p').last();
  wrap.find('label').remove();
  const update_text = wrap2.text().trim()
  const alias = wrap.text().trim()
  const desc = $('.info').html();
  let poster = $('.thumb img').attr('src');
  const tags = [];
  let country = '', publishedAt = null;
  $('.sinfo span').each((i, el) => {
    const label = $(el).find('label').text().trim()
    if (label === '上映:') {
      publishedAt = new Date($(el).text().substr(3))
    }
    if (label === '地区:') {
      country = $(el).find('a').attr('href').replace(/\//g, '')
      country = country[0].toUpperCase() + country.substring(1)
    }
    if (label === '类型:') {
      $(el).find('a').each((j, elm) => {
        tags.push($(elm).text())
      })
    }
  });
  // 非预览情况才下载
  if (poster.startsWith('//')) {
    poster = 'http:' + poster;
  }
  const videos = [], s = new Set();
  $('.fire').find('div.tabs a').each((i, a) => {
    const title = $(a).text().trim();
    const href = $(a).attr('href');
    if (!s.has(title)) {
      s.add(title);
      videos.push({
        title,
        nth: i + 1,
        v_id: href.replace(/^\/vp\//, '').replace(/\.html$/, ''),
      })
    }
  })
  if (videos.length) {
    await models.Video.bulkWrite(videos.map(v => ({
      updateOne: {
        filter: { v_id: v.v_id, resource_id },
        update: {
          $set: {
            title: v.title,
            nth: v.nth,
            type: title.includes('PV') ? constant.VIDEO.TYPE.TRAILER : constant.VIDEO.TYPE.FEATURE,
          }
        },
        upsert: true
      }
    })))
  }
  await models.Record.updateOne({
    rule_id: rule._id,
    source_id,
  }, {
    $set: {
      params,
      raw: { html: $('div.fire').html(), publishedAt, alias },
      source_type,
      source_id,
      resource_id,
      url,
      title,
      poster,
      desc,
      tags,
      country,
      createdAt: new Date(),
      updatedAt: new Date(),
      crawledAt: new Date(),
      status: constant.RECORD.STATUS.CREATED,
      update_text,
      update_status: update_text.includes('完结') ? 2 : 1,
    },
    $setOnInsert: {
      _id: v4(),
    }
  }, {
    upsert: true,
    new: true,
  })
}