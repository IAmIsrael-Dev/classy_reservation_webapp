 
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { 
  Plus, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Users, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  DollarSign,
  Star,
  Download
} from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'manager' | 'host' | 'server' | 'chef' | 'bartender';
  status: 'active' | 'inactive' | 'pending';
  hireDate: string;
  hourlyRate?: number;
  avatar?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  certifications?: string[];
}

interface Shift {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'missed' | 'cancelled';
  break?: {
    start: string;
    end: string;
  };
  notes?: string;
}


const MOCK_STAFF: Staff[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@bellavista.com',
    phone: '(555) 123-4567',
    role: 'manager',
    status: 'active',
    hireDate: '2023-01-15',
    hourlyRate: 25,
    emergencyContact: {
      name: 'Jane Smith',
      phone: '(555) 987-6543',
      relationship: 'Spouse'
    },
    certifications: ['Food Safety', 'Management']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@bellavista.com',
    phone: '(555) 234-5678',
    role: 'host',
    status: 'active',
    hireDate: '2023-03-20',
    hourlyRate: 18,
    certifications: ['Customer Service']
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@bellavista.com',
    phone: '(555) 345-6789',
    role: 'server',
    status: 'active',
    hireDate: '2023-02-10',
    hourlyRate: 15,
    certifications: ['Food Safety', 'Alcohol Service']
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@bellavista.com',
    phone: '(555) 456-7890',
    role: 'chef',
    status: 'active',
    hireDate: '2022-11-05',
    hourlyRate: 28,
    certifications: ['Culinary Arts', 'Food Safety']
  },
  {
    id: '5',
    name: 'Robert Brown',
    email: 'robert@bellavista.com',
    phone: '(555) 567-8901',
    role: 'server',
    status: 'pending',
    hireDate: '2024-01-08',
    hourlyRate: 15
  }
];

const MOCK_SHIFTS: Shift[] = [
  {
    id: '1',
    staffId: '1',
    date: '2024-01-15',
    startTime: '16:00',
    endTime: '23:00',
    role: 'manager',
    status: 'confirmed',
    break: { start: '19:00', end: '19:30' }
  },
  {
    id: '2',
    staffId: '2',
    date: '2024-01-15',
    startTime: '17:00',
    endTime: '22:00',
    role: 'host',
    status: 'confirmed'
  },
  {
    id: '3',
    staffId: '3',
    date: '2024-01-15',
    startTime: '17:30',
    endTime: '23:30',
    role: 'server',
    status: 'scheduled'
  },
  {
    id: '4',
    staffId: '4',
    date: '2024-01-15',
    startTime: '15:00',
    endTime: '22:00',
    role: 'chef',
    status: 'confirmed',
    break: { start: '18:00', end: '18:30' }
  }
];

const ROLE_CONFIG = {
  owner: { label: 'Owner', color: 'bg-purple-500', emoji: '👑' },
  manager: { label: 'Manager', color: 'bg-blue-500', emoji: '📊' },
  host: { label: 'Host', color: 'bg-green-500', emoji: '🏢' },
  server: { label: 'Server', color: 'bg-orange-500', emoji: '🍽️' },
  chef: { label: 'Chef', color: 'bg-red-500', emoji: '👨‍🍳' },
  bartender: { label: 'Bartender', color: 'bg-indigo-500', emoji: '🍸' }
};

export function StaffAndShifts() {
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');

  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    name: '',
    email: '',
    phone: '',
    role: 'server',
    status: 'pending',
    hireDate: new Date().toISOString().split('T')[0],
    hourlyRate: 15
  });

  const [newShift, setNewShift] = useState({
    staffId: '',
    date: selectedDate,
    startTime: '17:00',
    endTime: '23:00',
    role: 'server'
  });

  const handleSaveStaff = () => {
    if (editingStaff) {
      setStaff(prev => prev.map(s => 
        s.id === editingStaff.id ? { ...editingStaff, ...newStaff } : s
      ));
      setEditingStaff(null);
    } else {
      const staffMember: Staff = {
        id: Date.now().toString(),
        name: newStaff.name || '',
        email: newStaff.email || '',
        phone: newStaff.phone || '',
        role: newStaff.role || 'server',
        status: newStaff.status || 'pending',
        hireDate: newStaff.hireDate || new Date().toISOString().split('T')[0],
        hourlyRate: newStaff.hourlyRate || 15
      };
      setStaff(prev => [...prev, staffMember]);
    }
    
    setNewStaff({
      name: '',
      email: '',
      phone: '',
      role: 'server',
      status: 'pending',
      hireDate: new Date().toISOString().split('T')[0],
      hourlyRate: 15
    });
    setShowStaffForm(false);
  };

  const handleSaveShift = () => {
    const shift: Shift = {
      id: Date.now().toString(),
      staffId: newShift.staffId,
      date: newShift.date,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      role: newShift.role,
      status: 'scheduled'
    };
    setShifts(prev => [...prev, shift]);
    setNewShift({
      staffId: '',
      date: selectedDate,
      startTime: '17:00',
      endTime: '23:00',
      role: 'server'
    });
    setShowShiftForm(false);
  };

  const updateShiftStatus = (shiftId: string, status: Shift['status']) => {
    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, status } : s));
  };

  const filteredStaff = filterRole === 'all' 
    ? staff 
    : staff.filter(s => s.role === filterRole);

  const todayShifts = shifts.filter(s => s.date === selectedDate);

  const getStatusBadge = (status: Staff['status']) => {
    const config = {
      active: { color: 'bg-green-500', label: 'Active' },
      inactive: { color: 'bg-red-500', label: 'Inactive' },
      pending: { color: 'bg-yellow-500', label: 'Pending' }
    };
    return (
      <Badge variant="secondary" className={`text-white ${config[status].color}`}>
        {config[status].label}
      </Badge>
    );
  };

  const getShiftStatusBadge = (status: Shift['status']) => {
    const config = {
      scheduled: { color: 'bg-blue-500', label: 'Scheduled', icon: Calendar },
      confirmed: { color: 'bg-green-500', label: 'Confirmed', icon: CheckCircle },
      completed: { color: 'bg-purple-500', label: 'Completed', icon: CheckCircle },
      missed: { color: 'bg-red-500', label: 'Missed', icon: XCircle },
      cancelled: { color: 'bg-gray-500', label: 'Cancelled', icon: XCircle }
    };
    const conf = config[status];
    const Icon = conf.icon;
    return (
      <Badge variant="secondary" className={`text-white ${conf.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {conf.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Staff & Shifts</h1>
          <p className="text-muted-foreground">Manage your team and schedule shifts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Schedule
          </Button>
          <Button onClick={() => setShowStaffForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      <Tabs defaultValue="staff" className="space-y-6">
        <TabsList>
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="templates">Shift Templates</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                        <SelectItem key={role} value={role}>
                          {config.emoji} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Total Staff: {staff.length}</span>
                  <span>Active: {staff.filter(s => s.status === 'active').length}</span>
                  <span>Pending: {staff.filter(s => s.status === 'pending').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((member) => (
              <Card key={member.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-white ${ROLE_CONFIG[member.role].color}`}>
                            {ROLE_CONFIG[member.role].emoji} {ROLE_CONFIG[member.role].label}
                          </Badge>
                          {getStatusBadge(member.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Hired: {new Date(member.hireDate).toLocaleDateString()}</span>
                      </div>
                      {member.hourlyRate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span>${member.hourlyRate}/hour</span>
                        </div>
                      )}
                    </div>

                    {member.certifications && member.certifications.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Certifications</Label>
                        <div className="flex flex-wrap gap-1">
                          {member.certifications.map((cert) => (
                            <Badge key={cert} variant="outline" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => {
                          setEditingStaff(member);
                          setNewStaff(member);
                          setShowStaffForm(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        {todayShifts.filter(s => s.staffId === member.id).length} shifts today
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add/Edit Staff Form */}
          {showStaffForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="staff-name">Full Name</Label>
                      <Input
                        id="staff-name"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Smith"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-email">Email</Label>
                      <Input
                        id="staff-email"
                        type="email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@bellavista.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-phone">Phone</Label>
                      <Input
                        id="staff-phone"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="staff-role">Role</Label>
                      <Select
                        value={newStaff.role}
                        onValueChange={(value) => setNewStaff(prev => ({ ...prev, role: value as Staff['role'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                            <SelectItem key={role} value={role}>
                              {config.emoji} {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-rate">Hourly Rate ($)</Label>
                      <Input
                        id="staff-rate"
                        type="number"
                        step="0.50"
                        value={newStaff.hourlyRate}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 15 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-hire-date">Hire Date</Label>
                      <Input
                        id="staff-hire-date"
                        type="date"
                        value={newStaff.hireDate}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, hireDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    onClick={() => {
                      setShowStaffForm(false);
                      setEditingStaff(null);
                      setNewStaff({
                        name: '',
                        email: '',
                        phone: '',
                        role: 'server',
                        status: 'pending',
                        hireDate: new Date().toISOString().split('T')[0],
                        hourlyRate: 15
                      });
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveStaff}>
                    {editingStaff ? 'Update Staff' : 'Add Staff'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          {/* Date Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Label htmlFor="schedule-date">Schedule Date:</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-48"
                  />
                  <Button onClick={() => setShowShiftForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Shift
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  {todayShifts.length} shifts scheduled
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shifts List */}
          <div className="space-y-4">
            {todayShifts.map((shift) => {
              const staffMember = staff.find(s => s.id === shift.staffId);
              if (!staffMember) return null;

              return (
                <Card key={shift.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {staffMember.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-medium">{staffMember.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="outline" className={`text-white ${ROLE_CONFIG[shift.role as keyof typeof ROLE_CONFIG].color}`}>
                              {ROLE_CONFIG[shift.role as keyof typeof ROLE_CONFIG].emoji} {shift.role}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {shift.startTime} - {shift.endTime}
                            </div>
                            {shift.break && (
                              <div className="flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Break: {shift.break.start} - {shift.break.end}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getShiftStatusBadge(shift.status)}
                        <div className="flex items-center gap-2">
                          {shift.status === 'scheduled' && (
                            <Button
                              onClick={() => updateShiftStatus(shift.id, 'confirmed')}
                              size="sm"
                            >
                              Confirm
                            </Button>
                          )}
                          {shift.status === 'confirmed' && (
                            <Button
                              onClick={() => updateShiftStatus(shift.id, 'completed')}
                              size="sm"
                            >
                              Complete
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add Shift Form */}
          {showShiftForm && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Shift</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shift-staff">Staff Member</Label>
                    <Select
                      value={newShift.staffId}
                      onValueChange={(value) => setNewShift(prev => ({ ...prev, staffId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.filter(s => s.status === 'active').map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {ROLE_CONFIG[member.role].emoji} {member.name} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shift-role">Role for Shift</Label>
                    <Select
                      value={newShift.role}
                      onValueChange={(value) => setNewShift(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                          <SelectItem key={role} value={role}>
                            {config.emoji} {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shift-start">Start Time</Label>
                    <Input
                      id="shift-start"
                      type="time"
                      value={newShift.startTime}
                      onChange={(e) => setNewShift(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shift-end">End Time</Label>
                    <Input
                      id="shift-end"
                      type="time"
                      value={newShift.endTime}
                      onChange={(e) => setNewShift(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    onClick={() => setShowShiftForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveShift}>
                    Schedule Shift
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shift Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create recurring shift patterns for easier scheduling
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Shift Templates</h3>
                <p className="text-muted-foreground mb-4">
                  Create templates for recurring shifts to speed up scheduling
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Staff</p>
                    <p className="text-2xl font-medium">{staff.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Staff</p>
                    <p className="text-2xl font-medium">{staff.filter(s => s.status === 'active').length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Shifts</p>
                    <p className="text-2xl font-medium">{todayShifts.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Hourly Rate</p>
                    <p className="text-2xl font-medium">
                      ${(staff.reduce((sum, s) => sum + (s.hourlyRate || 0), 0) / staff.length).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}