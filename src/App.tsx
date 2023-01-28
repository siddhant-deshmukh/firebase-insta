import { useContext, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import ConfirmEmail from './components/ConfirmEmail'
import { ForgetPassword } from './components/ForgetPassword'
import Login from './components/Login'
import NavBar from './components/NavBar'
import SignUp from './components/SignUp'
import AppContext, { IAuthContext } from './context/AppContext'
import Authenticate from './routes/Authenticate'
import Home from './routes/Home'
import Post from './routes/Post'
import UserPage from './routes/UserPage'

function App() {
  const [count, setCount] = useState(0)
  const {authState,authLoading} = useContext<IAuthContext>(AppContext)
  if(authLoading ==='Yes' || authLoading==='initial'){
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
        </div>
      )
    }else if(authState.authenticated === 'Partial'){
      return(
        <div>
          <ConfirmEmail />
        </div>
      )
    } else{
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
