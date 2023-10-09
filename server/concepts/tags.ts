import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface TagsDoc extends BaseDoc {
  tagName: string;
  author: ObjectId;
  content: ObjectId;
}

const NOT_ALLOWED_TAGS: Set<string> = new Set(["", "easel"]);

export default class TagsConcept<T> {
  public readonly tagged;

  public constructor(name: string) {
    this.tagged = new DocCollection<TagsDoc>(name);
  }

  /** makes new tag */
  async create(tagName: string, author: ObjectId, content: ObjectId) {
    this.tagIsAllowed(tagName);
    await this.notExist(tagName, author, content);
    const _id = await this.tagged.createOne({
      tagName: tagName.toLowerCase(),
      author: author,
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
    console.log("maybe here?");
    console.log(filter);
    console.log(await this.tagged.readMany({ author: filter.author }));
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
  async deleteFilter(filter: Partial<TagsDoc>) {
    this.sanitizeFilter(filter);
    await this.tagged.deleteMany(filter);
    return { msg: "Delete(s) successful" }
  }

  private sanitizeUpdate(update: Partial<TagsDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["tagName"];
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
    else if (tagName && tagName.split('').includes(" ")) {
      throw new BadValuesError("Tagname cannot include a space");
    }
  }
  private async notExist(tagName: string, author: ObjectId, content: ObjectId) {
    if (await this.tagged.readOne({ tagName: tagName.toLowerCase(), author, content }))
      throw new BadValuesError("This content already has this tag!");
  }

  private sanitizeFilter(filter: Partial<TagsDoc>) {
    if (filter.tagName) filter.tagName = filter.tagName.toLowerCase();
  }
}
