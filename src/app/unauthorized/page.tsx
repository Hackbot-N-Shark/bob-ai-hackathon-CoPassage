export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4 font-bold text-xl">
          !
        </div>
        <h1 className="text-xl font-bold text-zinc-900">Access Denied</h1>
        <p className="mt-2 text-sm text-zinc-500">
          This panel is restricted to Super Admins only. Your current account does not have the required permissions.
        </p>
        <div className="mt-6">
          <a
            href="/admin/login"
            className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-zinc-800"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}