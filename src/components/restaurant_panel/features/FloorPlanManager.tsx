import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { 
  RotateCw, 
  Square, 
  Circle, 
  Trash2, 
  Save, 
  Download, 
  Upload,
  Grip,
  Users,
  Grid,
  Maximize
} from 'lucide-react';

interface Table {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  seats: number;
  rotation: number;
  shape: 'rectangle' | 'circle';
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  tableNumber: string;
}

const FLOOR_PLAN_TEMPLATES = [
  {
    id: 'casual',
    name: 'Casual Dining',
    description: '25 tables, mixed seating',
    tables: 25,
    thumbnail: '🍽️'
  },
  {
    id: 'fine',
    name: 'Fine Dining',
    description: '15 tables, spacious layout',
    tables: 15,
    thumbnail: '🥂'
  },
  {
    id: 'cafe',
    name: 'Cafe Style',
    description: '20 tables, cozy arrangement',
    tables: 20,
    thumbnail: '☕'
  },
  {
    id: 'custom',
    name: 'Start from Scratch',
    description: 'Build your own layout',
    tables: 0,
    thumbnail: '🎨'
  }
];

export function FloorPlanManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showTemplates, setShowTemplates] = useState(false);
  const [floorPlanDimensions, setFloorPlanDimensions] = useState({ width: 800, height: 600 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate sample tables for demo
  useEffect(() => {
    const sampleTables: Table[] = [
      { id: '1', x: 100, y: 100, width: 80, height: 80, seats: 4, rotation: 0, shape: 'rectangle', status: 'available', tableNumber: 'T1' },
      { id: '2', x: 200, y: 100, width: 60, height: 60, seats: 2, rotation: 0, shape: 'circle', status: 'occupied', tableNumber: 'T2' },
      { id: '3', x: 300, y: 100, width: 120, height: 80, seats: 6, rotation: 0, shape: 'rectangle', status: 'reserved', tableNumber: 'T3' },
      { id: '4', x: 100, y: 220, width: 80, height: 80, seats: 4, rotation: 45, shape: 'rectangle', status: 'cleaning', tableNumber: 'T4' },
      { id: '5', x: 250, y: 250, width: 80, height: 80, seats: 4, rotation: 0, shape: 'circle', status: 'available', tableNumber: 'T5' },
    ];
    setTables(sampleTables);
  }, []);

  const addTable = (shape: 'rectangle' | 'circle') => {
    const newTable: Table = {
      id: Date.now().toString(),
      x: 50,
      y: 50,
      width: shape === 'circle' ? 80 : 100,
      height: 80,
      seats: 4,
      rotation: 0,
      shape,
      status: 'available',
      tableNumber: `T${tables.length + 1}`
    };
    setTables([...tables, newTable]);
  };

  const deleteTable = (id: string) => {
    setTables(tables.filter(t => t.id !== id));
    if (selectedTable === id) {
      setSelectedTable(null);
    }
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(tables.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const rotateTable = (id: string) => {
    updateTable(id, { rotation: (tables.find(t => t.id === id)?.rotation || 0) + 45 });
  };

  const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.preventDefault();
    setSelectedTable(tableId);
    setIsDragging(true);
    
    const table = tables.find(t => t.id === tableId);
    if (table && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - table.x,
        y: e.clientY - rect.top - table.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedTable && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;
      
      updateTable(selectedTable, { 
        x: Math.max(0, Math.min(newX, floorPlanDimensions.width - 100)),
        y: Math.max(0, Math.min(newY, floorPlanDimensions.height - 100))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'cleaning': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const loadTemplate = (templateId: string) => {
    // Generate tables based on template
    const newTables: Table[] = [];
    let tableCount = 0;
    
    switch (templateId) {
      case 'casual':
        // Generate 25 tables in a casual layout
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            tableCount++;
            newTables.push({
              id: tableCount.toString(),
              x: 80 + col * 140,
              y: 80 + row * 120,
              width: 80,
              height: 80,
              seats: Math.floor(Math.random() * 4) + 2,
              rotation: 0,
              shape: Math.random() > 0.7 ? 'circle' : 'rectangle',
              status: 'available',
              tableNumber: `T${tableCount}`
            });
          }
        }
        break;
      case 'fine':
        // Generate 15 tables in a fine dining layout (more spacious)
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 5; col++) {
            tableCount++;
            newTables.push({
              id: tableCount.toString(),
              x: 100 + col * 160,
              y: 100 + row * 150,
              width: 100,
              height: 100,
              seats: Math.floor(Math.random() * 4) + 4,
              rotation: 0,
              shape: 'rectangle',
              status: 'available',
              tableNumber: `T${tableCount}`
            });
          }
        }
        break;
      case 'cafe':
        // Generate 20 tables in a cafe layout
        for (let i = 0; i < 20; i++) {
          tableCount++;
          newTables.push({
            id: tableCount.toString(),
            x: Math.random() * (floorPlanDimensions.width - 100),
            y: Math.random() * (floorPlanDimensions.height - 100),
            width: 60,
            height: 60,
            seats: Math.floor(Math.random() * 3) + 2,
            rotation: Math.random() * 360,
            shape: Math.random() > 0.5 ? 'circle' : 'rectangle',
            status: 'available',
            tableNumber: `T${tableCount}`
          });
        }
        break;
    }
    
    setTables(newTables);
    setShowTemplates(false);
  };

  const selectedTableData = selectedTable ? tables.find(t => t.id === selectedTable) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Floor Plan Manager</h1>
          <p className="text-muted-foreground">Design and manage your restaurant layout</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowTemplates(true)} variant="outline">
            <Grid className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {showTemplates && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {FLOOR_PLAN_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  onClick={() => loadTemplate(template.id)}
                  className="border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <div className="text-4xl mb-3">{template.thumbnail}</div>
                  <h4 className="font-medium mb-2">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowTemplates(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Toolbar */}
        <Card>
          <CardHeader>
            <CardTitle>Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Add Tables</Label>
              <div className="space-y-2">
                <Button 
                  onClick={() => addTable('rectangle')} 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Rectangle
                </Button>
                <Button 
                  onClick={() => addTable('circle')} 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <Circle className="w-4 h-4 mr-2" />
                  Circle
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-2 block">Floor Plan Size</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Width:</Label>
                  <Input
                    type="number"
                    value={floorPlanDimensions.width}
                    onChange={(e) => setFloorPlanDimensions(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                    className="text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Height:</Label>
                  <Input
                    type="number"
                    value={floorPlanDimensions.height}
                    onChange={(e) => setFloorPlanDimensions(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {selectedTableData && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Selected Table</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Number:</Label>
                    <Input
                      value={selectedTableData.tableNumber}
                      onChange={(e) => updateTable(selectedTable!, { tableNumber: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Seats:</Label>
                    <Input
                      type="number"
                      value={selectedTableData.seats}
                      onChange={(e) => updateTable(selectedTable!, { seats: parseInt(e.target.value) || 1 })}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Status:</Label>
                    <Select
                      value={selectedTableData.status}
                      onValueChange={(value) => updateTable(selectedTable!, { status: value as Table['status'] })}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => rotateTable(selectedTable!)} 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                    >
                      <RotateCw className="w-3 h-3" />
                    </Button>
                    <Button 
                      onClick={() => deleteTable(selectedTable!)} 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-2 block">Statistics</Label>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total Tables:</span>
                  <span>{tables.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Seats:</span>
                  <span>{tables.reduce((sum, t) => sum + t.seats, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span>{tables.filter(t => t.status === 'available').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupied:</span>
                  <span>{tables.filter(t => t.status === 'occupied').length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floor Plan Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Floor Plan</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Grip className="w-3 h-3 mr-1" />
                    Drag to move tables
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                ref={canvasRef}
                className="relative border border-dashed border-border rounded-lg overflow-hidden bg-muted/20"
                style={{ 
                  width: floorPlanDimensions.width, 
                  height: floorPlanDimensions.height,
                  maxWidth: '100%',
                  maxHeight: '600px'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Grid Pattern */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #666 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* Tables */}
                {tables.map((table) => (
                  <div
                    key={table.id}
                    onMouseDown={(e) => handleMouseDown(e, table.id)}
                    className={`absolute cursor-move border-2 flex items-center justify-center transition-all ${
                      selectedTable === table.id 
                        ? 'border-primary bg-primary/20 z-10' 
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                    style={{
                      left: table.x,
                      top: table.y,
                      width: table.width,
                      height: table.height,
                      borderRadius: table.shape === 'circle' ? '50%' : '8px',
                      transform: `rotate(${table.rotation}deg)`,
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium">{table.tableNumber}</div>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {table.seats}
                      </div>
                      <div className={`w-2 h-2 rounded-full mx-auto ${getStatusColor(table.status)}`} />
                    </div>
                  </div>
                ))}

                {/* Add Table Areas */}
                {tables.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Grid className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">Your floor plan is empty</p>
                      <p className="text-sm">Add tables using the toolbar or choose a template</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Cleaning</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}