import { Router } from 'express';
import models from '~/db/mongo/index.js'
import { VM, NodeVM, VMScript } from 'vm2'
import helper from '~/utils/helper.js';
import constant from '~/constant.js';

const router = Router();
const spiders = {};

router.post('/', async (req, res) => {
  const result = await models.Rule.create(req.body);
  res.success(result);
});

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
        preview })
      res.success(data);
    } catch (e) {
      console.log(e);
      res.fail({ message: `抓取失败: ${e.message}` });
    }
  }
})

export default router;