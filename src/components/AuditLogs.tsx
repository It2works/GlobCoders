import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { 
  Activity, 
  User, 
  Settings, 
  Shield, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  RefreshCw
} from "lucide-react"

interface AuditLogsProps {
  className?: string
}

interface AuditLog {
  id: string
  timestamp: string
  user: string
  userRole: string
  action: string
  resource: string
  resourceId: string
  description: string
  ipAddress: string
  userAgent: string
  severity: 'info' | 'warning' | 'critical' | 'error'
  changes: Record<string, any>
}

const AuditLogs = ({ className }: AuditLogsProps) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch real audit logs from API
  const fetchAuditLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const response = await fetch('/api/admin/audit-logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }

      const data = await response.json()
      setAuditLogs(data.logs || [])
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setError('Failed to load audit logs')
      setAuditLogs([]) // Set empty array as fallback
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const handleRefresh = () => {
    fetchAuditLogs(true)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'warning': return 'secondary'
      case 'error': return 'destructive'
      default: return 'default'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('COURSE')) return <FileText className="h-4 w-4" />
    if (action.includes('USER')) return <User className="h-4 w-4" />
    if (action.includes('PAYMENT')) return <Shield className="h-4 w-4" />
    if (action.includes('SETTINGS')) return <Settings className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement des logs d'audit...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-destructive mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Logs d'Audit
            </CardTitle>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {auditLogs.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getActionIcon(log.action)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.action}</span>
                            <Badge variant={getSeverityColor(log.severity)}>
                              {log.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Utilisateur:</span>
                        <span className="ml-2">{log.user}</span>
                        <Badge variant="outline" className="ml-2">{log.userRole}</Badge>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Ressource:</span>
                        <span className="ml-2">{log.resource} ({log.resourceId})</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">IP:</span>
                        <span className="ml-2 font-mono">{log.ipAddress}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Sévérité:</span>
                        <span className="ml-2 flex items-center gap-1">
                          {getSeverityIcon(log.severity)}
                          {log.severity}
                        </span>
                      </div>
                    </div>

                    {Object.keys(log.changes).length > 0 && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2 text-sm">Changements:</h4>
                        <div className="space-y-1 text-xs">
                          {Object.entries(log.changes).map(([key, change]) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="font-medium">{key}:</span>
                              <span className="text-muted-foreground">
                                {change.from !== null ? change.from : 'null'} → {change.to !== null ? change.to : 'null'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun log d'audit disponible</p>
              <p className="text-sm mt-1">Les logs apparaîtront ici quand des actions seront effectuées</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AuditLogs