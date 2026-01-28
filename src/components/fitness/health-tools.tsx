import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { 
  Calculator, 
  Heart, 
  Activity, 
  Target, 
  TrendingUp,
  Scale,
  Ruler,
  Zap
} from "lucide-react";

export function HealthTools() {
  const [bmiData, setBmiData] = useState({
    height: "",
    weight: "",
    unit: "metric"
  });
  
  const [calorieData, setCalorieData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    activity: "",
    goal: ""
  });

  const [bmiResult, setBmiResult] = useState<any>(null);
  const [calorieResult, setCalorieResult] = useState<any>(null);

  const calculateBMI = () => {
    if (!bmiData.height || !bmiData.weight) return;
    
    let height = parseFloat(bmiData.height);
    let weight = parseFloat(bmiData.weight);
    
    if (bmiData.unit === "imperial") {
      // Convert to metric
      height = height * 2.54 / 100; // inches to meters
      weight = weight * 0.453592; // pounds to kg
    } else {
      height = height / 100; // cm to meters
    }
    
    const bmi = weight / (height * height);
    let category = "";
    let color = "";
    
    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-blue-500";
    } else if (bmi < 25) {
      category = "Normal weight";
      color = "text-green-500";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "text-yellow-500";
    } else {
      category = "Obese";
      color = "text-red-500";
    }
    
    setBmiResult({
      bmi: bmi.toFixed(1),
      category,
      color
    });
  };

  const calculateCalories = () => {
    if (!calorieData.age || !calorieData.gender || !calorieData.height || !calorieData.weight || !calorieData.activity || !calorieData.goal) return;
    
    const age = parseFloat(calorieData.age);
    const height = parseFloat(calorieData.height);
    const weight = parseFloat(calorieData.weight);
    
    // Calculate BMR using Harris-Benedict equation
    let bmr;
    if (calorieData.gender === "male") {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // Activity multipliers
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      lightly: 1.375,
      moderately: 1.55,
      very: 1.725,
      extra: 1.9
    };
    
    const tdee = bmr * activityMultipliers[calorieData.activity];
    
    // Goal adjustments
    let goalCalories = tdee;
    let goalDescription = "";
    
    switch (calorieData.goal) {
      case "lose-1":
        goalCalories = tdee - 500;
        goalDescription = "Lose 1 lb per week";
        break;
      case "lose-2":
        goalCalories = tdee - 1000;
        goalDescription = "Lose 2 lbs per week";
        break;
      case "gain-1":
        goalCalories = tdee + 500;
        goalDescription = "Gain 1 lb per week";
        break;
      case "gain-2":
        goalCalories = tdee + 1000;
        goalDescription = "Gain 2 lbs per week";
        break;
      default:
        goalDescription = "Maintain current weight";
    }
    
    setCalorieResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      goalCalories: Math.round(goalCalories),
      goalDescription
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="animate-fadeInDown">
        <h1 className="text-3xl font-bold">Health & Fitness Tools</h1>
        <p className="text-muted-foreground">Calculate your BMI and daily calorie needs to optimize your fitness journey</p>
      </div>

      {/* Both Calculators Visible Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BMI Calculator */}
        <div className="space-y-6 animate-fadeInUp stagger-1">
          <Card className="card-hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="mr-2 h-5 w-5 text-primary" />
                BMI Calculator
              </CardTitle>
              <CardDescription>
                Calculate your Body Mass Index to assess your weight status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Measurement System</Label>
                <Select value={bmiData.unit} onValueChange={(value) => setBmiData({...bmiData, unit: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (kg/cm)</SelectItem>
                    <SelectItem value="imperial">Imperial (lbs/inches)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Height ({bmiData.unit === "metric" ? "cm" : "inches"})</Label>
                  <Input 
                    type="number" 
                    placeholder={bmiData.unit === "metric" ? "170" : "67"}
                    value={bmiData.height}
                    onChange={(e) => setBmiData({...bmiData, height: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight ({bmiData.unit === "metric" ? "kg" : "lbs"})</Label>
                  <Input 
                    type="number" 
                    placeholder={bmiData.unit === "metric" ? "70" : "154"}
                    value={bmiData.weight}
                    onChange={(e) => setBmiData({...bmiData, weight: e.target.value})}
                  />
                </div>
              </div>

              <Button onClick={calculateBMI} className="w-full btn-hover-scale transition-smooth">
                Calculate BMI
              </Button>
            </CardContent>
          </Card>

          {bmiResult && (
            <Card className="card-hover-glow animate-scaleIn">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-secondary" />
                  Your BMI Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{bmiResult.bmi}</div>
                  <div className={`text-lg font-medium ${bmiResult.color}`}>{bmiResult.category}</div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">BMI Categories:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Underweight</span>
                      <span className="text-blue-500">Below 18.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Normal weight</span>
                      <span className="text-green-500">18.5 - 24.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overweight</span>
                      <span className="text-yellow-500">25 - 29.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Obese</span>
                      <span className="text-red-500">30 or greater</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calorie Calculator */}
        <div className="space-y-6 animate-fadeInUp stagger-2">
          <Card className="card-hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-primary" />
                Calorie Calculator
              </CardTitle>
              <CardDescription>
                Calculate your daily caloric needs based on your goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input 
                    type="number" 
                    placeholder="25"
                    value={calorieData.age}
                    onChange={(e) => setCalorieData({...calorieData, age: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={calorieData.gender} onValueChange={(value) => setCalorieData({...calorieData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input 
                    type="number" 
                    placeholder="170"
                    value={calorieData.height}
                    onChange={(e) => setCalorieData({...calorieData, height: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input 
                    type="number" 
                    placeholder="70"
                    value={calorieData.weight}
                    onChange={(e) => setCalorieData({...calorieData, weight: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={calorieData.activity} onValueChange={(value) => setCalorieData({...calorieData, activity: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job, no exercise)</SelectItem>
                    <SelectItem value="lightly">Lightly active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderately">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="very">Very active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="extra">Extra active (very hard exercise, physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Goal</Label>
                <Select value={calorieData.goal} onValueChange={(value) => setCalorieData({...calorieData, goal: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose-2">Lose 2 lbs per week</SelectItem>
                    <SelectItem value="lose-1">Lose 1 lb per week</SelectItem>
                    <SelectItem value="maintain">Maintain current weight</SelectItem>
                    <SelectItem value="gain-1">Gain 1 lb per week</SelectItem>
                    <SelectItem value="gain-2">Gain 2 lbs per week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calculateCalories} className="w-full btn-hover-scale transition-smooth">
                Calculate Calories
              </Button>
            </CardContent>
          </Card>

          {calorieResult && (
            <Card className="card-hover-glow animate-scaleIn">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-secondary" />
                  Your Calorie Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span>Base Metabolic Rate (BMR)</span>
                    <Badge className="bg-secondary">{calorieResult.bmr.toLocaleString()} cal</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span>Maintenance Calories (TDEE)</span>
                    <Badge className="bg-primary">{calorieResult.tdee.toLocaleString()} cal</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div>
                      <div className="font-medium">Goal Calories</div>
                      <div className="text-sm text-muted-foreground">{calorieResult.goalDescription}</div>
                    </div>
                    <Badge className="bg-primary text-lg">{calorieResult.goalCalories.toLocaleString()} cal</Badge>
                  </div>
                </div>
                
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                  <h4 className="font-medium mb-2">Macronutrient Breakdown (Example)</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Protein (25%)</span>
                      <span>{Math.round(calorieResult.goalCalories * 0.25 / 4)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbs (45%)</span>
                      <span>{Math.round(calorieResult.goalCalories * 0.45 / 4)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat (30%)</span>
                      <span>{Math.round(calorieResult.goalCalories * 0.30 / 9)}g</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Health Tips */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 card-hover-lift animate-fadeInUp">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-primary animate-pulse" />
            Health & Fitness Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center transition-smooth hover:scale-105">
              <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium mb-1">Stay Active</h4>
              <p className="text-sm text-muted-foreground">Aim for at least 150 minutes of moderate exercise per week</p>
            </div>
            <div className="text-center transition-smooth hover:scale-105">
              <Heart className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <h4 className="font-medium mb-1">Balanced Diet</h4>
              <p className="text-sm text-muted-foreground">Focus on whole foods and proper portion control</p>
            </div>
            <div className="text-center transition-smooth hover:scale-105">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium mb-1">Set Goals</h4>
              <p className="text-sm text-muted-foreground">Set realistic, measurable fitness and nutrition goals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}