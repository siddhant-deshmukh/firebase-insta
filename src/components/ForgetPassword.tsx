import React, { useCallback, useContext, useEffect, useState } from 'react'
import { sendSignInLinkToEmail, signOut, sendPasswordResetEmail, User, ActionCodeSettings, applyActionCode } from 'firebase/auth'
import { auth } from '../firebase'
import AppContext from '../context/AppContext';

const actionCodeSettings : ActionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: `${import.meta.env.VITE_FRONT_END_URL as string}?meow=meow`,
    // This must be true.
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.example.ios'
    },
    android: {
      packageName: 'com.example.android',
      installApp: true,
      minimumVersion: '12'
    },//instagram-01-c1cb5.web.app
    dynamicLinkDomain: 'instsd.page.link' //
  };

  
export const ForgetPassword = () => {
  
    const {authState} = useContext(AppContext)
    const [email,setEmail]=useState<string>('')
    const sendLink = useCallback(() => {
      console.log('Here to send the link!',email)
      // sendSignInLinkToEmail(auth, email , actionCodeSettings)
      //     .then(() => {
      //         window.localStorage.setItem('emailForSignIn', email);
      //         console.log("Email has been sent to verify!",email)
      //     })
      //     .catch((error) => {
      //         const errorCode = error.code;
      //         const errorMessage = error.message;
      //         console.log(error)
      //     });
      sendPasswordResetEmail(auth,email,actionCodeSettings)
          .then((onfulfilled)=>{
              console.log("Send Email Verifcation",onfulfilled,auth.currentUser)
          })
          .catch((error)=>{
              console.error("Send email verification ", error)
          })
    },[authState,email])

  return (
    <div>
        <div className="h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="bg-white border border-gray-300 w-80 py-8 flex items-center flex-col mb-3">
                <img src="/Instagram-Logo.svg" className="w-44 " alt="Instagram" />
                
                <input 
                        className="text-xs w-full mb-2 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                        id="email" name='email' placeholder="Email" type="text"
                        value={email}
                        onChange={(event)=>{setEmail(event.target.value)}}/>

                <div className='p-3'>
                    An email has been send for changing the password. Please verify the email before procedding further
                    <input className='px-3 py-1' type={'number'} />
                </div>
                
                <div className='flex justify-between'>
                    <button 
                        onClick={(event)=>{event.preventDefault(); signOut(auth)}}
                        className="bg-white border border-gray-300 text-center w-auto py-4"
                        >SignOut</button>
                    <button
                        onClick={(event)=>{event.preventDefault(); sendLink()}}
                        className="bg-white border border-gray-300 text-center w-auto py-4"
                    >Send Email</button>
                </div>
            </div>
        </div>
    </div>
  )
}
