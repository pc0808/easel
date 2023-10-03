import { ObjectId } from "mongodb";
import { Post } from "../app";
import ContentConcept from "./content";

export default class BoardConcept extends ContentConcept<ObjectId[]>{
    //SPECIFIC to board: 
    async addPostToBoard(_board: ObjectId, _post: ObjectId) {
        await this.postNotInBoard(_board, _post);
        const board = (await this.getContentByID(_board)).PostBoard;
        await this.contentExists(board);
        const post = (await Post.getContentByID(_post)).PostBoard;
        await Post.contentExists(post);
        // console.log("In function: ", _postid, "\n");
        // console.log("In function: ", board, "\n");
        board?.content.push(_post);
        //console.log("In function after push: ", board, "\n", board?.content);
        await this.update(_board, { content: board?.content });
        return { msg: "Board successfully updated" };
    }
    async deletePostFromBoard(_board: ObjectId, _post: ObjectId) {
        await this.postInBoard(_board, _post);
        const board = (await this.getContentByID(_board)).PostBoard;
        await this.contentExists(board);
        const post = (await Post.getContentByID(_post)).PostBoard;
        await Post.contentExists(post);

        const newBoard = board?.content.filter(post => (post !== _post));
        //filter returns new array so no need for aliasing 
        await this.update(_board, { content: newBoard });
        return { msg: "Board successfully updated" };
    }
    async postNotInBoard(_id: ObjectId, _postid: ObjectId) {
        const board = (await this.getContentByID(_id)).PostBoard;
        //console.log(_postid.toHexString, board?.content);
        return board?.content.filter(post => (post.toString() === _postid.toString())).length === 0;
    }
    async postInBoard(_id: ObjectId, _postid: ObjectId) {
        const board = (await this.getContentByID(_id)).PostBoard;
        console.log(_postid.toHexString, board?.content);
        return board?.content.filter(post => (post.toString() === _postid.toString())).length !== 0;
    }
}