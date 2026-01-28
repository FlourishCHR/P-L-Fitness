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
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  AlertTriangle,
  CheckCircle,
  Box,
  Dumbbell,
  ShoppingBag,
  Wrench,
  TrendingDown,
  Calendar,
  Filter
} from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  condition: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  location: string;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Maintenance";
}

export function InventoryManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    // Equipment
    {
      id: 1,
      name: "Treadmill Pro X500",
      category: "equipment",
      quantity: 12,
      minStock: 10,
      unit: "units",
      condition: "Excellent",
      lastMaintenance: "2024-12-15",
      nextMaintenance: "2025-03-15",
      location: "Cardio Zone",
      status: "In Stock"
    },
    {
      id: 2,
      name: "Olympic Barbell 20kg",
      category: "equipment",
      quantity: 8,
      minStock: 10,
      unit: "units",
      condition: "Good",
      lastMaintenance: "2024-11-20",
      nextMaintenance: "2025-05-20",
      location: "Free Weights Area",
      status: "Low Stock"
    },
    {
      id: 3,
      name: "Exercise Bike Elite",
      category: "equipment",
      quantity: 15,
      minStock: 12,
      unit: "units",
      condition: "Excellent",
      lastMaintenance: "2025-01-10",
      nextMaintenance: "2025-04-10",
      location: "Spin Studio",
      status: "In Stock"
    },
    {
      id: 4,
      name: "Cable Machine Station",
      category: "equipment",
      quantity: 6,
      minStock: 5,
      unit: "units",
      condition: "Good",
      lastMaintenance: "2024-12-01",
      nextMaintenance: "2025-06-01",
      location: "Strength Zone",
      status: "In Stock"
    },
    // Supplies
    {
      id: 5,
      name: "Microfiber Gym Towels",
      category: "supplies",
      quantity: 45,
      minStock: 50,
      unit: "pieces",
      condition: "New",
      location: "Storage Room A",
      status: "Low Stock"
    },
    {
      id: 6,
      name: "Disinfectant Spray 500ml",
      category: "supplies",
      quantity: 28,
      minStock: 30,
      unit: "bottles",
      condition: "New",
      location: "Maintenance Closet",
      status: "Low Stock"
    },
    {
      id: 7,
      name: "Yoga Mat Premium",
      category: "supplies",
      quantity: 35,
      minStock: 25,
      unit: "pieces",
      condition: "Good",
      location: "Yoga Studio",
      status: "In Stock"
    },
    {
      id: 8,
      name: "Resistance Bands Set",
      category: "supplies",
      quantity: 22,
      minStock: 20,
      unit: "sets",
      condition: "Excellent",
      location: "Group Class Area",
      status: "In Stock"
    },
    // Merchandise
    {
      id: 9,
      name: "P&L Fitness T-Shirt",
      category: "merchandise",
      quantity: 68,
      minStock: 50,
      unit: "pieces",
      condition: "New",
      location: "Retail Counter",
      status: "In Stock"
    },
    {
      id: 10,
      name: "P&L Water Bottle 750ml",
      category: "merchandise",
      quantity: 42,
      minStock: 40,
      unit: "pieces",
      condition: "New",
      location: "Retail Counter",
      status: "In Stock"
    },
    {
      id: 11,
      name: "P&L Gym Bag",
      category: "merchandise",
      quantity: 18,
      minStock: 20,
      unit: "pieces",
      condition: "New",
      location: "Retail Counter",
      status: "Low Stock"
    },
    {
      id: 12,
      name: "P&L Protein Shaker",
      category: "merchandise",
      quantity: 5,
      minStock: 15,
      unit: "pieces",
      condition: "New",
      location: "Retail Counter",
      status: "Low Stock"
    },
  ]);

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: "",
    category: "equipment",
    quantity: 0,
    minStock: 0,
    unit: "units",
    condition: "New",
    location: "",
  });

  const getFilteredItems = () => {
    let filtered = inventoryItems;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(item => item.category === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return <Badge className="bg-green-500 hover:bg-green-600">In Stock</Badge>;
      case "Low Stock":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Low Stock</Badge>;
      case "Out of Stock":
        return <Badge className="bg-red-500 hover:bg-red-600">Out of Stock</Badge>;
      case "Maintenance":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Excellent": return "text-green-500";
      case "Good": return "text-blue-500";
      case "Fair": return "text-yellow-500";
      case "Poor": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const handleAddItem = () => {
    const item: InventoryItem = {
      id: inventoryItems.length + 1,
      name: newItem.name || "",
      category: newItem.category || "equipment",
      quantity: newItem.quantity || 0,
      minStock: newItem.minStock || 0,
      unit: newItem.unit || "units",
      condition: newItem.condition || "New",
      location: newItem.location || "",
      status: (newItem.quantity || 0) === 0 ? "Out of Stock" : 
              (newItem.quantity || 0) <= (newItem.minStock || 0) ? "Low Stock" : "In Stock",
      lastMaintenance: newItem.lastMaintenance,
      nextMaintenance: newItem.nextMaintenance
    };

    setInventoryItems([...inventoryItems, item]);
    setIsAddDialogOpen(false);
    setNewItem({
      name: "",
      category: "equipment",
      quantity: 0,
      minStock: 0,
      unit: "units",
      condition: "New",
      location: "",
    });
  };

  const handleEditItem = () => {
    if (!selectedItem) return;

    setInventoryItems(inventoryItems.map(item => 
      item.id === selectedItem.id ? {
        ...selectedItem,
        status: selectedItem.quantity === 0 ? "Out of Stock" : 
                selectedItem.quantity <= selectedItem.minStock ? "Low Stock" : "In Stock"
      } : item
    ));
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setInventoryItems(inventoryItems.filter(item => item.id !== id));
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem({ ...item });
    setIsEditDialogOpen(true);
  };

  // Calculate stats
  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventoryItems.filter(item => item.status === "Low Stock").length;
  const outOfStockItems = inventoryItems.filter(item => item.status === "Out of Stock").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Inventory Management
          </h2>
          <p className="text-muted-foreground mt-1">Track and manage gym equipment, supplies, and merchandise</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>Enter the details for the new inventory item</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Item Name *</Label>
                <Input 
                  placeholder="e.g., Treadmill Pro X500"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="merchandise">Merchandise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Stock Level *</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({...newItem, minStock: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select value={newItem.unit} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="sets">Sets</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition *</Label>
                <Select value={newItem.condition} onValueChange={(value) => setNewItem({...newItem, condition: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input 
                  placeholder="e.g., Cardio Zone"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                />
              </div>
              {newItem.category === "equipment" && (
                <>
                  <div className="space-y-2">
                    <Label>Last Maintenance</Label>
                    <Input 
                      type="date"
                      value={newItem.lastMaintenance}
                      onChange={(e) => setNewItem({...newItem, lastMaintenance: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Maintenance</Label>
                    <Input 
                      type="date"
                      value={newItem.nextMaintenance}
                      onChange={(e) => setNewItem({...newItem, nextMaintenance: e.target.value})}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddItem} disabled={!newItem.name || !newItem.location}>
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Items</div>
                <div className="text-2xl font-bold">{totalItems}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {inventoryItems.length} types
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Box className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Low Stock</div>
                <div className="text-2xl font-bold text-yellow-500">{lowStockItems}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Needs restocking
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Out of Stock</div>
                <div className="text-2xl font-bold text-red-500">{outOfStockItems}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Urgent action needed
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All Items ({inventoryItems.length})
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Dumbbell className="h-4 w-4 mr-2" />
            Equipment ({inventoryItems.filter(i => i.category === "equipment").length})
          </TabsTrigger>
          <TabsTrigger value="supplies">
            <Box className="h-4 w-4 mr-2" />
            Supplies ({inventoryItems.filter(i => i.category === "supplies").length})
          </TabsTrigger>
          <TabsTrigger value="merchandise">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Merchandise ({inventoryItems.filter(i => i.category === "merchandise").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredItems().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredItems().map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={item.quantity <= item.minStock ? "text-yellow-500 font-medium" : ""}>
                                {item.quantity}
                              </span>
                              <span className="text-muted-foreground text-sm">/{item.minStock} min</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${getConditionColor(item.condition)}`}>
                              {item.condition}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.location}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditDialog(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update the details for this inventory item</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Item Name *</Label>
                <Input 
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={selectedItem.category} onValueChange={(value) => setSelectedItem({...selectedItem, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="merchandise">Merchandise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input 
                  type="number"
                  value={selectedItem.quantity}
                  onChange={(e) => setSelectedItem({...selectedItem, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Stock Level *</Label>
                <Input 
                  type="number"
                  value={selectedItem.minStock}
                  onChange={(e) => setSelectedItem({...selectedItem, minStock: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select value={selectedItem.unit} onValueChange={(value) => setSelectedItem({...selectedItem, unit: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="sets">Sets</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition *</Label>
                <Select value={selectedItem.condition} onValueChange={(value) => setSelectedItem({...selectedItem, condition: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input 
                  value={selectedItem.location}
                  onChange={(e) => setSelectedItem({...selectedItem, location: e.target.value})}
                />
              </div>
              {selectedItem.category === "equipment" && (
                <>
                  <div className="space-y-2">
                    <Label>Last Maintenance</Label>
                    <Input 
                      type="date"
                      value={selectedItem.lastMaintenance}
                      onChange={(e) => setSelectedItem({...selectedItem, lastMaintenance: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Maintenance</Label>
                    <Input 
                      type="date"
                      value={selectedItem.nextMaintenance}
                      onChange={(e) => setSelectedItem({...selectedItem, nextMaintenance: e.target.value})}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditItem}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}