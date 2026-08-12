'use client'
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GalleryVerticalEnd, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [credentials, setCredentials] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (credentials.newPassword !== credentials.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (credentials.newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const apiBaseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

    try {
      const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: credentials.newPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast.success(data.message);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
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
          <div className="bg-green-100 text-green-600 flex size-16 items-center justify-center rounded-full">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Password Reset!</h2>
        <p className="text-muted-foreground">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <p className="text-sm text-muted-foreground animate-pulse">
          Redirecting to login...
        </p>
        <div className="pt-4">
          <Link href="/login" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium inline-block w-full">
            Go to Login Now
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
        <h1 className="text-2xl font-heading font-bold text-foreground">Create New Password</h1>
        <p className="text-muted-foreground text-sm">Please enter and confirm your new password below.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={credentials.newPassword} 
            onChange={handleChange}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={credentials.confirmPassword} 
            onChange={handleChange}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            required
            minLength={8}
          />
        </div>
        {error && <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-md border border-destructive/20">{error}</div>}
        <button
          type="submit"
          disabled={loading || !token}
          className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 hover:scale-[0.98] active:scale-95 inline-flex h-10 w-full items-center justify-center rounded-[10px] px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Resetting password...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#1A4731]">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md bg-card p-10 rounded-[20px] shadow-sm">
            <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
              <ResetPasswordForm />
            </Suspense>
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
