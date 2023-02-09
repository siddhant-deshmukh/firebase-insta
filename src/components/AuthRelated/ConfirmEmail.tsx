import React, { useCallback, useContext, useEffect } from 'react'
import { sendSignInLinkToEmail, signOut, sendEmailVerification, User, ActionCodeSettings, applyActionCode } from 'firebase/auth'
import { auth } from '../../firebase'
import AppContext from '../../context/AppContext';

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

const ConfirmEmail = () => {

  const {authState} = useContext(AppContext)

  const sendLink = useCallback(() => {
    console.log('Here to send the link!',authState?.user?.email)

    sendEmailVerification(auth.currentUser as User,actionCodeSettings)
        .then((onfulfilled)=>{
            console.log("Send Email Verifcation",onfulfilled,auth.currentUser)
        })
        .catch((error)=>{
            console.error("Send email verification ", error)
        })
  },[authState])
  useEffect(()=>{
    sendLink()
  },[sendLink])
  
  return (
    <div>
        <div className="h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="bg-white border border-gray-300 w-fit px-8 flex items-center flex-col mb-3">
                <img src="/Instagram-Logo.svg" className="w-44" alt="Instagram" />
                <div className="flex p-4 mb-4 w-fit text-sm text-gray-800 rounded-lg dark:bg-gray-800 dark:text-blue-400" role="alert">
                  <div>
                    <ul className="w-fit ml-1 list-disc list-inside">
                      <li>An email has been send for verification.</li>
                      <li>Please check spam folder for email</li>
                      <br></br>
                      <li>I am Siddhant SD and you can trust me!!!</li>
                      <li>So, in case of danger site alert go to details and slecect continue with unsafe site</li>
                    </ul>
                  </div>
                </div>

                <div className='flex justify-between w-full px-10 py-5'>
                    <button 
                        onClick={(event)=>{event.preventDefault(); signOut(auth)}}
                        className="border border-gray-300 rounded-lg bg-red-500 text-white text-center w-24 px-2"
                        >SignOut</button>
                    <button
                        onClick={(event)=>{event.preventDefault(); sendLink()}}
                        className="border border-gray-300 rounded-lg bg-blue-500 text-white text-center w-24 px-2"
                    >Resend Email</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ConfirmEmail