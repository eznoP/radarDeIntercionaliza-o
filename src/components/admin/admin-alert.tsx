/** Banner lido dos searchParams (?ok= / ?erro=) após uma ação de exclusão. */
export function AdminAlert({ ok, erro }: { ok?: string; erro?: string }) {
  if (erro) {
    return (
      <div
        role="alert"
        className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
      >
        {erro}
      </div>
    );
  }
  if (ok) {
    return (
      <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
        {ok === "1" ? "Operação concluída com sucesso." : ok}
      </div>
    );
  }
  return null;
}
