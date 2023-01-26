import React, { useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, isSignInWithEmailLink,signInWithEmailLink, User } from "firebase/auth"


export interface IAuthState{
    authenticated:'Yes'|'No'|'Partial',
    user?: User
}
export interface IAuthContext{
    authState:IAuthState
}
const initialAuthState : IAuthState = {
    authenticated:'No'
}
const initialContext : IAuthContext = {
    authState:initialAuthState
}
export const AppContext = React.createContext<IAuthContext>(initialContext);

//@ts-ignore
export const AppProvider= ({children}) => {

    // const user = auth.currentUser;
    const [authState,setAuthState] = useState<IAuthState>(initialAuthState)

    useEffect(()=>{

        onAuthStateChanged(auth,(user)=>{
            console.log('Auth state changed!')
            if(user && user.emailVerified){
                console.log(user)
                setAuthState({
                    authenticated:'Yes',
                    user
                })
            }else if(user){
                console.log("User email not verified!",user.email)
                if (isSignInWithEmailLink(auth, window.location.href)) {
                    // Additional state parameters can also be passed via URL.
                    // This can be used to continue the user's intended action before triggering
                    // the sign-in operation.
                    // Get the email if available. This should be available if the user completes
                    // the flow on the same device where they started it.
                    let email = window.localStorage.getItem('emailForSignIn') as string;
                    // if (!email) {
                    //   // User opened the link on a different device. To prevent session fixation
                    //   // attacks, ask the user to provide the associated email again. For example:
                    //   email = window.prompt('Please provide your email for confirmation');
                    // }
                    // The client SDK will parse the code from the link for you.
                    signInWithEmailLink(auth, email, window.location.href)
                      .then((result) => {
                        // Clear email from storaauthState?.user?.emailge.
                        window.localStorage.removeItem('emailForSignIn');
                        // You can access the new user via result.user
                        // Additional user info profile not available via:
                        // result.additionalUserInfo.profile == null
                        // You can check if the user is new or existing:
                        // result.additionalUserInfo.isNewUser
                        console.log("Signin with email")
                        setAuthState({
                            authenticated:'Yes',
                            user
                        })
                      })
                      .catch((error) => {
                        console.log("Error!")
                      });
                  }else{
                      setAuthState({
                          authenticated:'Partial',
                          user
                      })
                  }
            }
            else{
                setAuthState({
                    authenticated:'No',
                })
            }
        })

        
    },[])
    //@ts-ignore
    return( < AppContext.Provider value={{authState}}>
        {children}
      </ AppContext.Provider >
    );
}
export default AppContext;