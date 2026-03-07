import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Pin, Plus, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Forum {
  id: string;
  title: string;
  description: string | null;
  category: string;
  created_by: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  post_count?: number;
  latest_post?: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  forum_id: string;
  likes_count: number;
  replies_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null };
}

const Forums = () => {
  const { user } = useAuth();
  const [forums, setForums] = useState<Forum[]>([]);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateForumOpen, setIsCreateForumOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: "general", label: "General Discussion", color: "bg-blue-100 text-blue-800" },
    { value: "crop-advice", label: "Crop Advice", color: "bg-green-100 text-green-800" },
    { value: "market-info", label: "Market Information", color: "bg-yellow-100 text-yellow-800" },
    { value: "equipment", label: "Equipment", color: "bg-purple-100 text-purple-800" },
  ];

  useEffect(() => {
    fetchForums();
  }, []);

  useEffect(() => {
    if (selectedForum) {
      fetchPosts(selectedForum.id);
    }
  }, [selectedForum]);

  const fetchForums = async () => {
    try {
      const { data, error } = await supabase
        .from("forums")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setForums(data || []);
    } catch (error) {
      console.error("Error fetching forums:", error);
      toast.error("Failed to load forums");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (forumId: string) => {
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("forum_id", forumId)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    }
  };

  const createForum = async (formData: { title: string; description: string; category: string }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("forums")
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          created_by: user.id,
        });

      if (error) throw error;

      toast.success("Forum created successfully!");
      setIsCreateForumOpen(false);
      fetchForums();
    } catch (error) {
      console.error("Error creating forum:", error);
      toast.error("Failed to create forum");
    }
  };

  const createPost = async (formData: { title: string; content: string }) => {
    if (!user || !selectedForum) return;

    try {
      const { error } = await supabase
        .from("forum_posts")
        .insert({
          title: formData.title,
          content: formData.content,
          forum_id: selectedForum.id,
          author_id: user.id,
        });

      if (error) throw error;

      toast.success("Post created successfully!");
      setIsCreatePostOpen(false);
      fetchPosts(selectedForum.id);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const filteredForums = forums.filter(forum => {
    const matchesSearch = forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forum.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || forum.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
              placeholder="Search forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {user && (
          <Dialog open={isCreateForumOpen} onOpenChange={setIsCreateForumOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Forum
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Forum</DialogTitle>
                <DialogDescription>
                  Start a new discussion forum for farmers to share knowledge and experiences.
                </DialogDescription>
              </DialogHeader>
              <CreateForumForm onSubmit={createForum} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Forums List or Posts View */}
      {!selectedForum ? (
        <div className="grid gap-4">
          {filteredForums.map((forum) => (
            <motion.div
              key={forum.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => setSelectedForum(forum)}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {forum.is_pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                        <CardTitle className="text-lg">{forum.title}</CardTitle>
                        <Badge className={categories.find(c => c.value === forum.category)?.color}>
                          {categories.find(c => c.value === forum.category)?.label}
                        </Badge>
                      </div>
                      {forum.description && (
                        <CardDescription className="text-sm">
                          {forum.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{forum.post_count || 0} posts</span>
                    <span>Updated {new Date(forum.updated_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Back Button and Forum Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setSelectedForum(null)}>
                ← Back to Forums
              </Button>
              <div>
                <h2 className="text-2xl font-bold">{selectedForum.title}</h2>
                <p className="text-gray-600">{selectedForum.description}</p>
              </div>
            </div>

            {user && (
              <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                    <DialogDescription>
                      Share your thoughts and experiences in this forum.
                    </DialogDescription>
                  </DialogHeader>
                  <CreatePostForm onSubmit={createPost} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.profiles?.avatar_url || ""} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-gray-600">
                          by {post.profiles?.full_name || "Anonymous"} • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {post.is_pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes_count} likes
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.replies_count} replies
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Form Components
const CreateForumForm = ({ onSubmit }: { onSubmit: (data: { title: string; description: string; category: string }) => void }) => {
  const [formData, setFormData] = useState({ title: "", description: "", category: "general" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: "", description: "", category: "general" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Forum Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter forum title"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this forum is about"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Discussion</SelectItem>
            <SelectItem value="crop-advice">Crop Advice</SelectItem>
            <SelectItem value="market-info">Market Information</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Create Forum</Button>
    </form>
  );
};

const CreatePostForm = ({ onSubmit }: { onSubmit: (data: { title: string; content: string }) => void }) => {
  const [formData, setFormData] = useState({ title: "", content: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: "", content: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Post Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter post title"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Share your thoughts and experiences..."
          rows={6}
          required
        />
      </div>
      <Button type="submit" className="w-full">Create Post</Button>
    </form>
  );
};

export default Forums;