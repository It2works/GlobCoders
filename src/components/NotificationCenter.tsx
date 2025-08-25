import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/hooks/useAppData';
import { Eye, Bell, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Interface moved to useAppData hook

const NotificationCenter = () => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Get notifications from context
  const { notifications: contextNotifications, currentUser, markNotificationAsRead } = useAppData();

  // Filter notifications for current user with safety check
  const safeNotifications = contextNotifications && Array.isArray(contextNotifications) ? contextNotifications : [];
  const notifications = safeNotifications.filter(n => n.user_id === currentUser?._id);

  const unreadCount = notifications.filter(n => n.statut === 'non_lue').length;

  const handleViewNotification = (notification: any) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);

    // Mark as read if not already
    if (notification.statut === 'non_lue') {
      markNotificationAsRead(notification._id);
    }
  };

  const handleRedirect = (url?: string) => {
    if (url) {
      // In a real app, you would use router navigation
      toast({
        title: "Redirection",
        description: `Redirection vers: ${url}`
      });
    }
    setIsDialogOpen(false);
  };

  const markAllAsRead = () => {
    notifications
      .filter(n => n.statut === 'non_lue')
      .forEach(n => markNotificationAsRead(n._id));

    toast({
      title: "Notifications marquées",
      description: "Toutes les notifications ont été marquées comme lues"
    });
  };

  const getNotificationIcon = (type: string) => {
    return type === 'alerte' ? (
      <AlertTriangle className="h-4 w-4 text-warning" />
    ) : (
      <Info className="h-4 w-4 text-primary" />
    );
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return format(date, 'dd/MM/yyyy', { locale: fr });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="px-2 py-1">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {notifications
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-3 p-3 rounded-md transition-colors ${notification.statut === 'non_lue'
                      ? 'bg-primary/5 border border-primary/20'
                      : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`text-sm font-medium truncate ${notification.statut === 'non_lue' ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                          {notification.titre}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {notification.statut === 'non_lue' && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewNotification(notification)}
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        {notification.type === 'alerte' && (
                          <Badge variant="outline" className="text-xs">
                            Action requise
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {notifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Notification Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && getNotificationIcon(selectedNotification.type)}
              {selectedNotification?.titre}
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {format(selectedNotification.createdAt, 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                </span>
                <Badge variant={selectedNotification.type === 'alerte' ? 'destructive' : 'default'}>
                  {selectedNotification.type === 'alerte' ? 'Alerte' : 'Information'}
                </Badge>
              </div>

              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Fermer
                </Button>
                {selectedNotification.redirect_url && (
                  <Button onClick={() => handleRedirect(selectedNotification.redirect_url)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir les détails
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationCenter;