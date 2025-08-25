import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  FileText
} from "lucide-react"

interface PDFViewerProps {
  src: string
  title?: string
  className?: string
  onPageChange?: (page: number) => void
}

const PDFViewer = ({ src, title, className, onPageChange }: PDFViewerProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState<{ page: number; title: string }[]>([])
  
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Simulate PDF loading
    const timer = setTimeout(() => {
      setIsLoading(false)
      setTotalPages(25) // Mock total pages
    }, 1500)

    return () => clearTimeout(timer)
  }, [src])

  useEffect(() => {
    onPageChange?.(currentPage)
  }, [currentPage, onPageChange])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prev => {
      const newScale = direction === 'in' ? prev * 1.2 : prev / 1.2
      return Math.max(0.5, Math.min(3, newScale))
    })
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const addBookmark = () => {
    const title = prompt("Nom du signet:") || `Page ${currentPage}`
    setBookmarks(prev => [...prev, { page: currentPage, title }])
  }

  const downloadPDF = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = title || 'document.pdf'
    link.click()
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du PDF...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className} ref={containerRef}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {title || "Document PDF"}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Page {currentPage} sur {totalPages}
            </Badge>
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            {/* Navigation */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={currentPage}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="w-20 text-center"
              min={1}
              max={totalPages}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom('out')}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom('in')}
              disabled={scale >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
            
            <Button variant="outline" size="sm" onClick={addBookmark}>
              <BookOpen className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-[600px]">
          {/* Sidebar with bookmarks */}
          <div className="hidden lg:block border-r">
            <div className="p-4">
              <h4 className="font-medium mb-3">Signets</h4>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {bookmarks.map((bookmark, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg hover:bg-muted cursor-pointer text-sm"
                      onClick={() => handlePageChange(bookmark.page)}
                    >
                      <div className="font-medium">{bookmark.title}</div>
                      <div className="text-xs text-muted-foreground">Page {bookmark.page}</div>
                    </div>
                  ))}
                  
                  {bookmarks.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucun signet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="lg:col-span-3 bg-muted/30 flex items-center justify-center">
            <div 
              className="bg-white shadow-lg overflow-hidden"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease'
              }}
            >
              {/* PDF Preview - In a real implementation, you'd use a PDF.js viewer */}
              <div className="w-[595px] h-[842px] bg-white border border-gray-200 p-8 relative">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {title || "Document PDF"}
                  </h1>
                  <div className="w-16 h-1 bg-primary mx-auto"></div>
                </div>
                
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg font-semibold">Page {currentPage}</p>
                  
                  <div className="space-y-3 text-sm leading-relaxed">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                    
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse 
                      cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat 
                      cupidatat non proident, sunt in culpa qui officia deserunt mollit.
                    </p>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Point Important</h3>
                      <p>
                        Cette section contient des informations importantes 
                        relatives au cours de programmation.
                      </p>
                    </div>
                    
                    <p>
                      Sed ut perspiciatis unde omnis iste natus error sit voluptatem 
                      accusantium doloremque laudantium, totam rem aperiam, eaque ipsa 
                      quae ab illo inventore veritatis et quasi architecto beatae.
                    </p>
                  </div>
                </div>
                
                {/* Page number */}
                <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                  {currentPage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { PDFViewer }