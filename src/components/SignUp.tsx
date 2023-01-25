import React from 'react'
import { GoogleAuthProvider,signInWithRedirect } from 'firebase/auth'
import { auth } from '../firebase';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const provider = new GoogleAuthProvider();
  
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
                        id="email" placeholder="Email" type="text"/>
                    <input 
                        className="text-xs w-full mb-4 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                        id="fullname" placeholder="Full Name" type="text"/>
                    <input 
                        className="text-xs w-full mb-4 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                        id="username" placeholder="User Name" type="text"/>
                    <input 
                        className="text-xs w-full mb-4 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                        id="password" placeholder="Password" type="password"/>
                    <a className=" text-sm text-center bg-blue-300 text-white py-1 rounded font-medium">
                        Sign up
                    </a>
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