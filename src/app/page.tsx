import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Shield, Zap, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen h-screen overflow-hidden relative bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }} />

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60">
              <Image src="/logo.png" alt="Chatterly" width={32} height={32} className="h-8 w-auto" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">Chatterly</span>
          </div>
          <Link 
            href="/login"
            className="px-6 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-medium rounded-full shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Link>
        </header>


        <main className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Hero Text */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                  Conversations that feel like
                  <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent"> clouds</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-md">
                  A calm, private space for meaningful conversations. No noise, no clutter — just you and the people who matter.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/60 shadow-sm">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-600">End-to-end private</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/60 shadow-sm">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-600">Real-time messaging</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/60 shadow-sm">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-medium text-slate-600">Thoughtful reactions</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-4">
                <Link 
                  href="/login"
                  className="px-8 py-4 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-semibold rounded-2xl shadow-xl shadow-sky-200 hover:shadow-2xl hover:shadow-sky-300 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Start Chatting
                </Link>
                <span className="text-sm text-slate-400">Free forever</span>
              </div>
            </div>

            {/* Right - Floating Chat Bubbles */}
            <div className="hidden lg:block animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative h-[480px] w-full">
                {/* Central glowing orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-sky-300 to-blue-400 rounded-full opacity-20 blur-3xl animate-pulse" />
                
                {/* Floating conversation bubbles */}
                <div className="absolute top-8 left-12 animate-float" style={{ animationDelay: '0s' }}>
                  <div className="bg-white/90 backdrop-blur-md rounded-3xl rounded-tl-sm p-4 shadow-xl border border-white/60 max-w-[220px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full" />
                      <span className="text-xs font-semibold text-slate-700">Sarah</span>
                    </div>
                    <p className="text-sm text-slate-600">Just had the best coffee ever ☕️</p>
                    <div className="flex gap-1 mt-2">
                      <span className="text-xs bg-amber-50 px-2 py-0.5 rounded-full">☕️</span>
                      <span className="text-xs bg-rose-50 px-2 py-0.5 rounded-full">❤️</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-32 right-8 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="bg-gradient-to-r from-sky-400 to-blue-500 rounded-3xl rounded-tr-sm p-4 shadow-xl max-w-[200px]">
                    <p className="text-sm text-white">Where? I need good coffee! 😍</p>
                    <p className="text-[10px] text-sky-100 mt-1 text-right">2:34 PM ✓✓</p>
                  </div>
                </div>

                <div className="absolute top-64 left-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="bg-white/90 backdrop-blur-md rounded-3xl rounded-bl-sm p-4 shadow-xl border border-white/60 max-w-[240px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full" />
                      <span className="text-xs font-semibold text-slate-700">Mike</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">typing...</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-16 right-16 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="bg-gradient-to-r from-sky-400 to-blue-500 rounded-3xl rounded-br-sm p-4 shadow-xl max-w-[180px]">
                    <p className="text-sm text-white">Count me in! 🙌</p>
                  </div>
                </div>

                <div className="absolute bottom-8 left-20 animate-float" style={{ animationDelay: '1.5s' }}>
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/60">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full ring-2 ring-white" />
                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full ring-2 ring-white" />
                        <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full ring-2 ring-white" />
                      </div>
                      <span className="text-xs text-slate-500">+3 friends online</span>
                    </div>
                  </div>
                </div>

                {/* Floating emojis */}
                <div className="absolute top-4 right-32 animate-float" style={{ animationDelay: '0.8s' }}>
                  <span className="text-3xl">💬</span>
                </div>
                <div className="absolute bottom-32 right-4 animate-float" style={{ animationDelay: '2.5s' }}>
                  <span className="text-2xl">✨</span>
                </div>
                <div className="absolute top-48 left-48 animate-float" style={{ animationDelay: '1.8s' }}>
                  <span className="text-2xl">🌤️</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-4 text-center">
          <p className="text-sm text-slate-400">
            Built with 💙 for peaceful conversations
          </p>
        </footer>
      </div>
    </div>
  );
}
