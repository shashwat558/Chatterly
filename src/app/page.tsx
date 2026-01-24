import Image from "next/image";
import Link from "next/link";
import { 
  ChatBubbleLeftRightIcon, 
  ShieldCheckIcon, 
  BoltIcon, 
  UserGroupIcon, 
  VideoCameraIcon,
  PhotoIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-indigo-50/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-slate-900 tracking-tight">Chatterly</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                Sign In
              </Link>
              <Link 
                href="/login"
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-slate-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mb-32 relative">
            
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none animate-pulse-slow"></div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 mb-8 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-bold tracking-wide uppercase">v2.0 is live</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-5xl animate-fade-in-up delay-100 leading-tight">
              Connect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">instantly</span>. <br className="hidden md:block" />
              Chat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">freely</span>.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 animate-fade-in-up delay-200 leading-relaxed">
              Experience messaging re-imagined. Crystal clear chats, secure transmission, and a vibrant community waiting for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-24 animate-fade-in-up delay-300 w-full sm:w-auto">
                <Link href="/login" className="group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-1 flex items-center justify-center gap-3">
                    Start Chatting
                    <ChatBubbleLeftRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#features" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold hover:bg-slate-50 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                   Explore features
                </Link>
            </div>

            {/* Floating UI Elements / Graphical Representation */}
            <div className="relative w-full max-w-6xl animate-fade-in-up delay-500 perspective-1000">
                <div className="relative z-10 bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-slate-200 overflow-hidden aspect-[16/9] transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">
                    <Image 
                        src="/Hero.png" 
                        alt="Platform Preview" 
                        fill 
                        className="object-cover object-top"
                        priority
                    />
                    
                    {/* Simulated Notifications */}
                    <div className="absolute top-12 left-12 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/50 animate-float-slow hidden md:block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckBadgeIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">System</p>
                                <p className="text-sm font-bold text-slate-800">Message Encrypted</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/50 animate-float-delayed hidden md:block">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <BoltIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Performance</p>
                                <p className="text-sm font-bold text-slate-800">&lt; 10ms Latency</p>
                            </div>
                        </div>
                    </div>

                </div>
                 
                {/* Decorative blobs behind */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-200 rounded-full blur-3xl -z-10 opacity-40 animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-200 rounded-full blur-3xl -z-10 opacity-40 animate-pulse delay-700"></div>

            </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-32 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-3">Why Chatterly?</h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Everything you need, nothing you don't.</h3>
                    <p className="text-slate-600 text-lg">We focus on the essentials of modern communication—speed, privacy, and usability.</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    
                    <FeatureCard
                        icon={<ShieldCheckIcon className="w-6 h-6 text-emerald-600" />}
                        title="End-to-End Encryption"
                        desc="Your conversations are private. We utilize military-grade encryption to ensure only you and your recipient can read your messages."
                        color="bg-emerald-50"
                    />

                    <FeatureCard
                        icon={<BoltIcon className="w-6 h-6 text-amber-600" />}
                        title="Lightning Fast"
                        desc="Built on Redis and optimized for speed. Messages are delivered instantly, no matter where you are."
                        color="bg-amber-50"
                    />

                    <FeatureCard
                        icon={<PhotoIcon className="w-6 h-6 text-rose-600" />}
                        title="Media Sharing"
                        desc="Send photos and files with ease. High-quality image compression ensures fast uploads without losing detail."
                        color="bg-rose-50"
                    />

                    <FeatureCard
                        icon={<UserGroupIcon className="w-6 h-6 text-blue-600" />}
                        title="Seamless Friends"
                        desc="Add friends via email, manage requests, and build your circle. Real-time online status and typing indicators."
                        color="bg-blue-50"
                    />

                     {/* Video Calling Feature - Coming Soon */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                            Coming Soon
                        </div>
                        <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                             <VideoCameraIcon className="w-7 h-7 text-violet-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Video Calling</h3>
                        <p className="text-slate-500 leading-relaxed text-sm">
                           Face-to-face HD video calls are just around the corner. Connect with your friends on a deeper level.
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>


                    <FeatureCard
                        icon={<DevicePhoneMobileIcon className="w-6 h-6 text-slate-600" />}
                        title="Mobile Optimized"
                        desc="A responsive design that looks and feels great on any device. Chat on the go without compromise."
                        color="bg-slate-100"
                    />

                </div>
            </div>
            
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        </section>

        {/* Stats Section */}
        <section className="bg-slate-900 py-24 text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
                    <div className="p-4">
                        <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 mb-2">99.9%</div>
                        <div className="text-slate-400 font-medium uppercase tracking-widest text-sm">Uptime</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">&lt;50ms</div>
                        <div className="text-slate-400 font-medium uppercase tracking-widest text-sm">Latency</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">100%</div>
                        <div className="text-slate-400 font-medium uppercase tracking-widest text-sm">Secure</div>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-50 py-16 border-t border-slate-200">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 rounded-lg">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl text-slate-800">Chatterly</span>
                </div>
                
                <div className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} Chatterly Inc. All rights reserved.
                </div>

                <div className="flex gap-6">
                    <Link href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <GlobeAltIcon className="w-6 h-6" />
                    </Link>
                </div>
             </div>
        </footer>

      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
                {desc}
            </p>
        </div>
    )
}
