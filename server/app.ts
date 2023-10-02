import { ObjectId } from "mongodb";
import ContentConcept from "./concepts/content";
import FriendConcept from "./concepts/friend";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new ContentConcept<string>();
export const Board = new ContentConcept<Set<ObjectId>>(); 
export const Friend = new FriendConcept();
