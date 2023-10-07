import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ContentOptions {
  tagged: string[];
}

export interface ContentDoc<T> extends BaseDoc {
  author: ObjectId;
  caption: string;
  content: T;
  options?: ContentOptions;
}

export default class ContentConcept<T>{
  public readonly contents;

  public constructor(name: string) {
    this.contents = new DocCollection<ContentDoc<T>>(name);
  }

  async create(author: ObjectId, caption: string, content: T, options?: ContentOptions) {
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

  async getContentByID(_id: ObjectId) {
    const content = await this.contents.readOne({ _id });
    if (!content) throw new NotFoundError("Content w this ID does not exist");
    else return { msg: "read successful", content: content }
  }

  async delete(_id: ObjectId) {
    await this.contents.deleteOne({ _id });
    return { msg: "Content deleted successfully!" };
  }
  async deleteMany(userID: ObjectId) {
    await this.contents.deleteMany({ author: userID });
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
  async update(_id: ObjectId, update: Partial<ContentDoc<T>>) {
    this.sanitizeUpdate(update);
    await this.contents.updateOne({ _id }, update);
    return { msg: "Content successfully updated!" };
  }
  async contentExists(board: ContentDoc<T> | undefined) {
    if (!board) {
      throw new NotAllowedError('Board does not exist ');
    }
  }
  //BETA:
  async getUserProfile(_id: ObjectId) {
    throw new Error("Not yet implemented!");
  }

  async getTags(_id: ObjectId): Promise<string[]> {
    throw new Error("Not yet implemented");
  }
  async addTag(tagName: string, _id: ObjectId) {
    throw new Error("Not yet implemented");
  }
  async deleteTag(tagName: string, _id: ObjectId) {
    throw new Error("Not yet implemented");
  }

  private sanitizeUpdate(update: Partial<ContentDoc<T>>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["caption", "content"];
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
