import type { ReactNode } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { HiExclamationTriangle, HiEye, HiGlobeAlt, HiStar } from "react-icons/hi2"
import { GoRepoForked } from "react-icons/go"

import { BackButton } from "./back-button"
import { CloneUrlCopy } from "./clone-url-copy"
import { CountUp } from "@/components/count-up"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getRepositoryDetails } from "@/lib/github"

function StatTile({
  icon,
  label,
  value,
  accent = "primary",
}: {
  icon: ReactNode
  label: string
  value: string | number
  accent?: "primary" | "star" | "warning"
}) {
  const ring =
    accent === "star"
      ? "ring-destructive/20 bg-destructive/[0.06] dark:bg-destructive/12"
      : accent === "warning"
        ? "ring-amber-500/25 bg-amber-500/[0.06] dark:bg-amber-400/10"
        : "ring-primary/20 bg-primary/[0.07] dark:bg-primary/15"

  const iconTone =
    accent === "star"
      ? "text-destructive"
      : accent === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-primary"

  return (
    <div
      className={cn(
        "relative flex min-h-[4.5rem] items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm ring-1 transition-shadow duration-300 hover:shadow-md sm:min-h-[4.75rem] sm:gap-4 sm:p-4",
        ring
      )}
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/80 shadow-inner sm:size-14",
          "[&_svg]:size-6 sm:[&_svg]:size-8",
          iconTone
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">{label}</p>
        <p className="mt-0.5 truncate text-lg font-bold leading-none tabular-nums tracking-tight text-foreground sm:text-xl">
          {typeof value === "number" ? <CountUp end={value} /> : value}
        </p>
      </div>
    </div>
  )
}

type RepositoryDetailViewProps = {
  owner: string
  repo: string
}

export async function RepositoryDetailView({ owner, repo }: RepositoryDetailViewProps) {
  const repository = await getRepositoryDetails(owner, repo)

  if (!repository) {
    notFound()
  }

  const codeRepositoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: repository.full_name,
    description: repository.description ?? undefined,
    url: repository.html_url,
    codeRepository: repository.html_url,
    programmingLanguage: repository.language || undefined,
    author: {
      "@type": "Organization",
      name: repository.owner.login,
      url: `https://github.com/${repository.owner.login}`,
    },
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:gap-10 sm:px-8 sm:py-14">
      <BackButton />

      <Card className="jp-shell gap-0 overflow-hidden py-0">
        <CardHeader className="relative flex flex-col items-center border-0 bg-gradient-to-b from-primary/[0.06] to-transparent px-6 pb-4 pt-10 sm:px-10 sm:pt-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_50%_0%,rgb(30_74_107/0.12),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgb(126_176_212/0.15),transparent_70%)]" aria-hidden />
          <Image
            src={repository.owner.avatar_url}
            alt={`${repository.owner.login} avatar`}
            width={128}
            height={128}
            sizes="(max-width: 640px) 112px, 128px"
            quality={85}
            priority
            className="relative size-28 rounded-full border-[3px] border-background object-cover shadow-xl shadow-black/15 ring-4 ring-primary/15 sm:size-32"
          />
          <CardTitle className="sr-only">{repository.full_name}</CardTitle>
          <CardDescription className="sr-only">リポジトリの詳細情報と統計</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-10 pt-2 sm:px-10">
          <div className="space-y-4">
            <h1 className="flex flex-wrap items-center justify-center gap-x-0 text-balance text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              <a
                href={`https://github.com/${repository.owner.login}`}
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {repository.owner.login}
              </a>
              <span className="mx-0.5 select-none text-muted-foreground" aria-hidden>
                /
              </span>
              <a
                href={repository.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {repository.name}
              </a>
            </h1>
            <p className="mx-auto max-w-prose text-pretty text-center text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
              {repository.description ?? "説明はありません"}
            </p>
          </div>

          <div className="jp-divider opacity-80" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <StatTile icon={<HiGlobeAlt aria-hidden />} label="使用言語" value={repository.language ?? "なし"} />
            <StatTile icon={<HiStar aria-hidden />} label="スター" value={repository.stargazers_count} accent="star" />
            <StatTile icon={<HiEye aria-hidden />} label="ウォッチャー" value={repository.watchers_count} />
            <StatTile icon={<GoRepoForked aria-hidden />} label="フォーク" value={repository.forks_count} />
            <div className="sm:col-span-2">
              <StatTile
                icon={<HiExclamationTriangle aria-hidden />}
                label="オープンイシュー"
                value={repository.open_issues_count}
                accent="warning"
              />
            </div>
          </div>

          <CloneUrlCopy cloneUrl={repository.clone_url} />
        </CardContent>
      </Card>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(codeRepositoryJsonLd) }} />
    </main>
  )
}
