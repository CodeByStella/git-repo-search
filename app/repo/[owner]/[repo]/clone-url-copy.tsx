"use client"

import { useState } from "react"
import { HiCheck, HiClipboardDocument } from "react-icons/hi2"

import { Button } from "@/components/ui/button"

type CloneUrlCopyProps = {
  cloneUrl: string
}

export function CloneUrlCopy({ cloneUrl }: CloneUrlCopyProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      // コピー成功時は、短時間だけ完了アイコンを表示して状態を伝える。
      await navigator.clipboard.writeText(cloneUrl)
      setCopied(true)
      window.setTimeout(() => {
        setCopied(false)
      }, 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/30 p-5 shadow-sm ring-1 ring-black/[0.03] dark:from-card dark:to-muted/20 dark:ring-white/[0.05]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">クローン URL</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <code className="block flex-1 break-all rounded-xl border border-border/60 bg-background/80 px-4 py-3 font-mono text-[11px] leading-relaxed text-foreground shadow-inner sm:text-xs">
          {cloneUrl}
        </code>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="h-11 w-full shrink-0 border-border/80 bg-background/80 shadow-sm sm:size-10 sm:w-10"
          onClick={handleCopy}
          aria-label="クローンURLをコピー"
          title="クローンURLをコピー"
        >
          {copied ? <HiCheck className="size-4 text-primary" aria-hidden /> : <HiClipboardDocument className="size-4" aria-hidden />}
        </Button>
      </div>
    </div>
  )
}
