const _ = require('lodash');
const store = require('../utils/store');

module.exports = {
  /**
   * 上传文件
   * @param {string} format 保存格式
   * @param {string} type 存储策略
   */
  async upload(format, dir) {
    const files = store.create(this.files, format, dir);
    if (_.isEmpty(this.body)) {
      this.body = {};
    }
    _.assign(this.body, files);
    return files;
  },
  /**
   * 处理分页请求条件
   * @param {function} [cb] 回调函数
   */
  paging(cb) {
    let hql = {};
    const qs = this.query;
    let page = parseInt(qs[CFG.REQ_PAGE]) || 1;
    let limit = parseInt(qs[CFG.REQ_LIMIT]) || 20;
    let order = qs[CFG.REQ_ORDER];
    let search = qs[CFG.REQ_SEARCH];

    hql.page = Math.max(page, 1);
    hql.limit = Math.min(limit, 20);
    _.assign(qs, hql);
    hql.offset = (hql.page - 1) * hql.limit;

    if (!_.isEmpty(order)) {
      hql.order = order;
    }
    if (!_.isEmpty(search)) {
      hql.search = search;
    }
    hql.where = {};
    if (cb instanceof Function) {
      hql = cb(hql, this.query);
    }
    return hql;
  }
};