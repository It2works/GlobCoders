import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

// Capacitor imports for native notifications
let PushNotifications: any = null

try {
  // Only import if Capacitor is available (mobile environment)
  const { PushNotifications: PushNotificationsPlugin } = require('@capacitor/push-notifications')
  PushNotifications = PushNotificationsPlugin
} catch (error) {
  // Capacitor not available (web environment)
  console.log('Running in web environment - push notifications will use web APIs')
}

interface NotificationData {
  id: string
  title: string
  body: string
  data?: any
  actions?: { action: string; title: string }[]
  timestamp: Date
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'message' | 'payment'
}

interface PushNotificationSystemProps {
  userId: string
  userType: "student" | "teacher" | "admin"
  onNotificationClick?: (notification: NotificationData) => void
}

const PushNotificationSystem = ({
  userId,
  userType,
  onNotificationClick
}: PushNotificationSystemProps) => {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    checkNotificationSupport()
    requestPermission()
    setupNotificationHandlers()

    // Simulate receiving notifications
    simulateNotifications()

    return () => {
      // Cleanup
    }
  }, [])

  const checkNotificationSupport = () => {
    if (PushNotifications) {
      // Mobile environment with Capacitor
      setIsSupported(true)
    } else if ('Notification' in window && 'serviceWorker' in navigator) {
      // Web environment with Service Worker support
      setIsSupported(true)
    } else {
      setIsSupported(false)
      console.warn('Push notifications not supported in this environment')
    }
  }

  const requestPermission = async () => {
    if (PushNotifications) {
      // Mobile permission request
      try {
        const result = await PushNotifications.requestPermissions()
        if (result.receive === 'granted') {
          setPermission('granted')
          await registerForPushNotifications()
        } else {
          setPermission('denied')
        }
      } catch (error) {
        console.error('Error requesting mobile push permissions:', error)
        setPermission('denied')
      }
    } else if ('Notification' in window) {
      // Web permission request
      try {
        const permission = await Notification.requestPermission()
        setPermission(permission)

        if (permission === 'granted') {
          registerServiceWorker()
        }
      } catch (error) {
        console.error('Error requesting web push permissions:', error)
        setPermission('denied')
      }
    }
  }

  const registerForPushNotifications = async () => {
    if (!PushNotifications) return

    try {
      // Register for push notifications on mobile
      await PushNotifications.register()

      // Get the token
      PushNotifications.addListener('registration', (token: any) => {
        console.log('Push registration success, token: ' + token.value)
        // Send token to your backend server
        sendTokenToServer(token.value)
      })

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error))
      })
    } catch (error) {
      console.error('Error registering for push notifications:', error)
    }
  }

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      // Register service worker for web push notifications
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // Replace with your VAPID key
      })

      // Send subscription to your backend
      sendSubscriptionToServer(subscription)
    } catch (error) {
      console.error('Error registering service worker:', error)
    }
  }

  const setupNotificationHandlers = () => {
    if (PushNotifications) {
      // Mobile notification handlers
      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('Push received: ', notification)
        handleIncomingNotification(notification)
      })

      PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
        console.log('Push action performed: ', notification)
        handleNotificationAction(notification)
      })
    } else if ('serviceWorker' in navigator) {
      // Web notification handlers
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          handleNotificationAction(event.data.notification)
        }
      })
    }
  }

  const handleIncomingNotification = (notification: any) => {
    const notificationData: NotificationData = {
      id: notification.id || Date.now().toString(),
      title: notification.title,
      body: notification.body,
      data: notification.data,
      timestamp: new Date(),
      read: false,
      type: notification.data?.type || 'info'
    }

    setNotifications(prev => [notificationData, ...prev])

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.body,
      duration: 5000
    })
  }

  const handleNotificationAction = (notification: any) => {
    if (onNotificationClick) {
      onNotificationClick(notification)
    }

    // Mark as read
    markAsRead(notification.id)
  }

  const sendLocalNotification = async (notificationData: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    const notification: NotificationData = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    if (PushNotifications && permission === 'granted') {
      // Send local notification on mobile
      try {
        await PushNotifications.schedule({
          notifications: [
            {
              title: notification.title,
              body: notification.body,
              id: parseInt(notification.id),
              schedule: { at: new Date(Date.now() + 1000) }, // Schedule 1 second from now
              extra: notification.data
            }
          ]
        })
      } catch (error) {
        console.error('Error scheduling local notification:', error)
      }
    } else if ('Notification' in window && permission === 'granted') {
      // Send web notification
      try {
        const webNotification = new Notification(notification.title, {
          body: notification.body,
          icon: '/icon-192x192.png',
          data: notification.data
        })

        webNotification.onclick = () => {
          handleNotificationAction(notification)
          webNotification.close()
        }
      } catch (error) {
        console.error('Error showing web notification:', error)
      }
    }

    // Add to local notifications list
    setNotifications(prev => [notification, ...prev])

    // Show toast as fallback
    toast({
      title: notification.title,
      description: notification.body,
      variant: notification.type === 'error' ? 'destructive' : 'default'
    })
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    toast({
      title: "Notifications effacées",
      description: "Toutes les notifications ont été supprimées"
    })
  }

  const simulateNotifications = () => {
    // Simulate various types of notifications for demo
    const sampleNotifications = [
      {
        title: "Nouveau cours disponible",
        body: "Le cours 'React Avancé' est maintenant disponible !",
        type: 'course' as const,
        data: { courseId: '123', action: 'view_course' }
      },
      {
        title: "Message reçu",
        body: "Marie Dubois vous a envoyé un message",
        type: 'message' as const,
        data: { senderId: 'marie', chatId: '456' }
      },
      {
        title: "Paiement confirmé",
        body: "Votre paiement de 49€ a été traité avec succès",
        type: 'payment' as const,
        data: { amount: 49, orderId: '789' }
      }
    ]

    // Send notifications every 30 seconds for demo
    const interval = setInterval(() => {
      const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)]
      sendLocalNotification(randomNotification)
    }, 30000)

    return () => clearInterval(interval)
  }

  const sendTokenToServer = async (token: string) => {
    try {
      // In a real app, send the token to your backend
      console.log('Sending token to server:', token)
      // await fetch('/api/push-tokens', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, userId, userType })
      // })
    } catch (error) {
      console.error('Error sending token to server:', error)
    }
  }

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      // In a real app, send the subscription to your backend
      console.log('Sending subscription to server:', subscription)
      // await fetch('/api/push-subscriptions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ subscription, userId, userType })
      // })
    } catch (error) {
      console.error('Error sending subscription to server:', error)
    }
  }

  // Helper function for VAPID key conversion
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  return (
    <div className="space-y-4">
      {/* Notification Status */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div>
          <h3 className="font-medium">Notifications Push</h3>
          <p className="text-sm text-muted-foreground">
            Status: {permission === 'granted' ? '✅ Activées' :
              permission === 'denied' ? '❌ Refusées' :
                '⏳ En attente'}
          </p>
        </div>

        <div className="flex gap-2">
          {permission !== 'granted' && (
            <Button onClick={requestPermission} variant="outline">
              Activer les notifications
            </Button>
          )}

          {notifications.length > 0 && (
            <Button onClick={clearAllNotifications} variant="outline">
              Effacer tout
            </Button>
          )}
        </div>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Notifications récentes ({notifications.length})</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${notification.read ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'
                  }`}
                onClick={() => handleNotificationAction(notification)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{notification.title}</h5>
                    <p className="text-sm text-muted-foreground">{notification.body}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {notification.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { PushNotificationSystem }