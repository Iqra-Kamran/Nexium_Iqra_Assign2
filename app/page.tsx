'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string[]>([])
  const [urdu, setUrdu] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")

  const handleSubmit = async () => {
    if (!url) return alert("Please enter a blog URL.")
    setLoading(true)
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      // Extract structured data (fallback to plain summary if needed)
      setTitle(data.title || "Untitled Blog")
      setAuthor(data.author || "Unknown Author")

     console.log("📦 English raw summary:", data.english);
console.log("📦 Urdu raw summary:", data.urdu);

setSummary(
  Array.isArray(data.english)
    ? data.english.map((pt: string) =>
        typeof pt === "string" ? pt.trim() : String(pt)
      )
    : typeof data.english === "string"
    ? data.english
        .split(/[\n••·-]+/)
        .map((pt: string) => (typeof pt === "string" ? pt.trim() : String(pt)))
        .filter((pt: string ) => pt.length > 0)
    : []
);

setUrdu(
  Array.isArray(data.urdu)
    ? data.urdu.map((pt: string) =>
        typeof pt === "string" ? pt.trim() : String(pt)
      )
    : typeof data.urdu === "string"
    ? data.urdu
        .split(/[\n••·-]+/)
        .map((pt: string) => (typeof pt === "string" ? pt.trim() : String(pt)))
        .filter((pt: string ) => pt.length > 0)
    : []
);



    } catch (err) {
      console.error("❌ Unexpected error:", err)
      alert("Something went wrong. Check the console.")
    } finally {
      setLoading(false)
    }
  }

  return (
<div className="min-h-screen w-full bg-cover bg-center bg-no-repeat text-white relative overflow-hidden bg-[url('/image.jpg')]">
      
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* App Title */}
     <div className="text-center space-y-2">
  <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight">
    <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 drop-shadow-sm">
      Summora
    </span>
  </h1>
  <p className="text-lg md:text-xl text-white/80 font-medium tracking-wide">
    Your go-to blog summarizer
  </p>
</div>




        {/* URL Input */}
     <div className="flex items-center justify-center w-full max-w-2xl mx-auto gap-2">
        <Input
          className="w-full max-w-md text-white placeholder:text-white bg-white/10 border-white focus:border-white focus:ring-white rounded-md"  placeholder="Enter blog URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <Button
          className="whitespace-nowrap"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Summarizing..." : "Summarize"}
        </Button>
      </div>


        {/* Display summary only when data is available */}
        {(summary.length > 0 || urdu.length > 0) && (
          <Card className="bg-white/20 backdrop-blur-md text-white">
            <CardContent className="p-6 space-y-6">
              {/* Metadata */}
              <div className="space-y-1">
                <p className="text-lg font-semibold">{title}</p>
                <p className="text-sm">✍️ {author}</p>
              </div>

              {/* Side-by-side summaries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-bold text-xl underline mb-2">English Summary</p>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div dir="rtl">
                  <p className="font-bold text-xl underline mb-2">خلاصہ (اردو)</p>
                  <ul className="list-disc list-inside space-y-1">
                    {urdu.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
