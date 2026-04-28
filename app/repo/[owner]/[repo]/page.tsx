import Image from "next/image"
import { notFound } from "next/navigation"
import { Eye, GitFork, Globe, Star, TriangleAlert } from "lucide-react"

import { BackButton } from "./back-button"
import { CloneUrlCopy } from "./clone-url-copy"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRepositoryDetails } from "@/lib/github"

type PageProps = {
  params: Promise<{
    owner: string
    repo: string
  }>
}

export default async function RepositoryDetailPage({ params }: PageProps) {
  const routeParams = await params
  const owner = decodeURIComponent(routeParams.owner)
  const repo = decodeURIComponent(routeParams.repo)
  const repository = await getRepositoryDetails(owner, repo)

  if (!repository) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-14">
      <BackButton />

      <Card className="jp-shell gap-0 py-0">
        <CardHeader className="flex flex-col items-center border-0 px-6 pb-2 pt-8 sm:px-8 sm:pt-10">
          <Image
            src={repository.owner.avatar_url}
            alt={`${repository.owner.login} avatar`}
            width={128}
            height={128}
            sizes="(max-width: 640px) 112px, 128px"
            quality={85}
            priority
            className="size-28 rounded-full border-2 border-border/80 object-cover shadow-md ring-4 ring-muted/25 sm:size-32"
          />
          <CardTitle className="sr-only">{repository.full_name}</CardTitle>
          <CardDescription className="sr-only">リポジトリの詳細情報と統計</CardDescription>
        </CardHeader>
        <CardContent className="space-y-7 px-6 pb-8 pt-2 sm:px-8">
          <div className="space-y-4">
            <h1 className="flex flex-wrap items-center justify-center gap-x-0 text-balance text-center text-xl font-semibold tracking-wide sm:text-2xl">
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

          <div className="jp-divider" />

          <div className="grid gap-3 text-sm grid-cols-2">
            <div className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="text-muted-foreground flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                使用言語
              </p>
              <p className="mt-1.5 text-base font-medium">{repository.language ?? "なし"}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="text-muted-foreground flex items-center gap-2">
                <Star className="size-4 text-[#b23a48]" />
                スター
              </p>
              <p className="mt-1.5 text-base font-medium">{repository.stargazers_count.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="text-muted-foreground flex items-center gap-2">
                <Eye className="size-4 text-primary" />
                ウォッチャー
              </p>
              <p className="mt-1.5 text-base font-medium">{repository.watchers_count.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="text-muted-foreground flex items-center gap-2">
                <GitFork className="size-4 text-primary" />
                フォーク
              </p>
              <p className="mt-1.5 text-base font-medium">{repository.forks_count.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/35 p-4 col-span-2">
              <p className="text-muted-foreground flex items-center gap-2">
                <TriangleAlert className="size-4 text-[#b23a48]" />
                オープンイシュー
              </p>
              <p className="mt-1.5 text-base font-medium">{repository.open_issues_count.toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <CloneUrlCopy cloneUrl={repository.clone_url} />
            </div>
          </div>

        </CardContent>
      </Card>
    </main>
  )
}
