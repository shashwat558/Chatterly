'use client'

import { FC, useState } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Image from 'next/image'

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function loginWithGoogle() {
    setIsLoading(true)
    try {
      await signIn('google')
    } catch (error) {
      toast.error('Something went wrong with your login.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className='flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden'>
        {/* Background Image with fade from top to bottom */}
        <div className="absolute inset-0 -z-20">
          <Image 
            src="/loginbg.jpeg" 
            alt="" 
            fill 
            className="object-cover" 
            priority
          />
          {/* Gradient overlay - fades from transparent at top to white at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        </div>

        <div className="absolute top-0 left-0 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>

        <div className='w-full flex flex-col items-center max-w-sm space-y-8 p-10 glass-card rounded-3xl z-10'>
          <div className='flex flex-col items-center gap-3 animate-fade-in'>
            <div className="p-2 bg-sky-50 rounded-2xl">
              <Image src='/logo2.png' alt='Chatterly Logo' width={48} height={48} className='h-12 w-auto' />
            </div>
            <span className='font-bold text-2xl text-slate-800 tracking-tight'>Chatterly</span>
          </div>
          
          <div className='w-full space-y-8 animate-slide-up' style={{ animationDelay: '0.1s' }}>
            <div className='text-center space-y-2'>
               <h2 className='text-xl font-semibold text-slate-800'>
                Private Conversations
              </h2>
              <p className='text-sm text-slate-500'>
                Secure, simple, and beautifully quiet.
              </p>
            </div>
           

            <Button
              isLoading={isLoading}
              type='button'
              variants='secondary'
              className='w-full flex gap-3 items-center justify-center h-12 text-sm font-medium hover:scale-[1.02] transition-transform duration-200'
              onClick={loginWithGoogle}>
              {!isLoading && (
                <svg
                  className='h-5 w-5'
                  aria-hidden='true'
                  focusable='false'
                  data-prefix='fab'
                  data-icon='google'
                  role='img'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'>
                  <path
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    fill='#4285F4'
                  />
                  <path
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    fill='#34A853'
                  />
                  <path
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    fill='#FBBC05'
                  />
                  <path
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    fill='#EA4335'
                  />
                  <path d='M1 1h22v22H1z' fill='none' />
                </svg>
              )}
              Continue with Google
            </Button>
            
            <p className="text-center text-xs text-slate-400 leading-relaxed">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
