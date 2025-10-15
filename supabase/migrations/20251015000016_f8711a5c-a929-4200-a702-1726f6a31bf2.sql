-- Создаем таблицу для сезонов
CREATE TABLE public.seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anime_id UUID NOT NULL REFERENCES public.anime(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для эпизодов
CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS для сезонов
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- Политики для сезонов
CREATE POLICY "Все могут просматривать сезоны"
ON public.seasons FOR SELECT
USING (true);

CREATE POLICY "Только админы могут добавлять сезоны"
ON public.seasons FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Только админы могут обновлять сезоны"
ON public.seasons FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Только админы могут удалять сезоны"
ON public.seasons FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Включаем RLS для эпизодов
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Политики для эпизодов
CREATE POLICY "Все могут просматривать эпизоды"
ON public.episodes FOR SELECT
USING (true);

CREATE POLICY "Только админы могут добавлять эпизоды"
ON public.episodes FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Только админы могут обновлять эпизоды"
ON public.episodes FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Только админы могут удалять эпизоды"
ON public.episodes FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Создаем индексы для производительности
CREATE INDEX idx_seasons_anime_id ON public.seasons(anime_id);
CREATE INDEX idx_episodes_season_id ON public.episodes(season_id);