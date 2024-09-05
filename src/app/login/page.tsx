"use client";

import Button from '@/components/Button';
import { signIn } from 'next-auth/react';
import React, { FC, useState } from 'react'
import toast from 'react-hot-toast';

interface PageProps{}

const page: FC<PageProps> = ({}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const loginWithGoogle = async () => {
        setIsLoading(true)
        try {
            
            await signIn('google')                       
            
        } catch (error) {
            toast.error("Somthing went wrong while logging in")
            
        } finally {
            setIsLoading(false)
        }
        
    }


  return (
    <>
     <div className='flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='w-full flex flex-col items-center max-w-md space-y-8'>
            logo
            <div className='flex flex-col item-center gap-8'>
                
                <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
                    Sign in to your Account
                </h2>
            </div>
            <Button isLoading={isLoading} type='button' className='max-w-sm mx-auto w-full'
            onClick={loginWithGoogle}>
                {isLoading? null: "goolge logo"}
                Google

            </Button>
        </div>
     </div>
    </>
  )
}

export default page