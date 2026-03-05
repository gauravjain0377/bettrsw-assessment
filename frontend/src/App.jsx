import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { useAuth } from "./hooks/useAuth.js";

export default function App() {
  const { token, user, login, logout } = useAuth();
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null

  const isAuthenticated = Boolean(token && user);

  const closeModal = () => setAuthModal(null);

  return (
    <div className="min-h-screen bg-white text-black">
      {!isAuthenticated ? (
        <>
          <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">
                  TT
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    Task Tracker
                  </h1>
                  <p className="text-xs text-gray-500">
                    Lightweight workflow for developers
                  </p>
                </div>
              </div>
              <nav className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => setAuthModal("login")}
                  className="px-4 py-2 rounded-full border border-black text-black hover:bg-black hover:text-white transition-colors"
                >
                  Login
                </button>
              </nav>
            </div>
          </header>

          <main className="px-4">
            <section className="max-w-6xl mx-auto py-12 grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-10 items-center">
              <div className="space-y-6">
                <p className="inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs text-gray-600">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                  Designed for developers who live in their task list
                </p>
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Keep your work in one{" "}
                    <span className="underline underline-offset-4">
                      simple board
                    </span>
                    .
                  </h2>
                  <p className="text-sm md:text-base text-gray-700 max-w-xl">
                    Capture tasks, track status, and stay focused without noisy
                    dashboards. Task Tracker is a clean, minimal tool that feels
                    built for developers.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs md:text-sm">
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="font-medium text-black">Fast login</p>
                    <p className="mt-1 text-gray-600">
                      Register and start managing tasks in seconds.
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="font-medium text-black">Clear statuses</p>
                    <p className="mt-1 text-gray-600">
                      Move work from todo to in progress to done.
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="font-medium text-black">Built for focus</p>
                    <p className="mt-1 text-gray-600">
                      A calm UI that keeps attention on what matters.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex justify-end">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm max-w-sm w-full space-y-4">
                  <p className="text-sm font-medium text-black">
                    Ready to get started?
                  </p>
                  <p className="text-xs text-gray-600">
                    Click{" "}
                    <span className="font-semibold">Login</span> to open the sign-in modal. New here? You can switch to
                    register inside the same flow.
                  </p>
                  <button
                    onClick={() => setAuthModal("login")}
                    className="mt-2 w-full rounded-full border border-black bg-black px-4 py-2 text-sm font-medium text-white hover:bg-white hover:text-black transition-colors"
                  >
                    Open login
                  </button>
                </div>
              </div>
            </section>
          </main>
        </>
      ) : (
        <>
          <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">
                  TT
                </div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Task Tracker
                </h1>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-700">
                  {user.username} (id: {user.id})
                </span>
                <button
                  onClick={logout}
                  className="rounded-full border border-gray-800 px-3 py-1.5 text-xs text-black hover:bg-black hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          <main className="px-4">
            <Dashboard user={user} />
          </main>
        </>
      )}

      {authModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <button
              onClick={closeModal}
              className="absolute right-3 top-3 text-gray-400 hover:text-black text-sm"
              aria-label="Close"
            >
              ✕
            </button>
            {authModal === "login" ? (
              <div className="space-y-4">
                <Login
                  onLogin={(tokenValue, userInfo) => {
                    login(tokenValue, userInfo);
                    closeModal();
                  }}
                />
                <p className="text-xs text-gray-600 text-center">
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthModal("register")}
                    className="font-medium underline underline-offset-2"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Register />
                <p className="text-xs text-gray-600 text-center">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthModal("login")}
                    className="font-medium underline underline-offset-2"
                  >
                    Login instead
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}

