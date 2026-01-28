import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { 
  Activity, 
  Calendar, 
  Clock, 
  Flame, 
  Target, 
  Trophy,
  TrendingUp,
  Users
} from "lucide-react";

export function SidebarStats() {
  return (
    <div className="space-y-4">
      {/* Membership Status */}
      <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">Premium</span>
              <Badge className="bg-primary text-primary-foreground text-xs">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Expires: Dec 31, 2025</p>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-muted-foreground">3 months remaining</p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Streak */}
      <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Flame className="h-4 w-4 text-secondary" />
            Weekly Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-secondary">12</span>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                Days
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Best: 18 days</p>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-3 rounded-sm ${
                    i < 5 ? 'bg-secondary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">This week: 5/7</p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Workout */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Today's Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">45</span>
              <Badge variant="outline" className="text-xs">Min</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Upper Body</p>
            <Progress value={30} className="h-2" />
            <p className="text-xs text-muted-foreground">In progress</p>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Points */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">2,450</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground">+150 this week</p>
            <div className="flex items-center gap-2">
              <Progress value={65} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground">65%</span>
            </div>
            <p className="text-xs text-muted-foreground">550 to next reward</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">This Month</span>
            <span className="text-sm font-medium">18 visits</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Avg Duration</span>
            <span className="text-sm font-medium">1.5h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Next Goal</span>
            <Badge variant="outline" className="text-xs">20 visits</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Level</span>
            <span className="text-sm font-medium text-primary">12</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}