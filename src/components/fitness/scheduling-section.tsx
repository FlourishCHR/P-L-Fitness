import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, Clock, MapPin, Users, Plus, User, CheckCircle, Star } from "lucide-react";
import { ImageWithFallback } from "../design/ImageWithFallback";

export function SchedulingSection() {
  // Coach availability data
  const coaches = [
    {
      id: 1,
      name: "Sarah Johnson",
      specialty: "HIIT & Cardio",
      rating: 4.9,
      yearsExp: 8,
      certifications: ["NASM-CPT", "HIIT Specialist"],
      availability: "Available Now",
      nextClass: "HIIT Blast at 2:00 PM",
      status: "available"
    },
    {
      id: 2,
      name: "Mike Chen",
      specialty: "Yoga & Flexibility",
      rating: 5.0,
      yearsExp: 12,
      certifications: ["RYT-500", "Meditation Guide"],
      availability: "Available Now",
      nextClass: "Yoga Flow at 6:30 PM",
      status: "available"
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      specialty: "Strength & Conditioning",
      rating: 4.8,
      yearsExp: 10,
      certifications: ["CSCS", "Olympic Lifting"],
      availability: "Available Tomorrow",
      nextClass: "Strength Training at 9:00 AM",
      status: "available"
    },
    {
      id: 4,
      name: "Lisa Martinez",
      specialty: "Pilates & Core",
      rating: 4.7,
      yearsExp: 6,
      certifications: ["PMA-CPT", "Reformer Specialist"],
      availability: "In Class",
      nextClass: "Available at 4:00 PM",
      status: "busy"
    }
  ];

  const upcomingClasses = [
    {
      id: 1,
      name: "HIIT Blast",
      instructor: "Sarah Johnson",
      coachSpecialty: "HIIT & Cardio",
      coachRating: 4.9,
      coachYearsExp: 8,
      coachCertifications: ["NASM-CPT", "HIIT Specialist"],
      coachAvailability: "Available",
      time: "2:00 PM",
      date: "Today",
      duration: "45 min",
      spots: "3/20",
      difficulty: "High",
      image: "https://images.unsplash.com/photo-1676496962536-d8ef110ff6f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBneW0lMjBpbnRlcmlvciUyMGZpdG5lc3N8ZW58MXx8fHwxNzU2OTYwOTc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 2,
      name: "Yoga Flow",
      instructor: "Mike Chen",
      coachSpecialty: "Yoga & Flexibility",
      coachRating: 5.0,
      coachYearsExp: 12,
      coachCertifications: ["RYT-500", "Meditation Guide"],
      coachAvailability: "Available",
      time: "6:30 PM", 
      date: "Today",
      duration: "60 min",
      spots: "8/15",
      difficulty: "Medium",
      image: "https://images.unsplash.com/photo-1676496962536-d8ef110ff6f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBneW0lMjBpbnRlcmlvciUyMGZpdG5lc3N8ZW58MXx8fHwxNzU2OTYwOTc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 3,
      name: "Strength Training",
      instructor: "Alex Rodriguez",
      coachSpecialty: "Strength & Conditioning",
      coachRating: 4.8,
      coachYearsExp: 10,
      coachCertifications: ["CSCS", "Olympic Lifting"],
      coachAvailability: "Available",
      time: "9:00 AM",
      date: "Tomorrow",
      duration: "50 min",
      spots: "5/12",
      difficulty: "High",
      image: "https://images.unsplash.com/photo-1722925541311-2117dfa21fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwZ3ltJTIwZXF1aXBtZW50JTIwd2VpZ2h0c3xlbnwxfHx8fDE3NTY5NjA5NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Low": return "bg-green-500";
      case "Medium": return "bg-yellow-500";
      case "High": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Class Schedule</h2>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Book Class
        </Button>
      </div>

      {/* Coach Availability Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Coach Availability
          </CardTitle>
          <CardDescription>See which coaches are available for classes and personal training</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {coaches.map((coach) => (
              <div 
                key={coach.id} 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{coach.name}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-medium">{coach.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={coach.status === "available" 
                      ? "bg-green-500/20 text-green-500 border-green-500/30" 
                      : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {coach.availability}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{coach.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{coach.nextClass}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {coach.yearsExp} yrs • {coach.certifications[0]}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  disabled={coach.status === "busy"}
                >
                  {coach.status === "available" ? "Book Session" : "View Schedule"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {upcomingClasses.map((class_) => (
          <Card key={class_.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-32">
              <ImageWithFallback
                src={class_.image}
                alt={class_.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className={`${getDifficultyColor(class_.difficulty)} text-white`}>
                  {class_.difficulty}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{class_.name}</CardTitle>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-muted-foreground">with {class_.instructor}</p>
                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {class_.coachAvailability}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Coach Info */}
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{class_.coachSpecialty}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-medium">{class_.coachRating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{class_.coachYearsExp} years exp.</span>
                  <span>{class_.coachCertifications.join(", ")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{class_.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{class_.time}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{class_.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{class_.spots} spots</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-secondary hover:bg-secondary/90" 
                variant="default"
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Equipment Booking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Equipment Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Squat Rack #1", status: "Available", time: "Now" },
              { name: "Treadmill #5", status: "Reserved", time: "3:00 PM" },
              { name: "Cable Machine #3", status: "Available", time: "Now" }
            ].map((equipment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{equipment.name}</p>
                  <p className="text-sm text-muted-foreground">{equipment.time}</p>
                </div>
                <Badge 
                  variant={equipment.status === "Available" ? "default" : "secondary"}
                  className={equipment.status === "Available" ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {equipment.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}