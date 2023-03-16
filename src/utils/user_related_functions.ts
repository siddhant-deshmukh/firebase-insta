import { doc, DocumentData, getDoc, QuerySnapshot } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { QueryClient } from "react-query";
import { db, storage } from "../firebase";
import { IUserSnippet, IUserStored } from "../types";

export const getAvatarUrl = async (userId: string) => {
    try {
      const url = await getDownloadURL(ref(storage, `users/${userId}/avatar`))
      if (url) return url;
      else return undefined
    } catch (err) {
      console.warn('User avatar may not exist',userId,err)
      return undefined
    }
  }
  
  export const getUserData = async (userId: string, queryClient: QueryClient | undefined, ownUid: string | undefined) => {
    try {
      // if found the user in cache return it!
      const checkInCache = queryClient?.getQueryData(['user', 'snippet', userId]) as IUserSnippet
      if (checkInCache) return checkInCache
  
      // if not found in cache try to find it!
      const userStoredPromise = getDoc(doc(db, `users/${userId}`))     // getting the user info
      const userAvatarPromise = getAvatarUrl(userId)                   // getting user avatar
      const userRelationPromise = async () => {                        // getting relation i.e if main user follow him or not
        if (!ownUid) return undefined
        let relationWithUser: 'self' | '' | 'following' = '';
        if (ownUid === userId) {
          relationWithUser = 'self'
        } else {
          const doc_ = await getDoc(doc(db, `users/${ownUid}/following/${userId}`))
          if (doc_.exists()) relationWithUser = 'following'
          else relationWithUser = ''
        }
        return relationWithUser
      }
  
      const [userStoredDocSnap, userAvatarUrl, relationWithUser] = await Promise.all([userStoredPromise, userAvatarPromise, userRelationPromise()])
      const userStoredData = userStoredDocSnap.data() as IUserStored
      const userSnippet: IUserSnippet = {
        ...userStoredData,
        avatarUrl: (!userAvatarUrl && typeof userStoredData.avatar == "string" && userStoredData.avatar !== "") ? (userStoredData.avatar as string) : (userAvatarUrl),
        uid: userId,
        relationWithUser
      }
      // Storing in cache! Caching data
      if (queryClient) queryClient.setQueriesData(['user', 'snippet', userId], userSnippet); 
      return userSnippet as IUserSnippet;
    } catch (err) {
      console.error('Error while getting user data',err)
      return undefined;
    }
  }
  // getUserSnippetsFromDocsSnapShot can be used to show LikedBy, Followers, Following Modals
  export const getUserSnippetsFromDocsSnapShot = async (docsSnapShot: QuerySnapshot<DocumentData>, queryClient: QueryClient | undefined, ownUid: string | undefined) => {
    try {
      const promiseQ = docsSnapShot.docs.map(async (userDoc) => {
        //console.log("userId",userDoc.id)
        return await getUserData(userDoc.id, queryClient, ownUid)
      })
      return await Promise.all(promiseQ)
    } catch(err) {
      console.error('Error while getting user snippets',err)
      return []
    }
  }