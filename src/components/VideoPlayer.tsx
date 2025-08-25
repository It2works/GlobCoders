import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  Share2
} from "lucide-react"

interface VideoPlayerProps {
  src: string
  title?: string
  poster?: string
  subtitles?: { src: string; language: string; label: string }[]
  className?: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

const VideoPlayer = ({ 
  src, 
  title, 
  poster, 
  subtitles = [], 
  className,
  onProgress,
  onComplete 
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState("auto")
  const [isBuffering, setIsBuffering] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      onComplete?.()
    }
    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)
    const handleProgress = () => {
      if (duration > 0) {
        const progress = (video.currentTime / duration) * 100
        onProgress?.(progress)
      }
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('timeupdate', handleProgress)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('timeupdate', handleProgress)
    }
  }, [duration, onProgress, onComplete])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 relative">
        {title && (
          <div className="absolute top-4 left-4 z-20">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {title}
            </Badge>
          </div>
        )}

        <div 
          className="relative group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="w-full aspect-video bg-black"
            onClick={togglePlay}
          >
            {subtitles.map((subtitle, index) => (
              <track
                key={index}
                kind="subtitles"
                src={subtitle.src}
                srcLang={subtitle.language}
                label={subtitle.label}
              />
            ))}
          </video>

          {/* Loading Spinner */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Play Button Overlay */}
          {!isPlaying && !isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={togglePlay}
                className="bg-black/70 text-white hover:bg-black/80 rounded-full w-16 h-16"
              >
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>
          )}

          {/* Controls */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(-10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Playback Speed */}
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(Number(e.target.value))}
                  className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/20"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { VideoPlayer }