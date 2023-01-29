import React, { useCallback, useContext, useState } from 'react'
import { GoogleAuthProvider,signInWithRedirect,createUserWithEmailAndPassword,updateProfile } from 'firebase/auth'
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import AppContext from '../context/AppContext';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

interface ISignUpFormData {
    fullname:string,
    username:string
}
const initialSignUpFormData = {
    fullname:'',
    username:''
}

const CompleteDetails =  () => {
  const provider = new GoogleAuthProvider();
  const [signUpFormData,setFormData] = useState<ISignUpFormData>(initialSignUpFormData)
  const {authState} = useContext(AppContext)

  const signUpOperation = useCallback(async () => {
    if(!signUpFormData || signUpFormData.username==='' || signUpFormData.fullname==='') return
    console.log('Signup')
    
    const q = query(collection(db,'users'),where('username','==',signUpFormData.username))
    const querySnapShot = await getDocs(q)
    let any=false;
    querySnapShot.forEach((doc)=>{
        if(doc.id) any=true;
    })
    if(any){
        console.log("Username already exists! Try another username")
        return;
    } 
    const userDocRef = doc(db,`users/${authState.user?.uid}`) 
    updateDoc(userDocRef,{
        username:signUpFormData.username,
        name:signUpFormData.fullname,
        authComplete:true,
    }).then(()=>{

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
                        className="text-xs w-full mb-4 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                        id="fullname" name='fullname' placeholder="Full Name" type="text"
                        value={signUpFormData.fullname}
                        onChange={handleOnChange}/>
                    <input 
                        className="text-xs w-full mb-4 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                        id="username" name="username" placeholder="User Name" type="text"
                        value={signUpFormData.username}
                        onChange={handleOnChange}/>
                    <button 
                        className=" text-sm text-center bg-blue-500 text-white py-1 rounded font-medium"
                        onClick={(event)=>{event.preventDefault(); signUpOperation()}}>
                        Add Info
                    </button>
                </form>
            </div>
            <div className="bg-white border border-gray-300 text-center w-80 py-4">
                <span className="text-sm">Want to use another account</span>
                <button className="text-blue-500 text-sm font-semibold">Sign Out</button>
            </div>
            
        </div>
    </div>
  )
}

export default CompleteDetails