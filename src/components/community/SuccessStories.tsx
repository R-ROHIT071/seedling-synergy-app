import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Eye, Heart, MapPin, Plus, Search, Star, TrendingUp, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SuccessStory {
  id: string;
  title: string;
  story: string;
  images: string[] | null;
  crop_type: string | null;
  yield_increase: number | null;
  profit_increase: number | null;
  location: string | null;
  is_featured: boolean;
  likes_count: number;
  views_count: number;
  created_at: string;
  author_id: string;
  profiles?: { full_name: string | null; avatar_url: string | null };
}

const SuccessStories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const cropTypes = [
    "Rice", "Wheat", "Cotton", "Sugarcane", "Maize", "Soybean", "Groundnut",
    "Mustard", "Potato", "Tomato", "Onion", "Chili", "Banana", "Mango", "Grapes"
  ];

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("success_stories")
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load success stories");
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (formData: {
    title: string;
    story: string;
    crop_type: string;
    yield_increase: number;
    profit_increase: number;
    location: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("success_stories")
        .insert({
          title: formData.title,
          story: formData.story,
          crop_type: formData.crop_type,
          yield_increase: formData.yield_increase,
          profit_increase: formData.profit_increase,
          location: formData.location,
          author_id: user.id,
        });

      if (error) throw error;

      toast.success("Success story shared!");
      setIsCreateStoryOpen(false);
      fetchStories();
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Failed to share story");
    }
  };

  const likeStory = async (storyId: string) => {
    if (!user) return;

    try {
      // Check if user already liked
      const { data: existingLike } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", storyId)
        .eq("user_id", user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", storyId)
          .eq("user_id", user.id);

        await supabase
          .from("success_stories")
          .update({ likes_count: supabase.raw("likes_count - 1") })
          .eq("id", storyId);
      } else {
        // Like
        await supabase
          .from("post_likes")
          .insert({ post_id: storyId, user_id: user.id });

        await supabase
          .from("success_stories")
          .update({ likes_count: supabase.raw("likes_count + 1") })
          .eq("id", storyId);
      }

      fetchStories();
    } catch (error) {
      console.error("Error liking story:", error);
      toast.error("Failed to like story");
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.story.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === "all" || story.crop_type === selectedCrop;
    return matchesSearch && matchesCrop;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search success stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Crops</option>
            {cropTypes.map((crop) => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>

        {user && (
          <Dialog open={isCreateStoryOpen} onOpenChange={setIsCreateStoryOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Share Success Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Share Your Success Story</DialogTitle>
                <DialogDescription>
                  Inspire other farmers with your achievements and experiences.
                </DialogDescription>
              </DialogHeader>
              <CreateStoryForm onSubmit={createStory} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Featured Stories */}
      {filteredStories.filter(story => story.is_featured).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Stories
          </h2>
          <div className="grid gap-6">
            {filteredStories.filter(story => story.is_featured).map((story) => (
              <StoryCard key={story.id} story={story} onLike={likeStory} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* All Stories */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">All Success Stories</h2>
        <div className="grid gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} onLike={likeStory} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StoryCard = ({ story, onLike, user }: {
  story: SuccessStory;
  onLike: (storyId: string) => void;
  user: any;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className={`${story.is_featured ? 'ring-2 ring-yellow-400' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={story.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  <Trophy className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{story.title}</CardTitle>
                <CardDescription>
                  by {story.profiles?.full_name || "Anonymous"}
                  {story.location && (
                    <span className="flex items-center gap-1 ml-2">
                      <MapPin className="h-3 w-3" />
                      {story.location}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            {story.is_featured && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-700 line-clamp-3">{story.story}</p>

          {story.crop_type && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{story.crop_type}</Badge>
              {story.yield_increase && (
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{story.yield_increase}% yield
                </Badge>
              )}
              {story.profit_increase && (
                <Badge className="bg-blue-100 text-blue-800">
                  +{story.profit_increase}% profit
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {story.views_count} views
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {story.likes_count} likes
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {new Date(story.created_at).toLocaleDateString()}
              </span>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike(story.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CreateStoryForm = ({ onSubmit }: {
  onSubmit: (data: {
    title: string;
    story: string;
    crop_type: string;
    yield_increase: number;
    profit_increase: number;
    location: string;
  }) => void
}) => {
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    crop_type: "",
    yield_increase: 0,
    profit_increase: 0,
    location: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: "",
      story: "",
      crop_type: "",
      yield_increase: 0,
      profit_increase: 0,
      location: ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Story Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Give your success story a title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Your Story</label>
        <Textarea
          value={formData.story}
          onChange={(e) => setFormData({ ...formData, story: e.target.value })}
          placeholder="Share your farming journey, challenges overcome, and achievements..."
          rows={8}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Crop Type</label>
          <select
            value={formData.crop_type}
            onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select crop</option>
            {["Rice", "Wheat", "Cotton", "Sugarcane", "Maize", "Soybean", "Groundnut", "Mustard", "Potato", "Tomato", "Onion", "Chili", "Banana", "Mango", "Grapes"].map((crop) => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, State"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Yield Increase (%)</label>
          <Input
            type="number"
            value={formData.yield_increase}
            onChange={(e) => setFormData({ ...formData, yield_increase: parseInt(e.target.value) || 0 })}
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Profit Increase (%)</label>
          <Input
            type="number"
            value={formData.profit_increase}
            onChange={(e) => setFormData({ ...formData, profit_increase: parseInt(e.target.value) || 0 })}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">Share Success Story</Button>
    </form>
  );
};

export default SuccessStories;