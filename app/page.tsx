'use client'

import { VideoPlayer } from '@/components/video-player'
import { WaveformEditor } from '@/components/waveform-editor'
import { TranscriptionEditor } from '@/components/transcription-editor'
import { useState } from 'react'
import { type Subtitle } from '@/types/subtitle'

export default function SubtitleEditor() {
  const [currentTime, setCurrentTime] = useState(0)
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [selectedSubtitle, setSelectedSubtitle] = useState<Subtitle | null>(null)

  return (
    <div className="flex h-screen flex-col bg-zinc-900">
      <main className="flex flex-1 flex-col gap-0.5">
        {/* Top section: Video and Transcription */}
        <div className="flex flex-1 gap-0.5">
          {/* Left side: Video Player */}
          <div className="w-[50%] bg-zinc-800 p-4">
            <VideoPlayer
              src="demo.mp4"
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              subtitles={subtitles}
            />
          </div>

          {/* Right side: Transcription */}
          <div className="w-[50%] bg-zinc-800 p-4">
            <TranscriptionEditor
              subtitles={subtitles}
              selectedSubtitle={selectedSubtitle}
              onSubtitleSelect={setSelectedSubtitle}
              onSubtitlesChange={setSubtitles}
            />
          </div>
        </div>

        {/* Bottom section: Waveform */}
        <div className="h-[30%] bg-zinc-800 p-4">
          <WaveformEditor
            currentTime={currentTime}
            subtitles={subtitles}
            selectedSubtitle={selectedSubtitle}
            onSubtitleSelect={setSelectedSubtitle}
            onSubtitlesChange={setSubtitles}
          />
        </div>
      </main>
    </div>
  )
}
