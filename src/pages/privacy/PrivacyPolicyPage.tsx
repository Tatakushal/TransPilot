import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 sm:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-indigo-600">TransPilot</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: August 31, 2026</p>
        <div className="mt-8 space-y-7 text-sm leading-7 text-slate-600">
          <section><h2 className="font-bold text-slate-900">Information we collect</h2><p>We collect account information and operational fleet data needed to provide the TransPilot workspace, including vehicle, driver, trip, fuel and maintenance records entered by authorized users.</p></section>
          <section><h2 className="font-bold text-slate-900">How we use information</h2><p>Information is used to authenticate users, operate fleet workflows, provide reports and improve reliability and security. We do not use operational records for unrelated advertising.</p></section>
          <section><h2 className="font-bold text-slate-900">Data security</h2><p>Access is restricted by authentication and user permissions. Production deployments should use HTTPS, protected environment secrets, encrypted backups and least-privilege database access.</p></section>
          <section><h2 className="font-bold text-slate-900">Your choices</h2><p>Authorized account owners may request correction or deletion of account data. Operational retention requirements may apply where records are required for business, legal or compliance purposes.</p></section>
          <section><h2 className="font-bold text-slate-900">Contact</h2><p>For privacy questions or data requests, contact the TransPilot administrator responsible for your organization.</p></section>
        </div>
        <Link to="/login" className="mt-8 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">Back to sign in</Link>
      </article>
    </main>
  );
}
