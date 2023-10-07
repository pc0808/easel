import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import ContentConcept from "./content";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface TagsDoc extends BaseDoc {
  tagName: string;
  content: ObjectId[];
}

const NOT_ALLOWED_TAGS: Set<string> = new Set(["", "easel"]);

export default class TagsConcept<T> {
  public readonly tagged;
  private readonly allContent: ContentConcept<T>;

  public constructor(name: string, allContent: ContentConcept<T>) {
    this.tagged = new DocCollection<TagsDoc>(name);
    this.allContent = allContent;
  }

  /** makes new tag */
  async create(tagName: string) {
    await this.canCreate(tagName);
    this.tagIsAllowed(tagName);
    const _id = await this.tagged.createOne({ tagName: tagName, content: [] });
    return { msg: "Tag created successfully!", tag: await this.tagged.readOne({ _id }) };
  }
  /** deletes made tag */
  async delete(_id: ObjectId) {
    await this.tagged.deleteOne({ _id });
    return { msg: "Tag deleted!" };
    //BETA: for every content tagged: delete from its contentDoc.tagged
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
      throw new NotFoundError("Such a tag does not exist");
    }
  }
  /** gets content w that tag name, if exists */
  async getContentByTagName(tagName: string) {
    const content = await this.tagged.readOne({ tagName });
    if (content) {
      return { msg: "Read successful!", taggedContent: content };
    } else {
      throw new NotFoundError("Such a tag does not exist");
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
    //WILL MODIFY IN BETA FOR SYNCH W contentDoc.tagged

    // await this.tagNotInContent(_id, content);
    // await this.contentSameT(content);
    // const tagData = (await this.getContent(_id)).PostBoard;
    // tagData.content.push(content);
    // await this.update(_id, { content: tagData.content });

    throw new Error("Not yet implemented!");
  }
  /** */
  async deleteContent(_id: ObjectId, content: ObjectId) {
    //WILL MODIFY IN BETA FOR SYNCH W contentDoc.tagged

    // await this.tagInContent(_id, content);
    // const oldContent = (await this.getContent(_id)).PostBoard?.content;
    // const newContent = oldContent?.filter(post => (post.toString() !== content.toString()));
    // //filter returns new array so no need for aliasing
    // await this.update(_id, { content: newContent });

    throw new Error("Not yet implemented!");
  }
  /** checks tag isn't already created */
  private async canCreate(tagName: string) {
    const content = await this.tagged.readOne({ tagName });
    if (content) {
      throw new BadValuesError("Tag already created");
    } //else: means no content exists --> we are safe to create tag
  }
  /**checks tag has already been created */
  private async alreadyCreated(_id: ObjectId) {
    const ret = await this.getContent(_id);
    if (!ret.PostBoard) throw new NotFoundError("Tag not yet created");
  }
  /** Checks given post/board not already in tags */
  private async tagNotInContent(_id: ObjectId, content: ObjectId) {
    // await this.alreadyCreated(_id);
    // const result = (await this.getContent(_id)).PostBoard.content;
    // const diff = result?.filter(post => (post.toString() === content.toString())).length;
    // if (diff !== 0) throw new BadValuesError("Post already tagged like this");

    throw new Error("Not yet implemented!");
  }
  /** Checks given post/board is already in tags */
  private async tagInContent(_id: ObjectId, content: ObjectId) {
    // await this.alreadyCreated(_id);
    // const result = (await this.getContent(_id)).PostBoard?.content;
    // const diff = result?.filter(post => (post.toString() === content.toString())).length;
    // if (diff === 0) throw new BadValuesError("Post not yet tagged like this");

    throw new Error("Not yet implemented!");
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
  private async contentSameT(content: ObjectId) {
    // const post = await this.allContent.getContentByID(content);
    // this.allContent.contentExists(await this.allContent.getContentByID(content));

    // if (!post) {
    //   throw new NotFoundError("Can only add tags to elts of same type T");
    // }
  }

  private tagIsAllowed(tagName: string) {
    if (NOT_ALLOWED_TAGS.has(tagName)) {
      throw new BadValuesError("This tagname is not allowed");
    }
  }
}
