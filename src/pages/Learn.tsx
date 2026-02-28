import { motion } from "framer-motion";
import { BookOpen, Play, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageLayout from "@/components/PageLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const defaultResources = [
  { id: "1", title: "Modern Drip Irrigation Techniques", category: "Irrigation", read_time: "12 min", video_url: "https://youtube.com", content: "Learn how to set up and maintain drip irrigation for maximum water efficiency.", difficulty: "beginner", language: "en" },
  { id: "2", title: "Organic Pest Control Methods", category: "Pest Control", read_time: "8 min", video_url: "https://youtube.com", content: "Natural ways to protect your crops without harmful chemicals.", difficulty: "beginner", language: "en" },
  { id: "3", title: "Soil Health & Testing Guide", category: "Soil Science", read_time: "15 min", video_url: null, content: "Understanding soil pH, nutrients, and how to test your farmland.", difficulty: "intermediate", language: "en" },
  { id: "4", title: "Crop Rotation Best Practices", category: "Crop Management", read_time: "10 min", video_url: "https://youtube.com", content: "Maximize yield and soil health with proper crop rotation planning.", difficulty: "beginner", language: "en" },
  { id: "5", title: "Government Subsidy Guide 2026", category: "Finance", read_time: "6 min", video_url: null, content: "Complete guide to agricultural subsidies and how to apply.", difficulty: "beginner", language: "en" },
  { id: "6", title: "Greenhouse Farming Basics", category: "Crop Management", read_time: "20 min", video_url: "https://youtube.com", content: "Start your protected cultivation journey with this comprehensive guide.", difficulty: "intermediate", language: "en" },
];

const categories = ["All", "Crop Management", "Irrigation", "Pest Control", "Soil Science", "Finance"];
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
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow group cursor-pointer">
                {item.video_url && (
                  <div className="w-full h-40 rounded-lg bg-secondary mb-4 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Play className="h-12 w-12 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
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
                  <Button size="sm" variant="ghost" className="text-primary">{item.video_url ? "Watch" : "Read"}</Button>
                </div>
              </motion.div>
            ))}
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
