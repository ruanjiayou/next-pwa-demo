import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  const total = await res.models.MSpider.count();
  const items = await res.models.MSpider.getAll();
  res.success({ items, total });
})

router.post('/', async (req, res) => {
  await res.models.MSpider.create(req.body);
  res.success();
})

export default router;