import { Router } from 'express';
import Rule from '~/routes/rule.js'

const router = Router();

router.use('/rules', Rule);

export default router;