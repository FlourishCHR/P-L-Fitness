import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../../services/api";

interface DashboardAnalytics {
  overview: {
    totalMembers: number;
    newThisMonth: number;
    memberGrowth: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    activeToday: number;
    totalSessions: number;
    activeSessions: number;
  };
  statusBreakdown: Array<{ status: string; count: number }>;
  roleBreakdown: Array<{ role: string; count: number }>;
  revenueTrend: Array<{ month: string; revenue: number; members: number }>;
  weeklyAttendance: Array<{ day: string; attendance: number }>;
  recentActivity: Array<{
    id: number;
    name: string;
    email: string;
    createdAt: string;
    role: string;
    activityType: string;
  }>;
}

export function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load dashboard analytics
  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: any = await api.getDashboardAnalytics();
      setAnalytics(response.data);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard analytics");
      console.error("Error loading analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Helper function to get growth indicator
  const getGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return (
        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
          <ArrowUp className="h-3 w-3 mr-1" />
          +{growth}%
        </Badge>
      );
    } else if (growth < 0) {
      return (
        <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
          <ArrowDown className="h-3 w-3 mr-1" />
          {growth}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <Minus className="h-3 w-3 mr-1" />
          0%
        </Badge>
      );
    }
  };

  // Get status/role colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "#22c55e",
      INACTIVE: "#eab308",
      SUSPENDED: "#ef4444",
      PENDING: "#3b82f6",
    };
    return colors[status] || "#6b7280";
  };

  if (isLoading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadAnalytics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of your fitness center
            <span className="text-xs ml-2">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {analytics?.overview.totalMembers.toLocaleString() || 0}
                    </span>
                    {analytics && getGrowthIndicator(analytics.overview.memberGrowth)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics?.overview.newThisMonth || 0} this month
                  </p>
                  <Progress
                    value={Math.min((analytics?.overview.newThisMonth || 0) / (analytics?.overview.totalMembers || 1) * 100, 100)}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-secondary" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-secondary">
                      ₱{(analytics?.overview.monthlyRevenue || 0).toLocaleString()}
                    </span>
                    {analytics && getGrowthIndicator(analytics.overview.revenueGrowth)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From payments this month
                  </p>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  Active Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-500">
                      {analytics?.overview.activeToday || 0}
                    </span>
                    <Badge variant="outline">Members</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Checked in today
                  </p>
                  <Progress
                    value={Math.min((analytics?.overview.activeToday || 0) / (analytics?.overview.totalMembers || 1) * 100, 100)}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-500">
                      {analytics?.overview.totalSessions || 0}
                    </span>
                    <Badge variant="outline">Classes</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.overview.activeSessions || 0} active sessions
                  </p>
                  <Progress
                    value={Math.min((analytics?.overview.activeSessions || 0) / (analytics?.overview.totalSessions || 1) * 100, 100)}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Last 6 months revenue and member growth</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.revenueTrend && analytics.revenueTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="month" stroke="#a3a3a3" />
                      <YAxis stroke="#a3a3a3" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #262626',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#dc2626"
                        strokeWidth={2}
                        name="Revenue (₱)"
                      />
                      <Line
                        type="monotone"
                        dataKey="members"
                        stroke="#1e40af"
                        strokeWidth={2}
                        name="Payments"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No revenue data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Attendance */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance</CardTitle>
                <CardDescription>Check-ins over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.weeklyAttendance && analytics.weeklyAttendance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.weeklyAttendance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="day" stroke="#a3a3a3" />
                      <YAxis stroke="#a3a3a3" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #262626',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="attendance" fill="#1e40af" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No attendance data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Real-time system monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database</span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">API Server</span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Auth System</span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Email Service</span>
                  </div>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                    Pending
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Member Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Member Status Distribution</CardTitle>
                <CardDescription>Breakdown by account status</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.statusBreakdown && analytics.statusBreakdown.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics.statusBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #262626',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {analytics.statusBreakdown.map((item) => (
                        <div key={item.status} className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getStatusColor(item.status) }}
                          />
                          <div>
                            <div className="font-medium">{item.status}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.count} members ({Math.round((item.count / (analytics.overview.totalMembers || 1)) * 100)}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No status data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>Breakdown by user role</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.roleBreakdown && analytics.roleBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.roleBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="role" stroke="#a3a3a3" />
                      <YAxis stroke="#a3a3a3" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #262626',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#dc2626" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No role data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Important metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Member Growth Rate</span>
                    <span className="font-bold text-primary">{analytics?.overview.memberGrowth.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.abs(analytics?.overview.memberGrowth || 0)} className="h-2" />
                  <p className="text-xs text-muted-foreground">Based on last 30 days</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    <span className="font-bold text-secondary">{analytics?.overview.revenueGrowth.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.abs(analytics?.overview.revenueGrowth || 0)} className="h-2" />
                  <p className="text-xs text-muted-foreground">Compared to last month</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Member Rate</span>
                    <span className="font-bold text-green-500">
                      {analytics ? ((analytics.overview.activeToday / analytics.overview.totalMembers) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={analytics ? (analytics.overview.activeToday / analytics.overview.totalMembers) * 100 : 0}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">Members active today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics?.statusBreakdown.map((status) => (
              <Card key={status.status}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                      style={{ backgroundColor: `${getStatusColor(status.status)}20` }}
                    >
                      <Users className="h-6 w-6" style={{ color: getStatusColor(status.status) }} />
                    </div>
                    <div className="text-2xl font-bold mb-1">{status.count}</div>
                    <div className="text-sm text-muted-foreground">{status.status} Members</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round((status.count / (analytics.overview.totalMembers || 1)) * 100)}% of total
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Member Insights</CardTitle>
              <CardDescription>Detailed breakdown of your membership base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">New Members (30 days)</div>
                    <div className="text-2xl font-bold text-primary">+{analytics?.overview.newThisMonth || 0}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Active Today</div>
                    <div className="text-2xl font-bold text-green-500">{analytics?.overview.activeToday || 0}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-secondary">₱{(analytics?.overview.monthlyRevenue || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest member registrations and activities</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                        <UserPlus className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{activity.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{activity.email}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline">{activity.role}</Badge>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
