import * as React from "react"

import { textarea as textareaClass } from "@/lib/ui"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaClass, className)}
      {...props}
    />
  )
}

export { Textarea }
