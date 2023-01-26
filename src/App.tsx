import { useContext, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import ConfirmEmail from './components/ConfirmEmail'
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
  const appContext = useContext<IAuthContext>(AppContext)
  if(appContext && appContext?.authState.authenticated ==='Yes'){
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
  }else if(appContext && appContext?.authState.authenticated === 'Partial'){
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
          <Route path="*" element={<Authenticate/>}/> 
        </Routes>
      </div>
    )
  }
}

export default App
