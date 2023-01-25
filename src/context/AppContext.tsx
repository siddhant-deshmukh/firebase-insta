import React, { useContext, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth"

export const AppContext = React.createContext(null);

interface IAuthState{
    authenticated:boolean,
    user?:{
        
    }
}
//@ts-ignore
export const AppProvider= ({children}) => {

    // const user = auth.currentUser;
    const [authState,setAuthState] = useState<IAuthState>({authenticated:false})
    onAuthStateChanged(auth,(user)=>{
        if(user){
            setAuthState({
                authenticated:true,
                user
            })
        }else{
            setAuthState({
                authenticated:false,
            })
        }
    })
    //@ts-ignore
    return( < AppContext.Provider value={{authState}}>
        {children}
      </ AppContext.Provider >
    );
}
export default AppContext;