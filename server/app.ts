import BoardConcept from "./concepts/board";
import ContentConcept from "./concepts/content";
import FriendConcept from "./concepts/friend";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new ContentConcept<string>("Posts");
export const Board = new BoardConcept("Boards");
export const Friend = new FriendConcept();
