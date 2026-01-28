import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Target, 
  Trophy, 
  Calendar, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  Star,
  Flame,
  Zap,
  Timer,
  Award,
  TrendingUp,
  Medal,
  Crown,
  Plus,
  CheckCheck
} from "lucide-react";

interface Challenge {
  id: number;
  title: string;
  description: string;
  xp: number;
  points: number;
  progress: number;
  total: number;
  timeLeft: string;
  status: "available" | "accepted" | "in-progress" | "completed";
  icon: string;
  difficulty: string;
  type: "attendance" | "special";
  autoActivate: boolean;
}

export function Challenges() {
  const [activeTab, setActiveTab] = useState("my-challenges");
  const [challenges, setChallenges] = useState<Challenge[]>([
    // Daily Attendance Challenges (Auto-activated)
    {
      id: 1,
      title: "Check In Today",
      description: "Scan your QR code and check in to the gym",
      xp: 50,
      points: 10,
      progress: 1,
      total: 1,
      timeLeft: "14h 23m",
      status: "completed",
      icon: "✓",
      difficulty: "easy",
      type: "attendance",
      autoActivate: true
    },
    {
      id: 2,
      title: "Morning Motivation",
      description: "Check in before 12:00 PM",
      xp: 100,
      points: 20,
      progress: 0,
      total: 1,
      timeLeft: "8h 15m",
      status: "in-progress",
      icon: "🌅",
      difficulty: "easy",
      type: "attendance",
      autoActivate: true
    },
    {
      id: 3,
      title: "Class Participant",
      description: "Attend any group class today",
      xp: 150,
      points: 30,
      progress: 0,
      total: 1,
      timeLeft: "14h 23m",
      status: "in-progress",
      icon: "👥",
      difficulty: "medium",
      type: "attendance",
      autoActivate: true
    },
    {
      id: 4,
      title: "Evening Warrior",
      description: "Check in after 5:00 PM",
      xp: 100,
      points: 20,
      progress: 0,
      total: 1,
      timeLeft: "14h 23m",
      status: "in-progress",
      icon: "🌙",
      difficulty: "easy",
      type: "attendance",
      autoActivate: true
    },
    // Weekly Consistency Challenges (Auto-activated)
    {
      id: 5,
      title: "Consistency King",
      description: "Check in 3 days this week",
      xp: 300,
      points: 50,
      progress: 2,
      total: 3,
      timeLeft: "3d 14h",
      status: "in-progress",
      icon: "👑",
      difficulty: "medium",
      type: "attendance",
      autoActivate: true
    },
    {
      id: 6,
      title: "Dedicated Member",
      description: "Check in 5 days this week",
      xp: 500,
      points: 100,
      progress: 2,
      total: 5,
      timeLeft: "3d 14h",
      status: "in-progress",
      icon: "💪",
      difficulty: "hard",
      type: "attendance",
      autoActivate: true
    },
    {
      id: 7,
      title: "Class Enthusiast",
      description: "Attend 3 group classes this week",
      xp: 400,
      points: 75,
      progress: 1,
      total: 3,
      timeLeft: "3d 14h",
      status: "in-progress",
      icon: "🎯",
      difficulty: "medium",
      type: "attendance",
      autoActivate: true
    },
    // Special Challenges (Manual acceptance required)
    {
      id: 8,
      title: "7-Day Streak Master",
      description: "Check in to the gym for 7 consecutive days",
      xp: 1000,
      points: 200,
      progress: 0,
      total: 7,
      timeLeft: "7 days",
      status: "available",
      icon: "🔥",
      difficulty: "hard",
      type: "special",
      autoActivate: false
    },
    {
      id: 9,
      title: "30-Day Challenge",
      description: "Check in at least 20 days this month",
      xp: 2500,
      points: 500,
      progress: 0,
      total: 20,
      timeLeft: "30 days",
      status: "available",
      icon: "📅",
      difficulty: "extreme",
      type: "special",
      autoActivate: false
    },
    {
      id: 10,
      title: "Perfect Week",
      description: "Check in all 7 days in a single week",
      xp: 1500,
      points: 300,
      progress: 0,
      total: 7,
      timeLeft: "7 days",
      status: "available",
      icon: "⭐",
      difficulty: "extreme",
      type: "special",
      autoActivate: false
    },
    {
      id: 11,
      title: "Class Champion",
      description: "Attend 15 group classes this month",
      xp: 2000,
      points: 400,
      progress: 0,
      total: 15,
      timeLeft: "30 days",
      status: "available",
      icon: "🏆",
      difficulty: "hard",
      type: "special",
      autoActivate: false
    },
    {
      id: 12,
      title: "Weekend Warrior",
      description: "Check in both Saturday and Sunday for 4 weeks",
      xp: 800,
      points: 150,
      progress: 0,
      total: 8,
      timeLeft: "28 days",
      status: "available",
      icon: "🎊",
      difficulty: "medium",
      type: "special",
      autoActivate: false
    },
    {
      id: 13,
      title: "Early Bird Special",
      description: "Check in before 7:00 AM for 10 days",
      xp: 1200,
      points: 250,
      progress: 0,
      total: 10,
      timeLeft: "Ongoing",
      status: "available",
      icon: "🌄",
      difficulty: "hard",
      type: "special",
      autoActivate: false
    },
  ]);

  // Leaderboard data
  const leaderboardData = [
    { rank: 1, name: "Alex Johnson", points: 12450, xp: 62250, challenges: 87, streak: 45, avatar: "AJ" },
    { rank: 2, name: "Sarah Martinez", points: 11800, xp: 59000, challenges: 82, streak: 38, avatar: "SM" },
    { rank: 3, name: "Mike Chen", points: 10950, xp: 54750, challenges: 76, streak: 42, avatar: "MC" },
    { rank: 4, name: "Emma Davis", points: 9800, xp: 49000, challenges: 68, streak: 28, avatar: "ED" },
    { rank: 5, name: "You", points: 8450, xp: 42250, challenges: 58, streak: 7, avatar: "YO", isCurrentUser: true },
    { rank: 6, name: "Chris Wilson", points: 7920, xp: 39600, challenges: 55, streak: 15, avatar: "CW" },
    { rank: 7, name: "Lisa Brown", points: 7450, xp: 37250, challenges: 52, streak: 21, avatar: "LB" },
    { rank: 8, name: "David Lee", points: 6800, xp: 34000, challenges: 47, streak: 12, avatar: "DL" },
  ];

  const handleAcceptChallenge = (challengeId: number) => {
    setChallenges(challenges.map(c => 
      c.id === challengeId ? { ...c, status: "accepted" as const } : c
    ));
  };

  const handleDeclineChallenge = (challengeId: number) => {
    setChallenges(challenges.map(c => 
      c.id === challengeId ? { ...c, status: "available" as const } : c
    ));
  };

  // Calculate stats
  const totalPointsEarned = challenges
    .filter(c => c.status === "completed")
    .reduce((sum, c) => sum + c.points, 0) + 8450; // Adding base points
  
  const totalXPEarned = challenges
    .filter(c => c.status === "completed")
    .reduce((sum, c) => sum + c.xp, 0) + 42250; // Adding base XP
  
  const totalChallengesCompleted = challenges.filter(c => c.status === "completed").length + 58;

  const myChallenges = challenges.filter(c => 
    c.autoActivate || c.status === "accepted" || c.status === "in-progress" || c.status === "completed"
  );

  const availableChallenges = challenges.filter(c => 
    !c.autoActivate && c.status === "available"
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-orange-500";
      case "extreme": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in-progress": return <PlayCircle className="h-5 w-5 text-primary" />;
      case "accepted": return <CheckCheck className="h-5 w-5 text-secondary" />;
      case "available": return <Target className="h-5 w-5 text-muted-foreground" />;
      default: return <Target className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-600" />;
      default: return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeInDown">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-primary">P&L</span>{" "}
            <span className="text-secondary">Challenges</span>
          </h1>
          <p className="text-muted-foreground">Complete challenges to earn XP, points, and climb the leaderboard</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 card-hover-lift animate-fadeInUp stagger-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Points Earned</div>
                <div className="text-3xl font-bold text-primary">{totalPointsEarned.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +150 this week
                </div>
              </div>
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10 card-hover-lift animate-fadeInUp stagger-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total EXP Earned</div>
                <div className="text-3xl font-bold text-secondary">{totalXPEarned.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +750 XP this week
                </div>
              </div>
              <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center">
                <Zap className="h-7 w-7 text-secondary animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10 card-hover-lift animate-fadeInUp stagger-3">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Challenges Completed</div>
                <div className="text-3xl font-bold text-green-500">{totalChallengesCompleted}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  7-day streak active
                </div>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenges Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fadeInUp">
        <TabsList className="grid w-full grid-cols-3 transition-smooth">
          <TabsTrigger value="my-challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>My Challenges</span>
            <Badge variant="secondary" className="ml-1">{myChallenges.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Available</span>
            <Badge variant="secondary" className="ml-1">{availableChallenges.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Leaderboard</span>
          </TabsTrigger>
        </TabsList>

        {/* My Challenges Tab */}
        <TabsContent value="my-challenges" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active & In-Progress Challenges</h3>
            <Badge variant="outline" className="text-sm">
              {myChallenges.filter(c => c.status === "in-progress" || c.status === "accepted").length} Active
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myChallenges.map((challenge, index) => (
              <Card
                key={challenge.id}
                className={`card-hover-lift animate-scaleIn stagger-${(index % 6) + 1} ${
                  challenge.status === "completed" ? "border-green-500/30 bg-green-500/5" :
                  challenge.status === "in-progress" ? "border-primary/30 bg-primary/5" :
                  challenge.status === "accepted" ? "border-secondary/30 bg-secondary/5" :
                  "hover:border-muted-foreground/20"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{challenge.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <span>{challenge.title}</span>
                          {getStatusIcon(challenge.status)}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">{challenge.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white text-xs`}>
                        {challenge.difficulty}
                      </Badge>
                      {challenge.autoActivate && (
                        <Badge variant="outline" className="text-xs">Auto</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{challenge.progress}/{challenge.total}</span>
                    </div>
                    <Progress 
                      value={(challenge.progress / challenge.total) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  {/* Rewards and Time */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Zap className="h-4 w-4 text-secondary" />
                        <span className="font-medium">{challenge.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="font-medium">{challenge.points} pts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Timer className="h-3 w-3" />
                      <span>{challenge.timeLeft}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {challenge.status === "accepted" && !challenge.autoActivate && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDeclineChallenge(challenge.id)}
                    >
                      Remove Challenge
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {myChallenges.length === 0 && (
            <Card className="p-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
              <p className="text-muted-foreground mb-4">Browse available challenges to get started</p>
              <Button onClick={() => setActiveTab("available")}>
                <Plus className="h-4 w-4 mr-2" />
                Browse Challenges
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Available Challenges Tab */}
        <TabsContent value="available" className="space-y-4 mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Special Challenges</h3>
            <p className="text-sm text-muted-foreground">
              Accept these challenges to add them to your active list. Attendance-based challenges are automatically tracked.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableChallenges.map((challenge) => (
              <Card 
                key={challenge.id} 
                className="transition-all hover:shadow-lg hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{challenge.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{challenge.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">{challenge.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white text-xs`}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Challenge Info */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Rewards</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-secondary" />
                          <span className="font-medium text-sm">{challenge.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{challenge.points} pts</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        <span>{challenge.timeLeft}</span>
                      </div>
                    </div>
                  </div>

                  {/* Goal */}
                  <div className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                    <span className="text-muted-foreground">Goal:</span>
                    <span className="font-medium">{challenge.total} {challenge.total === 1 ? 'completion' : 'completions'}</span>
                  </div>

                  {/* Accept Button */}
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleAcceptChallenge(challenge.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Accept Challenge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {availableChallenges.length === 0 && (
            <Card className="p-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Available Challenges</h3>
              <p className="text-muted-foreground">You've accepted all available special challenges!</p>
            </Card>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Challenge Leaderboard
              </CardTitle>
              <CardDescription>Top members ranked by challenge points and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.map((member) => (
                  <div
                    key={member.rank}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      member.isCurrentUser 
                        ? "bg-primary/10 border-primary/30 shadow-md" 
                        : "bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(member.rank)}
                      </div>

                      {/* Avatar */}
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        member.isCurrentUser 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {member.avatar}
                      </div>

                      {/* Name and Stats */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${member.isCurrentUser ? "text-primary" : ""}`}>
                            {member.name}
                          </span>
                          {member.isCurrentUser && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {member.challenges} challenges
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            {member.streak} day streak
                          </span>
                        </div>
                      </div>

                      {/* Points and XP */}
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 justify-end">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span className="font-bold text-sm">{member.points.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <Zap className="h-4 w-4 text-secondary" />
                          <span className="font-medium text-xs text-muted-foreground">
                            {member.xp.toLocaleString()} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Your Rank Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">5th</div>
                    <div className="text-xs text-muted-foreground mt-1">Your Rank</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">3,550</div>
                    <div className="text-xs text-muted-foreground mt-1">To Next Rank</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">↑ 2</div>
                    <div className="text-xs text-muted-foreground mt-1">This Week</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-500">7</div>
                    <div className="text-xs text-muted-foreground mt-1">Day Streak</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
