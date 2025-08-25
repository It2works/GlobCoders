import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppData } from "@/hooks/useAppData";
import { UserCheck, Eye, Check, X, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserManagementModalProps {
  trigger: React.ReactNode;
  userId?: string;
}

const UserManagementModal = ({ trigger, userId }: UserManagementModalProps) => {
  const { users, updateUser, approveUser, rejectUser } = useAppData();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();

  // Ensure users is an array and handle the filtering properly
  const safeUsers = Array.isArray(users) ? users : [];
  const displayUsers = userId ? safeUsers.filter(u => u._id === userId.toString()) : safeUsers;

  const handleApprove = (user: any) => {
    approveUser(user._id);
    toast({
      title: "Utilisateur approuvé",
      description: `${user.firstName} ${user.lastName} a été approuvé avec succès`,
    });
  };

  const handleReject = (user: any) => {
    rejectUser(user._id);
    toast({
      title: "Utilisateur rejeté",
      description: `${user.firstName} ${user.lastName} a été rejeté`,
      variant: "destructive",
    });
  };

  const handleSuspend = (user: any) => {
    updateUser(parseInt(user._id), { isBlocked: true });
    toast({
      title: "Utilisateur suspendu",
      description: `${user.firstName} ${user.lastName} a été suspendu`,
      variant: "destructive",
    });
  };

  const handleActivate = (user: any) => {
    updateUser(parseInt(user._id), { isBlocked: false });
    toast({
      title: "Utilisateur activé",
      description: `${user.firstName} ${user.lastName} a été activé`,
    });
  };

  const handleEdit = (user: any) => {
    setEditingUser({ ...user });
  };

  const saveEdit = () => {
    if (editingUser) {
      updateUser(parseInt(editingUser._id), editingUser);
      setEditingUser(null);
      toast({
        title: "Utilisateur modifié",
        description: "Les informations ont été mises à jour",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <UserCheck className="h-4 w-4 mr-2" />
            Gestion des utilisateurs
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {userId ? "Détails de l'utilisateur" : "Gestion des utilisateurs"}
          </DialogTitle>
          <DialogDescription>
            Gérez les utilisateurs de la plateforme, approuvez les formateurs et surveillez les comptes.
          </DialogDescription>
        </DialogHeader>

        {editingUser ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Modifier l'utilisateur</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Rôle</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Élève">Élève</SelectItem>
                    <SelectItem value="Formateur">Formateur</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut</Label>
                <Select
                  value={editingUser.status}
                  onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="En attente">En attente</SelectItem>
                    <SelectItem value="Suspendu">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEdit}>Sauvegarder</Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Annuler</Button>
            </div>
          </div>
        ) : selectedUser ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Détails de {selectedUser.name}</h3>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Retour à la liste
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <div className="p-2 bg-muted rounded">{selectedUser.name}</div>
              </div>
              <div>
                <Label>Email</Label>
                <div className="p-2 bg-muted rounded">{selectedUser.email}</div>
              </div>
              <div>
                <Label>Rôle</Label>
                <Badge variant={selectedUser.role === 'Formateur' ? 'default' : 'secondary'}>
                  {selectedUser.role}
                </Badge>
              </div>
              <div>
                <Label>Statut</Label>
                <Badge variant={getStatusColor(selectedUser.status)}>
                  {selectedUser.status}
                </Badge>
              </div>
            </div>

            {/* Video presentation for formateurs */}
            {selectedUser.role === 'Formateur' && selectedUser.videoFile && (
              <div className="mt-6">
                <Label>Vidéo de présentation</Label>
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {typeof selectedUser.videoFile === 'string'
                        ? 'presentation_video.mp4'
                        : selectedUser.videoFile.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Vidéo obligatoire
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Cette vidéo de présentation a été uploadée lors de l'inscription pour évaluer les compétences pédagogiques du formateur.
                  </div>
                  {typeof selectedUser.videoFile === 'string' ? (
                    <video
                      controls
                      className="w-full max-h-64 rounded bg-black"
                      src={selectedUser.videoFile}
                    >
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  ) : (
                    <div className="p-8 text-center bg-muted rounded">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Fichier vidéo uploadé: {selectedUser.videoFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedUser.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {selectedUser.status === 'En attente' && (
                <>
                  <Button onClick={() => handleApprove(selectedUser)} className="text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                  <Button variant="destructive" onClick={() => handleReject(selectedUser)}>
                    <X className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </>
              )}
              {selectedUser.isBlocked === false && (
                <Button variant="destructive" onClick={() => handleSuspend(selectedUser)}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Suspendre
                </Button>
              )}
              {selectedUser.isBlocked === true && (
                <Button onClick={() => handleActivate(selectedUser)}>
                  <Check className="h-4 w-4 mr-2" />
                  Activer
                </Button>
              )}
              <Button variant="outline" onClick={() => handleEdit(selectedUser)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'teacher' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isBlocked ? 'destructive' : 'default'}>
                        {user.isBlocked ? 'Suspendu' : 'Actif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.teacherApprovalStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(user)}
                              className="text-green-600"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(user)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementModal;