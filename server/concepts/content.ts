import { Filter, ObjectId } from "mongodb";

import { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface ContentOptions {
  
}

export interface ContentDoc<T> extends BaseDoc {
  author: ObjectId;
  caption: string;
  content: T;
  options?: ContentOptions;
}

export interface Response{
  msg: string;
}

export interface ContentResponse<T> extends Response{
  content: ContentDoc<T>; 
}

export default interface ContentConcept<T> {
  //create(author: ObjectId, caption: string, content:T, options?: ContentOptions): any;
  getContents(query: Filter<ContentDoc<T>>): any;
  getByAuthor(author: ObjectId): any;
  getContentByID(_id: ObjectId): any;
  delete(_id: ObjectId): any; 
  isAuthor(user: ObjectId, _id: ObjectId): any; 
}

export class ContentAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of content {1}!", author, _id);
  }
}
