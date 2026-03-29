
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('farmer', 'vendor', 'admin');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'farmer',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Has role function (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  stock INT NOT NULL DEFAULT 0,
  vendor_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Vendors can insert products" ON public.products FOR INSERT WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors can update own products" ON public.products FOR UPDATE USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can delete own products" ON public.products FOR DELETE USING (auth.uid() = vendor_id);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- Group buys table
CREATE TABLE public.group_buys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'seeds',
  image TEXT,
  original_price NUMERIC NOT NULL,
  group_price NUMERIC NOT NULL,
  discount INT NOT NULL DEFAULT 0,
  target_qty INT NOT NULL,
  current_qty INT NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  creator_id UUID NOT NULL,
  location TEXT,
  specs TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.group_buys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view group buys" ON public.group_buys FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create group buys" ON public.group_buys FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own group buys" ON public.group_buys FOR UPDATE USING (auth.uid() = creator_id);

-- Group buy participants
CREATE TABLE public.group_buy_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_buy_id UUID NOT NULL REFERENCES public.group_buys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_buy_id, user_id)
);
ALTER TABLE public.group_buy_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view participants" ON public.group_buy_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated can join" ON public.group_buy_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave" ON public.group_buy_participants FOR DELETE USING (auth.uid() = user_id);

-- Verifications table
CREATE TABLE public.verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verifications" ON public.verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create verifications" ON public.verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all verifications" ON public.verifications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update verifications" ON public.verifications FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Learning resources
CREATE TABLE public.learning_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  video_url TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  read_time TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view learning resources" ON public.learning_resources FOR SELECT USING (true);
CREATE POLICY "Admins can insert resources" ON public.learning_resources FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update resources" ON public.learning_resources FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_learning_resources_updated_at BEFORE UPDATE ON public.learning_resources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
return farmers;

-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Price predictions
CREATE TABLE public.price_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  location TEXT NOT NULL,
  predicted_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  confidence INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.price_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view predictions" ON public.price_predictions FOR SELECT USING (true);
CREATE POLICY "Authenticated can create predictions" ON public.price_predictions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'farmer'));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for verification videos
INSERT INTO storage.buckets (id, name, public) VALUES ('verifications', 'verifications', true);
CREATE POLICY "Authenticated users can upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verifications' AND auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can view verification videos" ON storage.objects FOR SELECT USING (bucket_id = 'verifications');
