import { Model, Schema, Document, Connection } from 'mongoose';
import schema from 'schema/dist/index.ts'

type dbs = { [key: string]: Connection };
export type models = {
  [K in keyof typeof schema]: typeof schema[K] extends new (...args: any[]) => infer Instance ? Instance : never;
};

// 扩展 Server 类的声明
declare module './server' {
  export class Server {
    models: models;
  }
}