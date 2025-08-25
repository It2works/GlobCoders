import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/contexts/AuthContext';
import { safeFilter } from '@/utils/safeData';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quiz: { title: string; course: string; passingScore: number }) => void;
}

const QuizModal = ({ isOpen, onClose, onSave }: QuizModalProps) => {
  const { toast } = useToast();
  const { courses } = useAppData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    passingScore: 70
  });

  // Filter courses by current teacher with safe filter
  const teacherCourses = safeFilter(courses, course => course.instructor?._id === user?._id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.course) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);

    toast({
      title: "Succès",
      description: "Quiz créé avec succès"
    });

    onClose();
    setFormData({ title: '', course: '', passingScore: 70 });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau quiz</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre du quiz</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Quiz Python - Variables"
              required
            />
          </div>

          <div>
            <Label htmlFor="course">Cours associé</Label>
            <Select value={formData.course} onValueChange={(value) => handleInputChange('course', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un cours" />
              </SelectTrigger>
              <SelectContent>
                {teacherCourses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="passingScore">Score de passage (%)</Label>
            <Input
              id="passingScore"
              type="number"
              min="0"
              max="100"
              value={formData.passingScore}
              onChange={(e) => handleInputChange('passingScore', e.target.value)}
              placeholder="70"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pourcentage minimum requis pour réussir le quiz
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="hero">
              Créer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;