import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../design/ImageWithFallback";
import { Dumbbell, Trophy, Calendar, Target, Star, Clock, Shield, Zap } from "lucide-react";

export function LandingPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <Badge className="bg-primary text-primary-foreground px-4 py-2">
            24/7 Premium Fitness Center
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold">
            Join the Game. <br />
            <span className="text-primary">Train</span> <span className="text-secondary">Anytime.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience fitness like never before with our gamified training system, 
            expert coaches, and cutting-edge technology in San Pedro, Laguna.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Start Your Journey
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Why Choose <span className="text-primary">P&L</span> <span className="text-secondary">Fitness?</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Gamified Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Earn XP, unlock badges, and redeem rewards as you achieve your fitness goals.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-secondary/20">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-secondary mx-auto mb-2" />
              <CardTitle>Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Book classes, equipment, and personal training sessions with our intelligent system.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Daily Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete daily and weekly challenges to stay motivated and track progress.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-secondary/20">
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 text-secondary mx-auto mb-2" />
              <CardTitle>24/7 Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Train on your schedule with round-the-clock gym access and automated systems.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-muted/30 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Members Say</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                  alt="Member"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <CardTitle className="text-base">Miguel Santos</CardTitle>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "The gamification system keeps me motivated every day. I've never been more consistent with my workouts!"
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
                  alt="Member"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <CardTitle className="text-base">Maria Rodriguez</CardTitle>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "The coaches are amazing and the 24/7 access fits perfectly with my schedule. Love this place!"
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt="Member"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <CardTitle className="text-base">John Cruz</CardTitle>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "Best gym in Laguna! The technology integration makes everything so smooth and efficient."
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Join Our Community</h2>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Be Part of Something Bigger</h3>
            <p className="text-muted-foreground">
              Connect with like-minded fitness enthusiasts, participate in community challenges, 
              and celebrate achievements together. Our members support each other every step of the way.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">50+</div>
                <div className="text-sm text-muted-foreground">Classes Weekly</div>
              </div>
            </div>
          </div>
          
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h4 className="font-bold">This Week's Top Performers</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Alex M.</span>
                    <Badge className="bg-primary">3,450 XP</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sarah L.</span>
                    <Badge className="bg-secondary">3,200 XP</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mike T.</span>
                    <Badge className="bg-primary">2,980 XP</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="font-bold">
                <span className="text-primary">P&L</span>{" "}
                <span className="text-secondary">Fitness</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              San Pedro, Laguna's premier 24/7 fitness center with gamified training systems.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-2">Contact Info</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>📍 San Pedro, Laguna, Philippines</p>
              <p>📞 +63 123 456 7890</p>
              <p>✉️ info@plfitness.com</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-2">Follow Us</h4>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">Facebook</Button>
              <Button variant="ghost" size="sm">Instagram</Button>
              <Button variant="ghost" size="sm">TikTok</Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2024 P&L Fitness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}