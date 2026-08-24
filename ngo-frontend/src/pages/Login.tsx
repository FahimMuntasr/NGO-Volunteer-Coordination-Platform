import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/useAuth";


export default function Login() {
  const navigate =
    useNavigate();

  const location =
    useLocation();


  const accountCreated =
    location.state
      ?.accountCreated === true;


  const passwordReset =
    location.state
      ?.passwordReset === true;


  const {
    login,
    isAuthenticated,
    loading,
  } = useAuth();


  const [
    username,
    setUsername,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  useEffect(() => {
    if (
      isAuthenticated
    ) {
      navigate(
        "/dashboard",
        {
          replace: true,
        },
      );
    }
  }, [
    isAuthenticated,
    navigate,
  ]);


  if (
    loading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eaf0f5]">

        <div className="flex items-center gap-3 text-slate-500">

          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />

          Loading...

        </div>

      </div>
    );
  }


  if (
    isAuthenticated
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSubmitting(true);


    try {
      await login(
        username,
        password,
      );


      navigate(
        "/dashboard",
        {
          replace: true,
        },
      );

    } catch (
      error: unknown
    ) {

      if (
        typeof error ===
          "object" &&
        error !== null &&
        "response" in error
      ) {

        const response = (
          error as {
            response?: {
              data?: {
                detail?: string;
              };
            };
          }
        ).response;


        setError(
          response?.data
            ?.detail ??
            "Login failed. Please try again.",
        );

      } else {

        setError(
          "Unable to connect to the server.",
        );

      }

    } finally {

      setSubmitting(
        false,
      );

    }
  }


  return (
    <div className="min-h-screen bg-[#eaf0f5] lg:grid lg:grid-cols-2">


      {/* =========================
          Left Brand Section
      ========================== */}

      <div className="relative hidden overflow-hidden bg-[#172033] p-12 text-white lg:flex lg:flex-col lg:justify-between">


        {/* Decoration */}

        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl" />


        {/* Logo */}

        <div className="relative">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 text-xl font-bold text-white shadow-lg">
              N
            </div>


            <div>

              <h1 className="text-xl font-bold">
                NGO Volunteer Coordination
              </h1>

              <p className="text-xs text-slate-400">
                Volunteer Management Platform
              </p>

            </div>

          </div>

        </div>


        {/* Message */}

        <div className="relative max-w-lg">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Make an impact
          </p>


          <h2 className="mt-5 text-5xl font-bold leading-[1.1] tracking-tight">
            Connecting volunteers
            with meaningful causes.
          </h2>


          <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
            Discover opportunities,
            coordinate teams, support
            verified NGOs, and track
            meaningful community impact
            through one platform.
          </p>


          <div className="mt-10 grid grid-cols-3 gap-4">


            <div className="rounded-2xl border border-slate-600/40 bg-[#202d40]/80 p-4">

              <p className="font-bold text-slate-100">
                Volunteer
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Discover opportunities
              </p>

            </div>


            <div className="rounded-2xl border border-slate-600/40 bg-[#202d40]/80 p-4">

              <p className="font-bold text-slate-100">
                Coordinate
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Manage teams
              </p>

            </div>


            <div className="rounded-2xl border border-slate-600/40 bg-[#202d40]/80 p-4">

              <p className="font-bold text-slate-100">
                Support
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Help verified NGOs
              </p>

            </div>


          </div>

        </div>


        <p className="relative text-xs text-slate-500">
          NGO Volunteer Coordination Platform
        </p>

      </div>


      {/* =========================
          Login Side
      ========================== */}

      <div className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">


        <div className="w-full max-w-md">


          {/* Mobile Logo */}

          <div className="mb-10 flex items-center gap-3 lg:hidden">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 font-bold text-white shadow-md">
              N
            </div>


            <div>

              <p className="font-bold text-slate-900">
                NGO Volunteer Coordination
              </p>

              <p className="text-xs text-slate-500">
                Volunteer Management Platform
              </p>

            </div>

          </div>


          {/* Heading */}

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Welcome back
            </p>


            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h1>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your credentials to
              continue to your workspace.
            </p>

          </div>


          {/* Account Created */}

          {accountCreated && (

            <div className="mt-6 flex gap-3 rounded-xl border border-emerald-300/70 bg-emerald-100/60 px-4 py-3 text-sm text-emerald-800">

              <span className="font-bold">
                ✓
              </span>

              <span>
                Account created successfully.
                You can now log in.
              </span>

            </div>

          )}


          {/* Password Reset Success */}

          {passwordReset && (

            <div className="mt-6 flex gap-3 rounded-xl border border-emerald-300/70 bg-emerald-100/60 px-4 py-3 text-sm text-emerald-800">

              <span className="font-bold">
                ✓
              </span>

              <span>
                Password reset successfully.
                You can now sign in with
                your new password.
              </span>

            </div>

          )}


          {/* Form */}

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 space-y-5"
          >


            {/* Username */}

            <div>

              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Username
              </label>


              <input
                id="username"
                type="text"
                value={
                  username
                }
                onChange={(
                  event,
                ) =>
                  setUsername(
                    event.target.value,
                  )
                }
                placeholder="Enter your username"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400"
              />

            </div>


            {/* Password */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>


                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Forgot password?
                </Link>

              </div>


              <input
                id="password"
                type="password"
                value={
                  password
                }
                onChange={(
                  event,
                ) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400"
              />

            </div>


            {/* Error */}

            {error && (

              <div className="rounded-xl border border-red-300/70 bg-red-100/60 px-4 py-3 text-sm text-red-700">
                {error}
              </div>

            )}


            {/* Login Button */}

            <button
              type="submit"
              disabled={
                submitting
              }
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl disabled:translate-y-0 disabled:opacity-50"
            >
              {submitting
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>


          {/* Register */}

          <div className="mt-8 border-t border-slate-300 pt-6 text-center">

            <p className="text-sm text-slate-500">
              Don't have an account?
            </p>


            <Link
              to="/register"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-[#f4f7fa] px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-100/50 hover:text-blue-700"
            >
              Create an Account
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}