import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/contexts/AuthContext';
import { safeFilter } from '@/utils/safeData';
import { Plus, Trash2, Eye } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  points: number;
}

interface EnhancedQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quiz: {
    title: string;
    description: string;
    course: string;
    questions: Question[];
    passingScore: number;
  }) => void;
}

const EnhancedQuizModal = ({ isOpen, onClose, onSave }: EnhancedQuizModalProps) => {
  const { toast } = useToast();
  const { courses } = useAppData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    passingScore: 70
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  // Filter courses by current teacher with safe filter
  const teacherCourses = safeFilter(courses, course => course.instructor?._id === user?._id);

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir la question et la réponse correcte",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion.type === 'multiple-choice' &&
      (!currentQuestion.options || currentQuestion.options.some(opt => !opt.trim()))) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir toutes les options pour les questions à choix multiples",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: Question = {
      id: Date.now(),
      question: currentQuestion.question!,
      type: currentQuestion.type!,
      options: currentQuestion.type === 'multiple-choice' ? currentQuestion.options : undefined,
      correctAnswer: currentQuestion.type === 'multiple-choice'
        ? parseInt(currentQuestion.correctAnswer as string)
        : currentQuestion.correctAnswer as string,
      points: currentQuestion.points || 1 // Default points for new questions
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    });

    toast({
      title: "Question ajoutée",
      description: "La question a été ajoutée au quiz"
    });
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.course || questions.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs et ajouter au moins une question",
        variant: "destructive"
      });
      return;
    }

    onSave({ ...formData, questions });

    toast({
      title: "Succès",
      description: "Quiz créé avec succès"
    });

    onClose();
    setFormData({ title: '', description: '', course: '', passingScore: 70 });
    setQuestions([]);
  };

  const updateCurrentQuestion = (field: string, value: any) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || ['', '', '', ''])];
    newOptions[index] = value;
    updateCurrentQuestion('options', newOptions);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un quiz avancé</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre du quiz</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Quiz Python - Variables"
                required
              />
            </div>

            <div>
              <Label htmlFor="course">Cours associé</Label>
              <Select value={formData.course} onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passingScore">Score de passage (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={formData.passingScore}
                onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                placeholder="70"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pourcentage minimum requis pour réussir le quiz
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description du quiz</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description détaillée du quiz..."
              rows={3}
              required
            />
          </div>

          {/* Questions existantes */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Questions ajoutées ({questions.length})</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {questions.map((question, index) => (
                  <Card key={question.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Q{index + 1}</Badge>
                          <Badge variant={question.type === 'multiple-choice' ? 'default' : 'secondary'}>
                            {question.type === 'multiple-choice' ? 'Choix multiple' : 'Réponse courte'}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            {question.points || 1} point{question.points !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{question.question}</p>
                        {question.type === 'multiple-choice' && question.options && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Réponse correcte: {question.options[question.correctAnswer as number]}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Nouvelle question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ajouter une question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Question</Label>
                <Textarea
                  value={currentQuestion.question}
                  onChange={(e) => updateCurrentQuestion('question', e.target.value)}
                  placeholder="Écrivez votre question ici..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type de question</Label>
                  <RadioGroup
                    value={currentQuestion.type}
                    onValueChange={(value) => updateCurrentQuestion('type', value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple-choice" id="multiple-choice" />
                      <Label htmlFor="multiple-choice">Choix multiple</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short-answer" id="short-answer" />
                      <Label htmlFor="short-answer">Réponse courte</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={currentQuestion.points || 1}
                    onChange={(e) => updateCurrentQuestion('points', parseInt(e.target.value) || 1)}
                    placeholder="1"
                  />
                </div>
              </div>

              {currentQuestion.type === 'multiple-choice' ? (
                <div className="space-y-3">
                  <Label>Options de réponse</Label>
                  {(currentQuestion.options || ['', '', '', '']).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <RadioGroup
                        value={currentQuestion.correctAnswer?.toString()}
                        onValueChange={(value) => updateCurrentQuestion('correctAnswer', value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`correct_${index}`} />
                          <Label htmlFor={`correct_${index}`} className="text-xs">Correcte</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <Label>Réponse correcte</Label>
                  <Textarea
                    value={currentQuestion.correctAnswer as string}
                    onChange={(e) => updateCurrentQuestion('correctAnswer', e.target.value)}
                    placeholder="Écrivez la réponse correcte ou le code attendu..."
                    rows={4}
                  />
                </div>
              )}

              <Button type="button" onClick={addQuestion} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter la question
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="hero" disabled={questions.length === 0}>
              Créer le quiz ({questions.length} questions)
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedQuizModal;