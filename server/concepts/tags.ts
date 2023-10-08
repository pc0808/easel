import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { ContentDoc } from "./content";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface TagsDoc extends BaseDoc {
  tagName: string;
  content: ObjectId;
}

const NOT_ALLOWED_TAGS: Set<string> = new Set(["", "easel"]);

export default class TagsConcept<T> {
  public readonly tagged;

  public constructor(name: string) {
    this.tagged = new DocCollection<TagsDoc>(name);
  }

  /** makes new tag */
  async create(tagName: string, content: ObjectId) {
    this.tagIsAllowed(tagName);
    await this.notExist(tagName, content);
    const _id = await this.tagged.createOne({
      tagName: tagName.toLowerCase(),
      content: content,
    });
    return {
      msg: "Tag created successfully!",
      taggedContent: await this.tagged.readOne({ _id }),
    };
  }
  /**
   * gets content by tag object id
   * @param _id Id of tag object
   */
  async getContent(_id: ObjectId) {
    const content = await this.tagged.readOne({ _id });
    if (content) {
      return { msg: "Read successful!", taggedContent: content };
    } else {
      throw new NotFoundError("Such a tag does not exist");
    }
  }

  /** gets content matching the TagsDoc attributes in filter */
  async getContentFilter(filter: Partial<TagsDoc>) {
    this.sanitizeFilter(filter);
    const tags = await this.tagged.readMany(filter, {
      sort: { dateCreated: -1 },
    });
    return { msg: "Read successful", tags: (tags ? tags : []) };
  }

  /** taken from starter code, updates existing data */
  async update(_id: ObjectId, update: Partial<TagsDoc>) {
    this.sanitizeUpdate(update);
    this.sanitizeFilter(update);
    await this.tagged.updateOne({ _id }, update);
    return { msg: "Content successfully updated!" };
  }
  /** deletes made tag */
  async delete(_id: ObjectId) {
    await this.tagged.deleteOne({ _id });
    return { msg: "Tag deleted!" };
  }

  // matches tags with given content
  async deleteContent(content: ObjectId) {
    await this.tagged.deleteMany({ content });
    return { msg: "Delete successful" }
  }

  // matches tags with given tagName and content 
  async deleteContentTag(tagName: string, content: ObjectId) {
    await this.tagged.deleteOne({
      tagName: tagName.toLowerCase(),
      content: content,
    });
    return { msg: "Delete successful" }
  }

  // deletes every tag associated w these posts 
  async deleteMany(posts: ContentDoc<T>[]) {
    for (const post of posts) {
      await this.deleteContent(post._id);
    }
    return { msg: "successful" };
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
  private tagIsAllowed(tagName: string) {
    if (NOT_ALLOWED_TAGS.has(tagName.toLowerCase())) {
      throw new BadValuesError("This tagname is not allowed");
    }
    else if (tagName && tagName.charAt(0) === " ") {
      throw new BadValuesError("Tagname cannot start with a space");
    }
  }
  private async notExist(tagName: string, content: ObjectId) {
    if (await this.tagged.readOne({ tagName: tagName.toLowerCase(), content }))
      throw new BadValuesError("This content already has this tag!");
  }

  private sanitizeFilter(filter: Partial<TagsDoc>) {
    //const better: Partial<TagsDoc> = ; 
    if (filter.tagName) filter.tagName = filter.tagName.toLowerCase();
  }
}
