import { useContext, useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ConfirmEmail from './components/AuthRelated/ConfirmEmail'
import { ForgetPassword } from './components/AuthRelated/ForgetPassword'
import Login from './components/AuthRelated/Login'
import NavBar from './components/NavBar/SideNavBar'
import SignUp from './components/AuthRelated/SignUp'
import AppContext, { IAuthContext } from './context/AppContext'
import Authenticate from './routes/Authenticate'
import Home from './routes/Home'
import Post from './routes/Post'
import UserPage from './routes/UserPage'
import UploadFile from './components/modal/UploadFile'
import LikedBy from './components/modal/LikedBy'
import PostDisplay from './components/modal/PostDisplay'
import UpdateProfile from './components/Settings/UpdateProfile'
import { ReactQueryDevtools } from 'react-query/devtools'
import UpperNavbar from './components/NavBar/UpperNavbar'
import BottomNavbar from './components/NavBar/BottomNavbar'

function App() {
  const { authState, authLoading } = useContext<IAuthContext>(AppContext)
  let [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation()
  useEffect(() => {
    searchParams.forEach((value, key, parent) => {
      console.log(value, key, parent)
    })
    console.log(searchParams.get('modalOn'));
    console.log(searchParams.has('likedby'))
  }, [searchParams])

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/home' || authState.authenticated === 'No') {
      document.title = 'Instagram'
    } else {
      document.title = authState.user?.name || 'Instagram'
    }
  }, [location, authState])

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
  if (authLoading === 'Yes' || authLoading === 'initial') {
    return (<div className='w-screen relative h-screen '>
      <div className='mx-auto absolute inset-1/3 w-fit h-fit'>
        <img src='/insta-logo.svg' alt='loading' className='w-52 mx-auto' />
        <div className=" w-fit mx-auto">
          <div className="bg-clip-text text-2xl font-extrabold w-fit mb-10 mx-auto text-transparent bg-gradient-to-r from-red-500 to-yellow-300">
            Loading ...
          </div>
          <div className='font-medium text-lg'>
            <span>Created by</span> <br/>
            <span>Siddhant Deshmukh</span>
          </div>
        </div>
      </div>
    </div>)
  } else if (authState.authenticated === 'Partial') {
    return (
      <div>
        <ConfirmEmail />
      </div>
    )
  } else {
    if (authState && authState.authenticated === 'Yes') {
      return (
        <div className={`App flex pt-12 pl-0 sm:pt-0 sm:pl-14 lg:pl-56 xl:pl-0 h-screen w-screen ${(searchParams.get('createPostModal') || searchParams.get('likedByModal') || searchParams.get('showPostModal')) ? "overflow-y-hidden" : "overflow-y-auto"}`}>
          <NavBar />
          <UpperNavbar />

          <div className={` w-screen`}>
            <Routes>
              <Route index element={<Home />} />
              <Route path="/p/:postId" element={<Post />} />
              <Route path="/u/:userId" element={<UserPage />} />
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route path="*" element={<Home />} />
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
            searchParams.get('showPostModal') &&
            <PostDisplay />
          }
          <ReactQueryDevtools initialIsOpen={false} />

          <BottomNavbar />
        </div>
      )
    } else {
      return (
        <div>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/emailCheck' element={<ConfirmEmail />} />
            <Route path='/forgetpassword' element={<ForgetPassword />} />
            <Route path="*" element={<Authenticate />} />
          </Routes>
        </div>
      )
    }
  }
}

export default App
