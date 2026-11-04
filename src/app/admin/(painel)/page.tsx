import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Newspaper,
  Plus,
  Star,
  Tags,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  getCurrentProfile,
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { isAdminConfigured } from "@/lib/supabase/admin";
import { adminConfigured } from "@/lib/admin/guard";
import type { PostStatus } from "@/lib/database.types";

export const metadata = { title: "Visão geral" };

async function count(table: "categories" | "roles" | "profiles") {
  const supabase = await createClient();
  const { count: total } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  return total ?? 0;
}

async function countPosts(
  opts: { status?: PostStatus; authorId?: string; featured?: boolean } = {},
) {
  const supabase = await createClient();
  let query = supabase.from("posts").select("*", { count: "exact", head: true });
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.authorId) query = query.eq("author_id", opts.authorId);
  if (opts.featured) query = query.eq("is_featured", true);
  const { count: total } = await query;
  return total ?? 0;
}

export default async function AdminHome() {
  if (!adminConfigured()) return null;
  const current = await getCurrentProfile();
  const profile = current?.profile;
  const isAdmin = Boolean(profile?.is_admin);
  const myId = profile?.id;
  const authorFilter = isAdmin ? undefined : myId;

  const [posts, published, drafts, categories] = await Promise.all([
    countPosts({ authorId: authorFilter }),
    countPosts({ status: "published", authorId: authorFilter }),
    countPosts({ status: "draft", authorId: authorFilter }),
    count("categories"),
  ]);

  const [roles, integrantes, featured, pendingProfiles] = isAdmin
    ? await Promise.all([
        count("roles"),
        count("profiles"),
        countPosts({ status: "published", featured: true }),
        (async () => {
          const supabase = await createClient();
          const { count: total } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");
          return total ?? 0;
        })(),
      ])
    : [0, 0, 0, 0];

  const firstName =
    profile?.full_name?.split(" ")[0] ?? (isAdmin ? "gestor" : "integrante");

  const stats = isAdmin
    ? [
        {
          label: "Publicações",
          value: posts,
          hint: `${published} publicadas · ${drafts} rascunhos`,
          href: "/admin/publicacoes",
          icon: Newspaper,
        },
        {
          label: "Destaques na Home",
          value: featured,
          hint: "Marcadas com destaque",
          href: "/admin/publicacoes",
          icon: Star,
        },
        {
          label: "Categorias",
          value: categories,
          hint: "Área separada",
          href: "/admin/categorias",
          icon: Tags,
        },
        {
          label: "Cargos",
          value: roles,
          hint: "Área separada",
          href: "/admin/cargos",
          icon: Briefcase,
        },
        {
          label: "Integrantes",
          value: integrantes,
          hint: "Autores e equipe",
          href: "/admin/integrantes",
          icon: Users,
        },
      ]
    : [
        {
          label: "Minhas publicações",
          value: posts,
          hint: `${published} publicadas · ${drafts} rascunhos`,
          href: "/admin/publicacoes",
          icon: Newspaper,
        },
        {
          label: "Publicadas",
          value: published,
          hint: "Visíveis no site",
          href: "/admin/publicacoes?status=published",
          icon: Star,
        },
        {
          label: "Rascunhos",
          value: drafts,
          hint: "Ainda não publicadas",
          href: "/admin/publicacoes?status=draft",
          icon: Newspaper,
        },
      ];

  const warnings: { text: string; href?: string }[] = [];
  if (!isSupabaseConfigured()) {
    warnings.push({
      text: "O Supabase ainda não está configurado. Preencha o .env.local com a URL e as chaves e reinicie o servidor.",
    });
  }
  if (isAdmin && !isAdminConfigured()) {
    warnings.push({
      text: "A chave secreta (SUPABASE_SERVICE_ROLE_KEY) não está configurada. Sem ela não é possível criar ou gerenciar os acessos dos integrantes.",
    });
  }
  if (isAdmin && pendingProfiles > 0) {
    warnings.push({
      text:
        pendingProfiles === 1
          ? "1 perfil de integrante aguardando aprovação."
          : `${pendingProfiles} perfis de integrantes aguardando aprovação.`,
      href: "/admin/integrantes?filtro=pending",
    });
  }
  if (categories === 0) {
    warnings.push({
      text: isAdmin
        ? "Nenhuma categoria cadastrada. Crie ao menos uma para poder publicar."
        : "Ainda não há categorias cadastradas. Peça ao gestor para criar uma antes de publicar.",
    });
  }
  if (isAdmin && integrantes === 0) {
    warnings.push({
      text: "Nenhum integrante cadastrado. Cadastre um autor(a) para vincular às publicações.",
    });
  }

  return (
    <>
      <AdminPageHeader
        title={`Olá, ${firstName}`}
        description={
          isAdmin
            ? "Resumo do conteúdo do Radar de Internacionalização."
            : "Os seus conteúdos no Radar de Internacionalização."
        }
        action={
          <Link
            href="/admin/publicacoes/nova"
            className="inline-flex items-center gap-2 rounded-xl bg-dark-green px-4 py-2.5 font-display text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-moss hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nova publicação
          </Link>
        }
      />

      {warnings.length > 0 && (
        <ul className="mb-6 space-y-2">
          {warnings.map((w) =>
            w.href ? (
              <li key={w.text}>
                <Link
                  href={w.href}
                  className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100"
                >
                  <span>{w.text}</span>
                  <span className="underline">Revisar</span>
                </Link>
              </li>
            ) : (
              <li
                key={w.text}
                className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200"
              >
                {w.text}
              </li>
            ),
          )}
        </ul>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group flex flex-col rounded-card border border-dark-green/10 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-dark-green text-vanilla">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-dark-green" />
              </div>
              <p className="mt-4 font-display text-3xl font-bold text-dark-green">
                {stat.value}
              </p>
              <p className="mt-1 font-display text-sm font-semibold text-ink/75">
                {stat.label}
              </p>
              <p className="mt-0.5 font-body text-xs text-ink/50">{stat.hint}</p>
            </Link>
          );
        })}
      </section>

      <section className="mt-8 rounded-card border border-dark-green/10 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-dark-green">
          Atalhos
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <QuickLink
            href="/admin/publicacoes/nova"
            title="Criar publicação"
            description="Título, resumo, conteúdo e mídia."
          />
          {isAdmin ? (
            <>
              <QuickLink
                href="/admin/integrantes/novo"
                title="Cadastrar integrante"
                description="Pessoas do projeto e acesso ao painel."
              />
              <QuickLink
                href="/admin/categorias"
                title="Gerenciar categorias"
                description="Área exclusiva das categorias."
              />
              <QuickLink
                href="/admin/cargos"
                title="Gerenciar cargos"
                description="Área exclusiva dos cargos."
              />
            </>
          ) : (
            <>
              <QuickLink
                href="/admin/publicacoes"
                title="Minhas publicações"
                description="Edite ou remova os seus conteúdos."
              />
              <QuickLink
                href="/meu-perfil"
                title="Meu perfil"
                description="Foto, cargo, descrição e contatos."
              />
              <QuickLink
                href="/integrantes"
                title="Ver a equipe"
                description="Página pública de integrantes."
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-dark-green/10 bg-cream/60 px-4 py-3 transition hover:border-moss hover:bg-moss/10"
    >
      <span>
        <span className="block font-display text-sm font-semibold text-dark-green">
          {title}
        </span>
        <span className="block font-body text-xs text-ink/55">{description}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-ink/40" />
    </Link>
  );
}
