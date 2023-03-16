import React, { useCallback, useState } from 'react'
import { GoogleAuthProvider, signInWithRedirect, signInWithEmailAndPassword, GithubAuthProvider } from 'firebase/auth'
import { auth } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';

interface ILoginFormData {
    email: string,
    password: string,
}
const initialLoginFormData = {
    email: '',
    password: '',
}

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const Login = () => {

    const [loginFormData, setFormData] = useState<ILoginFormData>(initialLoginFormData)
    const navigate = useNavigate()
    const logInOperation = useCallback(() => {
        if (!loginFormData || loginFormData.email === '' || loginFormData.password === '') return
        console.log('login')


        signInWithEmailAndPassword(auth, loginFormData.email, loginFormData.password)
            .then((userCredentials) => {
                console.log("New user created sucesfully!", userCredentials)
            })
            .catch((error) => {
                console.log("Create user with email and password error!", error)
            })
    }, [loginFormData, setFormData])
    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setFormData((prev) => {
            // console.log(prev[event.target.name])
            return {
                ...prev,
                [event.target.name]: event.target.value
            }
        })
    }
    return (
        <div>

            <div className="h-screen bg-gray-50 flex flex-col justify-center items-center">
                <div className="bg-white border border-gray-300 w-80 py-8 flex items-center flex-col mb-3">
                    <img src="/Instagram-Logo.svg" className="w-44 " alt="Instagram" />
                    <form className="mt-8 w-64 flex flex-col">
                        <input
                            className="text-xs w-full mb-2 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                            id="email" name="email" placeholder="Phone number, username, or email" type="text"
                            value={loginFormData.email}
                            onChange={handleOnChange}
                        />
                        <input
                            className="text-xs w-full mb-4 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400 active:outline-none"
                            id="password" name="password" placeholder="Password" type="password"
                            value={loginFormData.password}
                            onChange={handleOnChange} />
                        <button
                            className=" text-sm text-center bg-blue-300 text-white py-1 rounded font-medium"
                            onClick={(event) => { event.preventDefault(); logInOperation() }}>
                            Log In
                        </button>
                    </form>
                    <div className="flex justify-evenly space-x-2 w-64 mt-4">
                        <span className="bg-gray-300 h-px flex-grow t-2 relative top-2"></span>
                        <span className="flex-none uppercase text-xs text-gray-400 font-semibold">or</span>
                        <span className="bg-gray-300 h-px flex-grow t-2 relative top-2"></span>
                    </div>
                    <button
                        onClick={(event) => { event.preventDefault(); signInWithRedirect(auth, googleProvider) }}
                        className="group mt-4 mx-auto  flex">
                        <img src="/google-logo.svg" className="h-4 mr-2" alt="Google" />
                        <span className="text-xs text-gray-600 font-semibold group-hover:underline">Continue with Google</span>
                    </button>
                    <button
                        onClick={(event) => { event.preventDefault(); signInWithRedirect(auth, githubProvider) }}
                        className="group mt-2 mx-auto  w-fit flex">
                        <svg height="16" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="mr-1.5">
                            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                        </svg>
                        <span className="text-xs text-gray-600 font-semibold group-hover:underline">Continue with Github</span>
                    </button>
                    <Link to={'/forgetpassword'} className="text-xs text-blue-900 mt-4 cursor-pointer -mb-4">Forgot password?</Link>
                </div>
                <div className="bg-white border border-gray-300 text-center w-80 py-4">
                    <span className="text-sm">Don't have an account?</span>
                    <Link to='/signup' className="text-blue-500 text-sm font-semibold">Sign up</Link>
                </div>

            </div>

        </div>
    )
}

export default Login