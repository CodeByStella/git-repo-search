import * as React from "react"
import { HiCheck, HiChevronDown } from "react-icons/hi2"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-xl border border-input/90 bg-card/90 px-3 text-sm text-foreground shadow-sm transition-colors duration-250 outline-none focus-visible:border-primary/70 focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <HiChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  side = "bottom",
  align = "start",
  sideOffset = 4,
  collisionPadding = { top: 12, right: 8, bottom: 4, left: 8 },
  sticky = "always",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        side={position === "popper" ? side : undefined}
        align={position === "popper" ? align : undefined}
        sideOffset={position === "popper" ? sideOffset : undefined}
        collisionPadding={position === "popper" ? collisionPadding : undefined}
        sticky={position === "popper" ? sticky : undefined}
        className={cn(
          "relative z-50 max-h-80 overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg shadow-black/5 ring-1 ring-black/[0.04] dark:shadow-black/30 dark:ring-white/[0.06]",
          // popper: 下方向を優先（side=bottom）。下端付近だけ flip で上に逃がす。幅はトリガーに一致
          position === "popper" &&
            "w-[var(--radix-popper-anchor-width)] min-w-[var(--radix-popper-anchor-width)] max-w-[var(--radix-popper-anchor-width)]",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center rounded-sm py-2 pr-8 pl-2 text-sm outline-none select-none focus:bg-muted/75",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <HiCheck className="size-3.5 shrink-0" aria-hidden />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
