import { getToken } from "next-auth/jwt";
import withAuth from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
    async function middleware(req:NextRequest) {
        const pathname = req.nextUrl.pathname;
        
        //route protection
        const isAuth = await getToken({req})
        const isLoginPage = pathname.startsWith('/login')

        const sensetiveRoutes = ['/dashboard']
        const isAccessingSensetiveRoute = sensetiveRoutes.some((route) => pathname.startsWith(route))

        if(isLoginPage){
            if(isAuth){
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }

            return NextResponse.next();
        }

        if(!isAuth && isAccessingSensetiveRoute){
            return NextResponse.redirect(new URL('/login', req.url))
            
        }

        // Only redirect to dashboard if logged in
        if(pathname === '/' && isAuth){
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    }, {
        callbacks: {
            async authorized(){
                return true;
            }
        }
    }

)



export const config = {
    matcher: ['/', '/login', '/dashboard/:path*']
}