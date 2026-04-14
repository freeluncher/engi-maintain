import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';

// Skema validasi menggunakan Zod
const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response: any = await apiClient.post('auth/login', {
        json: data,
      }).json();
      
      setCredentials(response.token, response.user);
      navigate('/');
    } catch (error: any) {
      if (error.response) {
        const errorData = await error.response.json().catch(() => ({}));
        setErrorMessage(errorData.message || 'Gagal login, periksa email & password.');
      } else {
        setErrorMessage('Gagal terhubung dengan server backend.');
      }
      console.error('Login Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-blue-900/10 md:flex-row border border-gray-100">
        
        {/* Kolom Kiri - Branding & Info */}
        <div className="relative flex flex-col items-start justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-12 text-white md:w-5/12 lg:w-1/2 overflow-hidden">
          {/* Efek dekorasi background melingkar */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
          
          <div className="relative z-10 w-full">
            <div className="mb-10 inline-flex items-center rounded-2xl bg-white/10 p-4 shadow-lg backdrop-blur-md border border-white/10">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">EngiMaintain</h1>
            <p className="text-lg leading-relaxed text-blue-100/90 font-medium">
              Platform modern untuk mengelola dan memantau pemeliharaan aset infrastruktur Anda secara terpusat.
            </p>
          </div>
          
          <div className="relative z-10 mt-16 flex items-center space-x-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-indigo-900 bg-gray-200 shadow-sm"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                    backgroundSize: 'cover',
                  }}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-blue-200">
              Dipercaya +100 Engineer <span className="mx-1 px-2 py-0.5 rounded-full bg-white/20 text-xs text-white">⭐ 4.9/5</span>
            </p>
          </div>
        </div>

        {/* Kolom Kanan - Form Login */}
        <div className="flex flex-col justify-center bg-white p-8 md:w-7/12 md:p-14 lg:p-16">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Menuju Dashboard</h2>
            <p className="mt-2 text-sm md:text-base text-gray-500">
              Masuk dengan akun perusahaan yang telah terdaftar.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <span className="font-semibold block mb-0.5">Autentikasi Gagal</span>
                {errorMessage}
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Alamat Email
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors group-focus-within:text-blue-500 text-gray-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="engineer@perusahaan.com"
                  className={`block w-full rounded-xl border ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  } bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-opacity-10`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center text-xs font-semibold text-red-500">
                  <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800"
                >
                  Lupa password?
                </a>
              </div>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors group-focus-within:text-blue-500 text-gray-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`block w-full rounded-xl border ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  } bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-opacity-10`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center text-xs font-semibold text-red-500">
                  <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>
            
            <div className="flex items-center pt-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-colors"
              />
              <label htmlFor="remember-me" className="ml-2.5 block text-sm font-medium text-gray-600 cursor-pointer">
                Simpan sesi login
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center items-center overflow-hidden rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-400 mt-4"
            >
              {isLoading ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memverifikasi...
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Belum terdaftar di sistem?{' '}
              <a href="#" className="font-semibold text-blue-600 transition-colors hover:text-blue-800">
                Hubungi Administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
