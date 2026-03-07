import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { DollarSign, MapPin, Plus, Search, Tractor, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type EquipmentSharing = Database['public']['Tables']['equipment_sharing']['Row'];
type EquipmentSharingInsert = Database['public']['Tables']['equipment_sharing']['Insert'];

const EquipmentSharing: React.FC = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<EquipmentSharing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for creating new equipment
  const [newEquipment, setNewEquipment] = useState<Partial<EquipmentSharingInsert>>({
    title: '',
    description: '',
    category: '',
    location: '',
    price_per_day: 0,
    availability_status: 'available',
    contact_info: '',
  });

  const categories = [
    'Tractor',
    'Harvester',
    'Seeder',
    'Sprayer',
    'Irrigation Equipment',
    'Tillage Equipment',
    'Harvesting Tools',
    'Other'
  ];

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('equipment_sharing')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (locationFilter) {
        query = query.ilike('location', `%${locationFilter}%`);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment listings');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, locationFilter, searchTerm]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleCreateEquipment = async () => {
    if (!user) {
      toast.error('Please log in to create equipment listings');
      return;
    }

    if (!newEquipment.title || !newEquipment.description || !newEquipment.category || !newEquipment.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('equipment_sharing')
        .insert({
          ...newEquipment,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setEquipment([data, ...equipment]);
      setNewEquipment({
        title: '',
        description: '',
        category: '',
        location: '',
        price_per_day: 0,
        availability_status: 'available',
        contact_info: '',
      });
      setIsCreateDialogOpen(false);
      toast.success('Equipment listing created successfully!');
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast.error('Failed to create equipment listing');
    }
  };

  const handleContactOwner = (contactInfo: string) => {
    // In a real app, this might open a chat or send an email
    toast.info(`Contact info: ${contactInfo}`);
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLocation = !locationFilter ||
      item.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipment Sharing</h2>
          <p className="text-gray-600">Share and rent farming equipment with fellow farmers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              List Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>List Your Equipment</DialogTitle>
              <DialogDescription>
                Share your farming equipment with the community and earn extra income.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Equipment Title *</Label>
                <Input
                  id="title"
                  value={newEquipment.title || ''}
                  onChange={(e) => setNewEquipment({ ...newEquipment, title: e.target.value })}
                  placeholder="e.g., John Deere Tractor Model X"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={newEquipment.category || ''} onValueChange={(value) => setNewEquipment({ ...newEquipment, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={newEquipment.location || ''}
                  onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                  placeholder="e.g., Springfield, IL"
                />
              </div>
              <div>
                <Label htmlFor="price">Price per Day ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newEquipment.price_per_day || ''}
                  onChange={(e) => setNewEquipment({ ...newEquipment, price_per_day: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newEquipment.description || ''}
                  onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                  placeholder="Describe your equipment, its condition, and any usage terms..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact Information</Label>
                <Input
                  id="contact"
                  value={newEquipment.contact_info || ''}
                  onChange={(e) => setNewEquipment({ ...newEquipment, contact_info: e.target.value })}
                  placeholder="Phone number or email"
                />
              </div>
              <Button onClick={handleCreateEquipment} className="w-full bg-green-600 hover:bg-green-700">
                Create Listing
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full sm:w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </CardDescription>
                </div>
                <Badge variant={item.availability_status === 'available' ? 'default' : 'secondary'}>
                  {item.availability_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.category}</Badge>
                  {item.price_per_day > 0 && (
                    <div className="flex items-center gap-1 text-green-600 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {item.price_per_day}/day
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContactOwner(item.contact_info || 'Contact owner')}
                  className="flex-1"
                >
                  <User className="w-4 h-4 mr-1" />
                  Contact Owner
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <Tractor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No equipment found</h3>
          <p className="text-gray-600">Try adjusting your filters or be the first to list equipment in your area.</p>
        </div>
      )}
    </div>
  );
};

export default EquipmentSharing;