import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface ContentOptions {
}

export interface ContentDoc<T> extends BaseDoc {
  author: ObjectId;
  caption: string;
  content: T;
  tagged: string[];
  options?: ContentOptions;
}

export default class ContentConcept<T>{
  public readonly contents;

  public constructor(name: string) {
    this.contents = new DocCollection<ContentDoc<T>>(name);
  }

  async create(author: ObjectId, caption: string, content: T, tagged = [], options?: ContentOptions) {
    const _id = await this.contents.createOne({
      author, caption, content, tagged, options
    });
    return {
      msg: "Content successfully created!",
      content: await this.contents.readOne({ _id })
    };
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
  //BETA:
  async getUserProfile(_id: ObjectId) {
    throw new Error("Not yet implemented!");
  }

  async getTags(_id: ObjectId) {
    console.log("Working?");
    const cont = await this.getContentByID(_id);
    console.log(cont);
    if (cont) { return cont.content.tagged }
    else { throw new NotFoundError("Content w given ID not found") }
  }
  async addTag(tagName: string, _id: ObjectId) {
    this.tagNotInPost(tagName, _id);
    const tags = await this.getTags(_id);

    tags.push(tagName);
    this.update(_id, { tagged: tags })
    return { msg: "Successfully updated!" };
  }
  async deleteTag(tagName: string, _id: ObjectId) {
    const tags = await this.getTags(_id);
    const newTags = tags.filter(t => (t !== tagName));
    this.update(_id, { tagged: newTags });
    return { msg: "Successfully updated!" }
  }
  async tagNotInPost(tagName: string, _id: ObjectId) {
    const tags = await this.getTags(_id);
    if (new Set(tags).has(tagName)) throw new BadValuesError("Post already has given tagname");
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
