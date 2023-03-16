import { addDoc, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import AppContext from '../../context/AppContext';
import { db, storage } from '../../firebase';
import { ref, uploadBytes } from 'firebase/storage'
import imageCompression from 'browser-image-compression'
import { InfiniteData, useMutation, useQueryClient } from 'react-query';
import { IPost, IPostStored } from '../../types';


const UploadFile = () => {

  let [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient()

  const [mediaFiles, setMediaFile] = useState<(Blob | null)[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined)
  const [sucessMsg, setSucessMsg] = useState<string | undefined>(undefined)
  const [inProgress, setProgress] = useState<boolean>(false)
  const [pageNum, setPageNum] = useState<1 | 2>(1)


  const [descPost, setDescPost] = useState<string>("");
  const { authState } = useContext(AppContext)

  const closeModal = useCallback(() => {
    setSearchParams((prev) => {
      // let temp_ = prev;
      prev.delete('createPostModal')
      return prev
    })
  }, [setSearchParams])

  const uploadPost = useCallback(async () => {
    try {
      if (authState.user && authState.user?.numPosts && authState.user?.numPosts >= 5) {
        setErrorMsg('Can not upload more than 5 posts')
        return
      }
      setProgress(true)
      console.log("uploading post", mediaFiles)
      const post_: IPostStored = {
        authorId: authState.user?.uid,
        createdAt: Timestamp.fromDate(new Date()),
        numMedia: mediaFiles.length,
        desc: descPost,
        numLikes: 0,
        numComments: 0,
      }
      console.log("Uploading", post_)
      const uDoc = await addDoc(collection(db, 'posts'), post_)
      const postId = uDoc.id

      console.log("---------Upload post-------")
      console.log("---------Upload post-------", postId, uDoc)


      const mediaFiles_ = mediaFiles.slice()
      mediaFiles_.forEach((media, index) => {
        if (!media) return
        let currRef = ref(storage, `posts/${authState.user?.uid}/${postId}/${index}`);
        uploadBytes(currRef, media).then((snapshot) => {
          console.log("Uploaded file ", `posts/${authState.user?.uid}/${postId}/${index}`, snapshot, media, `posts/${authState.user?.uid}/${postId}/${index}`)
        }).catch((err) => {
          console.log("Error to upload", `posts/${authState.user?.uid}/${postId}/${index}`, err, media, `posts/${authState.user?.uid}/${postId}/${index}`)
        });
      })
      // mutation.mutate(postId)
      console.log("Here we go to add postFeed", postId)
      // queryClient.setQueryData(['postFeed'], (oldData : any) => ({
      //   pages: [{data:[postId],nextPage:1,isLast:false}, ...oldData.pages],
      //   pageParams: oldData.pageParams,
      // }))
      // refetch({ refetchPage: (page, index) => index === 0 })
      closeModal()
    } catch (err) {
      setErrorMsg("Some internal error occured!")
    } finally {
      setProgress(false)
    }

  }, [mediaFiles, descPost])

  useEffect(() => {
    let any = true;
    const urls = mediaFiles.map((file) => {
      if (!file) return ''
      if (!file) setErrorMsg('some error occured while getting files')
      if (any) any = file.size < 2 * 1024 * 1024
      return URL.createObjectURL(file)
    })
    if (!any) setErrorMsg('Maximum file size can be of 2MB')
    else setErrorMsg(undefined)

    setMediaUrls(urls)
    return (() => {
      mediaUrls.forEach((file) => {
        URL.revokeObjectURL(file)
      })
    })
  }, [mediaFiles, setMediaUrls])



  return (
    <div>
      <div className={`modal ${(searchParams.get('createPostModal') === 'Yes') ? "" : "hidden"}  overflow-x-hidden h-screen fade fixed  flex items-center top-0 left-0  w-full outline-none bg-black bg-opacity-40  overflow-y-auto`}
        id="exampleModalScrollable" tabIndex={-1} py-20 aria-labelledby="exampleModalScrollableLabel" aria-hidden="true">

        <div className="mx-auto bg-slate-400 ">
          <div
            className="rounded-xl   h-full  shadow-lg w-auto   flex flex-col   bg-white " >
            {/* header */}
            <div
              className="modal-header flex bg-white  w-full flex-shrink-0 items-center justify-between px-4 py-2 border-b border-gray-200 rounded-t-md">
              <h5 className="text-lg font-medium leading-normal text-gray-800" id="exampleModalScrollableLabel">
                Upload Post
              </h5>
              <button type="button"
                className="px-1.5 py-0.5 rounded-full hover:bg-gray-200 text-black border-none "
                onClick={(event) => { event.preventDefault(); closeModal() }}>
                X
              </button>
            </div>

            {
              errorMsg &&
              <div className="flex items-center py-1 px-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                <span className="font-medium w-full">{errorMsg}</span>
                <button
                  onClick={(event) => { event.preventDefault(); setErrorMsg(undefined) }}
                  className='w-fit rounded-full px-1.5 py-0.5 hover:bg-red-300 '>
                  X
                </button>
              </div>
            }
            {
              sucessMsg &&
              <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                <span className="font-medium">{sucessMsg}</span>
                <button
                  onClick={(event) => { event.preventDefault(); setErrorMsg(undefined) }}
                  className='w-fit rounded-full px-1.5 py-0.5 hover:bg-green-300 '>
                  X
                </button>
              </div>
            }
            {
              inProgress &&
              <div className="p-4 mb-4 flex justify-between text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                <span className="font-medium">up loading...</span>
                <button
                  onClick={(event) => { event.preventDefault(); setErrorMsg(undefined) }}
                  className='w-fit rounded-full px-1.5 py-0.5 hover:bg-blue-300 '>
                  X
                </button>
              </div>
            }
            {/* main */}
            <div className="modal-body relative p-0.5 overflow-y-auto h-full w-full">

              {/*  When no media files selected */}
              {
                (!mediaFiles || mediaFiles.length === 0) &&
                <UploadPostSelectFile mediaFiles={mediaFiles} setMediaFile={setMediaFile}  setErrorMsg={setErrorMsg} />
              }

              {
                (mediaFiles && mediaFiles.length > 0) && pageNum === 1 &&
                <PostPreview mediaFiles={mediaFiles} mediaUrls={mediaUrls} setMediaUrls={setMediaUrls} setMediaFile={setMediaFile} />
              }
              {
                (mediaFiles && mediaFiles.length > 0) && pageNum === 2 &&
                <div className='h-72 w-96 px-4 py-4'>
                  <div className=' w-full'>
                    Description
                    <div
                      placeholder='write some about this  post'
                      className='border outline-none bg-white h-20 overflow-y-auto rounded-lg p-2 text-sm font-medium  border-gray-300'
                      contentEditable
                      onInput={(event) => {
                        //@ts-ignore
                        setDescPost(event.currentTarget?.textContent);
                        //@ts-ignore
                        if (event.currentTarget.textContent?.length >= 1000) setErrorMsg('Description can be of length 1000 max')
                        else setErrorMsg(undefined)
                      }}>
                    </div>
                  </div>
                </div>
              }
            </div>

            {/* footer */}
            {
              (mediaFiles && mediaFiles.length > 0) && pageNum === 2 && <div
                className="flex justify-between p-4 w-full border-t border-gray-200 rounded-b-md">

                <button type="button"
                  className="px-6 py-2.5  bg-blue-600 text-white font-medium text-xs rounded shadow-md hover:bg-blue-700  focus:bg-blue-700 focus:shadow-lg focus:outline-none "
                  onClick={(event) => { event.preventDefault(); setPageNum(1) }}
                  disabled={inProgress}
                >
                  Previous
                </button>

                <button type="button"
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium text-xs rounded shadow-md hover:bg-blue-700  focus:bg-blue-700 focus:shadow-lg focus:outline-none "
                  onClick={(event) => { event.preventDefault(); uploadPost() }}
                  disabled={inProgress}
                >
                  Upload Post
                </button>
              </div>
            }
            {
              (mediaFiles && mediaFiles.length > 0) && pageNum === 1 && <div
                className="flex justify-end p-4 w-full border-t border-gray-200 rounded-b-md">

                <button type="button"
                  className="px-6 py-2.5  bg-blue-600 text-white font-medium text-xs rounded shadow-md hover:bg-blue-700  focus:bg-blue-700 focus:shadow-lg focus:outline-none "
                  onClick={(event) => { event.preventDefault(); setPageNum(2) }}
                >
                  Next
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

function PostPreview({ mediaFiles, mediaUrls, setMediaUrls, setMediaFile }: {
  mediaFiles: (Blob | null)[],
  setMediaUrls: React.Dispatch<React.SetStateAction<string[]>>,
  mediaUrls: string[],
  setMediaFile: React.Dispatch<React.SetStateAction<(Blob | null)[]>>
}) {
  const [currentIndex, setCurrentIndex] = useState(0);


  return (
    <div
      className='h-fit w-fit'
    >
      <div className="flex items-center relative bg-white w-fit max-w-sm sm:max-w-xl h-fit  max-h-[32rem]" style={{ minHeight: '300px', minWidth: '400px' }}>
        <img src={mediaUrls[currentIndex]} className='max-w-full mx-auto h-fit  max-h-[32rem]' />
        <button
          className='absolute top-3 h-fit right-2  px-2 w-fit rounded-full bg-white opacity-80 font-medium hover:bg-gray-200'
          onClick={(event) => {
            event.preventDefault();
            setMediaUrls(mediaUrls.slice(0, currentIndex).concat(mediaUrls.slice(currentIndex + 1)))
            setMediaFile(mediaFiles.slice(0, currentIndex).concat(mediaFiles.slice(currentIndex + 1)))
            setCurrentIndex((currentIndex - 1 >= 0) ? currentIndex - 1 : 0)
          }}
        >
          X
        </button>
        <button
          className='absolute inset-y-1/2 h-fit left-2  px-2 w-fit rounded-full bg-white opacity-80 font-medium hover:bg-gray-200'
          onClick={(event) => { event.preventDefault(); setCurrentIndex((prev) => prev - 1) }}
          hidden={(currentIndex < 1) ? true : false}
        >
          {'<'}
        </button>
        <button
          className='absolute inset-y-1/2 h-fit right-2 px-2 w-fit rounded-full bg-white opacity-80 font-medium hover:bg-gray-200'
          onClick={(event) => { event.preventDefault(); setCurrentIndex((prev) => prev + 1) }}
          hidden={(currentIndex > mediaFiles.length - 2) ? true : false}
        >
          {'>'}
        </button>
      </div>

    </div>
  )
}
function UploadPostSelectFile({ mediaFiles, setErrorMsg, setMediaFile }: {
  mediaFiles: (Blob | null)[],
  setErrorMsg: React.Dispatch<React.SetStateAction<string | undefined>>,
  setMediaFile: React.Dispatch<React.SetStateAction<(Blob | null)[]>>

}) {
  const dropRef = useRef(null)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;

    if (files && files.length) {
      console.log({ files });
      if (files.length > 4) {
        setErrorMsg('can select up to 4 files only')
        return
      }
      let cFiles: (Blob | null)[] = []
      for (let ii = 0; ii < files.length; ii++) {
        let currentFile = files.item(ii)
        if (currentFile) cFiles[ii] = await imageCompression(currentFile, { maxSizeMB: 2 })
        //@ts-ignore
        if (cFiles[ii] !== null && cFiles[ii].size > 2 * 1024 * 1024) {
          setErrorMsg('maximum size limit is 2MB')
          return
        }
        console.log('cFile', ii, cFiles[ii])
      }
      setMediaFile((prev) => {
        const latest = [...prev, ...cFiles];
        latest.slice(0, 5)
        return latest
      })
    }
  };

  useEffect(() => {
    if (dropRef.current) {
      //@ts-ignore
      dropRef.current.addEventListener('dragover', handleDragOver); dropRef.current.addEventListener('drop', handleDrop);
    }
    return () => {
      if (dropRef.current) {
        //@ts-ignore
        dropRef.current.removeEventListener('dragover', handleDragOver); dropRef.current.removeEventListener('drop', handleDrop);
      }
    };
  }, [])
  return (
    <div
      ref={dropRef}
      className="w-96  h-[28rem] md:w-[40rem] md:h-[35rem]"
      hidden={!(!mediaFiles || mediaFiles.length === 0)}
    >
      <label
        className="flex justify-center w-full h-full px-4 transition bg-white rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
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
        <input type="file" accept=".jpg, .jpeg, .png .gif" multiple name="file_upload" className="hidden" onChange={(event) => {
          console.log('Here 1234', event.target.files)
        }} />
      </label>
    </div>
  )
}

export default UploadFile
