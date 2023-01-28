import React, { useCallback, useState } from 'react'
import { GoogleAuthProvider,signInWithRedirect,createUserWithEmailAndPassword,updateProfile } from 'firebase/auth'
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';

interface ISignUpFormData {
    fullname:string,
    email:string,
    password:string,
    username:string
}
const initialSignUpFormData = {
    fullname:'',
    email:'',
    password:'',
    username:''
}
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
    },
    dynamicLinkDomain: 'example.page.link'
  };
const SignUp = () => {
  const provider = new GoogleAuthProvider();
  const [signUpFormData,setFormData] = useState<ISignUpFormData>(initialSignUpFormData)
  const navigate = useNavigate()
  const signUpOperation = useCallback(() => {
    if(!signUpFormData || signUpFormData.email==='' || signUpFormData.password==='') return
    console.log('Signup')
    
    createUserWithEmailAndPassword(auth,signUpFormData.email,signUpFormData.password)
        .then((userCredentials)=>{

            console.log("New user created sucesfully!",userCredentials)
        })
        .catch((error)=>{
            console.log("Create user with email and password error!",error)
        })
  },[signUpFormData,setFormData])
  const handleOnChange = (event) => {
    event.preventDefault();
    setFormData((prev)=>{
        // console.log(prev[event.target.name])
        return {
            ...prev,
            [event.target.name]:event.target.value
        }
    })
  }
  return (
    <div>
        <div className="h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="bg-white border border-gray-300 w-80 py-8 flex items-center flex-col mb-3">
                <img src="/Instagram-Logo.svg" className="w-44 " alt="Instagram" />
                <button 
                    onClick={(event)=>{event.preventDefault(); signInWithRedirect(auth,provider)}}
                    className="group mt-8 w-64  text-xs   mb-2 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none">
                    <div className='w-fit h-fit mx-auto flex'>
                        <img src="/google-logo.svg" className="h-4 mr-2" alt="Instagram" />
                        Continue with Google
                    </div>
                </button>
                <div className="flex justify-evenly space-x-2 w-64 mt-4">
                    <span className="bg-gray-300 h-px flex-grow t-2 relative top-2"></span>
                    <span className="flex-none uppercase text-xs text-gray-400 font-semibold">or</span>
                    <span className="bg-gray-300 h-px flex-grow t-2 relative top-2"></span>
                </div>
                <form className="mt-8 w-64 flex flex-col">
                    <input 
                        className="text-xs w-full mb-2 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                        id="email" name='email' placeholder="Email" type="text"
                        value={signUpFormData.email}
                        onChange={handleOnChange}/>
                    <input 
                        className="text-xs w-full mb-4 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                        id="fullname" name='fullname' placeholder="Full Name" type="text"
                        value={signUpFormData.fullname}
                        onChange={handleOnChange}/>
                    <input 
                        className="text-xs w-full mb-4 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                        id="username" name="username" placeholder="User Name" type="text"
                        value={signUpFormData.username}
                        onChange={handleOnChange}/>
                    <input 
                        className="text-xs w-full mb-4 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                        id="password" name="password" placeholder="Password" type="password"
                        value={signUpFormData.password}
                        onChange={handleOnChange}/>
                    <button 
                        className=" text-sm text-center bg-blue-500 text-white py-1 rounded font-medium"
                        onClick={(event)=>{event.preventDefault(); signUpOperation()}}>
                        Sign up
                    </button>
                </form>
            </div>
            <div className="bg-white border border-gray-300 text-center w-80 py-4">
                <span className="text-sm">Don't have an account?</span>
                <Link to='/login' className="text-blue-500 text-sm font-semibold">Login in</Link>
            </div>
            
        </div>
    </div>
  )
}

export default SignUp