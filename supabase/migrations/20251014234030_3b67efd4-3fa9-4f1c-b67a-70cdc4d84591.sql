-- Создание типа для ролей
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Таблица профилей пользователей
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Пользователи могут видеть свой профиль"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Таблица ролей пользователей
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Пользователи могут видеть свои роли"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Функция для проверки роли
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Таблица аниме
CREATE TABLE public.anime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Все могут просматривать аниме"
  ON public.anime FOR SELECT
  USING (true);

CREATE POLICY "Только админы могут добавлять аниме"
  ON public.anime FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Только админы могут обновлять аниме"
  ON public.anime FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Только админы могут удалять аниме"
  ON public.anime FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Таблица рекламы
CREATE TABLE public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  redirect_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Все могут просматривать активную рекламу"
  ON public.advertisements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Админы могут просматривать всю рекламу"
  ON public.advertisements FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Только админы могут добавлять рекламу"
  ON public.advertisements FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Только админы могут обновлять рекламу"
  ON public.advertisements FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Только админы могут удалять рекламу"
  ON public.advertisements FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Функция для создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Проверяем, является ли пользователь админом
  IF NEW.email = 'Oolavadim@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Добавление тестовых аниме
INSERT INTO public.anime (title, description, image_url, rating, category, video_url) VALUES
('Атака титанов', 'Эпическая история о человечестве, борющемся с гигантскими титанами за выживание. Эрен Йегер и его друзья вступают в элитный отряд разведки, чтобы раскрыть тайну титанов и вернуть свободу человечеству.', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800', 9.5, 'Экшен', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
('Тетрадь смерти', 'Гениальный студент Лайт Ягами находит мистическую тетрадь, которая может убить любого, чье имя в нее запишут. Начинается интеллектуальная дуэль между Лайтом и загадочным детективом L.', 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=800', 9.8, 'Триллер', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
('Моя геройская академия', 'В мире, где 80% населения обладает суперспособностями, Изуку Мидория мечтает стать героем, несмотря на отсутствие у него силы. Но все меняется, когда он встречает величайшего героя Всемогущего.', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800', 9.2, 'Приключения', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
('Стальной алхимик', 'Братья Элрик пытаются вернуть свои тела после неудачной попытки воскресить мать с помощью алхимии. Их путешествие полно опасностей, тайн и философских размышлений о цене человеческой жизни.', 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800', 9.6, 'Фэнтези', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
('Токийский гуль', 'Канеки Кен становится полу-гулем после трагического инцидента и вынужден балансировать между миром людей и гулей, которые питаются человеческой плотью.', 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=800', 8.9, 'Ужасы', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
('Демон-убийца', 'Танджиро Камадо становится охотником на демонов, чтобы спасти свою сестру, превращенную в демона, и отомстить за свою семью.', 'https://images.unsplash.com/photo-1606310305462-887b8f192fcc?w=800', 9.4, 'Экшен', 'https://www.youtube.com/embed/dQw4w9WgXcQ');