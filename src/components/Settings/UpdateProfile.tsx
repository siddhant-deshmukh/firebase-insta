import React, { useContext, useState } from 'react'
import AppContext from '../../context/AppContext'
import { IUser, IUserOwn } from '../../types'
import imageCompression from 'browser-image-compression'
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { db, storage } from '../../firebase'
import { ref, uploadBytes } from 'firebase/storage'
import { getAvatarUrl } from '../../utils/user_related_functions'

interface EditUserErrors{
  name?:string,
  username?:string,
  about?:string,
  email?:string,
  avatar?:string,
  info?:string
}
interface onSucess{
  info?:string,
  avatar?:string,
}
const UpdateProfile = () => {

  const { authState, setAuthState } = useContext(AppContext)
  const [uploadFormData, setUploadFormData] = useState<IUserOwn>({ ...authState.user } as IUserOwn)
  const [avatar, setAvatar] = useState<string | undefined>(authState.user?.avatarUrl)
  const [toggleChangeAvatarModal, setChangeAvatarModal] = useState<boolean>(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [errors,setErros] = useState<EditUserErrors>({})

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let fieldName = event.target.name
    let value = (event.target.value as string)
    setUploadFormData((prev) => {
      return {
        ...prev,
        [fieldName]: value 
      }
    })
    if(fieldName === 'name'){
      if(typeof value === 'string' && value.length < 15 ){
        setErros((prev)=>{return {...prev,name:undefined}})
      }else{
        setErros((prev)=>{return {...prev,name:'length of name should be less than 15'}})
      }
    }else if(fieldName === 'username'){
      if(typeof value === 'string' && value.length < 10 && value.indexOf(' ')===-1){
        setErros((prev)=>{return {...prev,username:undefined}})
      }else{
        setErros((prev)=>{return {...prev,username:'length of username should be less than 10 and should not contain space'}})
      }
    }else if(fieldName === 'about'){
      if(typeof value === 'string' && value.length < 50 ){
        setErros((prev)=>{return {...prev,about:undefined}})
      }else{
        setErros((prev)=>{return {...prev,about:'length of name should be less than 50'}})
      }
    }
  }
  const handleUpdatingAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0]
    const fileCompressionOptions = {
      maxSizeMB: 0.8
    }
    if(file.size > 2*1024*1024){
      setErros((prev)=>{return {...prev,avatar:'File size should not be more than 2MB'}})
    }else{
      setErros((prev)=>{return {...prev,avatar:undefined}})
    }
    console.log("initial file", file)
    imageCompression(file, fileCompressionOptions).then((cFile) => {
      setAvatarFile(cFile)
      setAvatar(URL.createObjectURL(cFile))
    })
  }
  const handleSubmitChanges = async (finalData : IUserOwn) => {
    const checkUserNameQuery = query(collection(db,'users'),where('username','==',finalData.username))
    const docs_ = await getDocs(checkUserNameQuery)
    if(docs_.docs.length > 1){
      setErros((prev)=>{return {...prev,username:'Already exist! Try another!'}})
      return;
    }
    console.log(`users/${authState.user?.uid}`,({
      name : finalData.name,
      about : finalData.about,
      username : finalData.username,
    }))
    updateDoc(doc(db,`users/${authState.user?.uid}`),{
      name : finalData.name,
      about : finalData.about,
      username : finalData.username,
    }).then((value)=>{
      if(setAuthState){
        setAuthState((prev)=>{
          let user = prev.user as IUserOwn
          return {...prev,user: {...user,name : finalData.name, about : finalData.about, username : finalData.username }}
        })
      }
      console.log("Sucessfullly made the changes!",value)
    }).catch(err=>{
      console.log("Some error has occured!",err)
    })
  }
  const handleUploadAvatar =  (avatarFile: File | null) => {
    if (!avatarFile) return;
    let currRef = ref(storage, `users/${authState.user?.uid}/avatar`);
    uploadBytes(currRef, avatarFile).then((snapshot) => {
      console.log("Uploaded file ", `users/${authState.user?.uid}/avatar`, snapshot)
      getAvatarUrl(authState.user?.uid as string).then((url)=>{
        if(url && setAuthState){
          setAuthState((prev)=>{
            let user = prev.user as IUserOwn
            return {...prev,user:{...user,avatarUrl:url as string}}
          })
        }else{
          console.error('Some error ocuured to get the url')
        }
      }).catch((err)=>{ 
        console.error('Some error ocuured to get the url' , err)
      })
    }).catch((err) => {
      console.log("Error to upload", `users/${authState.user?.uid}/avatar`, err)
    });
  }
  return (
    <div className='mt-24 relative border border-gray-400 p-6 mx-auto' style={{ maxWidth: '800px' }}>
      <form className='w-full h-fit flex flex-col space-y-4'>
        <div className='w-full flex py-5 h-fit space-x-8 justify-between items-center '>
          <div className='text-right  w-3/12 font-semibold text-sm flex place-content-end'>
            <img src={avatar || '/abstract-user.svg'} className="rounded-full w-12" />
          </div>
          <div className='w-9/12'>
            {/* <label htmlFor="small-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Small input</label> */}
            <div className='font-normal text-lg'>{authState.user?.username}</div>
            <button
              className='text-sm text-blue-600 font-semibold'
              onClick={(event) => { event.preventDefault(); setChangeAvatarModal(true) }}
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
              onChange={handleOnChange} />
            {errors.name && <p className="mt-2 text-xs text-red-600 dark:text-red-500">{errors.name}</p>}
          </div>
        </div>
        <div className='w-full flex space-x-8 justify-between items-center'>
          <span className='text-right w-3/12 font-semibold text-sm'>
            Username
          </span>
          <div className='w-9/12'>
            {/* <label htmlFor="small-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Small input</label> */}
            <input type="text" onChange={handleOnChange} value={uploadFormData.username} name="username" id="small-input" className="block w-96 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            {errors.username && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.username}</p>}
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
              // @ts-ignore
              onChange={handleOnChange}
              name="about" id="small-input" className="block max-h-12 w-96 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            {errors.about && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.about}</p>}
          </div>
        </div>
        <div className='w-full flex space-x-8 justify-between items-center'>
          <span className='text-right w-3/12 font-semibold text-sm'>
            Email
          </span>
          <div className='w-9/12'>
            {/* <label htmlFor="small-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Small input</label> */}
            <input type="text" disabled value={uploadFormData.email} onChange={handleOnChange} name="email" id="small-input" className="block w-96 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
          </div>
        </div>
        <button 
          className='p-2 text-white rounded-lg bg-blue-600 hover:bg-blue-300 w-fit ml-auto mr-5'
          onClick={(event)=>{event.preventDefault(); handleSubmitChanges(uploadFormData)}}>
          Submit
        </button>
      </form>
      {
        toggleChangeAvatarModal &&
        <div
          className='fixed top-0 left-0 w-screen flex items-center h-screen bg-black bg-opacity-30'
          >
          <div className='bg-white mx-auto  w-auto h-fit rounded-xl'>
            <div className='place-content-end w-full flex'>
              <button className='w-fit p-2 h-fit hover:bg-slate-200'
                onClick={(event) => { event.preventDefault(); setChangeAvatarModal(false) }}>X</button>
            </div>
            <div className='h-fit p-5'>
              <img src={avatar || '/abstract-user.svg'} className='object-fill mx-auto w-32 h-32 rounded-full' />
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Upload file</label>
              <input
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="file_input_help"
                id="file_input" type="file"
                onChange={handleUpdatingAvatar}
              ></input>
              {errors.avatar && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.avatar}</p>}

              <div className='flex place-content-end mt-10 items-center w-full'>
                <button
                  className='w-fit p-2 text-white bg-red-600 hover:bg-red-400 rounded-xl'
                > Cancel</button>
                <button
                  className='w-fit p-2 text-white bg-blue-600 hover:bg-blue-400 ml-3 rounded-xl'
                  onClick={(event) => { event.preventDefault(); handleUploadAvatar(avatarFile); }}
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