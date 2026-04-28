"use client"

import { useRouter } from "next/navigation"
import { HiArrowLeft } from "react-icons/hi2"

import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push("/")
  }

  return (
    <Button
      variant="ghost"
      className="h-10 w-fit gap-2 rounded-full border border-transparent px-4 text-foreground/90 hover:border-border/80 hover:bg-muted/60"
      onClick={handleBack}
    >
      <HiArrowLeft className="size-4 shrink-0" aria-hidden />
      検索結果に戻る
    </Button>
  )
}
