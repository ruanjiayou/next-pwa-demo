import { Router } from 'express';
// import Rule from '~/routes/rule.js'
// import Record from '~/routes/record.js'
import Component from '~/routes/component.js'

const router = Router();

// router.use('/rules', Rule);
// router.use('/records', Record);
router.use('/component', Component);

export default router;