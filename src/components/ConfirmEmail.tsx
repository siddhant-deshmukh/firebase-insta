import React, { useCallback, useContext, useEffect } from 'react'
import { sendSignInLinkToEmail, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import AppContext from '../context/AppContext';

const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: import.meta.env.VITE_FRONT_END_URL as string,
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

const ConfirmEmail = () => {

  const {authState} = useContext(AppContext)
  
  const sendLink = useCallback(() => {
    console.log('Here to send the link!',authState?.user?.email)

    if(!authState?.user?.email) return 
    const email = authState?.user?.email as string
    sendSignInLinkToEmail(auth, email , actionCodeSettings)
        .then(() => {
            window.localStorage.setItem('emailForSignIn', email);
            console.log("Email has been sent to verify!",email)
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error)
        });
  },[authState])
  useEffect(()=>{
    sendLink()
  },[sendLink])
  
  return (
    <div>
        <div className="h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="bg-white border border-gray-300 w-80 py-8 flex items-center flex-col mb-3">
                <img src="/Instagram-Logo.svg" className="w-44 " alt="Instagram" />

                An email has been send for verification of your email. Please verify the email before procedding further
                <div className='flex justify-between'>
                    <button 
                        onClick={(event)=>{event.preventDefault(); signOut(auth)}}
                        className="bg-white border border-gray-300 text-center w-auto py-4"
                        >SignOut</button>
                    <button
                        onClick={(event)=>{event.preventDefault(); sendLink()}}
                        className="bg-white border border-gray-300 text-center w-auto py-4"
                    >Resend Link</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ConfirmEmail