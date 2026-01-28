import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LoyaltyCard } from "../profile/loyalty-card";
import { 
  CreditCard,
  Check,
  Star,
  Zap,
  Crown,
  Clock,
  Users,
  Dumbbell,
  Trophy,
  Gift,
  Shield,
  Calendar,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  priceMonthly?: number;
  icon: any;
  color: string;
  popular?: boolean;
  features: string[];
  perks: string[];
}

export function MembershipPlans() {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showCardGeneration, setShowCardGeneration] = useState(false);
  const [generatedMemberId, setGeneratedMemberId] = useState("");

  const plans: MembershipPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 1500,
      priceMonthly: 1500,
      icon: Dumbbell,
      color: "text-gray-500",
      features: [
        "24/7 Gym Access",
        "Locker Room Access",
        "Free WiFi",
        "Basic Equipment Access",
        "Mobile App Access"
      ],
      perks: []
    },
    {
      id: "premium",
      name: "Premium",
      price: 2500,
      priceMonthly: 2500,
      icon: Star,
      color: "text-primary",
      popular: true,
      features: [
        "All Basic Features",
        "Group Classes (Unlimited)",
        "Free Guest Pass (2/month)",
        "Nutrition Consultation",
        "Workout Plan Template",
        "Priority Class Booking",
        "10% Rewards Store Discount"
      ],
      perks: ["Most Popular Choice", "Best Value"]
    },
    {
      id: "vip",
      name: "VIP Elite",
      price: 5000,
      priceMonthly: 5000,
      icon: Crown,
      color: "text-secondary",
      features: [
        "All Premium Features",
        "Personal Training (4 sessions/month)",
        "Private Locker",
        "Exclusive VIP Lounge Access",
        "Customized Meal Plan",
        "Body Composition Analysis",
        "Free Merchandise (Monthly)",
        "20% Rewards Store Discount",
        "Priority Support"
      ],
      perks: ["Exclusive Benefits", "Premium Support"]
    }
  ];

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setIsPaymentDialogOpen(true);
    setPaymentSuccess(false);
  };

  const calculatePrice = (plan: MembershipPlan) => {
    if (billingCycle === "annual") {
      return plan.price * 10; // 10 months for annual (2 months free)
    }
    return plan.priceMonthly || plan.price;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate Xendit payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate unique member ID
    const year = new Date().getFullYear();
    const randomId = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const newMemberId = `PL${year}-${randomId}`;
    setGeneratedMemberId(newMemberId);
    
    setIsProcessing(false);
    setPaymentSuccess(true);
    
    // Show card generation after 2 seconds
    setTimeout(() => {
      setIsPaymentDialogOpen(false);
      setShowCardGeneration(true);
      setPaymentSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Membership Plans
        </h1>
        <p className="text-muted-foreground">Choose the perfect plan for your fitness journey</p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(value: any) => setBillingCycle(value)} className="w-auto">
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">
              Annual
              <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-500 border-green-500/30">
                Save 17%
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Current Membership Info */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Current Plan: Premium</h3>
                <p className="text-sm text-muted-foreground">Active until Dec 31, 2024</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
              <Button variant="outline" size="sm">
                View Benefits
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const monthlyPrice = calculatePrice(plan);
          const savings = billingCycle === "annual" ? plan.price * 2 : 0;

          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.popular ? "border-primary shadow-md scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 ${plan.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">₱{monthlyPrice.toLocaleString()}</span>
                    <span className="text-muted-foreground">/{billingCycle === "annual" ? "year" : "month"}</span>
                  </div>
                  {billingCycle === "annual" && savings > 0 && (
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                        Save ₱{savings.toLocaleString()}/year
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.perks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-2 border-b">
                    {plan.perks.map((perk, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        {perk}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full mt-4" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.id === "premium" ? "Current Plan" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Plans</CardTitle>
          <CardDescription>Detailed feature comparison across all membership tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Basic</th>
                  <th className="text-center py-3 px-4">Premium</th>
                  <th className="text-center py-3 px-4">VIP Elite</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-3 px-4">24/7 Gym Access</td>
                  <td className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Group Classes</td>
                  <td className="text-center text-muted-foreground">-</td>
                  <td className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Personal Training</td>
                  <td className="text-center text-muted-foreground">-</td>
                  <td className="text-center text-muted-foreground">-</td>
                  <td className="text-center">4 sessions/month</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Nutrition Consultation</td>
                  <td className="text-center text-muted-foreground">-</td>
                  <td className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Guest Passes</td>
                  <td className="text-center text-muted-foreground">-</td>
                  <td className="text-center">2/month</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Rewards Store Discount</td>
                  <td className="text-center text-muted-foreground">-</td>
                  <td className="text-center">10%</td>
                  <td className="text-center">20%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">VIP Lounge Access</td>
                  <td className="text-center text-muted-foreground">-</td>
                  <td className="text-center text-muted-foreground">-</td>
                  <td className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              {selectedPlan && `Subscribe to ${selectedPlan.name} plan`}
            </DialogDescription>
          </DialogHeader>

          {!paymentSuccess ? (
            <div className="space-y-4 py-4">
              {/* Order Summary */}
              {selectedPlan && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Plan</span>
                    <span className="font-medium">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Billing Cycle</span>
                    <span className="font-medium capitalize">{billingCycle}</span>
                  </div>
                  {billingCycle === "annual" && (
                    <div className="flex justify-between text-green-500">
                      <span className="text-sm">Discount</span>
                      <span className="font-medium">-₱{(selectedPlan.price * 2).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-primary">₱{calculatePrice(selectedPlan).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label>Payment Method (Xendit)</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcash">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">G</div>
                        GCash
                      </div>
                    </SelectItem>
                    <SelectItem value="paymaya">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-8 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">P</div>
                        PayMaya
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Credit/Debit Card
                      </div>
                    </SelectItem>
                    <SelectItem value="bank">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Online Banking
                      </div>
                    </SelectItem>
                    <SelectItem value="grabpay">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">G</div>
                        GrabPay
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" type="password" maxLength={3} />
                    </div>
                  </div>
                </div>
              )}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Secured by Xendit. Your payment information is encrypted and secure.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground mt-1">Your subscription has been activated</p>
              </div>
            </div>
          )}

          {!paymentSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Card Generation Dialog */}
      <Dialog open={showCardGeneration} onOpenChange={setShowCardGeneration}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Membership Card</DialogTitle>
            <DialogDescription>
              Your new membership card is ready
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 text-center space-y-4">
            <LoyaltyCard memberId={generatedMemberId} />
            <div>
              <h3 className="font-medium">Membership ID: {generatedMemberId}</h3>
              <p className="text-sm text-muted-foreground mt-1">Use this ID for all your gym transactions</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCardGeneration(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}