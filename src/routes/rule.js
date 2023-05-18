import { Router } from 'express';
import models from '~/db/mongo/index.js'
import { VM, NodeVM, VMScript } from 'vm2'
import helper from '~/utils/helper.js';
import constant from '~/constant.js';
import { match } from 'path-to-regexp';
import _ from 'lodash'

const router = Router();
const spiders = {};

router.post('/', async (req, res) => {
  const result = await models.Rule.create(req.body);
  res.success(result);
});
router.post('/detect', async (req, res) => {
  const url = new URL(req.query.url);
  const { origin, pathname, searchParams } = url;
  let result, record, params;
  const rules = await models.Rule.getAll({ where: { status: constant.RULE.STATUS.RUNNING, }, lean: true })
  for (let j = 0; j < rules.length; j++) {
    const rule = rules[j];
    let matched = false;
    for (let i = 0; i < rule.urls.length; i++) {
      const match_url = rule.urls[i];
      const fn = match(new URL(match_url).pathname || '', { decode: decodeURIComponent });
      const parsed = fn(pathname);
      if (parsed.params) {
        matched = true;
        result = rule;
        params = parsed.params;
        const arr = [...(new URL(match_url).searchParams.entries())]
        arr.forEach(([key, value]) => {
          if (value.startsWith(':')) {
            value = value.substring(1);
            params[value] = searchParams.get(key);
          }
        });
        break;
      }
    }
    if (matched) {
      break;
    }
  }
  if (result) {
    let code = 1001, message = '匹配到规则但没数据';
    record = await models.Record.findOne({ rule_id: result._id, source_id: params.id }).lean(true);
    if (record) {
      switch (record.status) {
        case constant.RECORD.STATUS.ERRORED:
          code = 1004;
          message = '抓取失败';
          break;
        case constant.RECORD.STATUS.DEALING:
          code = 1003;
          message = '处理中';
          break;
        case constant.RECORD.STATUS.CREATED:
          code = 1003;
          message = '处理中';
          break;
        default:
          // constant.RECORD.STATUS.SUCCESS constant.RECORD.STATUS.CREATED constant.RECORD.STATUS.DEALING
          code = 1002;
          message = '抓取数据成功';
          break;
      }
    }
    res.json({ code, message, data: { record, rule: _.omit(result, ['script']), params } });
  } else {
    // 未匹配到规则
    res.json({ code: 1000, message: '未匹配到规则' })
  }
})

router.get('/', async (req, res) => {
  const items = await models.Rule.find().lean(true);
  const total = await models.Rule.countDocuments();
  res.success({ items, total });
})

router.delete('/:id', async (req, res) => {
  await models.Rule.deleteOne({ _id: req.params.id })
  res.success();
})

router.put('/:id', async (req, res) => {
  await models.Rule.updateOne({ _id: req.params.id }, { $set: req.body });
  res.success();
})

router.patch('/:id', async (req, res) => {
  const rule = await models.Rule.findOne({ _id: req.params.id });
  const url = req.body.url, preview = req.query.preview ? true : false;
  if (!rule) {
    res.fail({ message: 'no rule' });
  } else {
    let script = spiders[rule._id]
    if (script === undefined) {
      const code = process.env.NODE_ENV === 'development' ? helper.readTxt(constant.ROOT_PATH + '/spiders/' + rule._id + '.js') : rule.script || '';
      script = new VMScript(code).compile();
      // spiders[rule._id] = script;
    }
    if (!script) {
      return res.fail({ message: "脚本错误" });
    }
    const fn = new NodeVM({
      console: 'inherit',
      require: {
        external: true,
        builtin: ['*']
      }
    }).run(script, {});
    if (typeof fn !== 'function') {
      return res.fail({ message: '脚本不是函数' });
    }
    try {
      const data = await fn({
        constant,
        models,
        helper,
        rule,
        url,
        preview
      })
      res.success(data);
    } catch (e) {
      console.log(e);
      res.fail({ message: `抓取失败: ${e.message}` });
    }
  }
})

export default router;