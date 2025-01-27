"use client"

import { Command } from 'cmdk'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownFile } from '@/types/types'

interface SearchResult {
  title: string
  excerpt?: string
}

interface SearchProps {
  files: MarkdownFile[]
}

const CommandMenu = ({ files }: SearchProps) => {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])

    console.log(files)

    // Handle keyboard shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    useEffect(() => {
        if (!search) {
            setResults([])
            return
        }

        // Search through files directly instead of using API
        const searchResults = files
            .filter(file => {
                const lowerSearch = search.toLowerCase()
                return file.name.toLowerCase().includes(lowerSearch)
            })
            .map(file => ({
                title: file.name,
            }))

        setResults(searchResults)
    }, [search, files])

    return (
        <Command label="Command Menu" onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
        }}>
            <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50" style={{ display: open ? 'block' : 'none' }}>
                <div className="max-w-2xl mx-auto mt-20">
                    <Command.Input 
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search markdown files..."
                    />
                    <Command.List className="max-h-[300px] overflow-y-auto bg-white rounded-b-lg border-x border-b border-gray-200">
                        <Command.Empty>No results found.</Command.Empty>

                        {results.length > 0 && (
                            <Command.Group heading="Documents">
                                {results.map((result) => (
                                    <Command.Item
                                        key={result.title}
                                        onSelect={() => {
                                            router.push(result.title)
                                            setOpen(false)
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{result.title}</span>
                                            {result.excerpt && (
                                                <span className="text-sm text-gray-500">{result.excerpt}</span>
                                            )}
                                        </div>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}
                    </Command.List>
                </div>
            </div>
        </Command>
    )
}

export default CommandMenu