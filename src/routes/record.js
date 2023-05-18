import { Router } from 'express';
import models from '~/db/mongo/index.js'
import constant from '~/constant.js';

const router = Router();

router.get('/', async (req, res) => {
  const items = await models.Record.find().lean(true);
  const total = await models.Record.countDocuments();
  res.success({ items, total });
})

export default router;