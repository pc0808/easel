import { Filter, ObjectId } from "mongodb";

import DocCollection from "../framework/doc";
import ContentConcept, { ContentAuthorNotMatchError, ContentDoc, ContentOptions } from "./content";
import { NotAllowedError, NotFoundError } from "./errors";

export default class PostConcept implements ContentConcept<string>{
    public readonly posts = new DocCollection<ContentDoc<string>>("Posts");

    async create(author: ObjectId, caption: string, content:string, options?: ContentOptions) {
        const _id = await this.posts.createOne({ author, caption, content, options });
        return { msg: "Content successfully created!", content: await this.posts.readOne({ _id }) };
    }
    
    async getContents(query: Filter<ContentDoc<string>>) {
        const contents = await this.posts.readMany(query, {
            sort: { dateUpdated: -1 },
        });
        return contents;
    }

    async getByAuthor(author: ObjectId) {
        return await this.getContents({ author });
    }

    async getContentByID(_id: ObjectId){
        const content = await this.posts.readOne({_id});
        if(content){
          return { msg: "Read successful!", content: content}; 
        }else{
          return {msg: "Read failure"};
        }
    }
    async delete(_id: ObjectId) {
        await this.posts.deleteOne({ _id });
        return { msg: "Content deleted successfully!" };
    }
    async isAuthor(user: ObjectId, _id: ObjectId) {
        const content = await this.posts.readOne({ _id });
        if (!content) {
          throw new NotFoundError(`Content ${_id} does not exist!`);
        }
        if (content.author.toString() !== user.toString()) {
          throw new ContentAuthorNotMatchError(user, _id);
        }
    }

    // Post-specific:
    async update(_id: ObjectId, update: Partial<ContentDoc<string>>) {
        this.sanitizeUpdate(update);
        await this.posts.updateOne({ _id }, update);
        return { msg: "Content successfully updated!" };
    }
    private sanitizeUpdate(update: Partial<ContentDoc<string>>) {
        // Make sure the update cannot change the author.
        const allowedUpdates = ["caption", "content"];
        for (const key in update) {
          if (!allowedUpdates.includes(key)) {
            throw new NotAllowedError(`Cannot update '${key}' field!`);
          }
        }
    }
}