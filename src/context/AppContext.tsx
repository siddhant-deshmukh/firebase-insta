import React, { useCallback, useContext, useEffect, useState } from "react";
import { auth,db } from "../firebase";
import { onAuthStateChanged, isSignInWithEmailLink,signInWithEmailLink, User as UserAuth } from "firebase/auth"
import { collection, query, where,  getDoc, doc } from "firebase/firestore"
import { IUser, IUserStored } from "../types";

export interface IAuthState{
    authenticated:'Yes'|'No'|'Partial',
    user?: IUser
}
export interface IAuthContext{
    authState:IAuthState,
    authLoading:'Yes'|'No' | 'initial',
}
const initialAuthState : IAuthState = {
    authenticated:'No'
}
const initialContext : IAuthContext = {
    authState:initialAuthState,
    authLoading:'initial',
}
export const AppContext = React.createContext<IAuthContext>(initialContext);

//@ts-ignore
export const AppProvider= ({children}) => {

    // const user = auth.currentUser;
    const [authState,setAuthState] = useState<IAuthState>(initialAuthState)
    const [authLoading,setAuthLoading] = useState<'Yes'|'No'| 'initial'>('initial')

    const setUserAuthStateFun = useCallback((user : UserAuth | null)=>{

        /**
         else if(user){
            setAuthState({
                authenticated : 'Partial'
            })
            setAuthLoading('No')
        } 
         */
        if(user ){ //add && user.emailVerified if want extra 
            const getUserByEmailQuery = doc( db, `users/${user.uid}` )  ;
            getDoc( getUserByEmailQuery ).then((docSnap)=>{
                console.log(user.email)
                const data =  docSnap.data() as IUserStored;
                console.log("Set user auth name",data,user)
                setAuthState({
                    authenticated : 'Yes',
                    user: {
                        uid: user.uid,
                        email : user.email as string,
                        emailVerified : user.emailVerified,
                        ...data
                    }
                })
            }).catch(err=>{
                setAuthState({
                    authenticated : 'No'
                })
                console.log("error while getting user")
            }).finally(()=>{
                setAuthLoading('No')
            })
        } else {
            setAuthState({
                authenticated : 'No'
            })
            setAuthLoading('No')
        }
    },[authState,setAuthState,setAuthLoading])


    useEffect(()=>{
        onAuthStateChanged(auth,(user)=>{
            setAuthLoading('Yes')
            console.log('Auth state changed!',user)
            let userData : IUserStored ;
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
            if(user){
                setUserAuthStateFun(user)
            }else setUserAuthStateFun(null)
        })
    },[setAuthLoading])
    //@ts-ignore
    return( < AppContext.Provider value={{authState,authLoading}}>
        {children}
      </ AppContext.Provider >
    );
}
export default AppContext;