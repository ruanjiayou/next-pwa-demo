import { Model, Schema, Document, Connection } from 'mongoose';
import schema from 'schema/dist/index.ts'

type dbs = { [key: string]: Connection };
export type Models = {
  [K in keyof typeof schema]: typeof schema[K] extends new (...args: any[]) => infer Instance ? Instance : never;
};
export function init(dbs: dbs, schema: Schema): Promise<Models>;
const models: Models;
export default models;