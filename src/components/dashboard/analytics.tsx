import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Calendar,
  Clock,
  Target,
  Award,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  UserPlus,
  UserMinus,
  Dumbbell,
  Star,
  Zap,
  Trophy
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ComposedChart
} from "recharts";

export function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Revenue data
  const revenueData = [
    { month: "Jan", revenue: 120000, expenses: 45000, profit: 75000, members: 1100 },
    { month: "Feb", revenue: 132000, expenses: 47000, profit: 85000, members: 1150 },
    { month: "Mar", revenue: 145000, expenses: 48000, profit: 97000, members: 1200 },
    { month: "Apr", revenue: 138000, expenses: 46000, profit: 92000, members: 1180 },
    { month: "May", revenue: 156000, expenses: 49000, profit: 107000, members: 1250 },
    { month: "Jun", revenue: 168000, expenses: 51000, profit: 117000, members: 1300 },
    { month: "Jul", revenue: 172000, expenses: 52000, profit: 120000, members: 1320 },
    { month: "Aug", revenue: 165000, expenses: 50000, profit: 115000, members: 1290 },
    { month: "Sep", revenue: 178000, expenses: 53000, profit: 125000, members: 1350 },
    { month: "Oct", revenue: 185000, expenses: 54000, profit: 131000, members: 1380 },
    { month: "Nov", revenue: 192000, expenses: 55000, profit: 137000, members: 1420 },
    { month: "Dec", revenue: 205000, expenses: 58000, profit: 147000, members: 1480 },
  ];

  // Member growth data
  const memberGrowthData = [
    { month: "Jan", new: 45, churned: 12, net: 33, total: 1100 },
    { month: "Feb", new: 62, churned: 8, net: 54, total: 1150 },
    { month: "Mar", new: 58, churned: 10, net: 48, total: 1200 },
    { month: "Apr", new: 42, churned: 15, net: 27, total: 1180 },
    { month: "May", new: 78, churned: 6, net: 72, total: 1250 },
    { month: "Jun", new: 65, churned: 9, net: 56, total: 1300 },
  ];

  // Attendance by day
  const attendanceByDay = [
    { day: "Monday", morning: 180, afternoon: 120, evening: 280, total: 580 },
    { day: "Tuesday", morning: 165, afternoon: 110, evening: 260, total: 535 },
    { day: "Wednesday", morning: 190, afternoon: 130, evening: 295, total: 615 },
    { day: "Thursday", morning: 175, afternoon: 115, evening: 270, total: 560 },
    { day: "Friday", morning: 170, afternoon: 125, evening: 310, total: 605 },
    { day: "Saturday", morning: 220, afternoon: 180, evening: 150, total: 550 },
    { day: "Sunday", morning: 150, afternoon: 140, evening: 110, total: 400 },
  ];

  // Peak hours data
  const peakHoursData = [
    { hour: "5AM", visitors: 45 },
    { hour: "6AM", visitors: 120 },
    { hour: "7AM", visitors: 180 },
    { hour: "8AM", visitors: 150 },
    { hour: "9AM", visitors: 90 },
    { hour: "10AM", visitors: 70 },
    { hour: "11AM", visitors: 85 },
    { hour: "12PM", visitors: 110 },
    { hour: "1PM", visitors: 95 },
    { hour: "2PM", visitors: 75 },
    { hour: "3PM", visitors: 80 },
    { hour: "4PM", visitors: 100 },
    { hour: "5PM", visitors: 200 },
    { hour: "6PM", visitors: 280 },
    { hour: "7PM", visitors: 320 },
    { hour: "8PM", visitors: 240 },
    { hour: "9PM", visitors: 160 },
    { hour: "10PM", visitors: 80 },
  ];

  // Class performance data
  const classPerformanceData = [
    { class: "HIIT", attendance: 92, capacity: 100, satisfaction: 4.8 },
    { class: "Yoga", attendance: 85, capacity: 90, satisfaction: 4.9 },
    { class: "Spin", attendance: 98, capacity: 100, satisfaction: 4.7 },
    { class: "Strength", attendance: 88, capacity: 100, satisfaction: 4.6 },
    { class: "Boxing", attendance: 76, capacity: 85, satisfaction: 4.8 },
    { class: "Pilates", attendance: 68, capacity: 75, satisfaction: 4.9 },
  ];

  // Membership distribution
  const membershipDistribution = [
    { name: "Basic", value: 423, percentage: 34, color: "#a3a3a3" },
    { name: "Premium", value: 687, percentage: 55, color: "#dc2626" },
    { name: "VIP", value: 137, percentage: 11, color: "#1e40af" },
  ];

  // Age demographics
  const ageDemographics = [
    { range: "18-24", count: 245 },
    { range: "25-34", count: 456 },
    { range: "35-44", count: 334 },
    { range: "45-54", count: 156 },
    { range: "55+", count: 56 },
  ];

  // Engagement metrics
  const engagementData = [
    { metric: "Classes", score: 85 },
    { metric: "Challenges", score: 72 },
    { metric: "Social", score: 68 },
    { metric: "Goals", score: 79 },
    { metric: "Rewards", score: 81 },
  ];

  // Retention data
  const retentionData = [
    { month: "Month 1", rate: 95 },
    { month: "Month 2", rate: 88 },
    { month: "Month 3", rate: 82 },
    { month: "Month 4", rate: 78 },
    { month: "Month 5", rate: 75 },
    { month: "Month 6", rate: 72 },
    { month: "Month 12", rate: 65 },
  ];

  // Revenue by source
  const revenueBySource = [
    { source: "Memberships", amount: 145000, percentage: 75 },
    { source: "Personal Training", amount: 28000, percentage: 15 },
    { source: "Merchandise", amount: 12000, percentage: 6 },
    { source: "Other", amount: 8000, percentage: 4 },
  ];

  const StatCard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon: Icon, 
    prefix = "", 
    suffix = "" 
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    changeType?: "positive" | "negative" | "neutral";
    icon: any;
    prefix?: string;
    suffix?: string;
  }) => {
    const getTrendIcon = () => {
      if (!change) return null;
      if (changeType === "positive") return <ArrowUp className="h-3 w-3" />;
      if (changeType === "negative") return <ArrowDown className="h-3 w-3" />;
      return <Minus className="h-3 w-3" />;
    };

    const getTrendColor = () => {
      if (changeType === "positive") return "text-green-500";
      if (changeType === "negative") return "text-red-500";
      return "text-muted-foreground";
    };

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{title}</p>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              {prefix}{value}{suffix}
            </p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(change)}%</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value="192K"
              prefix="₱"
              change={8.2}
              changeType="positive"
              icon={DollarSign}
            />
            <StatCard
              title="Active Members"
              value="1,247"
              change={5.4}
              changeType="positive"
              icon={Users}
            />
            <StatCard
              title="Avg Daily Attendance"
              value="542"
              change={-2.1}
              changeType="negative"
              icon={Activity}
            />
            <StatCard
              title="Member Retention"
              value="89"
              suffix="%"
              change={1.5}
              changeType="positive"
              icon={Trophy}
            />
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit Trend</CardTitle>
                <CardDescription>Monthly revenue and profit analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData.slice(-6)}>
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
                    <Bar dataKey="revenue" fill="#1e40af" name="Revenue" radius={[8, 8, 0, 0]} />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#dc2626" 
                      strokeWidth={2}
                      name="Profit"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Member Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Member Growth</CardTitle>
                <CardDescription>New vs. churned members</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memberGrowthData}>
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
                    <Bar dataKey="new" fill="#22c55e" name="New Members" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="churned" fill="#ef4444" name="Churned" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attendance by Day */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance Pattern</CardTitle>
                <CardDescription>Attendance distribution by day and time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={attendanceByDay}>
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
                    <Legend />
                    <Area type="monotone" dataKey="morning" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.6} name="Morning" />
                    <Area type="monotone" dataKey="afternoon" stackId="1" stroke="#1e40af" fill="#1e40af" fillOpacity={0.6} name="Afternoon" />
                    <Area type="monotone" dataKey="evening" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} name="Evening" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Membership Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Membership Distribution</CardTitle>
                <CardDescription>Current membership breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={membershipDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {membershipDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Class Fill Rate</p>
                    <p className="text-2xl font-bold text-primary">87%</p>
                  </div>
                  <Dumbbell className="h-8 w-8 text-primary/50" />
                </div>
                <Progress value={87} className="mt-3 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Visit Frequency</p>
                    <p className="text-2xl font-bold text-secondary">4.2/week</p>
                  </div>
                  <Calendar className="h-8 w-8 text-secondary/50" />
                </div>
                <Progress value={84} className="mt-3 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Member Satisfaction</p>
                    <p className="text-2xl font-bold text-green-500">4.7/5.0</p>
                  </div>
                  <Star className="h-8 w-8 text-green-500/50" />
                </div>
                <Progress value={94} className="mt-3 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Goal Completion</p>
                    <p className="text-2xl font-bold">76%</p>
                  </div>
                  <Target className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <Progress value={76} className="mt-3 h-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value="192,000"
              prefix="₱"
              change={8.2}
              changeType="positive"
              icon={DollarSign}
            />
            <StatCard
              title="Total Expenses"
              value="55,000"
              prefix="₱"
              change={3.1}
              changeType="positive"
              icon={TrendingDown}
            />
            <StatCard
              title="Net Profit"
              value="137,000"
              prefix="₱"
              change={12.4}
              changeType="positive"
              icon={TrendingUp}
            />
            <StatCard
              title="Profit Margin"
              value="71.4"
              suffix="%"
              change={2.8}
              changeType="positive"
              icon={BarChart3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>12-Month Revenue Trend</CardTitle>
                <CardDescription>Complete yearly overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
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
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#1e40af" 
                      fill="#1e40af" 
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#dc2626" 
                      fill="#dc2626" 
                      fillOpacity={0.3}
                      name="Profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Source */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
                <CardDescription>Revenue stream breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueBySource.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{source.source}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{source.percentage}%</span>
                          <span className="text-sm font-medium">₱{source.amount.toLocaleString()}</span>
                        </div>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Revenue</span>
                    <span className="text-xl font-bold text-primary">
                      ₱{revenueBySource.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue vs Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData.slice(-6)}>
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
                    <Bar dataKey="revenue" fill="#22c55e" name="Revenue" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Targets */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Target vs actual revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Target</span>
                    <span className="font-medium">₱180,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Revenue</span>
                    <span className="font-medium text-primary">₱192,000</span>
                  </div>
                  <Progress value={106.7} className="h-2" />
                  <div className="flex items-center gap-1 text-sm text-green-500">
                    <ArrowUp className="h-3 w-3" />
                    <span>106.7% of target achieved</span>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Monthly Revenue</span>
                    <span className="font-medium">₱165,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Highest Month</span>
                    <span className="font-medium">₱205,000 (Dec)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Growth Rate</span>
                    <span className="font-medium text-green-500">+15.2% YoY</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Members"
              value="1,247"
              change={5.4}
              changeType="positive"
              icon={Users}
            />
            <StatCard
              title="New This Month"
              value="78"
              change={12.3}
              changeType="positive"
              icon={UserPlus}
            />
            <StatCard
              title="Churned"
              value="6"
              change={-25.0}
              changeType="positive"
              icon={UserMinus}
            />
            <StatCard
              title="Net Growth"
              value="72"
              change={18.9}
              changeType="positive"
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Member Growth Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Member Growth Over Time</CardTitle>
                <CardDescription>Total member count trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
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
                    <Line 
                      type="monotone" 
                      dataKey="members" 
                      stroke="#1e40af" 
                      strokeWidth={3}
                      dot={{ fill: '#1e40af', r: 4 }}
                      name="Total Members"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Age Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
                <CardDescription>Member distribution by age group</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageDemographics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis type="number" stroke="#a3a3a3" />
                    <YAxis dataKey="range" type="category" stroke="#a3a3a3" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #262626',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#dc2626" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Retention Curve */}
            <Card>
              <CardHeader>
                <CardTitle>Member Retention Curve</CardTitle>
                <CardDescription>Retention rate over membership duration</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={retentionData}>
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
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.3}
                      name="Retention Rate %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Member Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Member Insights</CardTitle>
                <CardDescription>Key member statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Members</span>
                    <span className="font-medium">1,156 (93%)</span>
                  </div>
                  <Progress value={93} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Premium Members</span>
                    <span className="font-medium">687 (55%)</span>
                  </div>
                  <Progress value={55} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">VIP Members</span>
                    <span className="font-medium">137 (11%)</span>
                  </div>
                  <Progress value={11} className="h-2" />
                </div>
                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Member Age</span>
                    <span className="font-medium">32 years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gender Split</span>
                    <span className="font-medium">58% M / 42% F</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Lifetime Value</span>
                    <span className="font-medium text-primary">₱28,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Avg Daily Attendance"
              value="542"
              change={-2.1}
              changeType="negative"
              icon={Activity}
            />
            <StatCard
              title="Peak Attendance"
              value="320"
              change={5.2}
              changeType="positive"
              icon={TrendingUp}
            />
            <StatCard
              title="Utilization Rate"
              value="68"
              suffix="%"
              change={3.4}
              changeType="positive"
              icon={BarChart3}
            />
            <StatCard
              title="Avg Session Duration"
              value="82"
              suffix=" min"
              change={1.2}
              changeType="positive"
              icon={Clock}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Daily Peak Hours Analysis</CardTitle>
                <CardDescription>Hourly attendance distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="hour" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #262626',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#dc2626" 
                      fill="#dc2626" 
                      fillOpacity={0.4}
                      name="Visitors"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Class Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
                <CardDescription>Attendance and satisfaction by class type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classPerformanceData.map((classItem, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{classItem.class}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{classItem.attendance}%</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm">{classItem.satisfaction}</span>
                          </div>
                        </div>
                      </div>
                      <Progress value={classItem.attendance} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance Summary</CardTitle>
                <CardDescription>Total visitors by day of week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {attendanceByDay.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-24">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <Progress value={(day.total / 615) * 100} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{day.total}</span>
                  </div>
                ))}
                <div className="pt-3 border-t flex justify-between font-medium">
                  <span>Weekly Total</span>
                  <span className="text-primary">{attendanceByDay.reduce((sum, day) => sum + day.total, 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Challenges"
              value="12"
              change={20.0}
              changeType="positive"
              icon={Target}
            />
            <StatCard
              title="Participation Rate"
              value="76"
              suffix="%"
              change={8.5}
              changeType="positive"
              icon={Users}
            />
            <StatCard
              title="Goals Set"
              value="892"
              change={15.3}
              changeType="positive"
              icon={Trophy}
            />
            <StatCard
              title="Achievements Unlocked"
              value="1,234"
              change={22.7}
              changeType="positive"
              icon={Award}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Score by Category</CardTitle>
                <CardDescription>Multi-dimensional engagement analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={engagementData}>
                    <PolarGrid stroke="#262626" />
                    <PolarAngleAxis dataKey="metric" stroke="#a3a3a3" />
                    <PolarRadiusAxis stroke="#a3a3a3" />
                    <Radar 
                      name="Engagement Score" 
                      dataKey="score" 
                      stroke="#1e40af" 
                      fill="#1e40af" 
                      fillOpacity={0.5} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #262626',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Detailed engagement statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Challenge Completion Rate</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Social Interaction Score</span>
                    <span className="font-medium">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Goal Achievement Rate</span>
                    <span className="font-medium">76%</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reward Redemption Rate</span>
                    <span className="font-medium">81%</span>
                  </div>
                  <Progress value={81} className="h-2" />
                </div>
                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Session Duration</span>
                    <span className="font-medium">82 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Active Users</span>
                    <span className="font-medium">1,089 (87%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">App Usage Rate</span>
                    <span className="font-medium text-primary">94%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Challenges */}
            <Card>
              <CardHeader>
                <CardTitle>Top Challenges</CardTitle>
                <CardDescription>Most popular challenges by participation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "30-Day Squat Challenge", participants: 234, completion: 68 },
                  { name: "Weekly Cardio King", participants: 189, completion: 82 },
                  { name: "Iron Warrior", participants: 145, completion: 45 },
                  { name: "Flexibility Master", participants: 123, completion: 71 },
                  { name: "Core Crusher", participants: 98, completion: 64 },
                ].map((challenge, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{challenge.name}</span>
                      <Badge variant="outline">{challenge.participants} members</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={challenge.completion} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{challenge.completion}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievement Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Statistics</CardTitle>
                <CardDescription>Most unlocked achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "First Steps", icon: "🎯", unlocked: 1247, percentage: 100 },
                  { name: "Week Warrior", icon: "🔥", unlocked: 892, percentage: 72 },
                  { name: "Social Butterfly", icon: "🦋", unlocked: 645, percentage: 52 },
                  { name: "Strength Hero", icon: "💪", unlocked: 567, percentage: 45 },
                  { name: "Century Club", icon: "💯", unlocked: 234, percentage: 19 },
                ].map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{achievement.name}</span>
                        <span className="text-xs text-muted-foreground">{achievement.unlocked} members</span>
                      </div>
                      <Progress value={achievement.percentage} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
