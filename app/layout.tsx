import type { Metadata, Viewport } from "next"
import { Geist_Mono, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google"

import "./globals.css"
import { SearchStateProvider } from "@/components/search-state-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { getSiteUrl } from "@/lib/site"

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GitHubリポジトリ検索 | Git Repo Search",
    template: "%s | Git Repo Search",
  },
  description:
    "GitHub のリポジトリをキーワード検索。言語フィルター・並び替え・ページネーションで素早く目的のリポジトリを見つけ、詳細ページでスターやフォーク数などを確認できます。",
  applicationName: "Git Repo Search",
  keywords: ["GitHub", "リポジトリ検索", "オープンソース", "Git", "repository search", "GitHub API"],
  authors: [{ name: "Git Repo Search" }],
  creator: "Git Repo Search",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "Git Repo Search",
    title: "GitHubリポジトリ検索 | Git Repo Search",
    description:
      "GitHub のリポジトリをキーワードで検索し、言語・並び順で絞り込み。一覧から詳細へスムーズに遷移できます。",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHubリポジトリ検索 | Git Repo Search",
    description:
      "GitHub のリポジトリをキーワードで検索し、言語・並び順で絞り込み。一覧から詳細へスムーズに遷移できます。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2ede6" },
    { media: "(prefers-color-scheme: dark)", color: "#121418" },
  ],
}

const notoSans = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-sans" })
const notoSerif = Noto_Serif_JP({ subsets: ["latin"], variable: "--font-serif" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Git Repo Search",
  alternateName: "GitHubリポジトリ検索",
  description:
    "GitHub のリポジトリをキーワード検索。言語フィルター・並び替えで素早く目的のリポジトリを見つけられます。",
  url: siteUrl,
  inLanguage: "ja",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", notoSans.variable, notoSerif.variable)}
    >
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ThemeProvider>
          <SearchStateProvider>{children}</SearchStateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
