import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Calendar, User, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { processPayment, getCardType, PaymentRequest } from "@/services/fakeBackend";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionDetails: {
    courseId: number;
    courseName: string;
    teacherName: string;
    teacherId: number;
    date: string;
    time: string;
    price: number;
  };
  onPaymentSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, sessionDetails, onPaymentSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [holderName, setHolderName] = useState("");
  const { toast } = useToast();

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
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

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !holderName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage("");

    try {
      const paymentData: PaymentRequest = {
        cardNumber,
        expiryDate,
        cvv,
        holderName,
        amount: sessionDetails.price * 100, // Convert to cents
        currency: 'EUR',
        courseId: sessionDetails.courseId,
        studentId: 1, // Current user ID - in real app get from auth
        teacherId: sessionDetails.teacherId,
        sessionDate: sessionDetails.date,
        sessionTime: sessionDetails.time
      };

      const result = await processPayment(paymentData);

      if (result.success) {
        setPaymentStatus('success');
        toast({
          title: "Paiement réussi !",
          description: "Votre session a été réservée. Le formateur a été notifié.",
        });
        
        // Wait a moment to show success, then close
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
          resetForm();
        }, 2000);
      } else {
        setPaymentStatus('error');
        setErrorMessage(result.error || "Erreur de paiement");
        toast({
          title: "Paiement échoué",
          description: result.error || "Une erreur est survenue lors du paiement.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage("Erreur de connexion");
      toast({
        title: "Erreur",
        description: "Impossible de traiter le paiement. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setHolderName("");
    setPaymentStatus('idle');
    setErrorMessage("");
  };

  const cardType = getCardType(cardNumber);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Paiement sécurisé
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Récapitulatif de la session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{sessionDetails.courseName}</p>
                  <p className="text-sm text-muted-foreground">avec {sessionDetails.teacherName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">{sessionDetails.date}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">{sessionDetails.time}</p>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>{sessionDetails.price}€</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="holderName">Nom du titulaire</Label>
                <Input
                  id="holderName"
                  placeholder="John Doe"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Numéro de carte</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className={cardType !== 'unknown' && cardNumber ? 'pr-12' : ''}
                  />
                  {cardType !== 'unknown' && cardNumber && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {cardType === 'visa' && (
                        <div className="text-xs font-bold text-blue-600">VISA</div>
                      )}
                      {cardType === 'mastercard' && (
                        <div className="text-xs font-bold text-red-600">MC</div>
                      )}
                      {cardType === 'amex' && (
                        <div className="text-xs font-bold text-green-600">AMEX</div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cartes acceptées: Visa, Mastercard, American Express
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Date d'expiration</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                  />
                </div>
              </div>

              {paymentStatus === 'error' && errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-600">Paiement traité avec succès!</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => { onClose(); resetForm(); }} 
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handlePayment} 
                  disabled={isProcessing || paymentStatus === 'success'}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : paymentStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Payé
                    </>
                  ) : (
                    `Payer ${sessionDetails.price}€`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}