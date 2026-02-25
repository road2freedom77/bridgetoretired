import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5">
      <div className="mb-8 text-center">
        <div className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B] mb-3">BridgeToRetired Pro</div>
        <h1 className="font-syne font-bold text-2xl text-white">Create your Pro account</h1>
        <p className="text-white/40 text-sm mt-2">Sign up first, then complete your subscription.</p>
      </div>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/pricing"
      />
    </div>
  )
}

