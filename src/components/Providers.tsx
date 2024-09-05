import React, { FC } from 'react'
import { Toaster } from 'react-hot-toast'

interface ProvidersProps {
    children: React.ReactNode
}

const Providers: FC<ProvidersProps> = ({children}) => {
  return (
    <>
    <Toaster position='top-center' reverseOrder={false}/>   
    {children}  
    </>
  )
}

export default Providers