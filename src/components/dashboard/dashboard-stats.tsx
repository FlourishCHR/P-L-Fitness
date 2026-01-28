import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { 
  Trophy,
  ArrowRight,
  Lock,
  Calendar,
  Target,
  Gift,
  CreditCard
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function DashboardStats() {
  const { user } = useAuth();
  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || "Member";

  // Calculate membership data from user context
  const membershipData = {
    status: user?.membershipType || "No Membership",
    expires: user?.expiryDate
      ? new Date(user.expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : "N/A",
    monthsRemaining: user?.expiryDate
      ? Math.max(0, Math.ceil((new Date(user.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 0,
    isActive: user?.expiryDate ? new Date(user.expiryDate) > new Date() : false
  };

  const pointsData = {
    total: user?.totalExperience || 0,
    since: user?.joinDate
      ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : "N/A"
  };

  const achievements = [
    {
      id: 1,
      title: "First Workout",
      description: "Complete your first gym session",
      earned: true,
      date: "10/5/2024",
      icon: "workout"
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Work out 5 days in a week",
      earned: true,
      date: "10/5/2024",
      icon: "warrior"
    },
    {
      id: 3,
      title: "Consistency Ring",
      description: "Work out for 30 consecutive days",
      earned: false,
      icon: "consistency"
    },
    {
      id: 4,
      title: "Points Collector",
      description: "Earn 5,000 total points",
      earned: false,
      icon: "points"
    }
  ];

  const notifications = [
    {
      id: 1,
      category: "Class",
      title: "New Class Available",
      description: "Advanced Yoga class starts in 30 minutes",
      time: "5 minutes ago",
      icon: Calendar,
      color: "bg-[#00418E]"
    },
    {
      id: 2,
      category: "Challenge",
      title: "Challenge Approved",
      description: "Your 30-day pushup challenge has been verified!",
      time: "2 hours ago",
      icon: Target,
      color: "bg-[#991111]"
    },
    {
      id: 3,
      category: "Reward",
      title: "Points Added",
      description: "You've earned 250 points from your workout",
      time: "5 hours ago",
      icon: Gift,
      color: "bg-green-500"
    },
    {
      id: 4,
      category: "Membership",
      title: "Renewal Reminder",
      description: "Your membership will expire in 2 months",
      time: "1 day ago",
      icon: CreditCard,
      color: "bg-yellow-500"
    }
  ];

  // Calculate progress percentage for membership (assuming 12-month standard membership)
  const membershipProgress = membershipData.isActive
    ? Math.min(100, Math.max(0, ((12 - membershipData.monthsRemaining) / 12) * 100))
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Section - Three Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Back Card */}
        <Card className="text-white overflow-hidden relative card-hover-lift animate-fadeInUp stagger-1" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)', borderColor: '#1e3a8a', borderRadius: '16px' }}>
          <CardContent className="p-6">
            <div className="relative z-10">
              <p className="text-sm opacity-90 mb-1">Welcome Back,</p>
              <h2 className="text-2xl font-bold mb-2">{userName}</h2>
              <p className="text-sm opacity-90 mb-4">The grind doesn't stop let's<br />crush today's workout.</p>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 btn-hover-scale"
              >
                Profile <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            {/* Character illustration */}
            <div className="absolute right-4 bottom-0 w-28 h-32 animate-float">
              <div className="w-full h-full flex items-center justify-center text-7xl">
                🏋️
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Status Card */}
        <Card className="text-white card-hover-lift animate-fadeInUp stagger-2" style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)', borderColor: '#7f1d1d', borderRadius: '16px' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Membership Status</h3>
              <Badge className={`${membershipData.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white border-0 transition-smooth`}>
                {membershipData.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold">{membershipData.status}</div>
              <p className="text-xs opacity-90">
                {membershipData.isActive ? `Expires ${membershipData.expires}` : 'No active membership'}
              </p>
              <Progress value={membershipProgress} className="h-2 bg-white/20 transition-smooth" />
              <p className="text-xs opacity-90">
                {membershipData.isActive ? `${membershipData.monthsRemaining} months remaining` : 'Renew your membership'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-0 h-auto btn-hover-scale"
              >
                View <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Total Experience Earned Card */}
        <Card className="text-white relative overflow-hidden card-hover-lift animate-fadeInUp stagger-3" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)', borderColor: '#1e3a8a', borderRadius: '16px' }}>
          {/* Decorative trophy banner at top */}
          <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-center overflow-hidden transition-smooth" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
            <div className="flex gap-2 items-center">
              <Trophy className="h-6 w-6 text-yellow-300 animate-pulse" />
              {user?.currentRank && (
                <span className="text-white text-sm font-medium">{user.currentRank}</span>
              )}
            </div>
          </div>
          <CardContent className="p-6 pt-16">
            <div className="flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-medium opacity-90 mb-3">Total Experience<br />Earned</h3>
              <div className="bg-blue-700 rounded-full px-6 py-3 mb-3 transition-smooth hover:scale-110">
                <span className="text-white text-3xl font-bold">{pointsData.total.toLocaleString()}</span>
              </div>
              <p className="text-xs opacity-90">
                {pointsData.total > 0
                  ? <>You've earned a total of<br />{pointsData.total.toLocaleString()} XP since<br />{pointsData.since}</>
                  : <>Start your fitness journey<br />to earn experience points!</>
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <div className="space-y-4 animate-fadeInUp">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold">Achievements</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Unlock badges by completing challenges and reaching milestones
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <Card
              key={achievement.id}
              className={`${achievement.earned
                ? "bg-card border border-border card-hover-lift"
                : "bg-muted/30 border border-muted opacity-60 hover:opacity-80 transition-smooth"
              } animate-scaleIn stagger-${index + 1}`}
              style={{ borderRadius: '12px' }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    achievement.earned ? 'bg-red-600' : 'bg-gray-400'
                  }`}>
                    {achievement.earned ? (
                      <span className="text-2xl">💪</span>
                    ) : (
                      <Lock className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    {achievement.earned && (
                      <p className="text-xs text-muted-foreground">
                        {achievement.date}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="space-y-4 animate-fadeInUp">
        <h2 className="text-xl font-bold">NOTIFICATIONS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {notifications.map((notification, index) => {
            const Icon = notification.icon;
            return (
              <Card key={notification.id} className={`bg-card card-hover-lift cursor-pointer border border-border animate-scaleIn stagger-${index + 1}`} style={{ borderRadius: '12px' }}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded flex items-center justify-center ${notification.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                        {notification.category}
                      </p>
                      <h3 className="font-semibold text-sm mb-2">{notification.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
