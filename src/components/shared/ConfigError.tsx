/**
 * Shown in place of the app when the build had no Supabase credentials.
 *
 * Deliberately free of every other import — no router, no UI kit, no store —
 * because it has to render in exactly the situation where something about the
 * setup is already wrong.
 */
export function ConfigError({ detail }: { detail: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
                <div className="h-11 w-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-xl">
                    !
                </div>
                <div className="space-y-1.5">
                    <h1 className="text-lg font-medium text-slate-900">This build is not configured</h1>
                    <p className="text-sm text-slate-500 leading-relaxed">{detail}</p>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-xl p-3.5 space-y-2">
                    <p>
                        These are read when the site is <strong className="font-medium text-slate-700">built</strong>,
                        not when it loads, so adding them to the host afterwards has no effect until it rebuilds.
                    </p>
                    <p>
                        Locally, copy <code className="font-mono">.env.example</code> to{" "}
                        <code className="font-mono">.env.local</code>. On a host, set them for the environment being
                        deployed and trigger a fresh build.
                    </p>
                </div>
            </div>
        </div>
    );
}
