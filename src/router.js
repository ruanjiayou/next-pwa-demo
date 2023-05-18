import { Router } from 'express';
import Rule from '~/routes/rule.js'
import Record from '~/routes/record.js'

const router = Router();

router.use('/rules', Rule);
router.use('/records', Record);

export default router;