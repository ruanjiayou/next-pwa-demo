import type { Request as RequestBase, Response as ResponseBase, NextFunction } from 'express';
import { Model, Schema, Document, Connection } from 'mongoose';
import schema from 'schema/dist/index.ts'

type dbs = { [key: string]: Connection };
export type models = {
  [K in keyof typeof schema]: typeof schema[K] extends new (...args: any[]) => infer Instance ? Instance : never;
};

declare global {
  namespace Express {
    export interface Request extends RequsetBase {
      paging(): { limit: number, page: number, page_size: number };
    }
    export interface Response extends ResponseBase {
      success(data: any): void;
      fail(message: string, code?: number): void;
      models: models;
      dbs: dbs;
    }
    interface Next extends NextFunction {

    }
  }
}