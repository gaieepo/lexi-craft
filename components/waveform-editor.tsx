'use client'

import { useRef, useEffect } from 'react'
import { type Subtitle } from '@/types/subtitle'

interface WaveformEditorProps {
    currentTime: number
    subtitles: Subtitle[]
    selectedSubtitle: Subtitle | null
    onSubtitleSelect: (subtitle: Subtitle | null) => void
    onSubtitlesChange: (subtitles: Subtitle[]) => void
}

export function WaveformEditor({
    currentTime,
    subtitles,
    selectedSubtitle,
    onSubtitleSelect,
    onSubtitlesChange,
}: WaveformEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        canvas.width = containerRef.current.clientWidth
        canvas.height = containerRef.current.clientHeight
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        // Remove the devicePixelRatio scaling since we're using CSS for responsive sizing
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw subtitles
        subtitles.forEach(subtitle => {
            ctx.fillStyle = subtitle.id === selectedSubtitle?.id ? '#3b82f6' : '#2563eb'
            // Convert time to x position (assuming 100px = 1 second)
            const x = subtitle.startTime * 100
            const width = (subtitle.endTime - subtitle.startTime) * 100
            ctx.fillRect(x, 20, width, canvas.height - 40)
        })

        // Draw playhead
        ctx.fillStyle = '#ef4444'
        const playheadX = currentTime * 100
        ctx.fillRect(playheadX, 0, 2, canvas.height)
    }, [currentTime, subtitles, selectedSubtitle])

    return (
        <div className="flex h-full flex-col gap-2">
            <div ref={containerRef} className="relative flex-1">
                <canvas
                    ref={canvasRef}
                    className="absolute left-0 top-0 h-full w-full"
                    onClick={e => {
                        const rect = canvasRef.current?.getBoundingClientRect()
                        if (!rect) return
                        const time = (e.clientX - rect.left) / 100
                        const subtitle = subtitles.find(
                            sub => time >= sub.startTime && time <= sub.endTime
                        )
                        onSubtitleSelect(subtitle || null)
                    }}
                />
            </div>
        </div>
    )
}
