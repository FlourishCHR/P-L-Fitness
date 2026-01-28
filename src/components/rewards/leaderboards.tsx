import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  Calendar,
  Target,
  Crown,
  Flame,
  Activity,
  Clock,
} from "lucide-react";

export function Leaderboards() {
  const [selectedPeriod, setSelectedPeriod] =
    useState("weekly");

  const xpLeaderboard = [
    {
      rank: 1,
      name: "Alex Martinez",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      xp: 4250,
      level: 12,
      streak: 15,
      badge: "🥇",
    },
    {
      rank: 2,
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      xp: 3890,
      level: 11,
      streak: 12,
      badge: "🥈",
    },
    {
      rank: 3,
      name: "Mike Chen",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      xp: 3675,
      level: 10,
      streak: 9,
      badge: "🥉",
    },
    {
      rank: 4,
      name: "Emma Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      xp: 3420,
      level: 10,
      streak: 8,
      badge: "",
    },
    {
      rank: 5,
      name: "David Kim",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      xp: 3200,
      level: 9,
      streak: 7,
      badge: "",
    },
    {
      rank: 6,
      name: "Lisa Wong",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
      xp: 2980,
      level: 9,
      streak: 6,
      badge: "",
    },
    {
      rank: 7,
      name: "John Doe",
      avatar: "https://github.com/shadcn.png",
      xp: 2450,
      level: 8,
      streak: 7,
      badge: "",
      isCurrentUser: true,
    },
    {
      rank: 8,
      name: "Maria Santos",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face",
      xp: 2320,
      level: 8,
      streak: 5,
      badge: "",
    },
  ];

  const consistencyLeaderboard = [
    {
      rank: 1,
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      streak: 25,
      workouts: 89,
      percentage: 96,
      badge: "🔥",
    },
    {
      rank: 2,
      name: "Alex Martinez",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      streak: 18,
      workouts: 82,
      percentage: 94,
      badge: "⚡",
    },
    {
      rank: 3,
      name: "Emma Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      streak: 15,
      workouts: 78,
      percentage: 91,
      badge: "💪",
    },
    {
      rank: 4,
      name: "John Doe",
      avatar: "https://github.com/shadcn.png",
      streak: 7,
      workouts: 56,
      percentage: 85,
      badge: "",
      isCurrentUser: true,
    },
  ];

  const challengeLeaderboard = [
    {
      rank: 1,
      name: "Mike Chen",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      completed: 47,
      points: 1250,
      badge: "🎯",
    },
    {
      rank: 2,
      name: "Alex Martinez",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      completed: 42,
      points: 1180,
      badge: "🏆",
    },
    {
      rank: 3,
      name: "David Kim",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      completed: 38,
      points: 1050,
      badge: "⭐",
    },
    {
      rank: 4,
      name: "John Doe",
      avatar: "https://github.com/shadcn.png",
      completed: 31,
      points: 890,
      badge: "",
      isCurrentUser: true,
    },
  ];

  const getLeaderboardData = (type: string) => {
    switch (type) {
      case "xp":
        return xpLeaderboard;
      case "consistency":
        return consistencyLeaderboard;
      case "challenges":
        return challengeLeaderboard;
      default:
        return xpLeaderboard;
    }
  };

  const LeaderboardCard = ({
    data,
    type,
  }: {
    data: any[];
    type: string;
  }) => (
    <div className="space-y-2">
      {data.map((member) => (
        <Card
          key={member.rank}
          className={`transition-all hover:shadow-md ${
            member.isCurrentUser
              ? "ring-2 ring-primary bg-primary/5"
              : ""
          } ${
            member.rank <= 3
              ? "border-yellow-500/20 bg-yellow-500/5"
              : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center min-w-[40px]">
                  <div className="text-lg font-bold">
                    {member.rank}
                  </div>
                  {member.badge && (
                    <div className="text-lg">
                      {member.badge}
                    </div>
                  )}
                </div>

                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  {member.isCurrentUser && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      You
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                {type === "xp" && (
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {member.xp.toLocaleString()} XP
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Level {member.level}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Flame className="h-3 w-3 mr-1 text-orange-500" />
                      {member.streak} day streak
                    </div>
                  </div>
                )}

                {type === "consistency" && (
                  <div>
                    <div className="text-lg font-bold text-secondary">
                      {member.percentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.workouts} workouts
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Flame className="h-3 w-3 mr-1 text-orange-500" />
                      {member.streak} day streak
                    </div>
                  </div>
                )}

                {type === "challenges" && (
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {member.completed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.points} points
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leaderboards</h1>
          <p className="text-muted-foreground">
            See how you rank against other P&L Fitness members
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={
              selectedPeriod === "weekly"
                ? "default"
                : "outline"
            }
            onClick={() => setSelectedPeriod("weekly")}
          >
            This Week
          </Button>
          <Button
            variant={
              selectedPeriod === "monthly"
                ? "default"
                : "outline"
            }
            onClick={() => setSelectedPeriod("monthly")}
          >
            This Month
          </Button>
        </div>
      </div>

      {/* Your Rank Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">
                  XP Ranking
                </div>
                <div className="text-2xl font-bold">#7</div>
                <div className="text-xs text-muted-foreground">
                  2,450 XP
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Consistency
                </div>
                <div className="text-2xl font-bold">#4</div>
                <div className="text-xs text-muted-foreground">
                  85% rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Challenges
                </div>
                <div className="text-2xl font-bold">#4</div>
                <div className="text-xs text-muted-foreground">
                  31 completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="xp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="xp"
            className="flex items-center space-x-2"
          >
            <Trophy className="h-4 w-4" />
            <span>XP Leaders</span>
          </TabsTrigger>
          <TabsTrigger
            value="consistency"
            className="flex items-center space-x-2"
          >
            <Flame className="h-4 w-4" />
            <span>Consistency</span>
          </TabsTrigger>
          <TabsTrigger
            value="challenges"
            className="flex items-center space-x-2"
          >
            <Target className="h-4 w-4" />
            <span>Challenges</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="xp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                Top XP Earners (
                {selectedPeriod === "weekly"
                  ? "This Week"
                  : "This Month"}
                )
              </CardTitle>
              <CardDescription>
                Members ranked by total experience points earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardCard
                data={getLeaderboardData("xp")}
                type="xp"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flame className="mr-2 h-5 w-5 text-orange-500" />
                Most Consistent (
                {selectedPeriod === "weekly"
                  ? "This Week"
                  : "This Month"}
                )
              </CardTitle>
              <CardDescription>
                Members with the highest workout consistency
                rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardCard
                data={getLeaderboardData("consistency")}
                type="consistency"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-yellow-600" />
                Challenge Champions (
                {selectedPeriod === "weekly"
                  ? "This Week"
                  : "This Month"}
                )
              </CardTitle>
              <CardDescription>
                Members who completed the most challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardCard
                data={getLeaderboardData("challenges")}
                type="challenges"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Competition Info */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5 text-purple-500" />
            Monthly Competition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-medium">1st Place</div>
              <div className="text-sm text-muted-foreground">
                Free personal training session
              </div>
            </div>
            <div>
              <div className="text-2xl mb-2">🥈</div>
              <div className="font-medium">2nd Place</div>
              <div className="text-sm text-muted-foreground">
                P&L Fitness merchandise
              </div>
            </div>
            <div>
              <div className="text-2xl mb-2">🥉</div>
              <div className="font-medium">3rd Place</div>
              <div className="text-sm text-muted-foreground">
                Protein shake vouchers
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Competition resets on the 1st of every month. Keep
            pushing to climb the ranks!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}