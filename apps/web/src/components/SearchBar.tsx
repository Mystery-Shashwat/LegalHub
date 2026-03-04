"use client"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto flex items-center shadow-lg rounded-lg overflow-hidden border">
      <div className="flex-1 flex items-center bg-background px-4">
        <Search className="w-5 h-5 text-muted-foreground hidden sm:block" />
        <Input 
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base md:text-lg py-4 md:py-6"
            placeholder="Search by specialty, name, or city..."
            onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Button size="lg" className="rounded-none px-4 md:px-8 py-4 md:py-6 h-auto text-base md:text-lg">Search</Button>
    </div>
  )
}
