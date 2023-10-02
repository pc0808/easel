import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ContentOptions {
  backgroundColor?: string;
}

export interface ContentDoc<T> extends BaseDoc {
  author: ObjectId;
  caption: string;
  content: T;
  options?: ContentOptions;
}

export default class ContentConcept<T> {
  public readonly contents = new DocCollection<ContentDoc<T>>("content");

  async create(author: ObjectId, caption: string, content:T, options?: ContentOptions) {
    const _id = await this.contents.createOne({ author, caption, content, options });
    return { msg: "Content successfully created!", content: await this.contents.readOne({ _id }) };
  }

  async getContents(query: Filter<ContentDoc<T>>) {
    const contents = await this.contents.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return contents;
  }

  async getByAuthor(author: ObjectId) {
    return await this.getContents({ author });
  }

  async update(_id: ObjectId, update: Partial<ContentDoc<T>>) {
    this.sanitizeUpdate(update);
    await this.contents.updateOne({ _id }, update);
    return { msg: "Content successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.contents.deleteOne({ _id });
    return { msg: "Content deleted successfully!" };
  }

  async isAuthor(user: ObjectId, _id: ObjectId) {
    const content = await this.contents.readOne({ _id });
    if (!content) {
      throw new NotFoundError(`Content ${_id} does not exist!`);
    }
    if (content.author.toString() !== user.toString()) {
      throw new ContentAuthorNotMatchError(user, _id);
    }
  }

  private sanitizeUpdate(update: Partial<ContentDoc<T>>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["caption", "options"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class ContentAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of content {1}!", author, _id);
  }
}
