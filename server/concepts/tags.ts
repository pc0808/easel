import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
//import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface TagsDoc extends BaseDoc {
  tag: string;
  allContent: Array<ObjectId>; //CHANGE LATER PLEASE!!!!
}

export default class TagsConcept<ContentType> {
    public readonly tagged = new DocCollection<TagsDoc>("Tags");

    async create(tagName: string) {
        await this.canCreate(tagName);
        const _id = await this.tagged.createOne({ tag: tagName, allContent: [] });
        return { msg: "Tag created successfully!", user: await this.tagged.readOne({ _id }) };
    }
    async canCreate(tagName:string){

    }
}