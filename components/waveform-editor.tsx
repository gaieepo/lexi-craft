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
    const [activeLayer, setActiveLayer] = useState(0)

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

        // Draw background
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Calculate dimensions
        const timelineHeight = 30
        const layerHeight = (canvas.height - timelineHeight) / 4

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

        // Draw layer backgrounds and separators
        for (let i = 0; i < 4; i++) {
            const y = timelineHeight + i * layerHeight

            // Draw layer background
            ctx.fillStyle = i === activeLayer ? '#2a2a2a' : '#1a1a1a'
            ctx.fillRect(0, y, canvas.width, layerHeight)

            // Draw separator line
            ctx.fillStyle = '#333333'
            ctx.fillRect(0, y, canvas.width, 1)
        }

        // Draw subtitles in their respective layers
        subtitles.forEach(subtitle => {
            const layer = subtitle.layer ?? 0
            const y = timelineHeight + layer * layerHeight

            // Draw subtitle block
            ctx.fillStyle = subtitle.id === selectedSubtitle?.id ? '#3b82f6' : '#2563eb'
            const x = subtitle.startTime * pixelsPerSecond
            const width = (subtitle.endTime - subtitle.startTime) * pixelsPerSecond
            ctx.fillRect(x, y + 2, width, layerHeight - 4)
        })

        // Draw playhead
        ctx.fillStyle = '#ef4444'
        const playheadX = currentTime * pixelsPerSecond
        ctx.fillRect(playheadX, 0, 2, canvas.height)
    }, [currentTime, subtitles, selectedSubtitle, zoom, duration, pixelsPerSecond, totalWidth, activeLayer])

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const clickX = e.clientX - rect.left + scrollPosition
        const clickY = e.clientY - rect.top
        const time = clickX / pixelsPerSecond

        // Calculate which layer was clicked
        const timelineHeight = 30
        const layerHeight = (rect.height - timelineHeight) / 4
        const clickedLayer = Math.floor((clickY - timelineHeight) / layerHeight)

        if (clickedLayer >= 0 && clickedLayer < 4) {
            // Handle double click to set active layer
            if (e.detail === 2) {
                setActiveLayer(clickedLayer)
            }

            // Find subtitle in the clicked layer
            const subtitle = subtitles.find(
                sub =>
                    time >= sub.startTime &&
                    time <= sub.endTime &&
                    (sub.layer ?? 0) === clickedLayer
            )
            onSubtitleSelect(subtitle || null)
        }

        onTimeUpdate(time)
    }

    return (
        <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-zinc-400">
                    Zoom: {zoom.toFixed(1)}x | Active Layer: {activeLayer + 1}
                </div>
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
