import _ from 'lodash'

export default class Static {
  static _init(opts) {
    const opt = {
      where: {},
      order: {},
      attrs: {},
      lean: false,
      data: null,
      options: {},
    };
    opt.where = opts.where || {};
    Object.assign(opt.where, this.params);
    opt.options = opts.options || {};
    // FIXME: 这里有问题
    // if (opt.where.id) {
    //   opt.where._id = ObjectId(opt.where.id);
    //   delete opt.where.id;
    // }
    for (let key in opt.where) {
      if (_.isPlainObject(opt.where[key])) {
        for (let k2 in opt.where[key]) {
          if (k2.startsWith('__')) {
            let k = k2.replace('__', '$');
            opt.where[key][k] = opt.where[key][k2];
            delete opt.where[key][k2];
          }
        }
      }
    }
    // 分页
    if (_.isInteger(opts.limit)) {
      opt.limit = opts.limit;
    } else {
      opt.limit = 20;
    }
    if (_.isInteger(opts.page)) {
      opt.offset = (opts.page - 1) * opt.limit;
    } else {
      opt.page = 1
    }
    if (_.isInteger(opts.offset)) {
      opt.offset = opts.offset;
    } else {
      opt.offset = 0
    }
    // 事物

    // 关联查询

    // 字段
    if (!_.isEmpty(opts.attrs)) {
      opt.attrs = opts.attrs;
    }

    // update的数据
    if (opts.data) {
      opt.data = opts.data;
    }
    // 排序
    if (opts.order) {
      opt.order = opts.order;
    }
    // sum
    if (opts.sum) {
      opt.sum = opts.sum;
    }
    // lean
    if (opts.lean) {
      opt.lean = true;
    }

    return opt;
  }

  static upsert(filter, data) {
    return this.updateOne(filter, { $set: data }, { upsert: true, new: true });
  }

  static getAll(opts = {}) {
    const opt = this._init(opts);
    return this.find(opt.where).select(opt.attrs).sort(opt.order).lean(opt.lean);
  }

  static async sum(opts = {}) {
    const opt = this._init(opts);
    const sum = await this.aggregate([
      { $match: opt.where },
      { $group: { _id: null, count: { $sum: '$' + opt.sum } } }]);
    return sum.length ? sum[0].count : 0;
  }

  static getList(opts = {}) {
    const opt = this._init(opts);
    return this.find(opt.where).select(opt.attrs).limit(opt.limit).skip(opt.offset).sort(opt.order).lean(opt.lean);
  }

  static async getInfo(opts = {}) {
    const opt = this._init(opts);
    const result = await this.findOne(opt.where).select(opt.attrs).skip(opt.offset).sort(opt.order).lean(opt.lean);
    return result;
  }

  toJSON() {
    delete this._doc.__v;
    delete this._doc._id;
    return this._doc;
  }
}
