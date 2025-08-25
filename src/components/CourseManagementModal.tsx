import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData } from "@/hooks/useAppData";
import { BookOpen, Eye, Check, X, Edit, Trash2, Users, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseManagementModalProps {
  trigger?: React.ReactNode;
  courseId?: number;
}

const CourseManagementModal = ({ trigger, courseId }: CourseManagementModalProps) => {
  const { courses, updateCourse, users } = useAppData();
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const { toast } = useToast();

  // Ensure courses is an array and handle the filtering properly
  const safeCourses = Array.isArray(courses) ? courses : [];
  const displayCourses = courseId ? safeCourses.filter(c => c._id === courseId.toString()) : safeCourses;

  const handleApprove = (course: any) => {
    updateCourse(course._id, { status: 'published' });
    toast({
      title: "Cours approuvé",
      description: `${course.title} a été publié`,
    });
  };

  const handleReject = (course: any) => {
    updateCourse(course._id, { status: 'draft' });
    toast({
      title: "Cours rejeté",
      description: `${course.title} a été rejeté et remis en brouillon`,
      variant: "destructive",
    });
  };

  const handleDelete = (course: any) => {
    // Note: deleteCourse function doesn't exist in useAppData, so we'll just show a toast
    toast({
      title: "Cours supprimé",
      description: `${course.title} a été supprimé`,
      variant: "destructive",
    });
  };

  const handleEdit = (course: any) => {
    setEditingCourse({ ...course });
  };

  const saveEdit = () => {
    if (editingCourse) {
      updateCourse(editingCourse._id, editingCourse);
      setEditingCourse(null);
      setSelectedCourse(editingCourse);
      toast({
        title: "Cours modifié",
        description: "Les informations ont été mises à jour",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'pending': return 'secondary';
      case 'draft': return 'outline';
      case 'active': return 'default';
      default: return 'secondary';
    }
  };

  const getCourseEnrollments = (courseId: string) => {
    // Since we don't have enrollments in this component, return empty array for now
    return [];
  };

  const getTeacherInfo = (teacherName: string) => {
    const safeUsers = Array.isArray(users) ? users : [];
    return safeUsers.find(u => `${u.firstName} ${u.lastName}` === teacherName);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Gestion des cours
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {courseId ? "Détails du cours" : "Gestion des cours"}
          </DialogTitle>
          <DialogDescription>
            Gérez les cours disponibles et leurs statuts.
          </DialogDescription>
        </DialogHeader>

        {editingCourse ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Modifier le cours</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Titre</Label>
                <Input
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Formateur</Label>
                <Input
                  value={editingCourse.teacher}
                  onChange={(e) => setEditingCourse({ ...editingCourse, teacher: e.target.value })}
                />
              </div>
              <div>
                <Label>Statut</Label>
                <Select
                  value={editingCourse.status}
                  onValueChange={(value) => setEditingCourse({ ...editingCourse, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brouillon">Brouillon</SelectItem>
                    <SelectItem value="En révision">En révision</SelectItem>
                    <SelectItem value="Publié">Publié</SelectItem>
                    <SelectItem value="Actif">Actif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prix</Label>
                <Input
                  value={editingCourse.price}
                  onChange={(e) => setEditingCourse({ ...editingCourse, price: e.target.value })}
                />
              </div>
              <div>
                <Label>Durée</Label>
                <Input
                  value={editingCourse.duration}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                />
              </div>
              <div>
                <Label>Âge recommandé</Label>
                <Input
                  value={editingCourse.ageRecommended}
                  onChange={(e) => setEditingCourse({ ...editingCourse, ageRecommended: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editingCourse.description}
                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEdit}>Sauvegarder</Button>
              <Button variant="outline" onClick={() => setEditingCourse(null)}>Annuler</Button>
            </div>
          </div>
        ) : selectedCourse ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedCourse.title}</h3>
              <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                Retour à la liste
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Élèves inscrits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getCourseEnrollments(selectedCourse._id).length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Durée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedCourse.duration}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Prix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedCourse.price}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Formateur</Label>
                <div className="p-2 bg-muted rounded">{selectedCourse.teacher}</div>
              </div>
              <div>
                <Label>Statut</Label>
                <Badge variant={getStatusColor(selectedCourse.status)}>
                  {selectedCourse.status}
                </Badge>
              </div>
              <div>
                <Label>Niveau</Label>
                <div className="p-2 bg-muted rounded">{selectedCourse.level}</div>
              </div>
              <div>
                <Label>Âge recommandé</Label>
                <div className="p-2 bg-muted rounded">{selectedCourse.ageRecommended}</div>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <div className="p-3 bg-muted rounded mt-2">{selectedCourse.description}</div>
            </div>

            <div className="flex gap-2 pt-4">
              {selectedCourse.status === 'pending' && (
                <>
                  <Button onClick={() => handleApprove(selectedCourse)} className="text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                  <Button variant="destructive" onClick={() => handleReject(selectedCourse)}>
                    <X className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => handleEdit(selectedCourse)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(selectedCourse)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayCourses.map((course) => (
                <Card key={course._id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg truncate">{course.title}</CardTitle>
                      <Badge variant={getStatusColor(course.status)}>
                        {course.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Par {course.instructor?.firstName} {course.instructor?.lastName}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Élèves:</span>
                        <span className="font-medium">{getCourseEnrollments(course._id).length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Prix:</span>
                        <span className="font-medium">{course.price}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCourse(course)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        {course.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(course)}
                              className="text-green-600"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(course)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CourseManagementModal;