import {
    useState,
  } from "react";
  
  import {
    Link,
    useNavigate,
    useParams,
  } from "react-router-dom";
  
  import {
    confirmPasswordReset,
  } from "../api/auth";
  
  
  export default function ResetPassword() {
    const {
      uid,
      token,
    } =
      useParams<{
        uid: string;
        token: string;
      }>();
  
    const navigate =
      useNavigate();
  
  
    const [
      password,
      setPassword,
    ] =
      useState("");
  
    const [
      confirmPassword,
      setConfirmPassword,
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
  
  
    async function handleSubmit(
      event:
        React.FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();
  
      setError("");
  
  
      if (
        !uid ||
        !token
      ) {
        setError(
          "This password reset link is invalid.",
        );
  
        return;
      }
  
  
      if (
        password.length < 8
      ) {
        setError(
          "Password must be at least 8 characters.",
        );
  
        return;
      }
  
  
      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match.",
        );
  
        return;
      }
  
  
      try {
        setSubmitting(
          true,
        );
  
        await confirmPasswordReset(
          uid,
          token,
          password,
        );
  
  
        navigate(
          "/login",
          {
            replace: true,
            state: {
              passwordReset: true,
            },
          },
        );
  
      } catch (
        err: unknown
      ) {
        console.error(err);
  
  
        if (
          typeof err ===
            "object" &&
          err !== null &&
          "response" in err
        ) {
          const response = (
            err as {
              response?: {
                data?: {
                  detail?: string;
                  new_password?:
                    string[];
                };
              };
            }
          ).response;
  
  
          const passwordErrors =
            response?.data
              ?.new_password;
  
  
          if (
            passwordErrors &&
            passwordErrors.length > 0
          ) {
            setError(
              passwordErrors.join(
                " ",
              ),
            );
  
          } else {
            setError(
              response?.data
                ?.detail ??
                "Unable to reset password.",
            );
          }
  
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
              Create a new password
            </h1>
  
  
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Choose a strong new password
              for your account.
            </p>
  
  
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
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New Password
                </label>
  
  
                <input
                  id="new-password"
                  type="password"
                  required
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
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-300 bg-[#eef3f7] px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400"
                />
  
              </div>
  
  
              <div>
  
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm Password
                </label>
  
  
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={
                    confirmPassword
                  }
                  onChange={(
                    event,
                  ) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
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
                  ? "Resetting..."
                  : "Reset Password"}
              </button>
  
            </form>
  
  
            <div className="mt-6 text-center">
  
              <Link
                to="/login"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Back to Sign In
              </Link>
  
            </div>
  
          </div>
  
        </div>
  
      </div>
    );
  }