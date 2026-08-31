import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <section className="w-full max-w-xl rounded-[28px] bg-white p-8 text-center shadow-2xl sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Compass size={30} aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold text-indigo-600">404 · Route not found</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">Looks like you took a wrong turn.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">The page you requested does not exist or may have moved. Head back to your fleet command center.</p>
        <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">
          <ArrowLeft size={17} aria-hidden="true" /> Back to dashboard
        </Link>
      </section>
    </main>
  );
}
