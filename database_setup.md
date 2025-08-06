# E-alus | Andmebaasi seadistamise skript

Kopeerige ja käivitage allolev SQL-kood oma Supabase'i projekti SQL Editoris, et seadistada vajalikud tabelid ja turvareeglid.

```sql
-- Kustutab vana 'products' tabeli, kui see on olemas.
DROP TABLE IF EXISTS public.products;

-- ENUM tüübid andmete konsistentsuse tagamiseks
CREATE TYPE public.pallet_type AS ENUM ('EUR/EPAL', 'FIN', 'MUU');
CREATE TYPE public.pallet_condition AS ENUM ('UUS', 'KASUTATUD_HELE', 'KASUTATUD_TUME');

-- 1. Tabel: profiles
-- Hoiab avalikku profiiliinfot ja on seotud auth.users tabeliga (1-to-1).
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  company_name TEXT,
  company_reg_code TEXT,
  company_vat_no TEXT,
  avatar_url TEXT
);

-- RLS (Row Level Security) profiilidele
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger: loob automaatselt profiili, kui uus kasutaja registreerub
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Tabel: listings (Kuulutused)
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  pallet_type public.pallet_type NOT NULL,
  pallet_condition public.pallet_condition NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price REAL NOT NULL CHECK (price >= 0),
  price_per_piece BOOLEAN NOT NULL DEFAULT true,
  location TEXT NOT NULL,
  transport_options JSONB, -- nt: {"buyer_pickup": true, "seller_delivers": false, "delivery_fee": 0}
  image_urls TEXT[]
);

-- RLS kuulutustele
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings are viewable by everyone." ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users can insert their own listings." ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings." ON public.listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own listings." ON public.listings FOR DELETE USING (auth.uid() = user_id);


-- 3. Tabel: conversations (Vestlused)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_conversation UNIQUE (listing_id, buyer_id)
);

-- RLS vestlustele
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view conversations they are part of." ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create conversations." ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- 4. Tabel: messages (Sõnumid)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS sõnumitele
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in conversations they are part of."
ON public.messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations WHERE auth.uid() = buyer_id OR auth.uid() = seller_id
  )
);
CREATE POLICY "Users can send messages in their conversations."
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  conversation_id IN (
    SELECT id FROM public.conversations WHERE auth.uid() = buyer_id OR auth.uid() = seller_id
  )
);
