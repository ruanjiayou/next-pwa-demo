import _ from 'lodash'
import http from 'http'
import constant from '~/constant.js'

const {
  RES_DESC, RES_DATA, RES_CODE, RES_MESSAGE, RES_FAIL,
  RES_PAGER, RES_PAGER_LIMIT, RES_PAGER_PAGE, RES_PAGER_TOTAL
} = constant;

const extend = {
  /**
   * 返回成功
   * @param {object} [data] 数据 
   */
  success(data, params) {
    let res = {
      [RES_CODE]: 0,
      [RES_MESSAGE]: ''
    };
    if (!_.isEmpty(data) || data instanceof Array) {
      res[RES_DATA] = data;
    }
    if (params) {
      _.assign(res, params);
    }
    this.json(res)
  },
  /**
   * 返回失败
   */
  fail({ message, code = -1 }) {
    this.json({
      [RES_DESC]: RES_FAIL,
      [RES_CODE]: code,
      [RES_MESSAGE]: message,
    })
  },
  paging(items, info) {
    const result = { items };
    result.total = info.total;
    return this.success(items);
  },
  format(result) {
    if (typeof result === 'string' || result instanceof Buffer) {
      this.write(result);
      this.end();
    } else if (typeof result === 'object' && !(result instanceof http.ServerResponse)) {
      this.json(result);
    }
    // stream
  }
}
export default (req, res, next) => {
  Object.assign(res, extend);
  next();
};
