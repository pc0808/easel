import { Filter, ObjectId } from "mongodb";

import DocCollection from "../framework/doc";
import ContentConcept, { ContentAuthorNotMatchError, ContentDoc, ContentOptions } from "./content";
import { NotFoundError } from "./errors";

export default class BoardConcept extends ContentConcept<ObjectId[]>{
    public readonly boards = new DocCollection<ContentDoc<ObjectId[]>>("Boards");

    async create(author: ObjectId, caption: string, content: ObjectId[], options?: ContentOptions) {
        const _id = await this.boards.createOne({ author, caption, content, options });
        return { msg: "Content successfully created!", content: await this.boards.readOne({ _id }) };
    }

    async getContents(query: Filter<ContentDoc<ObjectId[]>>) {
        const contents = await this.boards.readMany(query, {
            sort: { dateUpdated: -1 },
        });
        return contents;
    }

    async getByAuthor(author: ObjectId) {
        return await this.getContents({ author });
    }

    async getContentByID(_id: ObjectId) {
        const content = await this.boards.readOne({ _id });
        if (content) {
            return { msg: "Read successful!", content: content };
        } else {
            return { msg: "Read failure" };
        }
    }
    async delete(_id: ObjectId) {
        await this.boards.deleteOne({ _id });
        return { msg: "Content deleted successfully!" };
    }
    async isAuthor(user: ObjectId, _id: ObjectId) {
        const content = await this.boards.readOne({ _id });
        if (!content) {
            throw new NotFoundError(`Content ${_id} does not exist!`);
        }
        if (content.author.toString() !== user.toString()) {
            throw new ContentAuthorNotMatchError(user, _id);
        }
    }

    //SPECIFIC to board: 
    async addPostToBoard(_id: ObjectId, _postid: ObjectId) {
        await this.postNotInBoard(_id, _postid);
        const board = (await this.getContentByID(_id)).content;
        const update = board?.content.push(_postid);
    }
    async postNotInBoard(_id: ObjectId, _postid: ObjectId) {
        const board = (await this.getContentByID(_id)).content;
        return board?.content.indexOf(_postid) === -1;
    }
    async postInBoard(_id: ObjectId, _postid: ObjectId) {
        const board = (await this.getContentByID(_id)).content;
        return !(board?.content.indexOf(_postid) === -1);
    }
}