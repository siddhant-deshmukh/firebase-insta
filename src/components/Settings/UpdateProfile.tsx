import React, { useContext, useState } from 'react'
import AppContext from '../../context/AppContext'
import { IUser } from '../../types'
import imageCompression from 'browser-image-compression'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'

const UpdateProfile = () => {

  const { authState } = useContext(AppContext)
  const [uploadFormData,setUploadFormData] = useState<IUser>({...authState.user} as IUser )
  const [avatar,setAvatar] = useState<string>()
  const [toggleChangeAvatarModal,setChangeAvatarModal] = useState<boolean>(false)
  const handleOnChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    setUploadFormData((prev)=>{
        return {
            ...prev,
            [event.target.name] : [event.target.value]
        }
    })
  }
  const handleUpdatingAvatar = (event : React.ChangeEvent<HTMLInputElement>) =>{
    if(!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0]
    const fileCompressionOptions = {
        maxSizeMB : 0.6
    }
    console.log("initial file",file)
    imageCompression(file,fileCompressionOptions).then((cFile)=>{
        console.log("COmpressed",cFile)
        let reader = new FileReader()
        reader.onload = function () {
            if(!reader.result) return
            let base64String = reader.result as string
                // .replace("data:", "")
                // .replace(/^.+,/, "");
     
            //console.log("Base64 :", reader.result);
            //const byteSize = str => new Blob([str]).size;
            console.log("Base 64 length",base64String.length)
            //const url = URL.createObjectURL(`data:image/jpg;base64,${reader.result}`)
            setAvatar(base64String)
        }
        reader.readAsDataURL(cFile);
        setChangeAvatarModal(true)
    })
  }
  const handleUploadAvatar = (avatar:string) => {
    const userRef = doc(db,'users',authState.user?.uid as string)
    console.log(avatar.length , authState.user?.uid)
    updateDoc(userRef,{
        avatar 
    }).then(()=>{
        console.log("avatar updated!")
        setChangeAvatarModal(false);
    }).catch((err)=>{
        console.log(err)
    })
  }
  return (
    <div className='mt-24 relative border border-gray-400 p-6 w-full' style={{maxWidth:'800px'}}>
        <form className='w-full h-fit flex flex-col space-y-4'>
            <div className='w-full flex py-5 h-fit space-x-8 justify-between items-center '>
                <div className='text-right w-3/12 font-semibold text-sm flex place-content-end'>
                    <img src={authState.user?.avatar || avatar || '/abstract-user.svg'} className="rounded-full w-12"/>
                </div>
                <div className='w-9/12' htmlFor='change-user-profile'>
                    {/* <label htmlFor="small-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Small input</label> */}
                    <div className='font-normal text-lg'>{authState.user?.username}</div>
                    <button 
                        className='text-sm text-blue-600 font-semibold'
                        onClick={(event)=>{event.preventDefault(); setChangeAvatarModal(true)}}
                        >Change Profile Photo</button>
                </div>

            </div>
            <div className='w-full flex space-x-8 justify-between items-center'>
                <span className='text-right w-3/12 font-semibold text-sm'>
                    Name
                </span>
                <div className='w-9/12'>
                    {/* <label htmlFor="small-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Small input</label> */}
                    <input type="text" 
                        value={uploadFormData.name} 
                        name="name" id="small-input" 
                        className="block w-96 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={handleOnChange}/>
                </div>
            </div>
            <div className='w-full flex space-x-8 justify-between items-center'>
                <span className='text-right w-3/12 font-semibold text-sm'>
                    Username
                </span>
                <div className='w-9/12'>
                    {/* <label htmlFor="small-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Small input</label> */}
                    <input type="text" onChange={handleOnChange} value={uploadFormData.username} name="username" id="small-input" className="block w-96 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                </div>
            </div>
            <div className='w-full flex space-x-8 justify-between items-center'>
                <span className='text-right w-3/12 font-semibold text-sm'>
                    Bio
                </span>
                <div className='w-9/12'>
                    {/* <label htmlFor="small-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Small input</label> */}
                    <textarea 
                        value={uploadFormData.about} 
                        onChange={(event)=>{event.preventDefault(); setUploadFormData((prev)=>{return{...prev,about:event.target.value}})}} 
                        name="about" id="small-input" className="block max-h-12 w-96 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                </div>
            </div>
            <div className='w-full flex space-x-8 justify-between items-center'>
                <span className='text-right w-3/12 font-semibold text-sm'>
                    Email
                </span>
                <div className='w-9/12'>
                    {/* <label htmlFor="small-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Small input</label> */}
                    <input type="text" value={uploadFormData.email} onChange={handleOnChange} name="email" id="small-input" className="block w-96 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                </div>
            </div>

        </form>
        {
            toggleChangeAvatarModal &&
            <div 
                className='fixed top-0 left-0 w-screen flex items-center h-screen bg-black bg-opacity-30' 
                >
                <div className='bg-white mx-auto  w-auto h-fit rounded-xl'>
                    <div className='place-content-end w-full flex'>
                        <button className='w-fit p-2 h-fit hover:bg-slate-200'
                            onClick={(event)=>{event.preventDefault(); setChangeAvatarModal(false)}}>X</button>
                    </div>
                    <div className='h-fit p-5'> 
                        <img src={authState.user?.avatar || avatar || '/abstract-user.svg'} className='object-fill mx-auto w-32 h-32 rounded-full'/>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Upload file</label>
                        <input 
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="file_input_help" 
                            id="file_input" type="file"
                            onChange={handleUpdatingAvatar}
                            ></input>
                        
                        <div className='flex place-content-end mt-10 items-center w-full'>
                            <button 
                                className='w-fit p-2 text-white bg-red-600 hover:bg-red-400 rounded-xl'
                                > Cancel</button>
                            <button 
                                className='w-fit p-2 text-white bg-blue-600 hover:bg-blue-400 ml-3 rounded-xl'
                                onClick={(event)=>{event.preventDefault(); handleUploadAvatar(avatar as string); }}
                                > Upload</button>
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>
  )
}

export default UpdateProfile