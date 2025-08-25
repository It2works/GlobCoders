import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (courseData: any) => Promise<void>;
    course?: any;
    instructorId: string;
}

const CourseModal = ({ isOpen, onClose, onSave, course, instructorId }: CourseModalProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 'beginner',
        price: '',
        category: 'programming',
        duration: '',
        maxStudents: ''
    });

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                level: course.level || 'beginner',
                price: course.price?.toString() || '',
                category: course.category || 'programming',
                duration: course.duration || '',
                maxStudents: course.maxStudents?.toString() || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                level: 'beginner',
                price: '',
                category: 'programming',
                duration: '',
                maxStudents: ''
            });
        }
    }, [course]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Frontend validation matching backend requirements
        if (!formData.title || formData.title.length < 5 || formData.title.length > 100) {
            toast({
                title: "Erreur",
                description: "Le titre doit contenir entre 5 et 100 caractères",
                variant: "destructive"
            });
            return;
        }

        if (!formData.description || formData.description.length < 20 || formData.description.length > 2000) {
            toast({
                title: "Erreur",
                description: "La description doit contenir entre 20 et 2000 caractères",
                variant: "destructive"
            });
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast({
                title: "Erreur",
                description: "Le prix doit être un nombre positif",
                variant: "destructive"
            });
            return;
        }

        try {
            const courseData = {
                ...formData,
                price: parseFloat(formData.price),
                maxStudents: parseInt(formData.maxStudents) || 0,
                instructor: instructorId,
                status: 'draft',
                duration: {
                    total: parseInt(formData.duration) || 60,
                    lectures: parseInt(formData.duration) || 5
                },
                syllabus: [],
                learningOutcomes: [],
                prerequisites: [],
                thumbnail: '📚'
            };

            await onSave(courseData);

            toast({
                title: "Succès",
                description: course ? "Cours modifié avec succès" : "Cours créé avec succès"
            });

            onClose();
        } catch (error) {
            console.error('Course creation error:', error);
            let errorMessage = "Une erreur s'est produite";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {course ? 'Modifier le cours' : 'Créer un nouveau cours'}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {course ? 'Modifiez les informations du cours ci-dessous.' : 'Remplissez le formulaire pour créer un nouveau cours.'}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="title">Titre du cours *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Introduction à Python"
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {formData.title.length}/100 caractères
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="category">Catégorie</Label>
                            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="programming">Programmation</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Description détaillée du cours..."
                            rows={4}
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {formData.description.length}/2000 caractères
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="level">Niveau</Label>
                            <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Débutant</SelectItem>
                                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                                    <SelectItem value="advanced">Avancé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="price">Prix (€) *</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                placeholder="29.99"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="duration">Durée (heures)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={formData.duration}
                                onChange={(e) => handleInputChange('duration', e.target.value)}
                                placeholder="10"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="maxStudents">Nombre max d'étudiants</Label>
                        <Input
                            id="maxStudents"
                            type="number"
                            value={formData.maxStudents}
                            onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                            placeholder="50"
                            min="1"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" variant="hero">
                            {course ? 'Modifier' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CourseModal;
