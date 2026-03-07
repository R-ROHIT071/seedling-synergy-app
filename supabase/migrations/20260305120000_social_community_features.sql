-- Social & Community Features Migration
-- Farmer forums and discussions
CREATE TABLE forums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'general', 'crop-advice', 'market-info', 'equipment'
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts
CREATE TABLE forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post replies
CREATE TABLE forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes
CREATE TABLE post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id),
  UNIQUE(reply_id, user_id)
);

-- Farmer success stories
CREATE TABLE success_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  images TEXT[],
  crop_type TEXT,
  yield_increase DECIMAL,
  profit_increase DECIMAL,
  location TEXT,
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farmer meetups/events
CREATE TABLE farmer_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  coordinates JSONB, -- GPS coordinates
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  event_type TEXT, -- 'meetup', 'workshop', 'market-visit'
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event attendees
CREATE TABLE event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES farmer_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rsvp_status TEXT DEFAULT 'attending', -- 'attending', 'maybe', 'declined'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Equipment sharing
CREATE TABLE equipment_sharing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  image_url TEXT,
  daily_rate DECIMAL,
  location TEXT,
  availability JSONB, -- Available dates/times
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_sharing ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view forums" ON forums FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create forums" ON forums FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Forum creators can update their forums" ON forums FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can view forum posts" ON forum_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Post authors can update their posts" ON forum_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Post authors can delete their posts" ON forum_posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can view replies" ON forum_replies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create replies" ON forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Reply authors can update their replies" ON forum_replies FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Reply authors can delete their replies" ON forum_replies FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can view likes" ON post_likes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage their own likes" ON post_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view success stories" ON success_stories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create stories" ON success_stories FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Story authors can update their stories" ON success_stories FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Story authors can delete their stories" ON success_stories FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view events" ON farmer_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON farmer_events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Event organizers can update their events" ON farmer_events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Event organizers can delete their events" ON farmer_events FOR DELETE USING (auth.uid() = organizer_id);

CREATE POLICY "Authenticated users can view attendees" ON event_attendees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage their own attendance" ON event_attendees FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view equipment" ON equipment_sharing FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create equipment listings" ON equipment_sharing FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Equipment owners can update their listings" ON equipment_sharing FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Equipment owners can delete their listings" ON equipment_sharing FOR DELETE USING (auth.uid() = owner_id);

-- Enable realtime for community features
ALTER PUBLICATION supabase_realtime ADD TABLE forums;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE success_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE farmer_events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_attendees;