import React, { useCallback, useContext, useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged, isSignInWithEmailLink, signInWithEmailLink, User as UserAuth } from "firebase/auth"
import { collection, query, where, getDoc, doc, QuerySnapshot, DocumentData } from "firebase/firestore"
import { IUser, IUserOwn, IUserSnippet, IUserStored } from "../types";
import { getDownloadURL, ref } from "firebase/storage";
import { QueryClient } from "react-query";

export interface IAuthState {
    authenticated: 'Yes' | 'No' | 'Partial',
    user?: IUserOwn
}
export interface IAuthContext {
    authState: IAuthState,
    authLoading: 'Yes' | 'No' | 'initial',
}
const initialAuthState: IAuthState = {
    authenticated: 'No'
}
const initialContext: IAuthContext = {
    authState: initialAuthState,
    authLoading: 'initial',
}
export const AppContext = React.createContext<IAuthContext>(initialContext);

export const getAvatarUrl = async (userId: string) => {
    try{
        const url = await getDownloadURL(ref(storage, `users/${userId}/avatar`))
        // console.log("Get Avatar Url ", url)
        if (url) return url;
        else return undefined
    }catch (err){
        // console.log('to find user avatar',userId, err)
        return undefined
    }
}

export const getUserData = async (userId:string,queryClient: QueryClient | undefined,ownUid:string | undefined) => {
    const checkInCache  = queryClient?.getQueryData(['user','snippet',userId]) as IUserSnippet
    if(checkInCache) return checkInCache

    const userStoredPromise = getDoc(doc(db, `users/${userId}`))
    const userAvatarPromise = getAvatarUrl(userId)
    const userRelationPromise = async ()=>{
        if(!ownUid) return undefined 
        let relationWithUser : 'self'|''|'following' = '';
        if(ownUid === userId){ 
            relationWithUser = 'self'
        } else{
            const doc_ = await getDoc(doc(db,`users/${ownUid}/following/${userId}`))
            if(doc_.exists()) relationWithUser = 'following'
            else relationWithUser = ''
        }
        return relationWithUser
    }

    const [userStoredDocSnap, userAvatarUrl,relationWithUser] = await Promise.all([userStoredPromise, userAvatarPromise, userRelationPromise()])
    const userStoredData = userStoredDocSnap.data() as IUserStored
    const userSnippet: IUserSnippet = {
        ...userStoredData,
        avatarUrl: (!userAvatarUrl && typeof userStoredData.avatar == "string" && userStoredData.avatar !== "") ? (userStoredData.avatar as string) : (userAvatarUrl),
        uid: userId,
        relationWithUser
    }
    // console.log("user",userId,userSnippet)
    if(queryClient) queryClient.setQueriesData(['user','snippet',userId],userSnippet) //Caching data
    return userSnippet as IUserSnippet;
}
// getUserSnippetsFromDocsSnapShot can be used to show LikedBy, Followers, Following Modals
export const getUserSnippetsFromDocsSnapShot = async (docsSnapShot: QuerySnapshot<DocumentData>,queryClient: QueryClient | undefined,ownUid:string|undefined) => {
    const promiseQ   = docsSnapShot.docs.map(async (userDoc) => {
        //console.log("userId",userDoc.id)
        return await getUserData(userDoc.id,queryClient,ownUid)
    })
    return await Promise.all(promiseQ)
}
//@ts-ignore
export const AppProvider = ({ children }) => {

    // const user = auth.currentUser;
    const [authState, setAuthState] = useState<IAuthState>(initialAuthState)
    const [authLoading, setAuthLoading] = useState<'Yes' | 'No' | 'initial'>('initial')

    const setUserAuthStateFun = useCallback((user: UserAuth | null) => {

        /**
         else if(user){
            setAuthState({
                authenticated : 'Partial'
            })
            setAuthLoading('No')
        } 
         */
        if (user) { //add && user.emailVerified if want extra 
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
            }).finally(() => {
                setAuthLoading('No')
            })
        } else {
            setAuthState({
                authenticated: 'No'
            })
            setAuthLoading('No')
        }
    }, [authState, setAuthState, setAuthLoading])


    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setAuthLoading('Yes')
            console.log('Auth state changed!', user)
            let userData: IUserStored;
            // add  && user.emailVerified if want email verified
            /**
             else if(user){
                console.log("User email not verified!",user.email)
                if (isSignInWithEmailLink(auth, window.location.href)) {
                    let email = window.localStorage.getItem('emailForSignIn') as string;
                    signInWithEmailLink(auth, email, window.location.href)
                      .then((result) => {
                        window.localStorage.removeItem('emailForSignIn');
                        console.log("Signin with email")
                        setUserAuthStateFun({...user,emailVerified:true})
                      })
                      .catch((error) => {
                        console.log("Error to check signinwitheemail!",error)
                        setUserAuthStateFun({...user,emailVerified:false})
                      })
                }else setUserAuthStateFun({...user,emailVerified:false})
            }
             */
            if (user) {
                setUserAuthStateFun(user)
            } else setUserAuthStateFun(null)
        })
    }, [setAuthLoading])
    //@ts-ignore
    return (< AppContext.Provider value={{ authState, authLoading }}>
        {children}
    </ AppContext.Provider >
    );
}
export default AppContext;