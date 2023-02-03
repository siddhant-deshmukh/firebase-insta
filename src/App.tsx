import { useContext, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ConfirmEmail from './components/AuthRelated/ConfirmEmail'
import { ForgetPassword } from './components/AuthRelated/ForgetPassword'
import Login from './components/AuthRelated/Login'
import NavBar from './components/NavBar'
import SignUp from './components/AuthRelated/SignUp'
import AppContext, { IAuthContext } from './context/AppContext'
import Authenticate from './routes/Authenticate'
import Home from './routes/Home'
import Post from './routes/Post'
import UserPage from './routes/UserPage'
import UploadFile from './components/modal/UploadFile'
import LikedBy  from './components/modal/LikedBy'
import PostDisplay from './components/modal/PostDisplay'
import { ReactQueryDevtools } from 'react-query/devtools'

function App() {
  const {authState,authLoading} = useContext<IAuthContext>(AppContext)
  let [searchParams, setSearchParams] = useSearchParams();
  
  useEffect(()=>{
    searchParams.forEach((value,key,parent)=>{
      console.log(value,key,parent)
    })
    console.log(searchParams.get('modalOn'));
    console.log(searchParams.has('likedby'))
  },[searchParams])
  // remove the partial if want only email verified alloed and add following condition
  /**
   else if(authState.authenticated === 'Partial'){
      return(
        <div>
          <ConfirmEmail />
        </div>
      )
    } 
   */
  if(authLoading ==='Yes' || authLoading==='initial' || authState.authenticated === 'Partial'){
    return(<div className='w-screen relative h-screen '>
      <div className='mx-auto absolute inset-1/3 w-fit h-fit'>
        <img src='/insta-logo.svg' alt='loading' className='w-52'/>
      </div>
    </div>)
  } else {
    if(authState && authState.authenticated ==='Yes'){
      return (
        <div className={`App flex h-screen w-screen ${(searchParams.get('createPostModal') || searchParams.get('likedByModal') || searchParams.get('showPostModal'))?"overflow-y-hidden":"overflow-y-auto"}`}>
          <aside className="w-64 fixed hidden lg:block" aria-label="Sidebar">
            <NavBar />
          </aside>
          
          <div className={`w-auto mx-auto`}>
            <Routes>
              <Route index element={<Home/>}/> 
              <Route path="/p/:postId" element={<Post/>}/> 
              <Route path="/u/:userId" element={<UserPage/>}/> 
              <Route path="*" element={<Home/>}/> 
            </Routes>
          </div>

          {
            searchParams.get('createPostModal') && 
            <UploadFile />
          }
          {
            searchParams.get('likedByModal') &&
            <LikedBy />
          }
          {
            searchParams.get('showPostModal')  &&
            <PostDisplay />
          }
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      )
    }else{
      return(
        <div>
          <Routes>
            <Route path='/login' element={<Login/>}/>
            <Route path='/signup'  element={<SignUp/>} />
            <Route path='/emailCheck'  element={<ConfirmEmail/>} />
            <Route path='/forgetpassword'  element={<ForgetPassword/>} />
            <Route path="*" element={<Authenticate/>}/> 
          </Routes>
        </div>
      )
    }
  }
}

export default App
