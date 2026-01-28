import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import {
  Clock,
  LogIn,
  Activity,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Users,
  Server,
  Zap,
  Shield,
  FileText
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import api from "../../services/api";

interface AccessLog {
  id: number;
  userId: number | null;
  username: string | null;
  action: string;
  resourceType: string;
  resourceId: number | null;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string | null;
  userAgent: string | null;
  requestBody: string | null;
  responseMessage: string | null;
  severity: string;
  category: string;
  createdAt: string;
}

interface LogAnalytics {
  summary: {
    totalRequests: number;
    period: string;
  };
  statusBreakdown: Array<{ statusCategory: string; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
  severityBreakdown: Array<{ severity: string; count: number }>;
  topUsers: Array<{ userId: number; username: string; requestCount: number; avgResponseTime: number }>;
  topActions: Array<{ action: string; count: number }>;
  responseTimeTrend: Array<{ hour: string; avgResponseTime: number; maxResponseTime: number; minResponseTime: number; requestCount: number }>;
  errorRateTrend: Array<{ hour: string; totalRequests: number; errorCount: number; errorRate: number }>;
  recentErrors: Array<any>;
  peakHours: Array<{ hour: number; requestCount: number; avgResponseTime: number }>;
  topEndpoints: Array<{ endpoint: string; method: string; count: number; avgResponseTime: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function AccessLogsDashboard() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [analytics, setAnalytics] = useState<LogAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'analytics' | 'errors'>('logs');

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [period, setPeriod] = useState("24h");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadLogs();
    loadAnalytics();
  }, [page, filterCategory, filterSeverity, filterAction, searchQuery]);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.loadAccessLogs({
        page,
        limit: 25,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        severity: filterSeverity !== 'all' ? filterSeverity : undefined,
        action: filterAction !== 'all' ? filterAction : undefined,
        search: searchQuery || undefined
      });

      // Check if table is not initialized
      if (response.data.tableNotInitialized) {
        setError('Access logs table not initialized. Please run: node scripts/init-access-logs.js in your project directory to create the required database table.');
        setLogs([]);
        setPagination(null);
      } else {
        setLogs(response.data.logs);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      console.error('Error loading access logs:', err);
      setError(err.message || 'Failed to load access logs');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await api.getAccessLogAnalytics(period);
      // Check if table is initialized
      if (!response.data.tableNotInitialized) {
        setAnalytics(response.data);
      } else {
        // Set empty analytics if table not initialized
        setAnalytics(response.data);
      }
    } catch (err: any) {
      console.error('Error loading analytics:', err);
    }
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 500) {
      return <Badge className="bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" />{statusCode}</Badge>;
    } else if (statusCode >= 400) {
      return <Badge className="bg-orange-500 text-white"><AlertCircle className="h-3 w-3 mr-1" />{statusCode}</Badge>;
    } else if (statusCode >= 300) {
      return <Badge className="bg-yellow-500 text-white">{statusCode}</Badge>;
    } else if (statusCode >= 200) {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />{statusCode}</Badge>;
    }
    return <Badge variant="outline">{statusCode}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      'INFO': 'bg-blue-100 text-blue-800',
      'WARNING': 'bg-yellow-100 text-yellow-800',
      'ERROR': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[severity] || 'bg-gray-100 text-gray-800'}>{severity}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'AUTH': 'bg-purple-100 text-purple-800',
      'USER': 'bg-blue-100 text-blue-800',
      'SESSION': 'bg-green-100 text-green-800',
      'PAYMENT': 'bg-yellow-100 text-yellow-800',
      'ATTENDANCE': 'bg-cyan-100 text-cyan-800',
      'ADMIN': 'bg-red-100 text-red-800',
      'SYSTEM': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
  };

  const exportLogs = () => {
    const csvData = logs.map(log => ({
      Timestamp: new Date(log.createdAt).toISOString(),
      Username: log.username || 'N/A',
      Action: log.action,
      Category: log.category,
      Method: log.method,
      Endpoint: log.endpoint,
      Status: log.statusCode,
      ResponseTime: `${log.responseTime}ms`,
      Severity: log.severity,
      IP: log.ipAddress || 'N/A'
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `access_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="font-semibold mb-2">Access Logs Not Initialized</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <div className="bg-muted p-4 rounded-lg text-left mb-4">
                <p className="text-xs font-medium mb-2">To initialize the access logging system:</p>
                <ol className="text-xs space-y-1 list-decimal list-inside">
                  <li>Open your terminal in the project directory</li>
                  <li>Run: <code className="bg-background px-2 py-0.5 rounded">node scripts/init-access-logs.js</code></li>
                  <li>Wait for the table creation to complete</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
              <Button onClick={loadLogs}>
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
            <Shield className="h-6 w-6 text-primary" />
            System Access Logs
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive logging and monitoring of all system activities</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {analytics.summary.totalRequests.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last {period}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {analytics.statusBreakdown.length > 0 ? (
                  <>
                    {(((analytics.statusBreakdown.find(s => s.statusCategory === '2xx Success')?.count || 0) / analytics.summary.totalRequests) * 100).toFixed(1)}%
                  </>
                ) : '0%'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Successful responses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {analytics.recentErrors.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Recent error count</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                Avg Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {analytics.responseTimeTrend.length > 0 ? (
                  <>
                    {Math.round(analytics.responseTimeTrend.reduce((acc, t) => acc + t.avgResponseTime, 0) / analytics.responseTimeTrend.length)}ms
                  </>
                ) : '0ms'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average latency</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">
            <FileText className="h-4 w-4 mr-2" />
            Access Logs
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertCircle className="h-4 w-4 mr-2" />
            Errors
          </TabsTrigger>
        </TabsList>

        {/* Access Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Access Log Entries</CardTitle>
                  <CardDescription>Complete record of all API requests and system activities</CardDescription>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="AUTH">Auth</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="SESSION">Session</SelectItem>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                    <SelectItem value="ATTENDANCE">Attendance</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SYSTEM">System</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                    <SelectItem value="VIEW_USER">View User</SelectItem>
                    <SelectItem value="CREATE_USER">Create User</SelectItem>
                    <SelectItem value="UPDATE_USER">Update User</SelectItem>
                    <SelectItem value="DELETE_USER">Delete User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="hidden lg:table-cell">Category</TableHead>
                      <TableHead className="hidden md:table-cell">Endpoint</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Response Time</TableHead>
                      <TableHead className="hidden lg:table-cell">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No access logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-muted/50">
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {log.username || <span className="text-muted-foreground">Anonymous</span>}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">{log.action}</code>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {getCategoryBadge(log.category)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="max-w-[200px] truncate text-xs">
                              <Badge variant="outline" className="mr-1">{log.method}</Badge>
                              {log.endpoint}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(log.statusCode)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className={log.responseTime > 1000 ? 'text-orange-600 font-semibold' : ''}>
                              {log.responseTime}ms
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {getSeverityBadge(log.severity)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total entries)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Response Time Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trend</CardTitle>
                  <CardDescription>Average, min, and max response times over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.responseTimeTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.responseTimeTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="avgResponseTime" stroke="#3b82f6" name="Avg" strokeWidth={2} />
                        <Line type="monotone" dataKey="maxResponseTime" stroke="#ef4444" name="Max" strokeWidth={1} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="minResponseTime" stroke="#10b981" name="Min" strokeWidth={1} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>

              {/* Error Rate Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Error Rate Trend</CardTitle>
                  <CardDescription>Percentage of failed requests over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.errorRateTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.errorRateTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="errorRate" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Error Rate (%)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>

              {/* Breakdown Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status Code Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.statusBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analytics.statusBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.statusCategory}: ${entry.count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analytics.statusBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No data available</div>
                    )}
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Requests by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.categoryBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analytics.categoryBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No data available</div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Users */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.topUsers.length > 0 ? (
                      <div className="space-y-2">
                        {analytics.topUsers.slice(0, 5).map((user, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-xs text-muted-foreground">{user.requestCount} requests</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{Math.round(user.avgResponseTime)}ms</div>
                              <div className="text-xs text-muted-foreground">avg time</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No data available</div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.topActions.length > 0 ? (
                      <div className="space-y-2">
                        {analytics.topActions.slice(0, 5).map((action, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <code className="text-sm font-medium">{action.action}</code>
                            <Badge>{action.count}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No data available</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Top Endpoints */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Accessed Endpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.topEndpoints.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Method</TableHead>
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Requests</TableHead>
                            <TableHead>Avg Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.topEndpoints.map((endpoint, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Badge variant="outline">{endpoint.method}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{endpoint.endpoint}</TableCell>
                              <TableCell>{endpoint.count}</TableCell>
                              <TableCell>{Math.round(endpoint.avgResponseTime)}ms</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Recent Errors & Failures
              </CardTitle>
              <CardDescription>Failed requests and error responses in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && analytics.recentErrors.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentErrors.map((error, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium">{error.username || 'Anonymous'}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(error.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(error.severity)}
                          {getStatusBadge(error.statusCode)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <code className="bg-red-100 px-2 py-0.5 rounded text-xs">{error.action}</code>
                          <span className="mx-2 text-muted-foreground">•</span>
                          <span className="font-mono text-xs">{error.endpoint}</span>
                        </div>
                        {error.message && (
                          <div className="text-sm text-red-700 mt-2">{error.message}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No errors in the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
