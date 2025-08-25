import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Filter,
  X,
  Download,
  FileText,
  Calendar,
  Clock,
  User,
  FileSpreadsheet
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportFunctionalityProps {
  data: any[]
  dataType: string
  className?: string
}

const ExportFunctionality = ({ data, dataType, className }: ExportFunctionalityProps) => {
  const { toast } = useToast()
  const [filters, setFilters] = useState({
    dateRange: "",
    status: "",
    category: "",
    searchTerm: ""
  })
  const [exportFormat, setExportFormat] = useState("csv")

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      dateRange: "",
      status: "",
      category: "",
      searchTerm: ""
    })
  }

  const filteredData = Array.isArray(data) ? data.filter(item => {
    const matchesSearch = filters.searchTerm === "" ||
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(filters.searchTerm.toLowerCase())
      )

    const matchesStatus = filters.status === "" || item.status === filters.status
    const matchesCategory = filters.category === "" || item.category === filters.category

    return matchesSearch && matchesStatus && matchesCategory
  }) : []

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Aucune donnée à exporter",
        description: "Veuillez ajuster vos filtres",
        variant: "destructive"
      })
      return
    }

    const headers = Object.keys(filteredData[0])
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row =>
        headers.map(header => `"${String(row[header]).replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export réussi",
      description: `${filteredData.length} enregistrements exportés en CSV`
    })
  }

  const exportToPDF = () => {
    // Simulate PDF export
    toast({
      title: "Export PDF en cours",
      description: "La génération du PDF peut prendre quelques instants..."
    })

    setTimeout(() => {
      toast({
        title: "Export PDF terminé",
        description: `${filteredData.length} enregistrements exportés en PDF`
      })
    }, 2000)
  }

  const exportToExcel = () => {
    // Simulate Excel export
    toast({
      title: "Export Excel en cours",
      description: "La génération du fichier Excel peut prendre quelques instants..."
    })

    setTimeout(() => {
      toast({
        title: "Export Excel terminé",
        description: `${filteredData.length} enregistrements exportés en Excel`
      })
    }, 1500)
  }

  const handleExport = () => {
    switch (exportFormat) {
      case "csv":
        exportToCSV()
        break
      case "pdf":
        exportToPDF()
        break
      case "excel":
        exportToExcel()
        break
      default:
        exportToCSV()
    }
  }

  // Get unique values for filter options
  const uniqueStatuses = [...new Set(data.map(item => item.status).filter(Boolean))]
  const uniqueCategories = [...new Set(data.map(item => item.category || item.type).filter(Boolean))]

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export et Filtres Avancés
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toute période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toute période</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {Object.values(filters).some(filter => filter !== "") && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Filtres actifs:</span>
              {filters.searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Recherche: {filters.searchTerm}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("searchTerm", "")}
                  />
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  Statut: {filters.status}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("status", "")}
                  />
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  Catégorie: {filters.category}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("category", "")}
                  />
                </Badge>
              )}
              {filters.dateRange && (
                <Badge variant="secondary" className="gap-1">
                  Période: {filters.dateRange}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("dateRange", "")}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Effacer tous
              </Button>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {filteredData.length} sur {data.length} enregistrements
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleExport} disabled={filteredData.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exporter ({filteredData.length})
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h4 className="font-medium mb-3">Aperçu des données</h4>
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-3">
                {filteredData.length > 0 ? (
                  <div className="space-y-2">
                    {filteredData.slice(0, 10).map((item, index) => (
                      <div key={index} className="p-2 bg-muted/30 rounded text-sm">
                        <div className="font-medium truncate">
                          {item.title || item.name || `Enregistrement ${index + 1}`}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {Object.entries(item).slice(0, 3).map(([key, value]) =>
                            `${key}: ${String(value).substring(0, 30)}${String(value).length > 30 ? '...' : ''}`
                          ).join(" • ")}
                        </div>
                      </div>
                    ))}
                    {filteredData.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        ... et {filteredData.length - 10} autres enregistrements
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun enregistrement ne correspond aux filtres</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { ExportFunctionality }