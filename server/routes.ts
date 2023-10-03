import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Board, BoardTags, Friend, Post, PostTags, User, WebSession } from "./app";
import { ContentDoc, ContentOptions } from "./concepts/content";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  ///////////////////////////////////////
  // USER+SESSION CONCEPT DOWN BELOW ////
  ///////////////////////////////////////
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  ////////////////////////////////
  // POSTS CONCEPT DOWN BELOW ////
  ////////////////////////////////
  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getContents({});
    }
    return Responses.posts(posts);
  }

  @Router.get("/posts/:_id")
  async getPostByID(_id: ObjectId) {
    let post = await Post.getContentByID(_id);
    return { msg: post.msg, post: post.PostBoard };
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, caption: string, content: string, options?: ContentOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, caption, content, options);
    return { msg: created.msg, post: await Responses.post(created.content) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<ContentDoc<string>>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  //////////////////////////////////
  // FRIENDS CONCEPT DOWN BELOW ////
  //////////////////////////////////
  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  /////////////////////////////////
  // BOARDS CONCEPT DOWN BELOW ////
  /////////////////////////////////
  @Router.get("/boards")
  async getBoards(author?: string) {
    let boards;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      boards = await Board.getByAuthor(id);
    } else {
      boards = await Board.getContents({});
    }
    return Responses.boards(boards);
  }

  @Router.get("/boards/:_id")
  async getBoardByID(_id: ObjectId) {
    let board = await Board.getContentByID(_id);
    return { msg: board.msg, board: board.PostBoard };
  }

  @Router.post("/boards")
  async createBoard(session: WebSessionDoc, caption: string) {
    const user = WebSession.getUser(session);
    const created = await Board.create(user, caption, []);
    return { msg: created.msg, board: await Responses.board(created.content) };
  }

  @Router.patch("/boards/:_board&:_post")
  async addPostToBoard(session: WebSessionDoc, _board: ObjectId, _post: ObjectId) {
    const user = WebSession.getUser(session);
    await Board.isAuthor(user, _board);
    //console.log("Before update id:", _id, "\n post:", _postid, "\n");
    return await Board.addPostToBoard(_board, _post);
  }

  @Router.delete("/boards/:_id")
  async deleteBoard(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Board.isAuthor(user, _id);
    return Board.delete(_id);
  }

  @Router.put("/boards/:_board&:_post")
  async deletePostFromBoard(session: WebSessionDoc, _board: ObjectId, _post: ObjectId) {
    const user = WebSession.getUser(session);
    await Board.isAuthor(user, _board);
    return await Board.deletePostFromBoard(_board, _post);
  }

  ////////////////////////////////
  // TAGS CONCEPT DOWN BELOW /////
  ////////////////////////////////
  @Router.get("/posts/tags/:tagName")
  async getTaggedPosts(session: WebSessionDoc, tagName: string) {
    WebSession.isLoggedIn(session);
    const posts = await PostTags.getContentByTagName(tagName);
    return { msg: posts.msg, posts: posts.taggedContent.content }
  }

  @Router.get("/boards/tags/:tagName")
  async getTaggedBoards(session: WebSessionDoc, tagName: string) {
    WebSession.isLoggedIn(session);
    const boards = await BoardTags.getContentByTagName(tagName);
    return { msg: boards.msg, boards: boards.taggedContent.content }
  }

  @Router.post("/posts/tags/:tagName")
  async createPostTag(session: WebSessionDoc, tagName: string) {
    WebSession.isLoggedIn(session);
    const created = await PostTags.create(tagName);
    return { msg: created.msg, post: created.tag };
  }

  @Router.post("/boards/tags/:tagName")
  async createBoardTag(session: WebSessionDoc, tagName: string) {
    WebSession.isLoggedIn(session);
    const created = await BoardTags.create(tagName);
    return { msg: created.msg, post: created.tag };
  }

  @Router.patch("/posts/tags/:tagName&:_post")
  async addTagToPost(session: WebSessionDoc, _post: ObjectId, tagName: string) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _post);
    const tag = (await PostTags.getContentByTagName(tagName)).taggedContent;
    console.log("Adding tag does work!! but mongoDB sends a strange error");
    return await PostTags.addContent(tag._id, _post);
  }

  @Router.patch("/boards/tags/:tagName&:_board")
  async addTagToBoard(session: WebSessionDoc, _board: ObjectId, tagName: string) {
    const user = WebSession.getUser(session);
    await Board.isAuthor(user, _board);
    const tag = (await BoardTags.getContentByTagName(tagName)).taggedContent;
    console.log("Adding tag does work!! but mongoDB sends a strange error");
    return await BoardTags.addContent(tag._id, _board);
  }

  @Router.put("/posts/tags/:tagName&:_post")
  async deleteTagFromPost(session: WebSessionDoc, _post: ObjectId, tagName: string) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _post);
    const tag = (await PostTags.getContentByTagName(tagName)).taggedContent;
    console.log("Deleting tag does work!! but mongoDB sends a strange error");
    return await PostTags.deleteContent(tag._id, _post);
  }

  @Router.put("/boards/tags/:tagName&:_board")
  async deleteTagFromBoard(session: WebSessionDoc, _board: ObjectId, tagName: string) {
    const user = WebSession.getUser(session);
    await Board.isAuthor(user, _board);
    const tag = (await BoardTags.getContentByTagName(tagName)).taggedContent;
    console.log("Deleting tag does work!! but mongoDB sends a strange error");
    return await BoardTags.deleteContent(tag._id, _board);
  }
}

export default getExpressRouter(new Routes());
