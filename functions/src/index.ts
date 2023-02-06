
import * as functions from "firebase-functions";
// The Firebase Admin SDK to access Firestore.
import * as admin from "firebase-admin";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
admin.initializeApp();

exports.afterAuthUser = functions
    .region("asia-south1")
    .auth.user().onCreate(async (user)=>{
      let newUserName = user.email?.split("@")[0].slice(0, 5) +
          Math.floor(Math.random()*10**5).toString();
      const newDisplayName = user.email?.split("@")[0];
      const collectionRef_ = admin.firestore().collection("users");
      let exists = false;
      for (let i=0; i<10; i++) {
        exists = false;
        const querySnapshot= await collectionRef_
            .where("username", "==", newUserName).get();
        querySnapshot.forEach((documentSnapshot) => {
          if (documentSnapshot.data()) exists=true;
        });
        if (exists) {
          console.log(newUserName, "alerady exists!");
          newUserName = user.email?.split("@")[0].slice(0, 5) +
            Math.floor(Math.random()*10**5).toString();
        } else break;
      }
      const newUser = {
        name: user.displayName || newDisplayName,
        avatar: user.photoURL || 0,
        about: "",
        username: newUserName,
        numPosts: 0,
        numStories: 0,
        // posts: [],
        // stories: [],
        // following: [],
        // followers: [],
        authComplete: false,
        numFollowing: 0,
        numFollowers: 0,
      };

      const collectionRef = admin.firestore().doc(`users/${user.uid}`)
          .create(newUser);
      return collectionRef;
    });
exports.followingAccountTrigger = functions
    .region("asia-south1")
    .firestore.document("/users/{userId}/following/{followingToId}")
    .onCreate(async (snap, context)=>{
      // functions.logger.log("followed someone", snap, context);
      // console.log("Snap", snap);
      // console.log("Context", context);
      const userId : string = context.params.userId;
      const followingToId = context.params.followingToId;
      const documentRef = admin.firestore()
          .doc(`users/${followingToId}/followers/${userId}`)
          .create({exists: true});
      const documentRef2 = admin.firestore()
          .doc(`users/${userId}`)
          .update({
            "numFollowing": FieldValue.increment(1),
          });
      const documentRef3 = admin.firestore()
          .doc(`users/${followingToId}`)
          .update({
            "numFollowers": FieldValue.increment(1),
          });
      return Promise.all([documentRef, documentRef2, documentRef3]);
    });
exports.unFollowingAccountTrigger = functions
    .region("asia-south1")
    .firestore.document("/users/{userId}/following/{followingToId}")
    .onDelete(async (snap, context)=>{
      // functions.logger.log("followed someone", snap, context);
      // console.log("Snap", snap);
      // console.log("Context", context);
      const userId = context.params.userId;
      const followingToId = context.params.followingToId;
      const documentRef = admin.firestore()
          .doc(`users/${followingToId}/followers/${userId}`)
          .delete();
      const documentRef2 = admin.firestore()
          .doc(`users/${userId}`)
          .update({
            "numFollowing": FieldValue.increment(-1),
          });
      const documentRef3 = admin.firestore()
          .doc(`users/${followingToId}`)
          .update({
            "numFollowers": FieldValue.increment(-1),
          });
      return Promise.all([documentRef, documentRef2, documentRef3]);
    });
exports.newPostCreatedTrigger = functions
    .region("asia-south1")
    .firestore.document("/posts/{postId}")
    .onCreate(async (snap, context)=>{
      // functions.logger.log("created new post", snap, context);
      const postId : string = context.params.postId;
      const authorId = snap.data().authorId;
      // console.log("Snap", snap);
      // console.log("Context", context);
      console.log(postId, authorId);
      const documentRef = admin.firestore()
          .doc(`users/${authorId}/posts/${postId}`)
          .create({exists: true, createdAt: Timestamp.fromDate(new Date)});
      const documentRef2 = admin.firestore()
          .doc(`users/${authorId}`)
          .update({
            "numPosts": FieldValue.increment(1),
          });
      return Promise.all([documentRef, documentRef2]);
    });
exports.postLikedTrigger = functions
    .region("asia-south1")
    .firestore.document("/posts/{postId}/likedby/{userLikedId}")
    .onCreate(async (snap, context)=>{
      const postId : string = context.params.postId;
      // const userLikedId = context.params.userLikedId;
      // const authorId = snap.data().authorId;
      // console.log("Snap", snap);
      // console.log("Context", context);
      // console.log("The data seen from here", snap.data());
      // console.log(postId, authorId);
      const documentRef = admin.firestore()
          .doc(`posts/${postId}`)
          .update({
            "numLikes": FieldValue.increment(1),
          });
      return documentRef;
    });
exports.postDisLikedTrigger = functions
    .region("asia-south1")
    .firestore.document("/posts/{postId}/likedby/{userLikedId}")
    .onDelete(async (snap, context)=>{
      const postId : string = context.params.postId;
      const documentRef = admin.firestore()
          .doc(`posts/${postId}`)
          .update({
            "numLikes": FieldValue.increment(-1),
          });
      return documentRef;
    });
exports.newStoryCreatedTrigger = functions
    .region("asia-south1")
    .firestore.document("/stories/{storyId}")
    .onCreate(async (snap, context)=>{
      // functions.logger.log("created new post", snap, context);
      const storyId = context.params.storyId;
      const authorId = snap.data().authorId;
      // console.log("Snap", snap);
      // console.log("Context", context);
      const documentRef = admin.firestore()
          .doc(`users/${authorId}/stories/${storyId}`)
          .create({exists: true});
      const documentRef2 = admin.firestore()
          .doc(`users/${authorId}`)
          .update({
            "numStories": FieldValue.increment(1),
          });
      return Promise.all([documentRef, documentRef2]);
    });
exports.newAvatarUploaded = functions
    .region("asia-south1")
    .storage.object()
    .onFinalize(async (object)=>{
      if (!object.name) return Promise<void>;
      // functions.logger.log("created new avatar", object);
      // functions.logger.log("name of avatar", object.name);
      const path = object.name.split("/");
      // console.log(path)
      if (path.length!==3 || path[0]!=="users" ||
        path[2].slice(0, 6)!=="avatar" || path[2].length > 10) {
        return Promise<void>;
      }
      const user = await admin.firestore()
          .doc(`users/${path[1]}`)
          .get();
      if (!user.exists) return;
      let numUpdates = 0;
      if (user.data() && typeof user.data()?.avatar === "string" ) {
        numUpdates = 0;
      } else {
        numUpdates = user.data()?.avatar + 1 || 1;
      }

      const updatedUserRef = await admin.firestore()
          .doc(`users/${path[1]}`)
          .update({
            avatar: numUpdates,
          });
      return updatedUserRef;
    });
