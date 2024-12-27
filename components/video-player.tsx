'use client'

import { Button } from '@/components/ui/button'
import { FastForward, Pause, Play, Rewind } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { type Subtitle } from '@/types/subtitle'

interface VideoPlayerProps {
    src: string
    currentTime: number
    onTimeUpdate: (time: number) => void
    onDurationChange: (duration: number) => void
    subtitles: Subtitle[]
}

export function VideoPlayer({ src, currentTime, onTimeUpdate, onDurationChange, subtitles }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
            videoRef.current.currentTime = currentTime
        }
    }, [currentTime])

    const currentSubtitle = subtitles.find(
        sub => currentTime >= sub.startTime && currentTime <= sub.endTime
    )

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <video
                ref={videoRef}
                src={src}
                className="h-full w-full"
                onTimeUpdate={e => onTimeUpdate(e.currentTarget.currentTime)}
                onLoadedMetadata={e => onDurationChange(e.currentTarget.duration)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                {currentSubtitle && (
                    <div className="mb-4 text-center text-lg font-medium text-white">
                        {currentSubtitle.text}
                    </div>
                )}

                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-white hover:bg-white/20"
                        onClick={() => {
                            if (videoRef.current) {
                                videoRef.current.currentTime -= 5
                            }
                        }}
                    >
                        <Rewind className="h-6 w-6" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 text-white hover:bg-white/20"
                        onClick={() => {
                            isPlaying ? videoRef.current?.pause() : videoRef.current?.play()
                        }}
                    >
                        {isPlaying ? (
                            <Pause className="h-8 w-8" />
                        ) : (
                            <Play className="h-8 w-8" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-white hover:bg-white/20"
                        onClick={() => {
                            if (videoRef.current) {
                                videoRef.current.currentTime += 5
                            }
                        }}
                    >
                        <FastForward className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
