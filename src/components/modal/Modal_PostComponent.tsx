import { useState } from "react";
import { IPost } from "../../types";

function Modal_PostComponent({post}:{post: IPost}) {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    return (
      <div className='relative flex items-center w-auto  bg-black h-full max-w-fit'>
        <img src={post?.imgUrls[currentIndex]} className="w-full max-h-full overflow-y-hidden max-w-xl" />
        <button
          className='absolute inset-y-1/2 h-fit left-0.5  px-2 w-fit rounded-full text-white bg-black opacity-40'
          onClick={(event) => { event.preventDefault(); setCurrentIndex((prev) => prev - 1) }}
          hidden={(currentIndex < 1) ? true : false}
        >
          {'<'}
        </button>
        <button
          className='absolute inset-y-1/2 h-fit right-0.5 px-2 w-fit rounded-full text-white bg-black opacity-40'
          onClick={(event) => { event.preventDefault(); setCurrentIndex((prev) => prev + 1) }}
          hidden={(currentIndex > post.imgUrls.length - 2) ? true : false}
        >
          {'>'}
        </button>
      </div>
    )
  }

export default Modal_PostComponent;
