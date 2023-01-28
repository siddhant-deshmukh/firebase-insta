
import * as functions from "firebase-functions";
// The Firebase Admin SDK to access Firestore.
import * as admin from "firebase-admin";
admin.initializeApp();

exports.afterAuthUser = functions
    .region("asia-south1")
    .auth.user().onCreate((user)=>{
      const newUser = {
        name: user.displayName || "",
        avatar: user.photoURL || "",
        about: "",
        username: "",
        // posts: [],
        // stories: [],
        // following: [],
        // followers: [],
        authComplete: false,
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
      return documentRef;
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
      return documentRef;
    });
exports.newPostCreatedTrigger = functions
    .region("asia-south1")
    .firestore.document("/posts/{postId}")
    .onCreate(async (snap, context)=>{
      // functions.logger.log("created new post", snap, context);
      const postId = context.params.postId;
      const authorId = snap.data().authorId;
      console.log("Snap", snap);
      console.log("Context", context);
      const documentRef = admin.firestore()
          .doc(`users/${authorId}/posts/${postId}`)
          .create({exists: true});
      return documentRef;
    });
exports.newStoryCreatedTrigger = functions
    .region("asia-south1")
    .firestore.document("/stories/{storyId}")
    .onCreate(async (snap, context)=>{
      // functions.logger.log("created new post", snap, context);
      const storyId = context.params.storyId;
      const authorId = snap.data().authorId;
      console.log("Snap", snap);
      console.log("Context", context);
      const documentRef = admin.firestore()
          .doc(`users/${authorId}/stories/${storyId}`)
          .create({exists: true});
      return documentRef;
    });
