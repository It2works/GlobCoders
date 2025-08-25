import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  X,
  Clock,
  Download,
  FileText,
  AlertTriangle,
  Users,
  BookOpen
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BulkOperationsProps {
  items: any[]
  itemType: "courses" | "users" | "sessions" | "payments"
  onBulkAction: (action: string, selectedIds: number[]) => void
  className?: string
}

const BulkOperations = ({ items, itemType, onBulkAction, className }: BulkOperationsProps) => {
  const { toast } = useToast()
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const selectAll = () => {
    const safeItems = Array.isArray(items) ? items : [];
    if (selectedItems.length === safeItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(safeItems.map(item => item.id))
    }
  }

  const toggleItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: "Aucun élément sélectionné",
        description: "Veuillez sélectionner au moins un élément",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      await onBulkAction(action, selectedItems)
      toast({
        title: "Action terminée",
        description: `${selectedItems.length} élément(s) ${action === 'approve' ? 'approuvé(s)' :
          action === 'reject' ? 'rejeté(s)' :
            action === 'delete' ? 'supprimé(s)' : 'traité(s)'}`
      })
      setSelectedItems([])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const exportSelected = () => {
    const safeItems = Array.isArray(items) ? items : [];
    const selectedData = safeItems.filter(item => selectedItems.includes(item.id))
    const csvContent = "data:text/csv;charset=utf-8," +
      Object.keys(selectedData[0] || {}).join(",") + "\n" +
      selectedData.map(row => Object.values(row).join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${itemType}_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export terminé",
      description: `${selectedItems.length} élément(s) exporté(s) en CSV`
    })
  }

  const getItemIcon = () => {
    switch (itemType) {
      case "courses": return BookOpen
      case "users": return Users
      case "sessions": return Clock
      case "payments": return FileText
      default: return FileText
    }
  }

  const ItemIcon = getItemIcon()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "En attente":
        return <Badge variant="outline" className="border-warning text-warning">En attente</Badge>
      case "approved":
      case "Approuvé":
        return <Badge variant="secondary" className="bg-success/10 text-success">Approuvé</Badge>
      case "rejected":
      case "Rejeté":
        return <Badge variant="destructive">Rejeté</Badge>
      case "active":
      case "Actif":
        return <Badge variant="secondary" className="bg-success/10 text-success">Actif</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ItemIcon className="h-5 w-5 text-primary" />
              Opérations en Lot ({selectedItems.length} sélectionné(s))
            </CardTitle>

            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportSelected}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>

                {(itemType === "courses" || itemType === "users") && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleBulkAction("approve")}
                      disabled={isProcessing}
                      className="bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver ({selectedItems.length})
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkAction("reject")}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeter ({selectedItems.length})
                    </Button>
                  </>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                  disabled={isProcessing}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Supprimer ({selectedItems.length})
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Select All */}
          <div className="flex items-center gap-3 p-3 border-b mb-4">
            <Checkbox
              checked={selectedItems.length === (Array.isArray(items) ? items.length : 0) && (Array.isArray(items) ? items.length : 0) > 0}
              onCheckedChange={selectAll}
            />
            <span className="font-medium">
              Sélectionner tout ({Array.isArray(items) ? items.length : 0} éléments)
            </span>
          </div>

          {/* Items List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Array.isArray(items) ? items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${selectedItems.includes(item.id)
                    ? "bg-primary/5 border-primary/20"
                    : "hover:bg-muted/50"
                  }`}
              >
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">
                      {item.title || item.name || item.description || `${itemType} #${item.id}`}
                    </h4>
                    {item.status && getStatusBadge(item.status)}
                  </div>

                  <div className="text-sm text-muted-foreground mt-1">
                    {itemType === "courses" && (
                      <span>Par {item.teacher} • {item.students} étudiants</span>
                    )}
                    {itemType === "users" && (
                      <span>{item.email} • Inscrit le {item.createdAt || "N/A"}</span>
                    )}
                    {itemType === "sessions" && (
                      <span>{item.date} • {item.duration}</span>
                    )}
                    {itemType === "payments" && (
                      <span>{item.amount}€ • {item.date}</span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  ID: {item.id}
                </div>
              </div>
            )) : null}
          </div>

          {(!Array.isArray(items) || items.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <ItemIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun élément à afficher</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { BulkOperations }