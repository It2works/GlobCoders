import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  FileText,
  X,
  CheckCircle
} from "lucide-react"

interface FileUploadProps {
  onFileSelect?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
  showProgress?: boolean
}

interface UploadedFile {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  preview?: string
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ 
    onFileSelect, 
    maxFiles = 5, 
    maxSize = 10,
    acceptedTypes = ['image/*', 'video/*', '.pdf', '.doc', '.docx'],
    className,
    showProgress = true,
    ...props 
  }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const getFileIcon = (file: File) => {
      if (file.type.startsWith('image/')) return Image
      if (file.type.startsWith('video/')) return Video
      if (file.type.includes('pdf') || file.type.includes('document')) return FileText
      return File
    }

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const simulateUpload = (file: File) => {
      return new Promise<void>((resolve) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 30
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
            setTimeout(() => {
              setUploadedFiles(prev => 
                prev.map(f => 
                  f.file === file 
                    ? { ...f, progress: 100, status: 'completed' as const }
                    : f
                )
              )
              resolve()
            }, 200)
          } else {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.file === file 
                  ? { ...f, progress: Math.floor(progress) }
                  : f
              )
            )
          }
        }, 100)
      })
    }

    const handleFiles = async (files: FileList) => {
      const fileArray = Array.from(files)
      
      // Validate file count
      if (uploadedFiles.length + fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} fichiers autorisés`)
        return
      }

      // Validate file sizes and types
      const validFiles = fileArray.filter(file => {
        if (file.size > maxSize * 1024 * 1024) {
          alert(`${file.name} est trop volumineux (max ${maxSize}MB)`)
          return false
        }
        
        const isValidType = acceptedTypes.some(type => {
          if (type.includes('/')) {
            return file.type.match(type.replace('*', '.*'))
          }
          return file.name.toLowerCase().endsWith(type)
        })
        
        if (!isValidType) {
          alert(`${file.name} n'est pas un type de fichier autorisé`)
          return false
        }
        
        return true
      })

      if (validFiles.length === 0) return

      // Create file objects with preview for images
      const newFiles: UploadedFile[] = await Promise.all(
        validFiles.map(async (file) => {
          let preview = undefined
          if (file.type.startsWith('image/')) {
            preview = URL.createObjectURL(file)
          }
          
          return {
            file,
            progress: 0,
            status: 'uploading' as const,
            preview
          }
        })
      )

      setUploadedFiles(prev => [...prev, ...newFiles])
      
      // Simulate upload for each file
      if (showProgress) {
        for (const fileObj of newFiles) {
          simulateUpload(fileObj.file)
        }
      } else {
        // Mark as completed immediately if no progress needed
        setUploadedFiles(prev => 
          prev.map(f => 
            newFiles.some(nf => nf.file === f.file)
              ? { ...f, progress: 100, status: 'completed' as const }
              : f
          )
        )
      }

      onFileSelect?.(validFiles)
    }

    const removeFile = (fileToRemove: File) => {
      setUploadedFiles(prev => {
        const updated = prev.filter(f => f.file !== fileToRemove)
        const remainingFiles = updated.map(f => f.file)
        onFileSelect?.(remainingFiles)
        return updated
      })
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Glissez vos fichiers ici ou cliquez pour sélectionner
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Maximum {maxFiles} fichiers, {maxSize}MB chacun
          </p>
          <p className="text-xs text-muted-foreground">
            Types acceptés: {acceptedTypes.join(', ')}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Fichiers téléchargés ({uploadedFiles.length})</h4>
            {uploadedFiles.map((fileObj, index) => {
              const Icon = getFileIcon(fileObj.file)
              
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  {fileObj.preview ? (
                    <img 
                      src={fileObj.preview} 
                      alt="Preview" 
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fileObj.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(fileObj.file.size)}
                    </p>
                    
                    {showProgress && fileObj.status === 'uploading' && (
                      <Progress value={fileObj.progress} className="mt-2" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {fileObj.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileObj.file)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"

export { FileUpload }