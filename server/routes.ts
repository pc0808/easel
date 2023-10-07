
import { Router, getExpressRouter } from "./framework/router";

import { ObjectId } from "mongodb";
import { Board, BoardTags, Post, PostTags, Profile, User, WebSession } from "./app";
import { ContentDoc, ContentOptions } from "./concepts/content";
import { BadValuesError } from "./concepts/errors";
import { ProfileDoc } from "./concepts/profile";
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
    return await User.getUsers(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    const user = await User.create(username, password);
    const userID = (await User.getUserByUsername(username))._id;
    const profile = await Profile.create(userID);
    return { msg: "Successfully created!", user: user.user, profile: profile.profile };
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update); //assures new usrn is okay 
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);

    const userID = (await User.getUserById(user))._id;
    await Profile.delete(userID);
    await Post.deleteMany(userID);
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

  ///////////////////////////////////
  // PROFILES CONCEPT DOWN BELOW ////
  ///////////////////////////////////
  @Router.get("/profiles/:username")
  async getProfileByUsername(username: string) {
    //userID: 
    const _id = (await User.getUserByUsername(username))._id;
    return await Profile.getProfileByUser(_id);
  }

  @Router.patch("/profiles")
  async updateProfile(session: WebSessionDoc, update: Partial<ProfileDoc>) {
    const user = WebSession.getUser(session);
    const profile = (await Profile.getProfileByUser(user))._id;
    return await Profile.update(profile, update); //assures new usrn is okay 
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
    const post = await Post.getContentByID(_id);
    return { msg: post.msg, post: post };
  }

  @Router.get("/posts/tags/:_id")
  async getTagsUnderPost(_id: ObjectId) {
    console.log(await Post.getTags(_id));
    return await Post.getTags(_id);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, caption: string, content: string, options?: ContentOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, caption, content, [], options);
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
    const board = await Board.getContentByID(_id);
    return { msg: board.msg, board: board.content };
  }

  @Router.get("/boards/tags/:_id")
  async getTagsUnderBoard(_id: ObjectId) {
    return Board.getTags(_id);
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
    await Post.getContentByID(_post); //will check that this post actually exists 
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
    await Post.getContentByID(_post); //will check that this post actually exists 
    return await Board.deletePostFromBoard(_board, _post);
  }

  ////////////////////////////////
  // TAGS CONCEPT DOWN BELOW /////
  ////////////////////////////////
  @Router.get("/tags/posts/:tagName")
  async getTaggedPosts(tagName: string) {
    return await PostTags.getContentByTagName(tagName);
  }

  @Router.get("/tags/boards/:tagName")
  async getTaggedBoards(tagName: string) {
    return await BoardTags.getContentByTagName(tagName);
  }

  @Router.patch("/tags/posts/:tagName&:_post")
  async addTagToPost(session: WebSessionDoc, _post: ObjectId, tagName: string) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _post);
    const tag = (await PostTags.getContentByTagName(tagName)).taggedContent;
    if (!tag) throw new BadValuesError("Tag search gone bad");

    // console.log("Adding tag does work!! but mongoDB sends a strange error");
    await PostTags.addContent(tag._id, _post);
    console.log("bug after adding to TAG instance");
    await Post.addTag(tagName, _post);
    return { msg: "Successful update" }
  }

  @Router.patch("/tags/boards/:tagName&:_board")
  async addTagToBoard(session: WebSessionDoc, _board: ObjectId, tagName: string) {
    const user = WebSession.getUser(session);
    await Board.isAuthor(user, _board);
    const tag = (await BoardTags.getContentByTagName(tagName)).taggedContent;

    if (!tag) throw new BadValuesError("Tag search gone bad");

    await BoardTags.addContent(tag._id, _board);
    await Board.addTag(tagName, _board);
    return { msg: "Successful update" }
  }

  @Router.put("/tags/posts/:tagName&:_post")
  async deleteTagFromPost(session: WebSessionDoc, _post: ObjectId, tagName: string) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _post);
    const tag = (await PostTags.getContentByTagName(tagName)).taggedContent;
    if (!tag) throw new BadValuesError("Tag search gone bad");

    await PostTags.deleteContent(tag._id, _post);
    await Post.deleteTag(tagName, _post);
    return { msg: "successfully updated" };
  }

  @Router.put("/tags/boards/:tagName&:_board")
  async deleteTagFromBoard(session: WebSessionDoc, _board: ObjectId, tagName: string) {
    const user = WebSession.getUser(session);
    await Board.isAuthor(user, _board);
    const tag = (await BoardTags.getContentByTagName(tagName)).taggedContent;
    if (!tag) throw new BadValuesError("Tag search gone bad");

    await BoardTags.deleteContent(tag._id, _board);
    await Board.deleteTag(tagName, _board);
    return { msg: "successfully updated" };
  }

  ////////////////////////////////
  // FRIENDS CONCEPT DOWN BELOW /////
  ////////////////////////////////
  @Router.get("/following/:username")
  async getFollowing(username: string) {
    throw new Error("Not yet implemented!");
  }
  @Router.get("/followers/:username")
  async getFollowers(username: string) {
    throw new Error("Not yet implemented!");
  }
  @Router.post("/following/:username")
  async followUser(username: string) {
    throw new Error("Not yet implemented!");
  }
  @Router.post("/followers/:username")
  async unfollowUser(username: string) {
    throw new Error("Not yet implemented!");
  }
}

export default getExpressRouter(new Routes());
