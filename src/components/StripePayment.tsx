import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentProps {
    amount: number;
    currency: string;
    onPaymentSuccess: (paymentResult: any) => void;
    onPaymentError: (error: string) => void;
    isProcessing: boolean;
    setIsProcessing: (processing: boolean) => void;
}

export const StripePayment: React.FC<StripePaymentProps> = ({
    amount,
    currency,
    onPaymentSuccess,
    onPaymentError,
    isProcessing,
    setIsProcessing
}) => {
    const { toast } = useToast();
    const [cardNumber, setCardNumber] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardholderName, setCardholderName] = useState('');

    const handlePayment = async () => {
        if (!validateForm()) return;

        setIsProcessing(true);
        try {
            // Create payment intent
            const response = await fetch('/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: amount * 100, // Convert to cents
                    currency: currency.toLowerCase(),
                    metadata: {
                        cardholderName,
                        paymentType: 'course_enrollment'
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret } = await response.json();

            // Process payment (simplified for demo)
            // In production, you would use Stripe Elements and proper card validation
            const paymentResult = {
                id: `pi_${Math.random().toString(36).substr(2, 9)}`,
                amount: amount,
                currency: currency,
                status: 'succeeded',
                clientSecret
            };

            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            onPaymentSuccess(paymentResult);
            toast({
                title: "Paiement réussi! 🎉",
                description: `Votre paiement de ${amount}${currency} a été traité avec succès.`
            });

        } catch (error) {
            console.error('Payment error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur de paiement inconnue';
            onPaymentError(errorMessage);
            toast({
                title: "Erreur de paiement",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const validateForm = (): boolean => {
        if (!cardNumber || !expiryMonth || !expiryYear || !cvc || !cardholderName) {
            toast({
                title: "Formulaire incomplet",
                description: "Veuillez remplir tous les champs.",
                variant: "destructive"
            });
            return false;
        }

        if (cardNumber.length < 13 || cardNumber.length > 19) {
            toast({
                title: "Numéro de carte invalide",
                description: "Veuillez vérifier votre numéro de carte.",
                variant: "destructive"
            });
            return false;
        }

        if (parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
            toast({
                title: "Mois d'expiration invalide",
                description: "Veuillez vérifier le mois d'expiration.",
                variant: "destructive"
            });
            return false;
        }

        const currentYear = new Date().getFullYear();
        if (parseInt(expiryYear) < currentYear) {
            toast({
                title: "Année d'expiration invalide",
                description: "Votre carte a expiré.",
                variant: "destructive"
            });
            return false;
        }

        if (cvc.length < 3 || cvc.length > 4) {
            toast({
                title: "CVC invalide",
                description: "Veuillez vérifier votre code de sécurité.",
                variant: "destructive"
            });
            return false;
        }

        return true;
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const getCardType = (number: string) => {
        const cleanNumber = number.replace(/\s/g, '');
        if (/^4/.test(cleanNumber)) return 'Visa';
        if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
        if (/^3[47]/.test(cleanNumber)) return 'American Express';
        if (/^6/.test(cleanNumber)) return 'Discover';
        return 'Carte';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Informations de paiement
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Cardholder Name */}
                <div className="space-y-2">
                    <Label htmlFor="cardholder-name">Nom du titulaire de la carte</Label>
                    <Input
                        id="cardholder-name"
                        placeholder="Nom tel qu'il apparaît sur la carte"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>

                {/* Card Number */}
                <div className="space-y-2">
                    <Label htmlFor="card-number">Numéro de carte</Label>
                    <div className="relative">
                        <Input
                            id="card-number"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            maxLength={19}
                            disabled={isProcessing}
                        />
                        {cardNumber && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <span className="text-xs text-gray-500">
                                    {getCardType(cardNumber)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expiry and CVC */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="expiry-month">Mois d'expiration</Label>
                        <Input
                            id="expiry-month"
                            placeholder="MM"
                            value={expiryMonth}
                            onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                            maxLength={2}
                            disabled={isProcessing}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expiry-year">Année d'expiration</Label>
                        <Input
                            id="expiry-year"
                            placeholder="YYYY"
                            value={expiryYear}
                            onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            disabled={isProcessing}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cvc">Code de sécurité (CVC)</Label>
                    <Input
                        id="cvc"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        disabled={isProcessing}
                    />
                </div>

                {/* Security Notice */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Lock className="w-4 h-4" />
                        <span>Vos informations de paiement sont sécurisées et cryptées</span>
                    </div>
                </div>

                {/* Payment Button */}
                <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full h-12 text-lg font-semibold"
                    size="lg"
                >
                    {isProcessing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Traitement du paiement...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Payer {amount}{currency}
                        </>
                    )}
                </Button>

                {/* Test Card Notice */}
                <div className="text-center text-xs text-gray-500">
                    <p>💳 Carte de test: 4242 4242 4242 4242</p>
                    <p>📅 Expiration: 12/25 | CVC: 123</p>
                </div>
            </CardContent>
        </Card>
    );
};
