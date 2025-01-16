import Base, { getMongoSchema } from "schema/dist/base.js";


const models = {};

export async function init(dbs, JsonSchema) {
  models.MJsonSchema = JsonSchema;
  const schemas = await JsonSchema.getAll({ where: { status: 1 }, lean: true })
  schemas.forEach(schema => {
    if (dbs[schema.db]) {
      const CModel = new Base();
      CModel.model = dbs[schema.db].model(
        schema.name,
        getMongoSchema(schema.schema, {
          strict: true,
          versionKey: false,
          excludeIndexes: true,
          collection: schema.name,
          timestamps: false,
        }),
      );
      models['M' + schema.name] = CModel;
    }
  });
  return models;
}
export default models;