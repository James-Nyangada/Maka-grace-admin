'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.auth.login(credentials);
      
      localStorage.setItem("mg_admin_token", response.token);
      localStorage.setItem("mg_admin_user", JSON.stringify({
        name: response.name,
        email: response.email,
        role: response.role
      }));
      
      toast.success("Login successful");
      
      const role = response.role;
      if (role === "super-admin") {
        router.push("/super-admin/dashboard");
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "user") {
        router.push("/users/dashboard");
      } else {
        router.push("/unauthorized");
      }
      
    } catch (err) {
      toast.error(err.message || "An error occurred");
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl">
            <GalleryVerticalEnd className="size-6" />
          </div>
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Admin Login</h1>
        <p className="text-muted-foreground text-sm">Sign in to manage your bookings, packages, and content</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={credentials.email} 
            onChange={handleChange}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            placeholder="admin@makagracetravel.co.ke"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <a href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            value={credentials.password} 
            onChange={handleChange}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            required
          />
        </div>
        {error && <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-md border border-destructive/20">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 hover:scale-[0.98] active:scale-95 inline-flex h-10 w-full items-center justify-center rounded-[10px] px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#1A4731]">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md bg-card p-10 rounded-[20px] shadow-sm">
            <LoginForm />
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