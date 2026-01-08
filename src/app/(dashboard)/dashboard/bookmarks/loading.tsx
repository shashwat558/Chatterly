import { FC } from 'react'

const Loading: FC = () => {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <div className='w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin'></div>
    </div>
  )
}

export default Loading
