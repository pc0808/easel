import { ObjectId } from "mongodb";
import BoardConcept from "./concepts/board";
import ContentConcept from "./concepts/content";
import FriendConcept from "./concepts/friend";
import TagsConcept from "./concepts/tags";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new ContentConcept<string>("Posts");
export const Board = new BoardConcept("Boards");
export const Friend = new FriendConcept();
export const PostTags = new TagsConcept<string>("Post Tags", Post);
export const BoardTags = new TagsConcept<ObjectId[]>("Board Tags", Board); 