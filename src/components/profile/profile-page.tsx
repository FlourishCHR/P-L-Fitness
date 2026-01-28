import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Trophy,
  Calendar,
  Target,
  User as UserIcon,
  Upload,
  ChevronDown,
  ChevronUp,
  Star
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [isPersonalExpanded, setIsPersonalExpanded] = useState(true);
  const [isHealthExpanded, setIsHealthExpanded] = useState(true);
  const [isMembershipExpanded, setIsMembershipExpanded] = useState(true);

  return (
    <div className="w-full h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Profile</h1>
        <p className="text-sm text-muted-foreground mb-4">Manage your personal information and profile settings</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Avatar and User Info */}
            <Card className="bg-card border-border">
              <CardContent className="pt-4 pb-4 flex flex-col items-center">
                <div className="relative mb-3">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                        : <UserIcon className="h-12 w-12" />
                      }
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-semibold text-base mb-1">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username || "Member"}
                </h3>
                <p className="text-xs text-muted-foreground mb-1">{user?.email || "No email"}</p>
                {user?.currentRank && (
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">{user.currentRank}</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Trophy className="h-5 w-5 text-red-500" />
                    </div>
                    <span className="text-sm font-medium">Experience</span>
                  </div>
                  <span className="font-bold text-red-500">{user?.totalExperience?.toLocaleString() || 0}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Star className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium">Rank</span>
                  </div>
                  <span className="font-bold text-blue-500">{user?.currentRank || "Unranked"}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Target className="h-5 w-5 text-orange-500" />
                    </div>
                    <span className="text-sm font-medium">Member ID</span>
                  </div>
                  <span className="font-bold text-orange-500">{user?.memberId || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="text-sm font-medium">Joined</span>
                  </div>
                  <span className="font-bold text-green-500">
                    {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Personal Information */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsPersonalExpanded(!isPersonalExpanded)}>
                <CardTitle>Personal Information</CardTitle>
                <div className="flex items-center gap-2">
                  {isPersonalExpanded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingPersonal(!isEditingPersonal);
                      }}
                    >
                      {isEditingPersonal ? "Save" : "Edit"}
                    </Button>
                  )}
                  {isPersonalExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {isPersonalExpanded && (
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm text-muted-foreground">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue={user?.firstName || ""}
                      disabled={!isEditingPersonal}
                      className={!isEditingPersonal ? "bg-muted/50 border-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm text-muted-foreground">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue={user?.lastName || ""}
                      disabled={!isEditingPersonal}
                      className={!isEditingPersonal ? "bg-muted/50 border-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-muted-foreground">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ""}
                      disabled={!isEditingPersonal}
                      className={!isEditingPersonal ? "bg-muted/50 border-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm text-muted-foreground">Phone Number</Label>
                    <Input
                      id="phone"
                      defaultValue={user?.phoneNumber || ""}
                      disabled={!isEditingPersonal}
                      className={!isEditingPersonal ? "bg-muted/50 border-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-sm text-muted-foreground">Bio</Label>
                    <Textarea
                      id="bio"
                      defaultValue="Fitness enthusiast and gym member"
                      disabled={!isEditingPersonal}
                      className={!isEditingPersonal ? "bg-muted/50 border-muted" : ""}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
              )}
            </Card>

            {/* Health Information */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsHealthExpanded(!isHealthExpanded)}>
                <CardTitle>Health Information</CardTitle>
                <div className="flex items-center gap-2">
                  {isHealthExpanded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingHealth(!isEditingHealth);
                      }}
                    >
                      {isEditingHealth ? "Save" : "Edit"}
                    </Button>
                  )}
                  {isHealthExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {isHealthExpanded && (
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-sm text-muted-foreground">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      defaultValue="1990-05-15"
                      disabled={!isEditingHealth}
                      className={!isEditingHealth ? "bg-muted/50 border-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm text-muted-foreground">Age</Label>
                    <Input
                      id="age"
                      defaultValue="34"
                      disabled
                      className="bg-muted/50 border-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-sm text-muted-foreground">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      defaultValue="180"
                      disabled={!isEditingHealth}
                      className={!isEditingHealth ? "bg-muted/50 border-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm text-muted-foreground">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      defaultValue="75"
                      disabled={!isEditingHealth}
                      className={!isEditingHealth ? "bg-muted/50 border-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bmi" className="text-sm text-muted-foreground">BMI</Label>
                    <Input
                      id="bmi"
                      defaultValue="23.1"
                      disabled
                      className="bg-muted/50 border-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal" className="text-sm text-muted-foreground">Fitness Goal</Label>
                    <Input
                      id="goal"
                      defaultValue="Build Muscle"
                      disabled={!isEditingHealth}
                      className={!isEditingHealth ? "bg-muted/50 border-muted" : ""}
                    />
                  </div>
                </div>
              </CardContent>
              )}
            </Card>

            {/* Membership Details */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsMembershipExpanded(!isMembershipExpanded)}>
                <CardTitle>Membership Details</CardTitle>
                {isMembershipExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CardHeader>
              {isMembershipExpanded && (
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Membership Tier</Label>
                    <Input
                      defaultValue={user?.membershipType || "No active membership"}
                      disabled
                      className="bg-muted/50 border-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Start Date</Label>
                    <Input
                      defaultValue={user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
                      disabled
                      className="bg-muted/50 border-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Expiration Date</Label>
                    <Input
                      defaultValue={user?.expiryDate ? new Date(user.expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
                      disabled
                      className="bg-muted/50 border-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="flex items-center h-10 px-3 py-2 border border-muted rounded-md bg-muted/50">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user?.expiryDate && new Date(user.expiryDate) > new Date()
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}>
                        {user?.expiryDate && new Date(user.expiryDate) > new Date() ? "Active" : "Expired"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}