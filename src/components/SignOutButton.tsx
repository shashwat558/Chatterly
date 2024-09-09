"use client";

import { ButtonHTMLAttributes, FC, useState } from 'react';
import Button from './ui/Button';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Loader2, LogOut } from 'lucide-react';

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({...props}) => {
      const [isSignedOut, setIsSignedOut] = useState<boolean>(false)
    return <Button {...props} variants={'ghost'} onClick={async () => {
        setIsSignedOut(true)
        try{
            await signOut()
        } catch(err){
            toast.error("Error in Signing out")
        } finally {
            setIsSignedOut(false)
        }
    }}>
        {isSignedOut ? (
            <Loader2 className='animate-spin h-4 w-4' />
        ): (
            <LogOut  className='h-full aspect-square'/>
        )}
    </Button>
}

export default SignOutButton