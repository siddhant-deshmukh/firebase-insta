import React, { useCallback,  useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, User as UserAuth } from "firebase/auth"
import { getDoc, doc } from "firebase/firestore"
import { IUserOwn,  IUserStored } from "../types";
import { getAvatarUrl } from "../utils/user_related_functions";

export interface IAuthState {
  authenticated: 'Yes' | 'No' | 'Partial' | 'Unknown',
  user?: IUserOwn
}
export interface IAuthContext {
  authState: IAuthState,
  authLoading: 'Yes' | 'No' | 'initial',
  setAuthState? : React.Dispatch<React.SetStateAction<IAuthState>>,
  postFeed: string[],
  setPostFeed?: React.Dispatch<React.SetStateAction<string[]>>
}
const initialAuthState: IAuthState = {
  authenticated: 'Unknown'
}
const initialContext: IAuthContext = {
  authState: initialAuthState,
  authLoading: 'Yes',
  postFeed: []
}
export const AppContext = React.createContext<IAuthContext>(initialContext);

//@ts-ignore
export const AppProvider = ({ children }) => {

  // const user = auth.currentUser;
  const [authState, setAuthState] = useState<IAuthState>(initialAuthState)
  const [authLoading, setAuthLoading] = useState<'Yes' | 'No' | 'initial'>('initial')
  const [postFeed, setPostFeed] = useState<string[]>([])

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
  return (< AppContext.Provider value={{ authState, authLoading, setAuthState, postFeed, setPostFeed }}>
    {children}
  </ AppContext.Provider >
  );
}
export default AppContext;