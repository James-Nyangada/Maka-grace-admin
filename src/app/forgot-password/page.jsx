'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GalleryVerticalEnd, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const apiBaseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

    try {
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      toast.success(data.message);
      setSuccess(true);
    } catch (err) {
      toast.error(err.message || "An error occurred");
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/20 text-primary flex size-16 items-center justify-center rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail-check"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/></svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold">Check your email</h2>
        <p className="text-muted-foreground">
          We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
        </p>
        <div className="pt-4">
          <Link href="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl">
            <GalleryVerticalEnd className="size-6" />
          </div>
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Reset Password</h1>
        <p className="text-muted-foreground text-sm">Enter your email address and we'll send you a link to reset your password.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            placeholder="admin@makagracetravel.co.ke"
            required
          />
        </div>
        {error && <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-md border border-destructive/20">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 hover:scale-[0.98] active:scale-95 inline-flex h-10 w-full items-center justify-center rounded-[10px] px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Sending link...' : 'Send Reset Link'}
        </button>
        <div className="text-center pt-2">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary hover:underline font-medium inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Back to login
          </Link>
        </div>
      </div>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#1A4731]">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md bg-card p-10 rounded-[20px] shadow-sm">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block rounded-l-[40px] overflow-hidden my-4 mr-4 shadow-2xl">
        <img
          src="/images/login.png"
          alt="Luxury travel destination"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
      </div>
    </div>
  );
}
