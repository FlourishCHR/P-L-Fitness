import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Download, 
  Share2, 
  Star,
  Crown,
  Dumbbell,
  Calendar,
  CreditCard,
  Smartphone,
  User
} from "lucide-react";

interface LoyaltyCardProps {
  memberName?: string;
  memberId?: string;
  membershipTier?: "basic" | "premium" | "vip";
  expiryDate?: string;
  joinDate?: string;
  showActions?: boolean;
}

export function LoyaltyCard({ 
  memberName = "John Doe",
  memberId = "PL2024-001247",
  membershipTier = "premium",
  expiryDate = "Dec 31, 2024",
  joinDate = "Jan 1, 2024",
  showActions = true
}: LoyaltyCardProps) {
  const [showBack, setShowBack] = useState(false);

  const tierConfig = {
    basic: {
      name: "Basic",
      color: "from-gray-600 to-gray-800",
      icon: Dumbbell,
      accentColor: "text-gray-400",
      badgeColor: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    },
    premium: {
      name: "Premium",
      color: "from-red-600 to-red-800",
      icon: Star,
      accentColor: "text-red-400",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30"
    },
    vip: {
      name: "VIP Elite",
      color: "from-blue-600 to-blue-900",
      icon: Crown,
      accentColor: "text-blue-400",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  };

  const config = tierConfig[membershipTier];
  const Icon = config.icon;

  // Generate QR Code data URL (simple pattern for demonstration)
  const generateQRCode = () => {
    // In production, use a QR code library like 'qrcode' or 'react-qr-code'
    // For now, creating a simple SVG representation
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <rect width="200" height="200" fill="white"/>
        {/* QR Code pattern simulation */}
        <rect x="10" y="10" width="30" height="30" fill="black"/>
        <rect x="50" y="10" width="10" height="10" fill="black"/>
        <rect x="70" y="10" width="10" height="10" fill="black"/>
        <rect x="90" y="10" width="20" height="20" fill="black"/>
        <rect x="120" y="10" width="10" height="10" fill="black"/>
        <rect x="140" y="10" width="10" height="10" fill="black"/>
        <rect x="160" y="10" width="30" height="30" fill="black"/>
        
        <rect x="10" y="50" width="10" height="10" fill="black"/>
        <rect x="30" y="50" width="10" height="10" fill="black"/>
        <rect x="50" y="50" width="20" height="20" fill="black"/>
        <rect x="90" y="50" width="10" height="10" fill="black"/>
        <rect x="110" y="50" width="20" height="20" fill="black"/>
        <rect x="160" y="50" width="10" height="10" fill="black"/>
        <rect x="180" y="50" width="10" height="10" fill="black"/>
        
        <rect x="10" y="70" width="10" height="10" fill="black"/>
        <rect x="30" y="70" width="10" height="10" fill="black"/>
        <rect x="70" y="70" width="20" height="20" fill="black"/>
        <rect x="110" y="70" width="10" height="10" fill="black"/>
        <rect x="140" y="70" width="20" height="20" fill="black"/>
        <rect x="160" y="70" width="10" height="10" fill="black"/>
        <rect x="180" y="70" width="10" height="10" fill="black"/>
        
        <rect x="10" y="90" width="30" height="30" fill="black"/>
        <rect x="50" y="90" width="10" height="10" fill="black"/>
        <rect x="70" y="90" width="10" height="10" fill="black"/>
        <rect x="90" y="90" width="10" height="10" fill="black"/>
        <rect x="110" y="90" width="10" height="10" fill="black"/>
        <rect x="130" y="90" width="10" height="10" fill="black"/>
        <rect x="150" y="90" width="10" height="10" fill="black"/>
        
        <rect x="50" y="120" width="20" height="20" fill="black"/>
        <rect x="90" y="120" width="10" height="10" fill="black"/>
        <rect x="120" y="120" width="20" height="20" fill="black"/>
        <rect x="160" y="120" width="10" height="10" fill="black"/>
        
        <rect x="10" y="140" width="10" height="10" fill="black"/>
        <rect x="30" y="140" width="20" height="20" fill="black"/>
        <rect x="70" y="140" width="10" height="10" fill="black"/>
        <rect x="100" y="140" width="30" height="30" fill="black"/>
        <rect x="150" y="140" width="10" height="10" fill="black"/>
        <rect x="180" y="140" width="10" height="10" fill="black"/>
        
        <rect x="10" y="160" width="30" height="30" fill="black"/>
        <rect x="50" y="160" width="10" height="10" fill="black"/>
        <rect x="70" y="160" width="20" height="20" fill="black"/>
        <rect x="140" y="160" width="20" height="20" fill="black"/>
        <rect x="170" y="160" width="20" height="20" fill="black"/>
        
        {/* Corner markers */}
        <rect x="15" y="15" width="20" height="20" fill="white"/>
        <rect x="165" y="15" width="20" height="20" fill="white"/>
        <rect x="15" y="165" width="20" height="20" fill="white"/>
        
        {/* Center data encoding member ID */}
        <text x="100" y="105" fontSize="8" textAnchor="middle" fill="black" fontFamily="monospace">{memberId.slice(-4)}</text>
      </svg>
    );
  };

  const handleDownload = () => {
    // In production, generate actual downloadable card image
    alert("Card downloaded to your device!");
  };

  const handleShare = () => {
    // In production, use Web Share API
    if (navigator.share) {
      navigator.share({
        title: 'P&L Fitness Membership Card',
        text: `My ${config.name} membership at P&L Fitness`,
      });
    } else {
      alert("Card details copied to clipboard!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-md mx-auto">
        {/* Card Container with flip effect */}
        <div 
          className="relative w-full aspect-[1.586/1] cursor-pointer perspective-1000"
          onClick={() => setShowBack(!showBack)}
        >
          <div 
            className={`absolute w-full h-full transition-all duration-500 transform-style-3d ${
              showBack ? 'rotate-y-180' : ''
            }`}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front of Card */}
            <div 
              className={`absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-br ${config.color} p-6 shadow-2xl overflow-hidden`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
              </div>

              {/* Card Content */}
              <div className="relative h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">
                        <span className="text-red-400">P&L</span>{" "}
                        <span className="text-blue-400">Fitness</span>
                      </h3>
                      <Dumbbell className="h-4 w-4 text-white/80" />
                    </div>
                    <p className="text-xs text-white/70">San Pedro, Laguna</p>
                  </div>
                  <Badge variant="outline" className={`${config.badgeColor} border backdrop-blur-sm`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {config.name}
                  </Badge>
                </div>

                {/* Member Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Member Name</p>
                      <p className="text-lg font-bold text-white">{memberName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-white/70">Member ID</p>
                      <p className="text-sm font-mono font-medium text-white">{memberId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70">Valid Until</p>
                      <p className="text-sm font-medium text-white">{expiryDate}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <Smartphone className="h-3 w-3" />
                    <span>Tap to flip for QR code</span>
                  </div>
                  <CreditCard className="h-5 w-5 text-white/40" />
                </div>
              </div>
            </div>

            {/* Back of Card */}
            <div 
              className={`absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-br ${config.color} p-6 shadow-2xl`}
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div>
                  <h4 className="text-center font-bold text-white mb-2">Scan for Access</h4>
                  <p className="text-xs text-white/70 text-center">Present this QR code at entry</p>
                </div>
                
                {/* QR Code */}
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <div className="w-48 h-48">
                    {generateQRCode()}
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-mono text-white/90">{memberId}</p>
                  <p className="text-xs text-white/60">Member Since {joinDate}</p>
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-xs text-white/50">Tap to flip back</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Card
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowBack(!showBack)}>
            <Smartphone className="h-4 w-4 mr-2" />
            {showBack ? "Show Front" : "Show QR Code"}
          </Button>
        </div>
      )}

      {/* Usage Instructions */}
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            How to Use Your Loyalty Card
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <span>Present your QR code at the gym entrance for quick check-in</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <span>Tap the card to flip between your details and QR code</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <span>Download and save to your phone for offline access</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">4</span>
              </div>
              <span>Use your Member ID for class bookings and reward redemptions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
