'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus } from 'lucide-react'
import { type Subtitle } from '@/types/subtitle'

interface TranscriptionEditorProps {
    subtitles: Subtitle[]
    selectedSubtitle: Subtitle | null
    onSubtitleSelect: (subtitle: Subtitle | null) => void
    onSubtitlesChange: (subtitles: Subtitle[]) => void
    currentTime: number
    activeLayer: number
}

export function TranscriptionEditor({
    subtitles,
    selectedSubtitle,
    onSubtitleSelect,
    onSubtitlesChange,
    currentTime,
    activeLayer,
}: TranscriptionEditorProps) {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-100">Subtitles</h2>
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-zinc-100 hover:bg-zinc-700 hover:text-zinc-100"
                    onClick={() => {
                        const newSubtitle: Subtitle = {
                            id: Math.random().toString(36).substr(2, 9),
                            startTime: currentTime,
                            endTime: currentTime + 2,
                            text: 'New subtitle',
                            layer: activeLayer,
                        }
                        onSubtitlesChange([...subtitles, newSubtitle])
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subtitle
                </Button>
            </div>

            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-2">
                    {subtitles.map(subtitle => (
                        <div
                            key={subtitle.id}
                            className={`rounded-lg border p-3 transition-colors ${selectedSubtitle?.id === subtitle.id
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                                }`}
                            onClick={() => onSubtitleSelect(subtitle)}
                        >
                            <div className="mb-2 flex justify-between text-sm text-zinc-400">
                                <span>{formatTime(subtitle.startTime)} → {formatTime(subtitle.endTime)}</span>
                                <span>Layer {(subtitle.layer ?? 0) + 1}</span>
                            </div>
                            <Textarea
                                value={subtitle.text}
                                onChange={e => {
                                    const updated = subtitles.map(s =>
                                        s.id === subtitle.id ? { ...s, text: e.target.value } : s
                                    )
                                    onSubtitlesChange(updated)
                                }}
                                className="min-h-[60px] border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-blue-500"
                                placeholder="Enter subtitle text..."
                            />
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms
        .toString()
        .padStart(3, '0')}`
}
