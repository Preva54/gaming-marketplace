"use client"

import { useEffect, useRef, useState } from "react"
import { useScroll, useTransform } from "framer-motion"

const FRAME_COUNT = 300 // Number of provided frames

const currentFrame = (index: number) =>
  `/scroll-animation/ezgif-frame-${index.toString().padStart(3, "0")}.jpg`

export default function ScrollAnimation({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, FRAME_COUNT])

  useEffect(() => {
    // Preload images
    const loadedImages: HTMLImageElement[] = []
    
    // Create image objects and set their src to trigger loading
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new window.Image()
      img.src = currentFrame(i)
      // Optional: add load listener if we want to track loading state,
      // but browser will handle caching automatically.
      loadedImages.push(img)
    }
    
    setImages(loadedImages)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || images.length === 0) return

    const context = canvas.getContext("2d")
    if (!context) return

    const render = () => {
      // Get the current frame index
      let index = Math.round(frameIndex.get())
      if (index < 1) index = 1
      if (index > FRAME_COUNT) index = FRAME_COUNT
      
      const img = images[index - 1]
      
      if (img && img.complete && img.naturalWidth > 0) {
        // Draw image covering the canvas (like object-fit: cover)
        const canvasRatio = canvas.width / canvas.height
        const imgRatio = img.width / img.height

        let drawWidth, drawHeight, offsetX, offsetY

        if (canvasRatio > imgRatio) {
          drawWidth = canvas.width
          drawHeight = canvas.width / imgRatio
          offsetX = 0
          offsetY = (canvas.height - drawHeight) / 2
        } else {
          drawHeight = canvas.height
          drawWidth = canvas.height * imgRatio
          offsetX = (canvas.width - drawWidth) / 2
          offsetY = 0
        }

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      } else if (img && !img.complete) {
        // If the current image isn't loaded yet, try to load it and re-render
        img.onload = render
      }
    }

    const handleResize = () => {
      // Setup high DPI canvas if needed, or just standard size
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      render()
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    // Subscribe to framer-motion scroll value changes
    const unsubscribe = frameIndex.on("change", render)

    return () => {
      window.removeEventListener("resize", handleResize)
      unsubscribe()
    }
  }, [images, frameIndex])

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-black">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover" 
        />
        
        {/* Overlay gradient so it blends into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--background)] to-transparent z-10 pointer-events-none" />
        
        <div className="absolute inset-0 flex items-center justify-center z-10">
            {children}
        </div>
      </div>
    </div>
  )
}
