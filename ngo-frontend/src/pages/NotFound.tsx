import {
    Link,
  } from "react-router-dom";
  
  
  export default function NotFound() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eaf0f5] px-5">
  
        <div className="max-w-lg text-center">
  
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#172033] text-xl font-bold text-white">
            404
          </div>
  
          <h1 className="mt-6 text-4xl font-bold text-slate-900">
            Page not found
          </h1>
  
          <p className="mt-3 leading-7 text-slate-500">
            The page you're trying to
            access doesn't exist or may
            have been moved.
          </p>
  
          <Link
            to="/dashboard"
            className="mt-7 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </Link>
  
        </div>
  
      </div>
    );
  }