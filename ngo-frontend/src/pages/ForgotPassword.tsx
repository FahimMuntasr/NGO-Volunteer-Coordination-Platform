import {
    useState,
  } from "react";
  
  import {
    Link,
  } from "react-router-dom";
  
  import {
    requestPasswordReset,
  } from "../api/auth";
  
  
  export default function ForgotPassword() {
    const [
      email,
      setEmail,
    ] =
      useState("");
  
    const [
      error,
      setError,
    ] =
      useState("");
  
    const [
      message,
      setMessage,
    ] =
      useState("");
  
    const [
      submitting,
      setSubmitting,
    ] =
      useState(false);
  
  
    async function handleSubmit(
      event:
        React.FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();
  
      try {
        setSubmitting(true);
        setError("");
        setMessage("");
  
        const response =
          await requestPasswordReset(
            email,
          );
  
        setMessage(
          response.detail,
        );
  
      } catch (err) {
        console.error(err);
  
        setError(
          "Unable to process the password reset request.",
        );
  
      } finally {
        setSubmitting(
          false,
        );
      }
    }
  
  
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eaf0f5] px-5 py-12">
  
        <div className="w-full max-w-md">
  
  
          <div className="mb-8 flex items-center gap-3">
  
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
  
  
          <div className="rounded-3xl border border-slate-300/60 bg-[#f4f7fa] p-7 shadow-lg sm:p-8">
  
            <p className="text-sm font-semibold text-blue-600">
              Account Recovery
            </p>
  
  
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Forgot your password?
            </h1>
  
  
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter the email address
              associated with your account.
              We'll send you a password reset
              link if an account exists.
            </p>
  
  
            {message && (
  
              <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-100/60 p-4 text-sm text-emerald-800">
                {message}
              </div>
  
            )}
  
  
            {error && (
  
              <div className="mt-6 rounded-xl border border-red-300 bg-red-100/60 p-4 text-sm text-red-700">
                {error}
              </div>
  
            )}
  
  
            <form
              onSubmit={
                handleSubmit
              }
              className="mt-7 space-y-5"
            >
  
              <div>
  
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>
  
  
                <input
                  id="email"
                  type="email"
                  required
                  value={
                    email
                  }
                  onChange={(
                    event,
                  ) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400"
                />
  
              </div>
  
  
              <button
                type="submit"
                disabled={
                  submitting
                }
                className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>
  
            </form>
  
  
            <div className="mt-6 text-center">
  
              <Link
                to="/login"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                ← Back to Sign In
              </Link>
  
            </div>
  
          </div>
  
        </div>
  
      </div>
    );
  }