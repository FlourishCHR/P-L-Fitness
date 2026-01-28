import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Progress } from "../ui/progress";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import api from "../../services/api";
import { 
  Users, 
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Trophy,
  Activity,
  Target,
  Clock,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserX,
  UserCheck,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Award
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  username: string;
  firstName: string;
  lastName: string;
  level: number;
  xp: number;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | "DELETED";
  role: string;
  specialty?: string;
  membership: "Basic" | "Premium" | "VIP";
  joined: string;
  lastVisit: string;
  totalVisits: number;
  avatar?: string;
  address: string;
  birthdate: string;
  emergencyContact: string;
  notes: string;
  membershipExpiry: string;
  achievements: number;
  challengesCompleted: number;
  pointsBalance: number;
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: "", message: "" });
  const [bulkEditData, setBulkEditData] = useState({ role: "", status: "", specialty: "" });
  const [importFile, setImportFile] = useState<File | null>(null);

  // Form data for adding/editing members
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: "MEMBER",
    specialty: "",
    status: "ACTIVE"
  });

  // Fetch users from database
  const [members, setMembers] = useState<Member[]>([]);

  // Load users from database on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load users function
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: any = await api.loadUsers();

      // Map database fields to Member interface
      const mappedMembers: Member[] = response.data.map((user: any) => ({
        id: user.mu_id,
        name: `${user.mu_firstName} ${user.mu_lastName}`,
        email: user.mu_email || "",
        phone: user.mu_phoneNumber || "",
        username: user.mu_username || "",
        firstName: user.mu_firstName || "",
        lastName: user.mu_lastName || "",
        level: 1, // Default values - you can add these fields to your database
        xp: 0,
        status: user.mu_status || "ACTIVE",
        role: user.mu_role || "MEMBER",
        specialty: user.mu_specialty || "",
        membership: "Basic", // Default - you can map this from another table
        joined: user.mu_createdAt ? new Date(user.mu_createdAt).toLocaleDateString() : "",
        lastVisit: "N/A",
        totalVisits: 0,
        address: "",
        birthdate: "",
        emergencyContact: "",
        notes: "",
        membershipExpiry: "",
        achievements: 0,
        challengesCompleted: 0,
        pointsBalance: 0
      }));

      setMembers(mappedMembers);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
      console.error("Error loading users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesMembership = membershipFilter === "all" || member.membership === membershipFilter;
    return matchesSearch && matchesStatus && matchesMembership;
  });

  // Toggle member selection
  const toggleMemberSelection = (id: number) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Select all members
  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  // View member details
  const viewMember = (member: Member) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  // Edit member
  const editMember = (member: Member) => {
    setSelectedMember(member);
    // Populate form with member data
    setFormData({
      username: member.username,
      password: "", // Don't populate password for security
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      phoneNumber: member.phone,
      role: member.role,
      specialty: member.specialty || "",
      status: member.status
    });
    setIsEditDialogOpen(true);
  };

  // Delete member
  const confirmDeleteMember = (id: number) => {
    setError(null);
    setMemberToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const deleteMember = async () => {
    if (memberToDelete) {
      try {
        setIsLoading(true);
        setError(null);
        await api.deleteUser({ id: memberToDelete });

        // Reload users from database after deletion
        await loadUsers();

        setIsDeleteDialogOpen(false);
        setMemberToDelete(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete user");
        console.error("Error deleting user:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Add member
  const handleAddMember = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validation
      if (!formData.username || !formData.password || !formData.email ||
          !formData.firstName || !formData.lastName || !formData.phoneNumber) {
        setError("Please fill in all required fields");
        return;
      }

      await api.createUser(formData);

      // Reload users from database after creation
      await loadUsers();

      // Close dialog and reset form
      setIsAddDialogOpen(false);
      setFormData({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        role: "MEMBER",
        specialty: "",
        status: "ACTIVE"
      });
    } catch (err: any) {
      setError(err.message || "Failed to create user");
      console.error("Error creating user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit member
  const handleEditMember = async () => {
    if (!selectedMember) return;

    try {
      setIsLoading(true);
      setError(null);

      await api.updateUser({
        id: selectedMember.id,
        ...formData
      });

      // Reload users from database after update
      await loadUsers();

      // Close dialog
      setIsEditDialogOpen(false);
      setSelectedMember(null);
    } catch (err: any) {
      setError(err.message || "Failed to update user");
      console.error("Error updating user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: Member["status"]) => {
    const variants = {
      ACTIVE: "bg-green-500/20 text-green-500 border-green-500/30",
      INACTIVE: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      SUSPENDED: "bg-red-500/20 text-red-500 border-red-500/30",
      PENDING: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      DELETED: "bg-gray-500/20 text-gray-500 border-gray-500/30"
    };
    return <Badge variant="outline" className={variants[status]}>{status}</Badge>;
  };

  // Get membership badge
  const getMembershipBadge = (membership: Member["membership"]) => {
    const variants = {
      Basic: "bg-muted text-foreground",
      Premium: "bg-primary/20 text-primary border-primary/30",
      VIP: "bg-secondary/20 text-secondary border-secondary/30"
    };
    return <Badge className={variants[membership]}>{membership}</Badge>;
  };

  // Send email to selected members
  const handleSendEmail = async () => {
    if (selectedMembers.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      if (!emailData.subject || !emailData.message) {
        setError("Subject and message are required");
        return;
      }

      await api.sendEmail({
        userIds: selectedMembers,
        subject: emailData.subject,
        message: emailData.message
      });

      setIsEmailDialogOpen(false);
      setEmailData({ subject: "", message: "" });
      alert(`Email sent to ${selectedMembers.length} member(s)`);
    } catch (err: any) {
      setError(err.message || "Failed to send email");
      console.error("Error sending email:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk edit selected members
  const handleBulkEdit = async () => {
    if (selectedMembers.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const updates: any = {};
      if (bulkEditData.role) updates.role = bulkEditData.role;
      if (bulkEditData.status) updates.status = bulkEditData.status;
      if (bulkEditData.specialty) updates.specialty = bulkEditData.specialty;

      if (Object.keys(updates).length === 0) {
        setError("Please select at least one field to update");
        return;
      }

      await api.bulkUpdateUsers({
        ids: selectedMembers,
        updates
      });

      await loadUsers();
      setIsBulkEditDialogOpen(false);
      setBulkEditData({ role: "", status: "", specialty: "" });
      setSelectedMembers([]);
    } catch (err: any) {
      setError(err.message || "Failed to bulk edit users");
      console.error("Error bulk editing users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk delete selected members
  const handleBulkDelete = async () => {
    if (selectedMembers.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      await api.bulkDeleteUsers({ ids: selectedMembers });

      await loadUsers();
      setIsBulkDeleteDialogOpen(false);
      setSelectedMembers([]);
    } catch (err: any) {
      setError(err.message || "Failed to bulk delete users");
      console.error("Error bulk deleting users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export users to CSV
  const handleExportCSV = () => {
    const csvData = filteredMembers.map(member => ({
      Username: member.username,
      Email: member.email,
      "First Name": member.firstName,
      "Last Name": member.lastName,
      Phone: member.phone,
      Role: member.role,
      Specialty: member.specialty || "",
      Status: member.status,
      Membership: member.membership,
      Level: member.level,
      XP: member.xp,
      "Total Visits": member.totalVisits,
      "Joined Date": member.joined,
      "Last Visit": member.lastVisit
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV import
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());

      if (lines.length < 2) {
        setError("CSV file must contain headers and at least one user");
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));
      const users = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ''));
        const user: any = {};

        headers.forEach((header, index) => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader === 'username') user.username = values[index];
          else if (lowerHeader === 'email') user.email = values[index];
          else if (lowerHeader === 'password') user.password = values[index];
          else if (lowerHeader === 'firstname' || lowerHeader === 'first name') user.firstName = values[index];
          else if (lowerHeader === 'lastname' || lowerHeader === 'last name') user.lastName = values[index];
          else if (lowerHeader === 'phone' || lowerHeader === 'phonenumber') user.phoneNumber = values[index];
          else if (lowerHeader === 'role') user.role = values[index];
          else if (lowerHeader === 'specialty') user.specialty = values[index];
          else if (lowerHeader === 'status') user.status = values[index];
        });

        if (user.username && user.email && user.password && user.firstName && user.lastName && user.phoneNumber) {
          users.push(user);
        }
      }

      if (users.length === 0) {
        setError("No valid users found in CSV file");
        return;
      }

      const response = await api.importUsersFromCSV({ users });

      await loadUsers();
      setIsImportDialogOpen(false);
      setImportFile(null);

      alert(`Import completed: ${response.successCount} users imported successfully${response.errorCount > 0 ? `, ${response.errorCount} failed` : ''}`);
    } catch (err: any) {
      setError(err.message || "Failed to import CSV");
      console.error("Error importing CSV:", err);
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage member accounts and profiles</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-primary">{members.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold text-green-500">
                  {members.filter(m => m.status === "ACTIVE").length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {members.filter(m => m.status === "INACTIVE").length}
                </p>
              </div>
              <UserX className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold text-secondary">
                  {members.filter(m => new Date(m.joined).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or email..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Membership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedMembers.length > 0 && (
            <div className="flex items-center gap-2 pt-4 border-t mt-4">
              <Badge variant="secondary">{selectedMembers.length} selected</Badge>
              <Button variant="outline" size="sm" onClick={() => setIsEmailDialogOpen(true)}>
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsBulkEditDialogOpen(true)}>
                <Settings className="h-3 w-3 mr-1" />
                Bulk Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => setIsBulkDeleteDialogOpen(true)}>
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Members Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Level/XP</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Last Visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => toggleMemberSelection(member.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <span className="font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">{member.phone}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <Badge variant="outline">Lvl {member.level}</Badge>
                          <div className="text-xs text-muted-foreground">{member.xp} XP</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getMembershipBadge(member.membership)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(member.status)}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                        {member.lastVisit}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => viewMember(member)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editMember(member)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Manage Membership
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => confirmDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredMembers.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredMembers.length} of {members.length} members
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Member Profile</DialogTitle>
            <DialogDescription>Complete member information and statistics</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="membership">Membership</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Personal Info */}
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {selectedMember.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium">{selectedMember.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {getMembershipBadge(selectedMember.membership)}
                      {getStatusBadge(selectedMember.status)}
                      <Badge variant="outline">Level {selectedMember.level}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {selectedMember.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {selectedMember.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {selectedMember.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Born: {selectedMember.birthdate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{selectedMember.xp}</div>
                        <div className="text-xs text-muted-foreground">Total XP</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <Activity className="h-6 w-6 mx-auto mb-2 text-secondary" />
                        <div className="text-2xl font-bold">{selectedMember.totalVisits}</div>
                        <div className="text-xs text-muted-foreground">Total Visits</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <div className="text-2xl font-bold">{selectedMember.challengesCompleted}</div>
                        <div className="text-xs text-muted-foreground">Challenges</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <Award className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                        <div className="text-2xl font-bold">{selectedMember.achievements}</div>
                        <div className="text-xs text-muted-foreground">Achievements</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <div>
                    <Label>Emergency Contact</Label>
                    <Input value={selectedMember.emergencyContact} readOnly />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={selectedMember.notes} readOnly rows={3} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { action: "Completed HIIT Challenge", xp: "+150 XP", time: "2 hours ago", icon: Target },
                      { action: "Attended Yoga Class", xp: "+100 XP", time: "Yesterday", icon: Activity },
                      { action: "Achieved Level 15", xp: "+500 XP", time: "2 days ago", icon: Trophy },
                      { action: "Redeemed Protein Shake", xp: "-300 Points", time: "3 days ago", icon: Star },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <activity.icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{activity.action}</div>
                          <div className="text-xs text-muted-foreground">{activity.time}</div>
                        </div>
                        <Badge variant="outline">{activity.xp}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Visit History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">This Week</span>
                        <span className="font-medium">5 visits</span>
                      </div>
                      <Progress value={71} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">This Month</span>
                        <span className="font-medium">18 visits</span>
                      </div>
                      <Progress value={60} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg per Week</span>
                        <span className="font-medium">4.2 visits</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="membership" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Membership Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Type</Label>
                        <div className="mt-1">{getMembershipBadge(selectedMember.membership)}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedMember.status)}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Join Date</Label>
                        <div className="mt-1 text-sm">{selectedMember.joined}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Expiry Date</Label>
                        <div className="mt-1 text-sm">{selectedMember.membershipExpiry}</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Points Balance</Label>
                      <div className="text-2xl font-bold text-primary mt-1">
                        {selectedMember.pointsBalance} Points
                      </div>
                      <Progress value={65} className="h-2 mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        550 points to next reward tier
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Membership
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Extend Membership
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) {
          // Reset form when dialog closes
          setFormData({
            username: "",
            password: "",
            email: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            role: "MEMBER",
            specialty: "",
            status: "ACTIVE"
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>Create a new member account</DialogDescription>
          </DialogHeader>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-firstName">First Name *</Label>
                <Input
                  id="add-firstName"
                  placeholder="Juan"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-lastName">Last Name *</Label>
                <Input
                  id="add-lastName"
                  placeholder="Dela Cruz"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-username">Username *</Label>
                <Input
                  id="add-username"
                  placeholder="juandelacruz"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password">Password *</Label>
                <Input
                  id="add-password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email *</Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="juan@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone Number *</Label>
                <Input
                  id="add-phone"
                  placeholder="+63 917 123 4567"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger id="add-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="TRAINER">Trainer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-status">Initial Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger id="add-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-specialty">Specialty (Optional)</Label>
              <Input
                id="add-specialty"
                placeholder="e.g., Yoga Instructor, Personal Trainer"
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Member Profile</DialogTitle>
            <DialogDescription>Update member information</DialogDescription>
          </DialogHeader>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          {selectedMember && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name *</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username *</Label>
                  <Input
                    id="edit-username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number *</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="TRAINER">Trainer</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-specialty">Specialty (Optional)</Label>
                <Input
                  id="edit-specialty"
                  placeholder="e.g., Yoga Instructor, Personal Trainer"
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditMember} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the member account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteMember();
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to Members</DialogTitle>
            <DialogDescription>
              Send an email to {selectedMembers.length} selected member(s)
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject *</Label>
              <Input
                id="email-subject"
                placeholder="Email subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Message *</Label>
              <Textarea
                id="email-message"
                placeholder="Type your message here..."
                value={emailData.message}
                onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                rows={6}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={isBulkEditDialogOpen} onOpenChange={setIsBulkEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Edit Members</DialogTitle>
            <DialogDescription>
              Update {selectedMembers.length} selected member(s). Leave fields empty to keep unchanged.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-role">Role</Label>
              <Select value={bulkEditData.role} onValueChange={(value) => setBulkEditData({...bulkEditData, role: value})}>
                <SelectTrigger id="bulk-role">
                  <SelectValue placeholder="Select role (leave unchanged)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Leave unchanged</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="TRAINER">Trainer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-status">Status</Label>
              <Select value={bulkEditData.status} onValueChange={(value) => setBulkEditData({...bulkEditData, status: value})}>
                <SelectTrigger id="bulk-status">
                  <SelectValue placeholder="Select status (leave unchanged)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Leave unchanged</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-specialty">Specialty</Label>
              <Input
                id="bulk-specialty"
                placeholder="Specialty (leave empty for unchanged)"
                value={bulkEditData.specialty}
                onChange={(e) => setBulkEditData({...bulkEditData, specialty: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Members"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedMembers.length} member(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedMembers.length} member account(s) and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import CSV Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Users from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with user data. Required columns: username, email, password, firstName, lastName, phoneNumber
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File *</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">CSV Format Example:</p>
              <pre className="text-xs bg-background p-2 rounded">
{`username,email,password,firstName,lastName,phoneNumber,role,specialty,status
johndoe,john@email.com,password123,John,Doe,+1234567890,MEMBER,,ACTIVE
janedoe,jane@email.com,password123,Jane,Doe,+1234567891,TRAINER,Yoga,ACTIVE`}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
