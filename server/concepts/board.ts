import { ObjectId } from "mongodb";
import { Post } from "../app";
import ContentConcept from "./content";

export default class BoardConcept extends ContentConcept<ObjectId[]>{
    //SPECIFIC to board: 
    async addPostToBoard(_id: ObjectId, _postid: ObjectId) {
        await this.postNotInBoard(_id, _postid);
        const board = (await this.getContentByID(_id)).PostBoard;
        await this.contentExists(board);
        const post = (await Post.getContentByID(_postid)).PostBoard;
        await Post.contentExists(post);
        // console.log("In function: ", _postid, "\n");
        // console.log("In function: ", board, "\n");
        board?.content.push(_postid);
        //console.log("In function after push: ", board, "\n", board?.content);
        await this.update(_id, { content: board?.content });
        return { msg: "Board successfully updated" };
    }
    async deletePostFromBoard(_id: ObjectId, _postid: ObjectId) {
        await this.postInBoard(_id, _postid);
        const board = (await this.getContentByID(_id)).PostBoard;
        await this.contentExists(board);
        const post = (await Post.getContentByID(_postid)).PostBoard;
        await Post.contentExists(post);

        const newBoard = board?.content.filter(post => (post !== _postid));
        //filter returns new array so no need for aliasing 
        await this.update(_id, { content: newBoard });
        return { msg: "Board successfully updated" };
    }
    async postNotInBoard(_id: ObjectId, _postid: ObjectId) {
        const board = (await this.getContentByID(_id)).PostBoard;
        //console.log(_postid.toHexString, board?.content);
        return board?.content.filter(post => (post.equals(_postid))).length === 0;
    }
    async postInBoard(_id: ObjectId, _postid: ObjectId) {
        const board = (await this.getContentByID(_id)).PostBoard;
        console.log(_postid.toHexString, board?.content);
        return board?.content.filter(post => (post.equals(_postid))).length !== 0;
    }
}