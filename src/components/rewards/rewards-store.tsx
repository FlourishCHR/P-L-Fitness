import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { ImageWithFallback } from "../design/ImageWithFallback";
import { 
  Gift, 
  ShoppingCart, 
  Search, 
  Filter, 
  Star, 
  Trophy,
  Shirt,
  Coffee,
  Dumbbell,
  Heart,
  CreditCard,
  Check,
  Shield,
  Clock
} from "lucide-react";

export function RewardsStore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"points" | "cash">("points");
  const [xenditPaymentMethod, setXenditPaymentMethod] = useState("gcash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const userPoints = 2450;

  const categories = [
    { id: "all", name: "All Items", icon: Gift },
    { id: "merchandise", name: "Merchandise", icon: Shirt },
    { id: "supplements", name: "Supplements", icon: Heart },
    { id: "equipment", name: "Equipment", icon: Dumbbell },
    { id: "food", name: "Food & Drinks", icon: Coffee },
  ];

  const rewards = [
    {
      id: 1,
      name: "P&L Fitness T-Shirt",
      description: "Premium cotton t-shirt with P&L logo",
      points: 500,
      category: "merchandise",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
      inStock: true,
      popular: true
    },
    {
      id: 2,
      name: "Protein Shake",
      description: "Post-workout protein shake (vanilla or chocolate)",
      points: 300,
      category: "supplements",
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=300&fit=crop",
      inStock: true,
      popular: true
    },
    {
      id: 3,
      name: "Resistance Bands Set",
      description: "Set of 3 resistance bands with different strengths",
      points: 800,
      category: "equipment",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
      inStock: true,
      popular: false
    },
    {
      id: 4,
      name: "Energy Bar",
      description: "Organic energy bar with nuts and dried fruits",
      points: 150,
      category: "food",
      image: "https://images.unsplash.com/photo-1527130055058-cd523413d960?w=300&h=300&fit=crop",
      inStock: true,
      popular: false
    },
    {
      id: 5,
      name: "P&L Water Bottle",
      description: "Insulated stainless steel water bottle (750ml)",
      points: 400,
      category: "merchandise",
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop",
      inStock: true,
      popular: true
    },
    {
      id: 6,
      name: "BCAA Supplement",
      description: "Branch-chain amino acids for muscle recovery",
      points: 1200,
      category: "supplements",
      image: "https://images.unsplash.com/photo-1608330706978-fa1a84d5d7e6?w=300&h=300&fit=crop",
      inStock: false,
      popular: false
    },
    {
      id: 7,
      name: "Yoga Mat",
      description: "Premium non-slip yoga mat with carrying strap",
      points: 600,
      category: "equipment",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
      inStock: true,
      popular: false
    },
    {
      id: 8,
      name: "Smoothie Bowl",
      description: "Fresh smoothie bowl with fruits and granola",
      points: 250,
      category: "food",
      image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=300&h=300&fit=crop",
      inStock: true,
      popular: false
    },
  ];

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || reward.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRedeem = (reward: any) => {
    setSelectedReward(reward);
    setIsPaymentDialogOpen(true);
    setPaymentSuccess(false);
    setPaymentMethod("points");
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setPaymentSuccess(true);
    
    // Close dialog after 2 seconds
    setTimeout(() => {
      setIsPaymentDialogOpen(false);
      setPaymentSuccess(false);
      setSelectedReward(null);
    }, 2000);
  };

  const calculateCashPrice = (points: number) => {
    // 1 point = ₱2 for cash purchases
    return points * 2;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Rewards Store</h1>
          <p className="text-muted-foreground">Redeem your hard-earned points for exclusive items</p>
        </div>
        <div className="text-center sm:text-right">
          <div className="text-sm text-muted-foreground">Available Points</div>
          <div className="text-xl sm:text-2xl font-bold text-primary">{userPoints.toLocaleString()}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search rewards..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                <Icon className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Popular Items */}
      {selectedCategory === "all" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-500" />
            Popular Items
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rewards.filter(r => r.popular).map((reward) => (
              <Card key={reward.id} className="overflow-hidden">
                <div className="relative">
                  <ImageWithFallback 
                    src={reward.image}
                    alt={reward.name}
                    className="w-full h-40 object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
                    Popular
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary">{reward.points} XP</Badge>
                    <Button 
                      size="sm" 
                      disabled={!reward.inStock || userPoints < reward.points}
                      onClick={() => handleRedeem(reward)}
                    >
                      {!reward.inStock ? "Out of Stock" : userPoints < reward.points ? "Not Enough XP" : "Redeem"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {selectedCategory === "all" ? "All Items" : categories.find(c => c.id === selectedCategory)?.name}
        </h2>
        
        {filteredRewards.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <ImageWithFallback 
                    src={reward.image}
                    alt={reward.name}
                    className="w-full h-40 object-cover"
                  />
                  {!reward.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-1">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {reward.points} XP
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!reward.inStock || userPoints < reward.points}
                      onClick={() => handleRedeem(reward)}
                      className={userPoints >= reward.points && reward.inStock ? "bg-primary hover:bg-primary/90" : ""}
                    >
                      {!reward.inStock ? "Out of Stock" : 
                       userPoints < reward.points ? "Not Enough XP" : 
                       "Redeem"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Points Earning Tips */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-primary" />
            How to Earn More Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">+100</div>
              <div className="text-sm">XP per workout session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary mb-1">+150</div>
              <div className="text-sm">XP per challenge completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">+200</div>
              <div className="text-sm">XP per class attended</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Redeem Reward</DialogTitle>
            <DialogDescription>
              {selectedReward && `Redeem ${selectedReward.name}`}
            </DialogDescription>
          </DialogHeader>

          {!paymentSuccess ? (
            <div className="space-y-4 py-4">
              {/* Reward Summary */}
              {selectedReward && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <img 
                      src={selectedReward.image} 
                      alt={selectedReward.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{selectedReward.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label>Choose Payment Method</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={paymentMethod === "points" ? "default" : "outline"}
                        className="h-auto py-4 flex-col"
                        onClick={() => setPaymentMethod("points")}
                      >
                        <Trophy className="h-6 w-6 mb-2" />
                        <div className="font-medium">XP Points</div>
                        <div className="text-sm">{selectedReward.points} XP</div>
                      </Button>
                      <Button
                        variant={paymentMethod === "cash" ? "default" : "outline"}
                        className="h-auto py-4 flex-col"
                        onClick={() => setPaymentMethod("cash")}
                      >
                        <CreditCard className="h-6 w-6 mb-2" />
                        <div className="font-medium">Cash</div>
                        <div className="text-sm">₱{calculateCashPrice(selectedReward.points)}</div>
                      </Button>
                    </div>
                  </div>

                  {/* Xendit Payment Options (only for cash) */}
                  {paymentMethod === "cash" && (
                    <div className="space-y-2">
                      <Label>Payment Gateway (Xendit)</Label>
                      <Select value={xenditPaymentMethod} onValueChange={setXenditPaymentMethod}>
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
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reward</span>
                      <span className="font-medium">{selectedReward.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payment Method</span>
                      <span className="font-medium capitalize">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">Total</span>
                      {paymentMethod === "points" ? (
                        <span className="font-bold text-primary">{selectedReward.points} XP</span>
                      ) : (
                        <span className="font-bold text-primary">₱{calculateCashPrice(selectedReward.points)}</span>
                      )}
                    </div>
                    {paymentMethod === "points" && (
                      <div className="text-xs text-muted-foreground">
                        Your balance: {userPoints} XP
                      </div>
                    )}
                  </div>

                  {paymentMethod === "cash" && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Secured by Xendit. Your payment information is encrypted and secure.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Redemption Successful!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {paymentMethod === "points" 
                    ? "Your reward will be available for pickup" 
                    : "Payment confirmed. Your reward will be available for pickup"}
                </p>
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
                    {paymentMethod === "points" ? (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        Redeem with XP
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay ₱{selectedReward && calculateCashPrice(selectedReward.points)}
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}