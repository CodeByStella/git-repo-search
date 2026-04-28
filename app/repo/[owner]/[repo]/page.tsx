import type { Metadata } from "next"

import { getRepositoryDetails } from "@/lib/github"

import { RepositoryDetailView } from "./repository-detail-view"

type PageProps = {
  params: Promise<{
    owner: string
    repo: string
  }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const routeParams = await props.params
  const owner = decodeURIComponent(routeParams.owner)
  const repoName = decodeURIComponent(routeParams.repo)
  const repository = await getRepositoryDetails(owner, repoName)

  if (!repository) {
    return {
      title: "見つかりません",
      robots: { index: false, follow: false },
    }
  }

  const title = repository.full_name
  const description =
    (repository.description && repository.description.slice(0, 155)) ||
    `${repository.full_name} の GitHub リポジトリ情報（言語、スター、フォーク、イシュー数など）。`
  const canonicalPath = `/repo/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalPath,
      siteName: "Git Repo Search",
      locale: "ja_JP",
      images: repository.owner.avatar_url
        ? [
            {
              url: repository.owner.avatar_url,
              width: 400,
              height: 400,
              alt: `${repository.owner.login} のアバター`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: canonicalPath,
    },
    robots: { index: true, follow: true },
  }
}

export default async function RepositoryDetailPage(props: PageProps) {
  const routeParams = await props.params
  const owner = decodeURIComponent(routeParams.owner)
  const repo = decodeURIComponent(routeParams.repo)
  return <RepositoryDetailView owner={owner} repo={repo} />
}
