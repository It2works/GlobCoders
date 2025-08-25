import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  Send,
  Search,
  UserCheck,
  Clock,
  Paperclip,
  MoreVertical,
  Users
} from "lucide-react"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface MessagingCenterProps {
  userType: "teacher" | "student" | "admin"
  currentUserId?: string | number
  className?: string
}

interface Conversation {
  conversationId: string
  participant: {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
    online: boolean
  }
  lastMessage: {
    content: string
    timestamp: string
    unread: boolean
    senderId: string
  } | null
  unreadCount: number
  messages: Array<{
    id: string
    content: string
    timestamp: string
    senderId: string
    senderName: string
    isRead: boolean
  }>
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: string
  teacherApprovalStatus?: string
}

const MessagingCenter = ({ userType, currentUserId: propCurrentUserId, className }: MessagingCenterProps) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [currentMessages, setCurrentMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)

  const currentUserId = user?._id || propCurrentUserId
  const isSearchingUsers = searchQuery.trim().length >= 2

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        const endpoint = userType === 'teacher'
          ? `/api/messages/teacher/${currentUserId}/conversations`
          : `/api/messages/student/${currentUserId}/conversations`

        const response = await api.get(endpoint)
        setConversations(response.data)
        if (response.data.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data[0].conversationId)
        }
      } catch (err) {
        console.error('Error fetching conversations:', err)
        setError('Erreur lors du chargement des conversations')
      } finally {
        setLoading(false)
      }
    }

    if (currentUserId) {
      fetchConversations()
    }
  }, [currentUserId, userType])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !currentUserId) return

      try {
        const response = await api.get(`/api/messages/conversation/${selectedConversation}?userId=${currentUserId}`)
        setCurrentMessages(response.data)
      } catch (err) {
        console.error('Error fetching messages:', err)
      }
    }

    fetchMessages()
  }, [selectedConversation, currentUserId])

  // Search for users to start conversations with
  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setAvailableUsers([])
      return
    }

    try {
      setSearchingUsers(true)
      const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`)
      const users = Array.isArray(response.data) ? response.data : (response.data?.data ?? [])
      // Filter out admins and the current user with safety check
      const filteredUsers = users && Array.isArray(users) ? users.filter((u: User) =>
        u.role !== 'admin' && u._id !== currentUserId
      ) : []
      setAvailableUsers(filteredUsers)
    } catch (err) {
      console.error('Error searching users:', err)
      setAvailableUsers([])
    } finally {
      setSearchingUsers(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isSearchingUsers) {
        searchUsers(searchQuery)
      } else {
        setAvailableUsers([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, isSearchingUsers])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return

    try {
      const response = await api.post('/api/messages/send', {
        senderId: currentUserId,
        recipientId: selectedConversation,
        content: newMessage
      })

      // Add new message to current messages
      setCurrentMessages(prev => [...prev, response.data])
      setNewMessage("")

      // Update conversation's last message
      setConversations(prev =>
        prev.map(conv =>
          conv.conversationId === selectedConversation
            ? {
              ...conv,
              lastMessage: {
                content: newMessage,
                timestamp: new Date().toISOString(),
                unread: false,
                senderId: currentUserId.toString()
              },
              unreadCount: 0
            }
            : conv
        )
      )
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  const startConversationWithUser = async (userId: string, userName: string) => {
    try {
      // Create a new conversation by sending an initial message
      const response = await api.post('/api/messages/send', {
        senderId: currentUserId,
        recipientId: userId,
        content: `Bonjour! J'aimerais discuter avec vous.`
      })

      // Refresh conversations to include the new one
      const conversationsResponse = await api.get(`/api/messages/student/${currentUserId}/conversations`)
      setConversations(conversationsResponse.data)

      // Select the new conversation
      setSelectedConversation(userId)
      setSearchQuery("")
      setAvailableUsers([])

      // Show success message or handle the new conversation
    } catch (err) {
      console.error('Error starting conversation:', err)
    }
  }

  const filteredConversations = conversations && Array.isArray(conversations) ? conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Chargement des messages...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {userType === 'student' ? 'Messages' : 'Conversations'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {isSearchingUsers ? availableUsers.length : conversations.length}
                </Badge>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={"Rechercher des utilisateurs ou des conversations..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {isSearchingUsers ? (
                  // Show available users for starting new conversations
                  <div className="space-y-2">
                    {searchingUsers && (
                      <div className="flex items-center justify-center p-4">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm text-muted-foreground">Recherche en cours...</span>
                      </div>
                    )}

                    {!searchingUsers && searchQuery.length < 2 && (
                      <div className="text-center p-4 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Tapez au moins 2 caractères pour rechercher des utilisateurs</p>
                      </div>
                    )}

                    {!searchingUsers && searchQuery.length >= 2 && availableUsers.length === 0 && (
                      <div className="text-center p-4 text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun utilisateur trouvé</p>
                      </div>
                    )}

                    {availableUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border border-muted/50 rounded-lg"
                        onClick={() => startConversationWithUser(user._id, `${user.firstName} ${user.lastName}`)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium truncate">{user.firstName} {user.lastName}</h4>
                            <Badge variant="outline" className="text-xs">
                              {user.role === 'teacher' ? 'Formateur' : 'Étudiant'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          {user.role === 'teacher' && user.teacherApprovalStatus && (
                            <div className="mt-1">
                              <Badge
                                variant={user.teacherApprovalStatus === 'approved' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {user.teacherApprovalStatus === 'approved' ? '✅ Approuvé' : '⏳ En attente'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Show existing conversations
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.conversationId}
                      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedConversation === conversation.conversationId ? 'bg-muted' : ''
                        }`}
                      onClick={() => setSelectedConversation(conversation.conversationId)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.participant.avatar} />
                        <AvatarFallback>
                          {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{conversation.participant.name}</h3>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage?.content || 'Aucun message'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastMessage?.timestamp
                              ? new Date(conversation.lastMessage.timestamp).toLocaleDateString('fr-FR')
                              : ''
                            }
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {conversation.participant.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            {selectedConversation && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversations.find(c => c.conversationId === selectedConversation)?.participant.avatar} />
                    <AvatarFallback>
                      {conversations.find(c => c.conversationId === selectedConversation)?.participant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {conversations.find(c => c.conversationId === selectedConversation)?.participant.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {conversations.find(c => c.conversationId === selectedConversation)?.participant.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {conversations.find(c => c.conversationId === selectedConversation)?.participant.role}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col h-[500px]">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUserId?.toString() ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${message.senderId === currentUserId?.toString()
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                          }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    className="min-h-[60px] resize-none"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { MessagingCenter }