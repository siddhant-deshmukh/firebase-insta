import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import AppContext from '../../context/AppContext';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'


const Modal = () => {

  let [searchParams, setSearchParams] = useSearchParams();
  const [mediaFiles,setMediaFile] = useState<any[]>([]);
  const [mediaUrls,setMediaUrls] = useState<string[]>([]);
  const [currentIndex,setCurrentIndex] = useState(0);
  const [descPost,setDescPost] = useState("");
  const { authState } = useContext(AppContext)
  const dropRef = useRef(null)
  const closeModal = useCallback(()=>{
    setSearchParams((prev)=>{
        // let temp_ = prev;
        prev.delete('modalOn')
        prev.delete('likedby')
        prev.delete('postId')
        return prev
    })
  },[setSearchParams])

  const uploadPost = useCallback(async ()=>{
    const uDoc =  await addDoc(collection(db,'posts'),{
        authorId: authState.user?.uid,
        createdAt: new Date(),
        numMedia: mediaFiles.length, 
        desc:descPost 
    })
    const postId = uDoc.id
    console.log("Upload post",postId,uDoc)

    mediaFiles.forEach(async(media,index)=>{
        let currRef = ref(storage,`posts/${postId}_${index}`);
        uploadBytes(currRef,media).then((snapshot)=>{
            console.log("Uploaded file ", `posts/${postId}_${index}`)
        }).catch((err)=>{
            console.log("Error to upload",`posts/${postId}_${index}`,err)
        });
    })

  },[mediaFiles,descPost])

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const {files} = e.dataTransfer;

    if (files && files.length) {
        console.log(files);
        setMediaFile((prev : any[] )=>{
            const latest = [...prev,...files];
            latest.slice(0,5)
            return latest
        })
    }
  };
  useEffect(()=>{
    const urls = mediaFiles.map((file)=>{
        return URL.createObjectURL(file)
    })
    setMediaUrls(urls)
    return(()=>{
        mediaFiles.forEach((file)=>{
            URL.revokeObjectURL(file)
        })
    })
  },[mediaFiles,setMediaUrls])
  useEffect(()=>{
    if(dropRef.current){
        //@ts-ignore
        dropRef.current.addEventListener('dragover', handleDragOver); dropRef.current.addEventListener('drop', handleDrop);
    }
    return () => {
        if(dropRef.current){
            //@ts-ignore
            dropRef.current.removeEventListener('dragover', handleDragOver); dropRef.current.removeEventListener('drop', handleDrop);
        }
      };
  },[])

  return (
    <div>
        <div className={`modal ${(searchParams.get('modalOn')==='Yes')?"":"hidden"} overflow-x-hidden h-screen fade fixed  flex items-center top-0 left-0  w-full outline-none bg-black bg-opacity-40  overflow-y-auto`}
        id="exampleModalScrollable" tabIndex={-1} py-20 aria-labelledby="exampleModalScrollableLabel" aria-hidden="true">
        <div className="modal-dialog  modal-dialog-scrollable flex flex-col max-h-screen  relative mx-auto w-fit    pointer-events-none">
            <div
            className="modal-content mx-auto border-none rounded-xl max-w-4xl  max-h-full h-full p-0.5 shadow-lg  relative  flex flex-col w-fit pointer-events-auto bg-white bg-clip-padding  outline-none text-current"
            style={{height:'700px'}}
            >
                    <div
                      className="modal-header flex bg-white  w-full flex-shrink-0 items-center justify-between p-4 border-b border-gray-200 rounded-t-md">
                        <h5 className="text-xl  font-medium leading-normal text-gray-800" id="exampleModalScrollableLabel">
                            Upload Post
                        </h5>
                        <button type="button"
                        className="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
                        data-bs-dismiss="modal" aria-label="Close"
                        onClick={(event)=>{event.preventDefault(); closeModal() }}>
                            X
                        </button>
                    </div>
                    <div className="modal-body relative p-0.5 overflow-y-auto h-full w-fit">
                        {/* <p>This is some placeholder content to show the scrolling behavior for modals. We use repeated line breaks to demonstrate how content can exceed minimum inner height, thereby showing inner scrolling. When content becomes longer than the predefined max-height of modal, content will be cropped and scrollable within the modal.</p>
                        <p>This content should appear at the bottom after you scroll.</p>
                        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/> */}
                         { (!mediaFiles || mediaFiles.length === 0) && <div
                            ref={dropRef} 
                            className="h-full"
                            style={{width:'600px'}}>
                            <label
                                className="flex justify-center w-full h-full px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                                <span className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="font-medium text-gray-600">
                                        Drop files to Attach, or
                                        <span className="text-blue-600 underline">browse</span>
                                    </span>
                                </span>
                                <input type="file" name="file_upload" className="hidden"/>
                            </label>
                        </div>}
                        {
                            (mediaFiles && mediaFiles.length>0) && <div
                            className='relative flex  w-auto h-full'
                            >   
                                <div className="h-full w-auto">
                                    <img src={mediaUrls[currentIndex]} className='w-fit ' />
                                    <button 
                                        className='absolute inset-y-1/2 h-fit left-0  px-2 w-fit rounded-full bg-white opacity-40'
                                        onClick={(event)=>{event.preventDefault(); setCurrentIndex((prev)=>prev-1)}}
                                        disabled={(currentIndex<1)?true:false}
                                        >  
                                        {'<'}
                                    </button>
                                    <button 
                                        className='absolute inset-y-1/2 h-fit right-0 px-2 w-fit rounded-full bg-white opacity-40'
                                        onClick={(event)=>{event.preventDefault(); setCurrentIndex((prev)=>prev+1)}}
                                        disabled={(currentIndex>mediaFiles.length-2)?true:false}
                                        >  
                                        {'>'}
                                    </button>
                                </div>
                                <div className='h-full w-max bg-slate-50' >
                                    <textarea 
                                        placeholder='write some about this  post'
                                        className='border w-full border-gray-300'
                                        value={descPost}
                                        onChange={(event)=>{event.preventDefault(); setDescPost(event.target.value)}}>
                                    </textarea>
                                </div>
                            </div>
                        }
                    </div>
                    <div
                        className="modal-footer flex flex-shrink-0 flex-wrap items-center justify-end p-4 border-t border-gray-200 rounded-b-md">
                        <button type="button"
                        className="inline-block px-6 py-2.5 bg-purple-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-purple-700 hover:shadow-lg focus:bg-purple-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-purple-800 active:shadow-lg transition duration-150 ease-in-out"
                        data-bs-dismiss="modal"
                        onClick={(event)=>{event.preventDefault(); closeModal()}}>
                        Cancel
                        </button>
                        <button type="button"
                        className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out ml-1"
                        onClick={(event)=>{event.preventDefault(); uploadPost()}}
                        >
                        Upload Post
                        </button>
                    
                    </div>

                
            
            </div>
        </div>
        </div>
    </div>
  )
}

export default Modal