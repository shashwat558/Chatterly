import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react';
import React, { ButtonHTMLAttributes, FC } from 'react'

const buttonVariants = cva(
    'active:scale-95 inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:shadow-glow',
    {  
       variants:{
        variants: {
            default: "bg-gradient-to-r from-sky-400 to-blue-500 text-white border-0 hover:from-sky-500 hover:to-blue-600 shadow-sky-200/50",
            ghost: "bg-transparent hover:bg-white/50 hover:text-sky-600 text-slate-600",
            secondary: "bg-white text-slate-700 border border-slate-100 hover:bg-sky-50 shadow-sm"
        },
        size:{
            default: "h-11 py-2 px-6",
            sm: 'h-9 px-4 text-xs',
            lg: 'h-12 px-8 text-base',
        }

       },
       defaultVariants: {
        variants: 'default',
        size: "default"
       }
       
        
    },
 
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    
}

const Button: FC<ButtonProps> = ({className, children, variants, isLoading, size, ...props}) => {

  return (
   <button {...props} className={cn(buttonVariants({variants, size, className}))} disabled= {isLoading}>
    {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' />: null}
    {children}
   </button>
  )
}

export default Button