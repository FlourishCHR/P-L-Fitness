import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { 
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  Upload,
  Image as ImageIcon,
  Megaphone,
  Trophy,
  Gift,
  Award,
  Calendar,
  Dumbbell,
  Bell,
  Mail,
  Copy,
  MoreVertical,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Target,
  Star
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ContentItem {
  id: number;
  title: string;
  description: string;
  status: "Published" | "Draft" | "Scheduled" | "Archived";
  author: string;
  createdAt: string;
  publishDate?: string;
  category?: string;
  views?: number;
  likes?: number;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  xpReward: number;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: string;
  status: "Active" | "Inactive";
  participants: number;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  stock: number;
  status: "Available" | "Out of Stock" | "Coming Soon";
  redemptions: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  xpReward: number;
  unlocked: number;
}

export function ContentManagement() {
  const [selectedTab, setSelectedTab] = useState("announcements");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Mock data for announcements
  const [announcements, setAnnouncements] = useState<ContentItem[]>([
    {
      id: 1,
      title: "New HIIT Classes Starting Next Week",
      description: "Join our high-intensity interval training sessions every Monday and Wednesday at 6 PM. Limited slots available!",
      status: "Published",
      author: "Admin",
      createdAt: "2024-11-15",
      publishDate: "2024-11-15",
      views: 234,
      likes: 45
    },
    {
      id: 2,
      title: "Holiday Hours - Christmas Schedule",
      description: "Please note our special operating hours during the holiday season. We'll be open from 6 AM to 8 PM on Christmas Eve and closed on Christmas Day.",
      status: "Scheduled",
      author: "Admin",
      createdAt: "2024-11-10",
      publishDate: "2024-12-20",
      views: 0,
      likes: 0
    },
    {
      id: 3,
      title: "Free Personal Training Sessions",
      description: "Premium members get 2 free personal training sessions this month! Book your slot now before they fill up.",
      status: "Published",
      author: "Coach Mike",
      createdAt: "2024-11-12",
      publishDate: "2024-11-12",
      views: 456,
      likes: 89
    },
  ]);

  // Mock data for classes
  const [classes, setClasses] = useState([
    {
      id: 1,
      name: "HIIT Training",
      description: "High-intensity interval training to burn calories and build endurance",
      instructor: "Coach Mike",
      duration: "45 mins",
      difficulty: "Hard",
      maxCapacity: 20,
      status: "Active"
    },
    {
      id: 2,
      name: "Yoga Flow",
      description: "Vinyasa flow yoga for flexibility and mindfulness",
      instructor: "Coach Sarah",
      duration: "60 mins",
      difficulty: "Easy",
      maxCapacity: 15,
      status: "Active"
    },
    {
      id: 3,
      name: "Strength & Conditioning",
      description: "Build muscle and strength with progressive overload training",
      instructor: "Coach John",
      duration: "60 mins",
      difficulty: "Medium",
      maxCapacity: 25,
      status: "Active"
    },
  ]);

  // Mock data for challenges
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 1,
      name: "30-Day Squat Challenge",
      description: "Complete 100 squats daily for 30 days",
      xpReward: 500,
      difficulty: "Medium",
      duration: "30 days",
      status: "Active",
      participants: 145
    },
    {
      id: 2,
      name: "Weekly Cardio King",
      description: "Log 5 cardio sessions in one week",
      xpReward: 200,
      difficulty: "Easy",
      duration: "7 days",
      status: "Active",
      participants: 234
    },
    {
      id: 3,
      name: "Iron Warrior - 1000 Push-ups",
      description: "Complete 1000 push-ups in one month",
      xpReward: 1000,
      difficulty: "Hard",
      duration: "30 days",
      status: "Active",
      participants: 67
    },
  ]);

  // Mock data for rewards
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      name: "Protein Shake",
      description: "Premium whey protein shake - your choice of flavor",
      pointsCost: 300,
      category: "Nutrition",
      stock: 50,
      status: "Available",
      redemptions: 234
    },
    {
      id: 2,
      name: "P&L Fitness T-Shirt",
      description: "Official P&L Fitness branded t-shirt in black or red",
      pointsCost: 800,
      category: "Merchandise",
      stock: 0,
      status: "Out of Stock",
      redemptions: 89
    },
    {
      id: 3,
      name: "1 Month Premium Upgrade",
      description: "Upgrade to premium membership for one month",
      pointsCost: 2500,
      category: "Membership",
      stock: 999,
      status: "Available",
      redemptions: 45
    },
  ]);

  // Mock data for achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first workout",
      icon: "🎯",
      requirement: "1 workout completed",
      xpReward: 50,
      unlocked: 1247
    },
    {
      id: 2,
      name: "Streak Master",
      description: "Maintain a 7-day workout streak",
      icon: "🔥",
      requirement: "7-day streak",
      xpReward: 200,
      unlocked: 456
    },
    {
      id: 3,
      name: "Century Club",
      description: "Complete 100 total workouts",
      icon: "💯",
      requirement: "100 workouts",
      xpReward: 500,
      unlocked: 234
    },
  ]);

  // Mock data for events
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "New Year Fitness Challenge",
      description: "Kickstart 2025 with our month-long fitness challenge featuring prizes and giveaways",
      date: "2025-01-01",
      time: "6:00 AM",
      location: "Main Gym Floor",
      slots: 100,
      registered: 67,
      status: "Open"
    },
    {
      id: 2,
      title: "Nutrition Workshop",
      description: "Learn about meal planning and nutrition for optimal fitness results",
      date: "2024-12-05",
      time: "7:00 PM",
      location: "Conference Room",
      slots: 30,
      registered: 30,
      status: "Full"
    },
  ]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Published: "bg-green-500/20 text-green-500 border-green-500/30",
      Draft: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      Scheduled: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      Archived: "bg-gray-500/20 text-gray-500 border-gray-500/30",
      Active: "bg-green-500/20 text-green-500 border-green-500/30",
      Inactive: "bg-red-500/20 text-red-500 border-red-500/30",
      Available: "bg-green-500/20 text-green-500 border-green-500/30",
      "Out of Stock": "bg-red-500/20 text-red-500 border-red-500/30",
      "Coming Soon": "bg-blue-500/20 text-blue-500 border-blue-500/30",
      Open: "bg-green-500/20 text-green-500 border-green-500/30",
      Full: "bg-red-500/20 text-red-500 border-red-500/30"
    };
    return <Badge variant="outline" className={variants[status] || ""}>{status}</Badge>;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants: Record<string, string> = {
      Easy: "bg-green-500/20 text-green-500 border-green-500/30",
      Medium: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      Hard: "bg-red-500/20 text-red-500 border-red-500/30"
    };
    return <Badge variant="outline" className={variants[difficulty] || ""}>{difficulty}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Content Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage all platform content and resources</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-1">
          <TabsTrigger value="announcements">
            <Megaphone className="h-4 w-4 mr-2 hidden sm:inline" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="classes">
            <Dumbbell className="h-4 w-4 mr-2 hidden sm:inline" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="h-4 w-4 mr-2 hidden sm:inline" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-2 hidden sm:inline" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Award className="h-4 w-4 mr-2 hidden sm:inline" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2 hidden sm:inline" />
            Events
          </TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Manage news and announcements for members</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{announcement.title}</h4>
                          {getStatusBadge(announcement.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{announcement.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>By {announcement.author}</span>
                          <span>Created: {announcement.createdAt}</span>
                          {announcement.publishDate && <span>Published: {announcement.publishDate}</span>}
                          {announcement.views !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {announcement.views} views
                            </span>
                          )}
                          {announcement.likes !== undefined && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {announcement.likes} likes
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Class Types</CardTitle>
                  <CardDescription>Manage available class types and descriptions</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Class Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Name</TableHead>
                      <TableHead className="hidden md:table-cell">Instructor</TableHead>
                      <TableHead className="hidden lg:table-cell">Duration</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead className="hidden xl:table-cell">Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((classItem) => (
                      <TableRow key={classItem.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{classItem.name}</div>
                            <div className="text-sm text-muted-foreground md:hidden">{classItem.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{classItem.instructor}</TableCell>
                        <TableCell className="hidden lg:table-cell">{classItem.duration}</TableCell>
                        <TableCell>{getDifficultyBadge(classItem.difficulty)}</TableCell>
                        <TableCell className="hidden xl:table-cell">{classItem.maxCapacity}</TableCell>
                        <TableCell>{getStatusBadge(classItem.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Challenges</CardTitle>
                  <CardDescription>Create and manage fitness challenges</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Challenge
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenges.map((challenge) => (
                  <Card key={challenge.id} className="relative overflow-hidden hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-medium">{challenge.name}</h4>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getDifficultyBadge(challenge.difficulty)}
                          {getStatusBadge(challenge.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">XP Reward</div>
                            <div className="font-medium text-primary">{challenge.xpReward} XP</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Duration</div>
                            <div className="font-medium">{challenge.duration}</div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-muted-foreground">Participants</div>
                            <div className="font-medium flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {challenge.participants}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Rewards Store</CardTitle>
                  <CardDescription>Manage redeemable rewards and inventory</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reward</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead className="hidden md:table-cell">Stock</TableHead>
                      <TableHead className="hidden lg:table-cell">Redemptions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewards.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reward.name}</div>
                            <div className="text-sm text-muted-foreground">{reward.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reward.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-primary">{reward.pointsCost}</span>
                          <span className="text-xs text-muted-foreground ml-1">pts</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={reward.stock === 0 ? "text-destructive" : ""}>
                            {reward.stock}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{reward.redemptions}</TableCell>
                        <TableCell>{getStatusBadge(reward.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Upload className="h-4 w-4 mr-2" />
                                Update Stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Achievements & Badges</CardTitle>
                  <CardDescription>Manage achievement system and rewards</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Achievement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{achievement.name}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs">Requirement</div>
                            <div className="font-medium">{achievement.requirement}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">XP Reward</div>
                            <div className="font-medium text-primary">{achievement.xpReward} XP</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Unlocked By</div>
                            <div className="font-medium">{achievement.unlocked}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Events & Workshops</CardTitle>
                  <CardDescription>Manage special events and workshops</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.title}</h4>
                          {getStatusBadge(event.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Date
                            </div>
                            <div className="font-medium">{event.date}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Time
                            </div>
                            <div className="font-medium">{event.time}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Location</div>
                            <div className="font-medium">{event.location}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Registration
                            </div>
                            <div className="font-medium">{event.registered}/{event.slots}</div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Registrations
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Email Attendees
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Add Dialog - Generic for all content types */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New {selectedTab.slice(0, -1).charAt(0).toUpperCase() + selectedTab.slice(1, -1)}</DialogTitle>
            <DialogDescription>Add new content to the {selectedTab} section</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedTab === "announcements" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" placeholder="Announcement title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" placeholder="Announcement content" rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue="draft">
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Publish Now</SelectItem>
                        <SelectItem value="scheduled">Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publishDate">Publish Date</Label>
                    <Input id="publishDate" type="date" />
                  </div>
                </div>
              </>
            )}
            {selectedTab === "challenges" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Challenge Name *</Label>
                  <Input id="name" placeholder="e.g., 30-Day Plank Challenge" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" placeholder="Challenge details and requirements" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="xpReward">XP Reward</Label>
                    <Input id="xpReward" type="number" placeholder="500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" placeholder="e.g., 30 days" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue="active">
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            {selectedTab === "rewards" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rewardName">Reward Name *</Label>
                  <Input id="rewardName" placeholder="e.g., Protein Shake" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rewardDesc">Description *</Label>
                  <Textarea id="rewardDesc" placeholder="Reward details" rows={3} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pointsCost">Points Cost</Label>
                    <Input id="pointsCost" type="number" placeholder="300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" type="number" placeholder="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nutrition">Nutrition</SelectItem>
                        <SelectItem value="merchandise">Merchandise</SelectItem>
                        <SelectItem value="membership">Membership</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsAddDialogOpen(false)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
