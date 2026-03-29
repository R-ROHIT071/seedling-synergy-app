-- Create group_buy_participants table for tracking who joined which group buys
CREATE TABLE group_buy_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_buy_id UUID REFERENCES group_buys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_buy_id, user_id)
);

-- Enable RLS
ALTER TABLE group_buy_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view group buy participants" ON group_buy_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join group buys" ON group_buy_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own participation" ON group_buy_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave group buys" ON group_buy_participants FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE group_buy_participants;