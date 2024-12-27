import React, { useRef, useEffect, useState } from 'react'

interface ScrollbarProps {
    contentWidth: number
    viewportWidth: number
    scrollPosition: number
    onScroll: (newPosition: number) => void
}

export function Scrollbar({ contentWidth, viewportWidth, scrollPosition, onScroll }: ScrollbarProps) {
    const scrollbarRef = useRef<HTMLDivElement>(null)
    const thumbRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startScrollLeft, setStartScrollLeft] = useState(0)

    const thumbWidth = Math.max(20, (viewportWidth / contentWidth) * viewportWidth)
    const maxScroll = contentWidth - viewportWidth

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return
            e.preventDefault()
            const deltaX = e.clientX - startX
            const newScrollLeft = Math.min(
                Math.max(0, startScrollLeft + (deltaX / viewportWidth) * contentWidth),
                maxScroll
            )
            onScroll(newScrollLeft)
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, startX, startScrollLeft, viewportWidth, contentWidth, maxScroll, onScroll])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === thumbRef.current) {
            setIsDragging(true)
            setStartX(e.clientX)
            setStartScrollLeft(scrollPosition)
        } else if (scrollbarRef.current) {
            const clickPosition = e.clientX - scrollbarRef.current.getBoundingClientRect().left
            const scrollPercentage = clickPosition / viewportWidth
            const newScrollLeft = scrollPercentage * maxScroll
            onScroll(Math.min(Math.max(0, newScrollLeft), maxScroll))
        }
    }

    return (
        <div
            ref={scrollbarRef}
            className="h-4 w-full bg-zinc-700"
            onMouseDown={handleMouseDown}
        >
            <div
                ref={thumbRef}
                className="h-full bg-zinc-500 hover:bg-zinc-400 cursor-pointer"
                style={{
                    width: `${thumbWidth}px`,
                    transform: `translateX(${(scrollPosition / maxScroll) * (viewportWidth - thumbWidth)}px)`,
                }}
            />
        </div>
    )
}
