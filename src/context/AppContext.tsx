import React, { useCallback, useContext, useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged, User as UserAuth } from "firebase/auth"
import { getDoc, doc, QuerySnapshot, DocumentData } from "firebase/firestore"
import { IUserOwn, IUserSnippet, IUserStored } from "../types";
import { getDownloadURL, ref } from "firebase/storage";
import { QueryClient } from "react-query";

export interface IAuthState {
  authenticated: 'Yes' | 'No' | 'Partial' | 'Unknown',
  user?: IUserOwn
}
export interface IAuthContext {
  authState: IAuthState,
  authLoading: 'Yes' | 'No' | 'initial',
  setAuthState? : React.Dispatch<React.SetStateAction<IAuthState>>,
}
const initialAuthState: IAuthState = {
  authenticated: 'Unknown'
}
const initialContext: IAuthContext = {
  authState: initialAuthState,
  authLoading: 'Yes',
}
export const AppContext = React.createContext<IAuthContext>(initialContext);

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
//@ts-ignore
export const AppProvider = ({ children }) => {

  // const user = auth.currentUser;
  const [authState, setAuthState] = useState<IAuthState>(initialAuthState)
  const [authLoading, setAuthLoading] = useState<'Yes' | 'No' | 'initial'>('initial')

  const setUserAuthStateFun = useCallback((user: UserAuth | null) => {
    
    if (user && user.emailVerified) { //add && user.emailVerified if want extra 
      const getUserByEmailQuery = doc(db, `users/${user.uid}`);
      getDoc(getUserByEmailQuery).then((docSnap) => {
        console.log(user.email)
        const data = docSnap.data() as IUserStored;
        console.log("Set user auth name", data, user)
        getAvatarUrl(docSnap.id).then((avatarUrl) => {
          setAuthState({
            authenticated: 'Yes',
            user: {
              uid: user.uid,
              email: user.email as string,
              emailVerified: user.emailVerified,
              avatarUrl: (!avatarUrl && typeof data.avatar == "string" && data.avatar !== "") ? (data.avatar as string) : (avatarUrl),
              ...data
            },
          })
        }).catch(err => {
          console.log("Get avatar URL of logged in user error", err)
        })
      }).catch(err => {
        setAuthState({
          authenticated: 'No'
        })
        console.log("error while getting user")
      })
    } else if(user && !user.emailVerified ){
      setAuthState({
        authenticated: 'Partial'
      })
    } else {
      setAuthState({
        authenticated: 'No'
      })
    }
  }, [authState, setAuthState])


  useEffect(() => {
    setAuthLoading('Yes')
    onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed!', user)
      setUserAuthStateFun(user)
    })
  }, [setAuthLoading])
  useEffect(()=>{
    if(authState.authenticated === 'Unknown') setAuthLoading('Yes')
    else{
      setAuthLoading('No')
    }
  },[authState,setAuthLoading])
  //@ts-ignore
  return (< AppContext.Provider value={{ authState, authLoading, setAuthState }}>
    {children}
  </ AppContext.Provider >
  );
}
export default AppContext;