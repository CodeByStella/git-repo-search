"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  HiArrowPath,
  HiArrowsUpDown,
  HiCodeBracket,
  HiExclamationCircle,
  HiMagnifyingGlass,
  HiStar,
} from "react-icons/hi2"
import { SiGithub } from "react-icons/si"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchPagination } from "@/components/search-pagination"
import { type SearchRepositoryItem, useSearchState } from "@/components/search-state-provider"
import { fetchRepositories } from "@/lib/github"

const PER_PAGE = 20
/** GitHub Search API returns at most 1000 results for repository search. */
const GITHUB_SEARCH_RESULT_CAP = 1000
const SORT_OPTIONS = [
  { value: "stars-desc", label: "スターが多い順" },
  { value: "stars-asc", label: "スターが少ない順" },
  { value: "forks-desc", label: "フォークが多い順" },
  { value: "forks-asc", label: "フォークが少ない順" },
  { value: "updated-desc", label: "最近更新された順" },
  { value: "updated-asc", label: "更新が古い順" },
]

export default function Page() {
  const {
    keyword,
    setKeyword,
    activeQuery,
    setActiveQuery,
    activeLanguage,
    setActiveLanguage,
    activeSort,
    setActiveSort,
    items,
    setItems,
    totalCount,
    setTotalCount,
    page,
    setPage,
    hasSearched,
    setHasSearched,
    scrollY,
    setScrollY,
    openedRepoKeys,
    markRepoOpened,
  } = useSearchState()
  const [isSearching, setIsSearching] = useState(false)
  const [isPaging, setIsPaging] = useState(false)
  const [error, setError] = useState("")
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const didRestoreScroll = useRef(false)

  const shownCount = items.length
  const isLoading = isSearching || isPaging
  const openedRepoKeySet = useMemo(() => new Set(openedRepoKeys), [openedRepoKeys])
  const totalPages = useMemo(() => {
    if (totalCount === 0) {
      return 0
    }
    const capped = Math.min(totalCount, GITHUB_SEARCH_RESULT_CAP)
    return Math.ceil(capped / PER_PAGE)
  }, [totalCount])
  const rangeStart = useMemo(() => {
    if (page < 1 || shownCount === 0) {
      return 0
    }
    return (page - 1) * PER_PAGE + 1
  }, [page, shownCount])
  const rangeEnd = useMemo(() => {
    if (page < 1 || shownCount === 0) {
      return 0
    }
    return (page - 1) * PER_PAGE + shownCount
  }, [page, shownCount])
  const languageOptions = useMemo(() => {
    const base = [{ value: "", label: "すべての言語" }]
    const dynamic = availableLanguages.map((language) => ({ value: language, label: language }))
    if (activeLanguage && !availableLanguages.includes(activeLanguage)) {
      dynamic.unshift({ value: activeLanguage, label: activeLanguage })
    }
    return [...base, ...dynamic]
  }, [activeLanguage, availableLanguages])

  // スクロール位置の復元は初回のみ行い、再描画時の巻き戻りを防ぐ。
  useEffect(() => {
    if (!hasSearched || items.length === 0 || didRestoreScroll.current) {
      return
    }

    didRestoreScroll.current = true
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" })
    })
  }, [hasSearched, items.length, scrollY])

  useEffect(() => {
    // スクロール位置を共有状態に保存し、詳細ページから戻った際に復元する。
    function handleScroll() {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [setScrollY])

  const updateRepositories = useCallback(
    async (query: string, nextPage: number) => {
      const data = await fetchRepositories(query, nextPage, PER_PAGE, activeLanguage, activeSort)
      const fetchedItems = data.items as SearchRepositoryItem[]

      if (nextPage === 1 && !activeLanguage) {
        const languageCount = new Map<string, number>()
        for (const repo of fetchedItems) {
          if (!repo.language) {
            continue
          }
          languageCount.set(repo.language, (languageCount.get(repo.language) ?? 0) + 1)
        }
        const sortedLanguages = [...languageCount.entries()]
          .sort((a, b) => {
            if (b[1] !== a[1]) {
              return b[1] - a[1]
            }
            return a[0].localeCompare(b[0])
          })
          .map(([language]) => language)
        setAvailableLanguages(sortedLanguages)
      }

      setTotalCount(data.totalCount)
      setPage(nextPage)
      setItems(fetchedItems)
    },
    [activeLanguage, activeSort, setItems, setPage, setTotalCount]
  )

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = keyword.trim()

    if (!query) {
      setHasSearched(true)
      setActiveQuery("")
      setAvailableLanguages([])
      setItems([])
      setTotalCount(0)
      setPage(0)
      setScrollY(0)
      setError("キーワードを入力してください。")
      return
    }

    setHasSearched(true)
    setActiveQuery(query)
    setError("")
  }

  async function goToPage(nextPage: number) {
    if (!activeQuery || isLoading || totalPages === 0) {
      return
    }
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return
    }

    setError("")
    setIsPaging(true)
    try {
      await updateRepositories(activeQuery, nextPage)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "リポジトリの取得に失敗しました。")
    } finally {
      setIsPaging(false)
    }
  }

  useEffect(() => {
    if (!hasSearched || !activeQuery) {
      return
    }

    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) {
        return
      }
      setError("")
      setPage(1)
      setIsSearching(true)
      void updateRepositories(activeQuery, 1)
        .catch((err) => {
          if (cancelled) {
            return
          }
          setItems([])
          setTotalCount(0)
          setPage(0)
          setError(err instanceof Error ? err.message : "リポジトリの取得に失敗しました。")
        })
        .finally(() => {
          if (cancelled) {
            return
          }
          setIsSearching(false)
        })
    })

    return () => {
      cancelled = true
    }
  }, [activeLanguage, activeSort, activeQuery, hasSearched, setItems, setPage, setTotalCount, updateRepositories])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:gap-12 sm:px-8 sm:py-14">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/[0.07] px-6 py-10 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.18)] ring-1 ring-black/[0.04] sm:px-12 sm:py-14 dark:from-card dark:via-card dark:to-primary/10 dark:ring-white/[0.06]">
        <div
          className="pointer-events-none absolute -right-24 -top-28 size-[22rem] rounded-full bg-primary/[0.18] blur-3xl dark:bg-primary/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-destructive/[0.1] blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl space-y-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/55 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md sm:text-xs">
            <SiGithub className="size-4 text-foreground" aria-hidden />
            <span>GitHub Search</span>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/15">
              <HiMagnifyingGlass className="size-8" aria-hidden />
            </span>
            <h1 className="w-full text-balance text-center text-3xl font-bold tracking-tight text-foreground sm:w-auto sm:text-left sm:text-4xl md:text-5xl">
              GitHubリポジトリ検索
            </h1>
          </div>
          <p className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            キーワードを入力し、リポジトリを選んで詳細へ。言語と並び順で結果をすばやく絞り込めます。
          </p>
        </div>
      </section>

      <Card className="jp-shell gap-5 border-border/65 px-4 py-6 sm:gap-6 sm:px-8 sm:py-8">
        <form className="mx-auto flex w-full max-w-4xl flex-col gap-4" onSubmit={handleSearch}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <Input
              name="keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="例: nextjs, react, spring"
              className="h-12 flex-1 border-border/80 bg-background/80 text-[15px] shadow-inner sm:h-11"
              aria-label="リポジトリ検索キーワード"
            />
            <Button type="submit" className="h-12 min-w-[7.5rem] gap-2 shadow-md shadow-primary/20 sm:h-11" disabled={isLoading}>
              {isSearching ? (
                <HiArrowPath className="size-4 animate-spin" aria-hidden />
              ) : (
                <HiMagnifyingGlass className="size-4" aria-hidden />
              )}
              {isSearching ? "検索中..." : "検索"}
            </Button>
          </div>
          {hasSearched ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <HiCodeBracket className="size-3.5 text-primary" aria-hidden />
                  言語フィルター
                </span>
                <Select value={activeLanguage || "all"} onValueChange={(value) => setActiveLanguage(value === "all" ? "" : value)}>
                  <SelectTrigger aria-label="言語フィルター">
                    <SelectValue placeholder="言語を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value || "all"} value={option.value || "all"}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <HiArrowsUpDown className="size-3.5 text-primary" aria-hidden />
                  並び順
                </span>
                <Select value={activeSort} onValueChange={setActiveSort}>
                  <SelectTrigger aria-label="並び順">
                    <SelectValue placeholder="並び順を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          ) : null}
        </form>
      </Card>

      {!hasSearched ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/90 bg-card/50 px-6 py-14 text-center shadow-inner">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-1 ring-border/80">
            <HiMagnifyingGlass className="size-7" aria-hidden />
          </span>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            キーワードを入力してリポジトリを検索してください。
          </p>
        </div>
      ) : null}

      {hasSearched && error ? (
        <div
          className="flex items-start gap-3 rounded-2xl border border-destructive/35 bg-destructive/10 px-5 py-4 text-sm text-destructive shadow-sm"
          role="alert"
        >
          <HiExclamationCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <span className="leading-relaxed">{error}</span>
        </div>
      ) : null}

      {hasSearched && !error ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-foreground/90">
              <span className="text-muted-foreground">&quot;{activeQuery}&quot;</span>
              <span className="mx-2 text-border">·</span>
              {totalCount.toLocaleString()} 件中{" "}
              {rangeStart > 0 && rangeEnd > 0 ? (
                <>
                  {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} 件を表示
                </>
              ) : (
                <>{shownCount.toLocaleString()} 件を表示</>
              )}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {activeLanguage ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3 py-1 font-medium text-foreground/85">
                  <HiCodeBracket className="size-3.5 text-primary" aria-hidden />
                  {activeLanguage}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3 py-1 font-medium text-foreground/85">
                <HiStar className="size-3.5 text-primary" aria-hidden />
                {SORT_OPTIONS.find((option) => option.value === activeSort)?.label ?? "スターが多い順"}
              </span>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/80 bg-card/70 py-16 text-center">
              {isLoading ? (
                <>
                  <HiArrowPath className="size-8 animate-spin text-primary" aria-hidden />
                  <p className="text-sm text-muted-foreground">リポジトリを読み込み中...</p>
                </>
              ) : (
                <>
                  <HiMagnifyingGlass className="size-8 text-muted-foreground/80" aria-hidden />
                  <p className="text-sm text-muted-foreground">該当するリポジトリが見つかりませんでした。</p>
                </>
              )}
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((repo) => {
                const repoKey = `${repo.owner.login}/${repo.name}`
                const isOpened = openedRepoKeySet.has(repoKey)

                return (
                  <li key={repo.id}>
                    <Card className="group gap-0 overflow-hidden rounded-2xl border border-border/65 bg-card/95 py-0 shadow-sm ring-1 ring-black/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/[0.08] dark:ring-white/[0.04]">
                      <CardHeader className="block px-5 pt-6 pb-5 sm:px-6 sm:pb-6">
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 sm:gap-6">
                          <div className="flex w-[5.25rem] shrink-0 justify-center sm:w-28">
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 to-transparent opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
                              <Image
                                src={repo.owner.avatar_url ?? "https://avatars.githubusercontent.com/u/0?v=4"}
                                alt={`${repo.owner.login} avatar`}
                                width={96}
                                height={96}
                                sizes="(max-width: 640px) 84px, 96px"
                                quality={85}
                                className="relative size-[4.25rem] rounded-full border-2 border-border/70 object-cover shadow-md ring-2 ring-background sm:size-24"
                              />
                            </div>
                          </div>
                          <div className="min-w-0 space-y-2.5">
                            <CardTitle className="text-base leading-snug">
                              <Link
                                href={`/repo/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}`}
                                onClick={() => {
                                  setScrollY(window.scrollY)
                                  markRepoOpened(repoKey)
                                }}
                                className={`block break-words text-[1.05rem] font-semibold tracking-tight text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline ${isOpened ? "text-primary/85" : ""}`}
                              >
                                {repo.full_name}
                              </Link>
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                              {repo.description ?? "説明はありません"}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-5 pb-6 pt-1 sm:px-6">
                        <div className="jp-divider mb-4 opacity-80" />
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full bg-primary/[0.09] px-3.5 py-1.5 text-xs font-medium text-foreground/90 ring-1 ring-primary/15 dark:bg-primary/15">
                            <HiCodeBracket className="size-3.5 shrink-0 text-primary" aria-hidden />
                            {repo.language ?? "言語なし"}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-destructive/[0.08] px-3.5 py-1.5 text-xs font-medium text-foreground/90 ring-1 ring-destructive/15 dark:bg-destructive/15">
                            <HiStar className="size-3.5 shrink-0 text-destructive" aria-hidden />
                            {repo.stargazers_count.toLocaleString()} stars
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}

          {totalPages > 1 ? (
            <SearchPagination
              className="pt-2"
              currentPage={Math.max(1, page)}
              totalPages={totalPages}
              onPageChange={goToPage}
              disabled={isPaging}
            />
          ) : null}
        </section>
      ) : null}
    </main>
  )
}
