import models from '~/db/mongo'

export default {
  async getRecords(hql = {}) {
    const total = await models.Record.countDocuments();
    return { total };
  }
}