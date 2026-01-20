import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Shield, Zap, Users, Lock, Smile, CheckCheck, UserPlus, Reply } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-xl">
                 <Image src="/logo.png" alt="Chatterly" width={24} height={24} className="h-6 w-auto brightness-0 invert" />
              </div>
              <span className="font-bold text-xl text-slate-800">Chatterly</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Sign In
              </Link>
              <Link 
                href="/login"
                className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                </span>
                <span className="text-xs font-semibold tracking-wide uppercase">v1.0 is now live</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Connect with your friends,<br />
              <span className="text-blue-600">securely</span> and <span className="text-indigo-600">instantly</span>.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Experience the next generation of messaging. Built for speed, designed for privacy, and crafted for connection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:scale-105 flex items-center gap-2 justify-center">
                    <MessageCircle className="w-5 h-5" />
                    Start Chatting Now
                </Link>
                <Link href="#features" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold hover:bg-slate-50 transition-all hover:scale-105 flex items-center gap-2 justify-center">
                    Learn More
                </Link>
            </div>

            {/* App Preview Image */}
            <div className="relative w-full max-w-5xl rounded-3xl p-2 bg-gradient-to-b from-slate-200 to-slate-100 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-50 duration-1000 delay-500">
                 <div className="rounded-2xl overflow-hidden bg-white aspect-[16/10] relative">
                    <Image 
                        src="/dashboard.jpeg" 
                        alt="App Dashboard" 
                        fill 
                        className="object-cover"
                        priority
                    />
                 </div>
                 {/* Floating Elements specific to screenshots available */}
                 <div className="absolute -right-12 top-1/4 w-64 rounded-2xl p-2 bg-white shadow-xl border border-slate-100 hidden lg:block hover:scale-105 transition-transform duration-300">
                    <Image src="/addFriend.jpeg" alt="Add Friend" width={300} height={200} className="rounded-xl w-full h-auto" />
                 </div>
                 <div className="absolute -left-12 bottom-1/4 w-64 rounded-2xl p-2 bg-white shadow-xl border border-slate-100 hidden lg:block hover:scale-105 transition-transform duration-300">
                    <Image src="/sidebar.jpeg" alt="Sidebar" width={300} height={200} className="rounded-xl w-full h-auto" />
                 </div>
            </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need in a chat app</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">We've stripped away the clutter and focused on what matters most: speed, security, and user experience.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                        <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">End-to-End Encryption</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Your messages are encrypted before they leave your device. Only you and the recipient can read them. No one else, not even us.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                        <Zap className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Messaging</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Powered by Redis and Pusher for sub-millisecond latency. Experience conversations that flow naturally without delays.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                        <Smile className="w-6 h-6 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Express Yourself</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Go beyond text with typing indicators, read receipts, and message reactions. Feel the presence of your friends.
                    </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                        <UserPlus className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Easy Friend Requests</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Add friends via email with a simple, secure request system. Manage your social circle with ease.
                    </p>
                </div>

                 {/* Feature 5 */}
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                        <Reply className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Replies</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Context-aware reply system helps you keep the conversation thread organized. Never lose track of what you're answering.
                    </p>
                </div>

                {/* Feature 6 */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                        <CheckCheck className="w-6 h-6 text-violet-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Read Status</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Know exactly when your message has been delivered and seen. Transparency builds better communication.
                    </p>
                </div>
            </div>
        </section>


        {/* Visual Showcase Section */}
        <section className="bg-slate-900 py-24 my-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                     <h2 className="text-4xl font-bold text-white leading-tight">
                        Built for the modern web.<br/>
                        <span className="text-blue-400">Fast. Secure. Reliable.</span>
                     </h2>
                     <p className="text-slate-300 text-lg leading-relaxed">
                         We utilize cutting-edge technology including Next.js, Redis, and Pusher to deliver a seamless chatting experience. No page reloads, no waiting.
                     </p>
                     <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-slate-200">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <CheckCheck className="w-4 h-4 text-blue-400" />
                            </div>
                            Instant message delivery
                        </li>
                         <li className="flex items-center gap-3 text-slate-200">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <CheckCheck className="w-4 h-4 text-blue-400" />
                            </div>
                            Real-time typing indicators
                        </li>
                        <li className="flex items-center gap-3 text-slate-200">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <CheckCheck className="w-4 h-4 text-blue-400" />
                            </div>
                            Secure session management
                        </li>
                     </ul>
                </div>
                <div className="flex-1 relative">
                    <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 max-w-sm ml-auto rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Image src="/friendRequest.jpeg" alt="Mobile View" width={400} height={800} className="w-full h-auto" />
                    </div>
                     <div className="absolute top-10 -left-10 z-0 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 max-w-sm -rotate-3 hover:rotate-0 transition-transform duration-500 opacity-60">
                        <Image src="/dashboard.jpeg" alt="Mobile View" width={400} height={800} className="w-full h-auto" />
                    </div>
                </div>
            </div>
        </section>


        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                     <h2 className="text-4xl font-bold text-white">Ready to start chatting?</h2>
                     <p className="text-blue-100 text-lg">Join thousands of users who have already switched to a faster, more secure way to communicate.</p>
                     <Link href="/login" className="inline-block px-10 py-5 bg-white text-blue-600 text-lg font-bold rounded-2xl shadow-xl hover:bg-blue-50 transition-all hover:scale-105">
                        Create an Account
                     </Link>
                </div>
             </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-slate-200 rounded-lg">
                    <Image src="/logo.png" alt="Chatterly" width={20} height={20} className="h-5 w-auto opacity-50 grayscale" />
                </div>
                <span className="font-semibold text-slate-500">Chatterly</span>
            </div>
            <div className="text-slate-400 text-sm">
                © {new Date().getFullYear()} Chatterly. All rights reserved.
            </div>
            <div className="flex gap-6">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-400 hover:bg-slate-300 hover:text-slate-600 transition-colors cursor-pointer">
                    <Users className="w-4 h-4" />
                </span>
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-400 hover:bg-slate-300 hover:text-slate-600 transition-colors cursor-pointer">
                    <Shield className="w-4 h-4" />
                </span>
            </div>
        </div>
      </footer>
    </div>
  );
}