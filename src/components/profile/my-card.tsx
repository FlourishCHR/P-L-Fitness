import { LoyaltyCard } from "./loyalty-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  CreditCard, 
  Star, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Gift,
  Trophy,
  Zap
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

// Helper functions - defined before component to avoid hoisting issues
function calculateStreak(attendance: any[]): number {
  if (!attendance || attendance.length === 0) return 0;
  // Sort by date descending
  const sorted = attendance
    .filter(a => a.checkout)
    .sort((a, b) => new Date(b.checkout).getTime() - new Date(a.checkout).getTime());

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const checkDate = new Date(sorted[i].checkout);
    checkDate.setHours(0, 0, 0, 0);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (checkDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateMemberSince(joinDate: string): string {
  if (!joinDate) return 'N/A';
  const join = new Date(joinDate);
  const now = new Date();
  const months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
  return `${months} month${months !== 1 ? 's' : ''}`;
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function MyCard() {
  const { user } = useAuth();
  const { data: profile, loading: profileLoading, error: profileError } = useApi(() => api.getProfile());
  const { data: pointsData, loading: pointsLoading, error: pointsError } = useApi(() => api.getPoints());
  const { data: attendanceData, loading: attendanceLoading, error: attendanceError } = useApi(() => api.loadAttendance());

  const isLoading = profileLoading || pointsLoading || attendanceLoading;
  const hasError = profileError || pointsError || attendanceError;

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading membership card...</p>
        </div>
      </div>
    );
  }

  // Show error state if all API calls failed or user not authenticated
  if (hasError && !profile && !user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Unable to Load Card</h2>
          <p className="text-muted-foreground mb-4">Please log in to view your membership card.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Extract data from API responses (API returns {message, data})
  const profileData = (profile as any)?.data;
  const attendance = (attendanceData as any)?.data || [];

  // Calculate stats from attendance data
  const totalVisits = attendance?.length || 0;
  const currentStreak = calculateStreak(attendance || []);

  const userData = {
    memberName: profileData?.name || user?.username || "Member",
    memberId: profileData?.memberId || "PL2024-000000",
    membershipTier: (profileData?.membershipType?.toLowerCase() || "basic") as "basic" | "premium" | "vip",
    expiryDate: formatDate(profileData?.expiryDate || ""),
    joinDate: formatDate(profileData?.joinDate || ""),
    totalVisits,
    currentStreak,
    memberSince: calculateMemberSince(profileData?.joinDate || ""),
    nextBilling: formatDate(profileData?.nextBilling || ""),
    autoRenew: profileData?.autoRenew || false
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          My Membership Card
        </h1>
        <p className="text-muted-foreground">Your digital access pass to P&L Fitness</p>
      </div>

      {/* Membership Status */}
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium flex items-center gap-2">
                Active Membership
                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                Valid until {userData.expiryDate} • Auto-renew {userData.autoRenew ? "ON" : "OFF"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Card */}
      <LoyaltyCard
        memberName={userData.memberName}
        memberId={userData.memberId}
        membershipTier={userData.membershipTier}
        expiryDate={userData.expiryDate}
        joinDate={userData.joinDate}
        showActions={true}
      />

      {/* Member Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold text-primary">{userData.totalVisits}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-secondary">{userData.currentStreak} days</p>
              </div>
              <Zap className="h-8 w-8 text-secondary/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-2xl font-bold">{userData.memberSince}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="text-sm font-medium">{userData.nextBilling}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Active Benefits
            </CardTitle>
            <CardDescription>Your Premium membership perks</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>24/7 Gym Access</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlimited Group Classes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>2 Free Guest Passes Monthly</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Nutrition Consultation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>10% Rewards Store Discount</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Priority Class Booking</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Membership Rewards
            </CardTitle>
            <CardDescription>Unlock exclusive perks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Loyalty Bonus</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Earn 2x XP points on all activities as a Premium member
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Birthday Gift</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Receive a special birthday reward and free personal training session
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Streak Rewards</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Maintain your streak for exclusive monthly bonuses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Membership</CardTitle>
          <CardDescription>Update your subscription and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Update Billing
            </Button>
            <Button variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button variant="outline">
              <Gift className="h-4 w-4 mr-2" />
              Refer a Friend
            </Button>
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
