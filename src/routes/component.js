import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  // const items = await models.Record.find().lean(true);
  // const total = await models.Record.countDocuments();
  const total = await res.models.MComponent.count();
  const items = await res.models.MComponent.getAll();
  res.success({ items, total });
})

export default router;