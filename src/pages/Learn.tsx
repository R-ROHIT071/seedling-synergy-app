import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BookOpen, Clock, Play, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const defaultResources = [
  { id: "1", title: "Modern Drip Irrigation Techniques", category: "Irrigation", read_time: "12 min", video_url: "https://youtu.be/pfNSTgnmVWE?si=IozWgztX0iSOK30q", content: "Learn how to set up and maintain drip irrigation for maximum water efficiency.", difficulty: "beginner", language: "en" },
  { id: "2", title: "Organic Pest Control Methods", category: "Pest Control", read_time: "8 min", video_url: "https://youtu.be/q3KkDG-dy-w?si=Cr7wwyV6Ep5CRcq-", content: "Natural ways to protect your crops without harmful chemicals.", difficulty: "beginner", language: "en" },
  { id: "3", title: "Soil Health & Testing Guide", category: "Soil Science", read_time: "15 min", video_url: "https://youtu.be/RPjEszQGnes?si=tUdItKY65ipDUSEX", content: "Understanding soil pH, nutrients, and how to test your farmland.", difficulty: "intermediate", language: "en" },
  { id: "4", title: "Crop Rotation Best Practices", category: "Crop Management", read_time: "10 min", video_url: "https://youtu.be/vBPCtUOxCkE?si=SyWAGLby7TM38CuF", content: "Maximize yield and soil health with proper crop rotation planning.", difficulty: "beginner", language: "en" },
  { id: "5", title: "Government Subsidy Guide 2026", category: "Finance", read_time: "6 min", video_url: "https://youtu.be/0sQ5aJcGvJM?si=aeeeCjog_ze2dxW4", content: "Complete guide to agricultural subsidies and how to apply.", difficulty: "beginner", language: "en" },
  { id: "6", title: "Greenhouse Farming Basics", category: "Crop Management", read_time: "20 min", video_url: "https://youtu.be/Zwy4Su9AgZU?si=R9fnOU_wAdNiyCnu", content: "Start your protected cultivation journey with this comprehensive guide.", difficulty: "intermediate", language: "en" },
  { id: "7", title: "Sustainable Farming Practices", category: "Crop Management", read_time: "16 min", video_url: "https://youtu.be/OVKO8pC1ACA?si=bkMap_BGj-KZevis", content: "Learn sustainable farming practices for long-term success.", difficulty: "intermediate", language: "en" },
  { id: "8", title: "Weather Forecasting for Farmers", category: "Weather", read_time: "12 min", video_url: "https://youtu.be/ZH4r8FOD4Js?si=6qiFFdNLoFOrRyzX", content: "Understand weather patterns and forecasting for better planning.", difficulty: "beginner", language: "en" },
];

const categories = ["All", "Crop Management", "Irrigation", "Pest Control", "Soil Science", "Finance", "Weather"];
const languages = [
  { code: "all", label: "All Languages" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
];

const Learn = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("all");
  const [resources, setResources] = useState(defaultResources);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      const { data } = await supabase.from("learning_resources").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) setResources(data as any);
    };
    fetchResources();
  }, []);

  const extractVideoId = (url: string) => {
    const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  useEffect(() => {
    const fetchResources = async () => {
      const { data } = await supabase.from("learning_resources").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) setResources(data as any);
    };
    fetchResources();
  }, []);

  const filtered = resources.filter((r) => {
    const matchCat = filter === "All" || r.category === filter;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    const matchLang = lang === "all" || r.language === lang;
    return matchCat && matchSearch && matchLang;
  });

  return (
    <PageLayout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Knowledge Hub</span>
            <h1 className="text-3xl md:text-5xl font-bold mt-2 text-foreground">Learning Resources</h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Expert tutorials and guides to help you farm smarter and more efficiently.
            </p>
          </motion.div>

          <div className="max-w-lg mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {categories.map((cat) => (
              <Button key={cat} variant={filter === cat ? "default" : "outline"} size="sm" onClick={() => setFilter(cat)}>{cat}</Button>
            ))}
          </div>

          <div className="flex justify-center gap-2 mb-10">
            {languages.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${lang === l.code ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}
              >{l.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => {
              const videoId = item.video_url ? extractVideoId(item.video_url) : null;
              const isPlaying = playingVideo === item.id;
              
              return (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow"
                >
                  {item.video_url && videoId && (
                    <div className="w-full mb-4 rounded-lg overflow-hidden">
                      {isPlaying ? (
                        <div className="relative">
                          <iframe
                            src={`${getEmbedUrl(videoId)}?autoplay=1`}
                            className="w-full h-40 rounded-lg"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={item.title}
                          />
                          <button
                            onClick={() => setPlayingVideo(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="relative cursor-pointer group"
                          onClick={() => setPlayingVideo(item.id)}
                        >
                          <img
                            src={getThumbnailUrl(videoId)}
                            alt={item.title}
                            className="w-full h-40 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              // Fallback to lower quality thumbnail if maxresdefault fails
                              const img = e.target as HTMLImageElement;
                              if (!img.src.includes('hqdefault')) {
                                img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                            <Play className="h-12 w-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">{item.category}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.difficulty === "beginner" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"}`}>
                    {item.difficulty}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mt-1 mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{item.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {item.read_time}</span>
                  {item.video_url ? (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-primary"
                      onClick={() => window.open(item.video_url, '_blank')}
                    >
                      Watch on YouTube
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="text-primary">Read</Button>
                  )}
                </div>
              </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No resources found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Learn;
