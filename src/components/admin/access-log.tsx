import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Clock, 
  MapPin, 
  Activity, 
  Calendar,
  BarChart3,
  TrendingUp,
  CheckCircle
} from "lucide-react";

export function AccessLog() {
  const recentVisits = [
    {
      id: 1,
      date: "Today",
      time: "2:15 PM",
      checkIn: "2:15 PM",
      checkOut: "3:45 PM",
      duration: "1h 30m",
      area: "Cardio Zone",
      status: "active"
    },
    {
      id: 2,
      date: "Yesterday",
      time: "6:30 AM",
      checkIn: "6:30 AM",
      checkOut: "7:45 AM",
      duration: "1h 15m",
      area: "Weight Room",
      status: "completed"
    },
    {
      id: 3,
      date: "Sep 2",
      time: "5:00 PM",
      checkIn: "5:00 PM",
      checkOut: "6:30 PM",
      duration: "1h 30m",
      area: "Group Fitness",
      status: "completed"
    },
    {
      id: 4,
      date: "Sep 1",
      time: "7:00 AM",
      checkIn: "7:00 AM",
      checkOut: "8:15 AM",
      duration: "1h 15m",
      area: "Functional Training",
      status: "completed"
    },
    {
      id: 5,
      date: "Aug 31",
      time: "4:30 PM",
      checkIn: "4:30 PM",
      checkOut: "6:00 PM",
      duration: "1h 30m",
      area: "Swimming Pool",
      status: "completed"
    }
  ];

  const weeklyStats = [
    { day: "Mon", visits: 1, duration: "1.5h" },
    { day: "Tue", visits: 1, duration: "1.25h" },
    { day: "Wed", visits: 0, duration: "0h" },
    { day: "Thu", visits: 1, duration: "1.5h" },
    { day: "Fri", visits: 1, duration: "1.75h" },
    { day: "Sat", visits: 0, duration: "0h" },
    { day: "Sun", visits: 1, duration: "2h" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Access Log & Analytics</h2>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                In Gym
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Check-in Time</span>
              <span className="font-medium">2:15 PM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="font-medium text-primary">1h 30m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Area</span>
              <span className="font-medium">Cardio Zone</span>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Check Out
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              This Week's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weeklyStats.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                  <div 
                    className={`h-12 rounded-md flex items-center justify-center text-xs font-medium ${
                      day.visits > 0 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {day.visits > 0 ? day.duration : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {day.visits} visit{day.visits !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Total this week:</span>
                <span className="font-medium">5 visits, 8h 0m</span>
              </div>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                Goal: 4/7 days ✓
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Visits History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentVisits.map((visit) => (
              <div key={visit.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{visit.date}</div>
                    <div className="text-xs text-muted-foreground">{visit.time}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{visit.area}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>In: {visit.checkIn}</span>
                      {visit.checkOut && <span>Out: {visit.checkOut}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-primary">{visit.duration}</div>
                  <Badge 
                    variant={visit.status === "active" ? "default" : "secondary"}
                    className={visit.status === "active" ? "bg-green-500 text-white" : ""}
                  >
                    {visit.status === "active" ? "Active" : "Completed"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}