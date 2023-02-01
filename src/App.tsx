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

function App() {
  const [count, setCount] = useState(0)
  const {authState,authLoading} = useContext<IAuthContext>(AppContext)
  const {modalOn, likedby,viewpost, postId} = useParams()
  const location = useLocation();
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
        <div className="App flex">
          <aside className="w-64" aria-label="Sidebar">
            <NavBar />
          </aside>
          
          <Routes>
            <Route index element={<Home/>}/> 
            <Route path="/p/:postId" element={<Post/>}/> 
            <Route path="/u/:userId" element={<UserPage/>}/> 
            <Route path="*" element={<Home/>}/> 
          </Routes>

          {
            searchParams.get('createPostModal') && 
            <UploadFile />
          }
          {
            searchParams.get('likedByModal') && searchParams.get('postId') &&
            <LikedBy />
          }
          {
            searchParams.get('showPostModal') && searchParams.get('postId') &&
            <PostDisplay />
          }
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
