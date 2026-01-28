import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { 
  Trophy, 
  Star, 
  Gift, 
  Target, 
  Award,
  Crown,
  Zap,
  Medal
} from "lucide-react";

export function LoyaltySystem() {
  const achievements = [
    {
      id: 1,
      name: "Consistent Crusher",
      description: "Visit the gym 10 days in a row",
      icon: Zap,
      completed: true,
      points: 500,
      rarity: "gold"
    },
    {
      id: 2,
      name: "Early Bird",
      description: "Complete 5 morning workouts",
      icon: Star,
      completed: true,
      points: 300,
      rarity: "silver"
    },
    {
      id: 3,
      name: "Class Champion",
      description: "Attend 20 group fitness classes",
      icon: Crown,
      completed: false,
      progress: 15,
      total: 20,
      points: 750,
      rarity: "gold"
    },
    {
      id: 4,
      name: "Weight Warrior",
      description: "Complete 50 strength training sessions",
      icon: Medal,
      completed: false,
      progress: 32,
      total: 50,
      points: 1000,
      rarity: "platinum"
    }
  ];

  const rewards = [
    {
      id: 1,
      name: "Free Protein Shake",
      points: 250,
      category: "Food & Beverage",
      available: true
    },
    {
      id: 2,
      name: "Personal Training Session",
      points: 1500,
      category: "Training",
      available: true
    },
    {
      id: 3,
      name: "P&L Fitness T-Shirt",
      points: 800,
      category: "Merchandise",
      available: false
    },
    {
      id: 4,
      name: "Guest Pass (1 Week)",
      points: 600,
      category: "Access",
      available: true
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "bronze": return "text-orange-600";
      case "silver": return "text-gray-400";
      case "gold": return "text-yellow-500";
      case "platinum": return "text-purple-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Loyalty & Rewards</h2>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold">2,450 Points</span>
        </div>
      </div>

      {/* Level Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Level 12 - Fitness Enthusiast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progress to Level 13</span>
              <span className="text-sm font-medium">2,450 / 3,000 XP</span>
            </div>
            <Progress value={82} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Fitness Enthusiast</span>
              <span>550 XP to Fitness Warrior</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <div className={`p-2 rounded-full ${achievement.completed ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Icon className={`h-4 w-4 ${achievement.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{achievement.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRarityColor(achievement.rarity)}`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {!achievement.completed && achievement.progress && (
                      <div className="space-y-1">
                        <Progress value={(achievement.progress / achievement.total) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {achievement.progress} / {achievement.total}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">+{achievement.points} XP</span>
                      {achievement.completed && (
                        <Badge className="bg-green-500 text-white text-xs">Completed</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Rewards Store */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Rewards Store
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{reward.name}</h4>
                  <p className="text-xs text-muted-foreground">{reward.category}</p>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-primary" />
                    <span className="text-sm font-medium">{reward.points} points</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={reward.available ? "default" : "secondary"}
                  className={reward.available ? "bg-secondary hover:bg-secondary/90" : ""}
                  disabled={!reward.available}
                >
                  {reward.available ? "Redeem" : "Locked"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}