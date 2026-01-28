import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Search, 
  Download,
  RefreshCw,
  Activity,
  Users,
  Timer,
  Calendar,
  Filter,
  Eye,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function AdminAccessLogging() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("today");

  // Mock data for members currently in the gym
  const currentlyInGym = [
    { 
      id: 1, 
      name: "Juan Dela Cruz", 
      membershipType: "Premium",
      timeIn: "2:15 PM",
      duration: "1h 45m",
      status: "active"
    },
    { 
      id: 2, 
      name: "Maria Santos", 
      membershipType: "VIP",
      timeIn: "3:30 PM",
      duration: "45m",
      status: "active"
    },
    { 
      id: 3, 
      name: "Pedro Reyes", 
      membershipType: "Basic",
      timeIn: "1:00 PM",
      duration: "3h 15m",
      status: "active"
    },
    { 
      id: 4, 
      name: "Ana Garcia", 
      membershipType: "Premium",
      timeIn: "4:00 PM",
      duration: "15m",
      status: "active"
    },
    { 
      id: 5, 
      name: "Carlos Mendoza", 
      membershipType: "Premium",
      timeIn: "2:45 PM",
      duration: "1h 30m",
      status: "active"
    },
  ];

  // Mock data for today's access log
  const todayAccessLog = [
    { 
      id: 1, 
      name: "Juan Dela Cruz", 
      membershipType: "Premium",
      timeIn: "2:15 PM",
      timeOut: null,
      duration: "1h 45m",
      status: "in-gym"
    },
    { 
      id: 2, 
      name: "Maria Santos", 
      membershipType: "VIP",
      timeIn: "3:30 PM",
      timeOut: null,
      duration: "45m",
      status: "in-gym"
    },
    { 
      id: 3, 
      name: "Lisa Tan", 
      membershipType: "Basic",
      timeIn: "6:00 AM",
      timeOut: "7:30 AM",
      duration: "1h 30m",
      status: "completed"
    },
    { 
      id: 4, 
      name: "Robert Cruz", 
      membershipType: "Premium",
      timeIn: "7:00 AM",
      timeOut: "8:45 AM",
      duration: "1h 45m",
      status: "completed"
    },
    { 
      id: 5, 
      name: "Pedro Reyes", 
      membershipType: "Basic",
      timeIn: "1:00 PM",
      timeOut: null,
      duration: "3h 15m",
      status: "in-gym"
    },
    { 
      id: 6, 
      name: "Sarah Johnson", 
      membershipType: "VIP",
      timeIn: "9:00 AM",
      timeOut: "10:15 AM",
      duration: "1h 15m",
      status: "completed"
    },
    { 
      id: 7, 
      name: "Ana Garcia", 
      membershipType: "Premium",
      timeIn: "4:00 PM",
      timeOut: null,
      duration: "15m",
      status: "in-gym"
    },
    { 
      id: 8, 
      name: "Michael Wong", 
      membershipType: "Basic",
      timeIn: "10:30 AM",
      timeOut: "12:00 PM",
      duration: "1h 30m",
      status: "completed"
    },
    { 
      id: 9, 
      name: "Carlos Mendoza", 
      membershipType: "Premium",
      timeIn: "2:45 PM",
      timeOut: null,
      duration: "1h 30m",
      status: "in-gym"
    },
    { 
      id: 10, 
      name: "Jenny Lee", 
      membershipType: "VIP",
      timeIn: "11:00 AM",
      timeOut: "1:00 PM",
      duration: "2h 0m",
      status: "completed"
    },
    { 
      id: 11, 
      name: "David Martinez", 
      membershipType: "Premium",
      timeIn: "8:00 AM",
      timeOut: "9:30 AM",
      duration: "1h 30m",
      status: "completed"
    },
    { 
      id: 12, 
      name: "Emma Rodriguez", 
      membershipType: "Basic",
      timeIn: "12:00 PM",
      timeOut: "1:15 PM",
      duration: "1h 15m",
      status: "completed"
    },
  ];

  // Filter the access log based on search and status
  const filteredAccessLog = todayAccessLog.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "in-gym" && entry.status === "in-gym") ||
                          (filterStatus === "completed" && entry.status === "completed");
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalVisitsToday = todayAccessLog.length;
  const currentlyInGymCount = currentlyInGym.length;
  const completedVisits = todayAccessLog.filter(entry => entry.status === "completed").length;
  const avgDuration = "1h 35m";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Gym Access Logging
          </h1>
          <p className="text-muted-foreground mt-1">Monitor real-time gym access and attendance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Log
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Currently In Gym
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-500">{currentlyInGymCount}</span>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Members inside facility</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Total Visits Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">{totalVisitsToday}</span>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  +12%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Check-ins recorded</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-secondary" />
              Completed Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-secondary">{completedVisits}</span>
                <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                  Done
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Checked out today</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{avgDuration}</span>
                <Badge variant="outline">
                  Per Visit
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Average session time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currently In Gym */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Currently In Gym
              </CardTitle>
              <CardDescription>Members who are currently inside the facility</CardDescription>
            </div>
            <Badge className="bg-green-500 text-white">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              {currentlyInGymCount} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentlyInGym.map((member) => (
              <div 
                key={member.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {member.membershipType}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 sm:mt-0">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Time In</div>
                    <div className="font-medium flex items-center gap-1">
                      <LogIn className="h-3 w-3" />
                      {member.timeIn}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium text-green-500">{member.duration}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Access Log */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Access Log
              </CardTitle>
              <CardDescription>Complete record of all check-ins and check-outs</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search members..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-gym">In Gym</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Access Log Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden md:table-cell">Membership</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead className="hidden lg:table-cell">Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccessLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-medium">{entry.name}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {entry.membershipType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <LogIn className="h-3 w-3 text-muted-foreground" />
                        {entry.timeIn}
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.timeOut ? (
                        <div className="flex items-center gap-1 text-sm">
                          <LogOut className="h-3 w-3 text-muted-foreground" />
                          {entry.timeOut}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm font-medium">{entry.duration}</span>
                    </TableCell>
                    <TableCell>
                      {entry.status === "in-gym" ? (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          <Activity className="h-3 w-3 mr-1" />
                          In Gym
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filteredAccessLog.length} of {todayAccessLog.length} entries
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}