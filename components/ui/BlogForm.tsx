"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function BlogForm({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState("")

  return (
    <div className="flex gap-2 w-full">
      <Input
        placeholder="Enter blog URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button onClick={() => onSubmit(url)}>Summarise</Button>
    </div>
  )
}
