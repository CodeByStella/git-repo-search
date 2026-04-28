"use client"

import { HiChevronLeft, HiChevronRight } from "react-icons/hi2"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SearchPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
  className?: string
}

function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 1) {
    return []
  }
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "ellipsis")[] = []
  const windowSize = 1
  const left = Math.max(2, current - windowSize)
  const right = Math.min(total - 1, current + windowSize)

  pages.push(1)
  if (left > 2) {
    pages.push("ellipsis")
  }
  for (let i = left; i <= right; i++) {
    pages.push(i)
  }
  if (right < total - 1) {
    pages.push("ellipsis")
  }
  pages.push(total)
  return pages
}

export function SearchPagination({ currentPage, totalPages, onPageChange, disabled, className }: SearchPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const list = buildPageList(currentPage, totalPages)
  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  return (
    <nav aria-label="検索結果のページ" className={cn("flex flex-col items-center gap-3 sm:flex-row sm:justify-center", className)}>
      <div className="flex flex-wrap items-center justify-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="size-9 shrink-0 sm:size-10"
          disabled={disabled || !canPrev}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="前のページ"
        >
          <HiChevronLeft className="size-4" aria-hidden />
        </Button>

        {list.map((entry, index) =>
          entry === "ellipsis" ? (
            <span key={`e-${index}`} className="flex size-9 items-center justify-center text-muted-foreground" aria-hidden>
              …
            </span>
          ) : (
            <Button
              key={entry}
              type="button"
              variant={entry === currentPage ? "default" : "outline"}
              size="sm"
              className="h-9 min-w-9 shrink-0 px-2 font-semibold tabular-nums sm:h-10 sm:min-w-10"
              disabled={disabled}
              onClick={() => onPageChange(entry)}
              aria-label={`${entry} ページ目`}
              aria-current={entry === currentPage ? "page" : undefined}
            >
              {entry}
            </Button>
          )
        )}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="size-9 shrink-0 sm:size-10"
          disabled={disabled || !canNext}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="次のページ"
        >
          <HiChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
      <p className="text-xs tabular-nums text-muted-foreground sm:pl-2">
        {currentPage} / {totalPages} ページ
      </p>
    </nav>
  )
}
