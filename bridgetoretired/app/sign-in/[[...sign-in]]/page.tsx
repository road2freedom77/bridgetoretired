import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5">
      <div className="mb-8 text-center">
        <div className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B] mb-3">BridgeToRetired Pro</div>
        <h1 className="font-syne font-bold text-2xl text-white">Sign in to your account</h1>
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/auth-callback"
      />
    </div>
  )
}
