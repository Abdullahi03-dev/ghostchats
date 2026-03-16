"use client";

import { useRouter } from "next/navigation";

export default function Landing() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="text-base font-semibold tracking-tight text-zinc-100">ghostchats</span>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/auth")} className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
              Log in
            </button>
            <button onClick={() => router.push("/auth")} className="text-sm bg-zinc-100 hover:bg-white text-zinc-900 font-medium px-5 py-2 rounded-lg transition-colors">
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 sm:pt-40 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-emerald-500 text-sm font-medium tracking-wide uppercase mb-5">Real-time anonymous chat</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-[1.15] tracking-tight text-zinc-100 mb-6">
            Say what you mean.
            <br />
            <span className="text-zinc-500">Disappear when you&apos;re done.</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-xl mb-10">
            GhostChats lets you talk freely in real-time rooms. Toggle your identity off, turn on vanishing messages, and leave no trace behind.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => router.push("/auth")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-7 py-3 rounded-xl transition-colors text-sm">
              Create an account
            </button>
            <button onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })} className="text-zinc-400 hover:text-zinc-200 font-medium px-7 py-3 rounded-xl transition-colors text-sm border border-zinc-800 hover:border-zinc-700">
              How it works
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6"><div className="border-t border-zinc-800/60"></div></div>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-emerald-500 text-sm font-medium tracking-wide uppercase mb-5">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 mb-12">Three ideas. Nothing else.</h2>

          <div className="space-y-10">
            <div className="flex gap-5 sm:gap-6">
              <div className="text-xl font-bold text-zinc-700 shrink-0 w-8 text-right">01</div>
              <div>
                <h3 className="text-base font-semibold text-zinc-200 mb-2">Anonymous by default</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  When you flip the switch, your name disappears. Other users see a generated alias — something
                  like <span className="text-zinc-300 font-mono text-xs">ShadowWraith42</span> or <span className="text-zinc-300 font-mono text-xs">CrimsonBanshee7</span>.
                  Your real identity stays hidden until you decide otherwise.
                </p>
              </div>
            </div>
            <div className="flex gap-5 sm:gap-6">
              <div className="text-xl font-bold text-zinc-700 shrink-0 w-8 text-right">02</div>
              <div>
                <h3 className="text-base font-semibold text-zinc-200 mb-2">Messages that vanish</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Turn on Vanish Mode in any room and messages start dissolving every ten seconds — oldest first.
                  They fade out and get deleted from the database. Gone for real.
                </p>
              </div>
            </div>
            <div className="flex gap-5 sm:gap-6">
              <div className="text-xl font-bold text-zinc-700 shrink-0 w-8 text-right">03</div>
              <div>
                <h3 className="text-base font-semibold text-zinc-200 mb-2">Instant, no refresh</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Powered by WebSockets. When someone sends a message, it appears on your
                  screen the moment they hit send. No polling, no delay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6"><div className="border-t border-zinc-800/60"></div></div>

      {/* Tech */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-emerald-500 text-sm font-medium tracking-wide uppercase mb-5">Under the hood</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 mb-6">Built with things that work.</h2>
          <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-xl">
            No over-engineered stack. A Node.js backend, MongoDB for data, Socket.io for real-time,
            and a Next.js frontend. Authentication runs on HTTP-only cookies.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Express", "Socket.io", "MongoDB", "Next.js", "JWT", "bcrypt"].map((tech) => (
              <span key={tech} className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6"><div className="border-t border-zinc-800/60"></div></div>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 mb-4">Ready?</h2>
          <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto">Create an account, join the lobby, and start talking.</p>
          <button onClick={() => router.push("/auth")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-7 py-3 rounded-xl transition-colors text-sm">
            Get started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-zinc-800/40">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-medium text-zinc-500">ghostchats</span>
          <p className="text-xs text-zinc-600">A real-time chat experiment.</p>
        </div>
      </footer>
    </div>
  );
}
