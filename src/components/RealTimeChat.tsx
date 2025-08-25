import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Image,
  File,
  Mic,
  Loader2,
  AlertTriangle,
  RefreshCw
} from "lucide-react"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'audio'
  isRead: boolean
  replyTo?: string
}

interface ChatRoom {
  id: string
  name: string
  type: 'direct' | 'group' | 'course'
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  isOnline?: boolean
}

interface RealTimeChatProps {
  currentUserId: string
  currentUserName: string
  userType: "student" | "teacher" | "admin"
  className?: string
}

const RealTimeChat = ({
  currentUserId,
  currentUserName,
  userType,
  className
}: RealTimeChatProps) => {
  const { toast } = useToast()
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({})
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Fetch real chat data from API
  const fetchChatRooms = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const response = await fetch('/api/chat/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms')
      }

      const data = await response.json()
      setChatRooms(data.rooms || [])
    } catch (err) {
      console.error('Error fetching chat rooms:', err)
      setError('Failed to load chat rooms')
      setChatRooms([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(prev => ({
        ...prev,
        [roomId]: data.messages || []
      }))
    } catch (err) {
      console.error('Error fetching messages:', err)
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchChatRooms()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom)
    }
  }, [selectedRoom])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return

    try {
      const response = await fetch(`/api/chat/rooms/${selectedRoom}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          type: 'text'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const sentMessage = await response.json()

      setMessages(prev => ({
        ...prev,
        [selectedRoom]: [...(prev[selectedRoom] || []), sentMessage]
      }))

      setNewMessage("")
      scrollToBottom()
    } catch (err) {
      console.error('Error sending message:', err)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      })
    }
  }

  const handleRefresh = () => {
    fetchChatRooms(true)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleTyping = (roomId: string) => {
    setIsTyping(prev => ({ ...prev, [roomId]: true }))

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(prev => ({ ...prev, [roomId]: false }))
    }, 1000)
  }

  const filteredRooms = chatRooms && Array.isArray(chatRooms) ? chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  const selectedRoomData = chatRooms.find(room => room.id === selectedRoom)
  const currentMessages = messages[selectedRoom || ""] || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement du chat...</span>
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
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chat en Temps Réel</CardTitle>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Rooms Sidebar */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {filteredRooms.length > 0 ? (
                <div className="p-2 space-y-2">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedRoom === room.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={room.lastMessage?.senderAvatar} />
                          <AvatarFallback>
                            {room.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{room.name}</h4>
                            {room.unreadCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {room.unreadCount}
                              </Badge>
                            )}
                          </div>
                          {room.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {room.lastMessage.content}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {room.lastMessage?.timestamp
                                ? new Date(room.lastMessage.timestamp).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                                : 'Aucun message'}
                            </span>
                            {room.isOnline && (
                              <div className="h-2 w-2 bg-green-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucune conversation disponible</p>
                  <p className="text-sm mt-1">Commencez une nouvelle conversation</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedRoomData?.lastMessage?.senderAvatar} />
                      <AvatarFallback>
                        {selectedRoomData?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{selectedRoomData?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRoomData?.type === 'direct' ? 'Message privé' :
                          selectedRoomData?.type === 'group' ? 'Groupe' : 'Cours'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-3">
                  {currentMessages.length > 0 ? (
                    <div className="space-y-4">
                      {currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.senderId === currentUserId ? "justify-end" : "justify-start"
                            }`}
                        >
                          {message.senderId !== currentUserId && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.senderAvatar} />
                              <AvatarFallback>
                                {message.senderName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[70%] ${message.senderId === currentUserId
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                              } rounded-lg p-3`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {message.senderName}
                              </span>
                              <span className="text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Aucun message dans cette conversation</p>
                      <p className="text-sm mt-1">Envoyez le premier message !</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <File className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p>Sélectionnez une conversation pour commencer</p>
                  <p className="text-sm mt-1">ou créez-en une nouvelle</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default RealTimeChat