import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";


export interface TagsDoc extends BaseDoc {
  tagName: string;
  content: ObjectId[];
}

export default class TagsConcept {
  public readonly tagged;

  public constructor(name: string) {
    this.tagged = new DocCollection<TagsDoc>(name);
  }

  /** makes new tag */
  async create(tagName: string) {
    await this.canCreate(tagName);
    const _id = await this.tagged.createOne({ tagName: tagName, content: [] });
    return { msg: "Tag created successfully!", user: await this.tagged.readOne({ _id }) };
  }
  /** deletes made tag */
  async delete(_id: ObjectId) {
    await this.tagged.deleteOne({ _id });
    return { msg: "Tag deleted!" };
  }
  /**
   * gets content by tag object id 
   * @param _id Id of tag object 
   */
  async getContent(_id: ObjectId) {
    const content = await this.tagged.readOne({ _id });
    if (content) {
      return { msg: "Read successful!", PostBoard: content };
    } else {
      return { msg: "Read failure" };
    }
  }
  /** gets content w that tag name, if exists */
  async getContentByTagName(tagName: string) {
    const content = await this.tagged.readOne({ tagName });
    if (content) {
      return { msg: "Read successful!", taggedContent: content };
    } else {
      return { msg: "Read failure" };
    }
  }
  /** taken from starter code, updates existing data */
  async update(_id: ObjectId, update: Partial<TagsDoc>) {
    this.sanitizeUpdate(update);
    await this.tagged.updateOne({ _id }, update);
    return { msg: "Content successfully updated!" };
  }
  /** adds post/board under given tag */
  async addContent(_id: ObjectId, content: ObjectId) {
    await this.tagNotInContent(_id, content);
    const tagData = (await this.getContent(_id)).PostBoard;
    tagData?.content.push(content);
    await this.update(_id, { content: tagData?.content });
  }
  /** */
  async deleteContent(_id: ObjectId, content: ObjectId) {
    await this.tagInContent(_id, content);
    const oldContent = (await this.getContent(_id)).PostBoard?.content;
    const newContent = oldContent?.filter(post => (post !== content));
    //filter returns new array so no need for aliasing 
    await this.update(_id, { content: newContent });
  }
  /** checks tag isn't already created */
  private async canCreate(tagName: string) {
    const ret = await this.getContentByTagName(tagName);
    if (ret.taggedContent) throw new BadValuesError("Tag already created");
  }
  /**checks tag has already been created */
  private async alreadyCreated(_id: ObjectId) {
    const ret = await this.getContent(_id);
    if (!ret.PostBoard) throw new NotFoundError("Tag not yet created");
  }
  /** Checks given post/board not already in tags */
  private async tagNotInContent(_id: ObjectId, content: ObjectId) {
    this.alreadyCreated(_id);
    const result = (await this.getContent(_id)).PostBoard?.content;
    const diff = result?.filter(post => (post.toString() === content.toString())).length;
    if (diff !== 0) throw new BadValuesError("Post already tagged like this");
  }
  /** Checks given post/board is already in tags */
  private async tagInContent(_id: ObjectId, content: ObjectId) {
    this.alreadyCreated(_id);
    const result = (await this.getContent(_id)).PostBoard?.content;
    const diff = result?.filter(post => (post.toString() === content.toString())).length;
    if (diff === 0) throw new BadValuesError("Post not yet tagged like this");
  }
  private sanitizeUpdate(update: Partial<TagsDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["content"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}