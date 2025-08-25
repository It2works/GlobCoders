import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image,
  Link,
  Undo,
  Redo
} from "lucide-react"

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value = "", onChange, placeholder, className, ...props }, ref) => {
    const editorRef = React.useRef<HTMLDivElement>(null)
    const [isEditorFocused, setIsEditorFocused] = React.useState(false)

    const handleCommand = (command: string, value?: string) => {
      document.execCommand(command, false, value)
      editorRef.current?.focus()
      updateContent()
    }

    const updateContent = () => {
      if (editorRef.current && onChange) {
        onChange(editorRef.current.innerHTML)
      }
    }

    const toolbarButtons = [
      { command: 'bold', icon: Bold, title: 'Gras' },
      { command: 'italic', icon: Italic, title: 'Italique' },
      { command: 'underline', icon: Underline, title: 'Souligné' },
      null, // separator
      { command: 'insertUnorderedList', icon: List, title: 'Liste à puces' },
      { command: 'insertOrderedList', icon: ListOrdered, title: 'Liste numérotée' },
      { command: 'formatBlock', value: 'blockquote', icon: Quote, title: 'Citation' },
      null, // separator
      { command: 'formatBlock', value: 'pre', icon: Code, title: 'Code' },
      { command: 'insertImage', icon: Image, title: 'Image' },
      { command: 'createLink', icon: Link, title: 'Lien' },
      null, // separator
      { command: 'undo', icon: Undo, title: 'Annuler' },
      { command: 'redo', icon: Redo, title: 'Rétablir' },
    ]

    const handleImageInsert = () => {
      const url = prompt('URL de l\'image:')
      if (url) {
        handleCommand('insertImage', url)
      }
    }

    const handleLinkInsert = () => {
      const url = prompt('URL du lien:')
      if (url) {
        handleCommand('createLink', url)
      }
    }

    React.useEffect(() => {
      if (editorRef.current && value !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = value
      }
    }, [value])

    return (
      <div className={cn("border rounded-md", className)} {...props}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
          {toolbarButtons.map((button, index) => {
            if (button === null) {
              return <Separator key={index} orientation="vertical" className="h-6 mx-1" />
            }

            const Icon = button.icon
            const handleClick = () => {
              if (button.command === 'insertImage') {
                handleImageInsert()
              } else if (button.command === 'createLink') {
                handleLinkInsert()
              } else {
                handleCommand(button.command, button.value)
              }
            }

            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={handleClick}
                title={button.title}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            )
          })}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          className={cn(
            "min-h-[200px] p-3 focus:outline-none prose prose-sm max-w-none",
            !value && !isEditorFocused && "text-muted-foreground"
          )}
          onInput={updateContent}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          suppressContentEditableWarning
        >
          {!value && !isEditorFocused && (
            <span className="text-muted-foreground pointer-events-none">
              {placeholder || "Commencez à écrire..."}
            </span>
          )}
        </div>
      </div>
    )
  }
)

RichTextEditor.displayName = "RichTextEditor"

export { RichTextEditor }