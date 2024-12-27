'use client'

import { useRef, useEffect, useState } from 'react'
import { type Subtitle } from '@/types/subtitle'
import { Slider } from '@/components/ui/slider'

interface WaveformEditorProps {
    currentTime: number
    subtitles: Subtitle[]
    selectedSubtitle: Subtitle | null
    onSubtitleSelect: (subtitle: Subtitle | null) => void
    onSubtitlesChange: (subtitles: Subtitle[]) => void
    duration: number
    onTimeUpdate: (time: number) => void
}

export function WaveformEditor({
    currentTime,
    subtitles,
    selectedSubtitle,
    onSubtitleSelect,
    onSubtitlesChange,
    duration,
    onTimeUpdate,
}: WaveformEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [zoom, setZoom] = useState(1)
    const [scrollPosition, setScrollPosition] = useState(0)

    const pixelsPerSecond = 100 * zoom
    const totalWidth = duration * pixelsPerSecond
    const viewportWidth = containerRef.current?.clientWidth || 0

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        canvas.width = totalWidth
        canvas.height = containerRef.current.clientHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw timeline
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw time ruler
        ctx.fillStyle = '#ffffff'
        ctx.font = '10px Arial'
        for (let i = 0; i <= duration; i++) {
            const x = i * pixelsPerSecond
            ctx.fillRect(x, 0, 1, 10)
            if (i % 5 === 0) {
                ctx.fillRect(x, 0, 1, 15)
                ctx.fillText(formatTime(i), x + 2, 25)
            }
        }

        // Draw subtitles
        subtitles.forEach(subtitle => {
            ctx.fillStyle = subtitle.id === selectedSubtitle?.id ? '#3b82f6' : '#2563eb'
            const x = subtitle.startTime * pixelsPerSecond
            const width = (subtitle.endTime - subtitle.startTime) * pixelsPerSecond
            ctx.fillRect(x, 30, width, canvas.height - 60)
        })

        // Draw playhead
        ctx.fillStyle = '#ef4444'
        const playheadX = currentTime * pixelsPerSecond
        ctx.fillRect(playheadX, 0, 2, canvas.height)
    }, [currentTime, subtitles, selectedSubtitle, zoom, duration, pixelsPerSecond, totalWidth])

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        const clickX = e.clientX - rect.left + scrollPosition
        const time = clickX / pixelsPerSecond
        onTimeUpdate(time)

        const subtitle = subtitles.find(
            sub => time >= sub.startTime && time <= sub.endTime
        )
        onSubtitleSelect(subtitle || null)
    }

    return (
        <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-zinc-400">Zoom: {zoom.toFixed(1)}x</div>
                <Slider
                    className="w-48"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={[zoom]}
                    onValueChange={([value]) => setZoom(value)}
                />
            </div>
            <div ref={containerRef} className="relative flex-1 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute left-0 top-0 h-full"
                    style={{
                        transform: `translateX(${-scrollPosition}px)`,
                    }}
                    onClick={handleCanvasClick}
                />
            </div>
            <Slider
                className="mt-2"
                min={0}
                max={Math.max(0, totalWidth - viewportWidth)}
                step={1}
                value={[scrollPosition]}
                onValueChange={([value]) => setScrollPosition(value)}
            />
        </div>
    )
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}
