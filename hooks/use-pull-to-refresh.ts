"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function usePullToRefresh() {
    const router = useRouter()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [startY, setStartY] = useState(0)
    const [pullDistance, setPullDistance] = useState(0)

    useEffect(() => {
        let touchStartY = 0

        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                touchStartY = e.touches[0].clientY
                setStartY(touchStartY)
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (window.scrollY === 0 && touchStartY > 0) {
                const currentY = e.touches[0].clientY
                const pull = currentY - touchStartY

                if (pull > 0 && pull < 150) {
                    setPullDistance(pull)
                }
            }
        }

        const handleTouchEnd = () => {
            if (pullDistance > 80) {
                setIsRefreshing(true)
                router.refresh()
                setTimeout(() => {
                    setIsRefreshing(false)
                    setPullDistance(0)
                }, 1000)
            } else {
                setPullDistance(0)
            }
            setStartY(0)
        }

        window.addEventListener('touchstart', handleTouchStart)
        window.addEventListener('touchmove', handleTouchMove)
        window.addEventListener('touchend', handleTouchEnd)

        return () => {
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchend', handleTouchEnd)
        }
    }, [pullDistance, router])

    return { isRefreshing, pullDistance }
}
