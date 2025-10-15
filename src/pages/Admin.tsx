import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Anime form state
  const [animeForm, setAnimeForm] = useState({
    title: "",
    description: "",
    image_url: "",
    rating: "",
    category: "",
  });

  // Season form state
  const [seasonForm, setSeasonForm] = useState({
    anime_id: "",
    season_number: "",
    title: "",
  });

  // Episode form state
  const [episodeForm, setEpisodeForm] = useState({
    season_id: "",
    episode_number: "",
    title: "",
    video_url: "",
  });

  // Advertisement form state
  const [adForm, setAdForm] = useState({
    title: "",
    video_url: "",
    redirect_url: "",
  });

  // Lists
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [adList, setAdList] = useState<any[]>([]);
  const [seasonList, setSeasonList] = useState<any[]>([]);
  const [episodeList, setEpisodeList] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
    fetchAnimeList();
    fetchAdList();
    fetchSeasonList();
    fetchEpisodeList();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!data) {
      toast.error("У вас нет прав администратора");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const fetchAnimeList = async () => {
    const { data } = await supabase
      .from("anime")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setAnimeList(data);
  };

  const fetchAdList = async () => {
    const { data } = await supabase
      .from("advertisements")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setAdList(data);
  };

  const fetchSeasonList = async () => {
    const { data } = await supabase
      .from("seasons")
      .select("*, anime(title)")
      .order("created_at", { ascending: false });
    
    if (data) setSeasonList(data);
  };

  const fetchEpisodeList = async () => {
    const { data } = await supabase
      .from("episodes")
      .select("*, seasons(title, anime(title))")
      .order("created_at", { ascending: false });
    
    if (data) setEpisodeList(data);
  };

  const handleAnimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from("anime").insert([{
        ...animeForm,
        rating: parseFloat(animeForm.rating),
      }]);

      if (error) throw error;

      toast.success("Аниме добавлено!");
      setAnimeForm({
        title: "",
        description: "",
        image_url: "",
        rating: "",
        category: "",
      });
      fetchAnimeList();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from("advertisements").insert([adForm]);

      if (error) throw error;

      toast.success("Реклама добавлена!");
      setAdForm({
        title: "",
        video_url: "",
        redirect_url: "",
      });
      fetchAdList();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAnime = async (id: string) => {
    try {
      const { error } = await supabase.from("anime").delete().eq("id", id);
      if (error) throw error;
      toast.success("Аниме удалено");
      fetchAnimeList();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      const { error } = await supabase.from("advertisements").delete().eq("id", id);
      if (error) throw error;
      toast.success("Реклама удалена");
      fetchAdList();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleAdStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("advertisements")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Статус рекламы обновлен");
      fetchAdList();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSeasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from("seasons").insert([{
        ...seasonForm,
        season_number: parseInt(seasonForm.season_number),
      }]);

      if (error) throw error;

      toast.success("Сезон добавлен!");
      setSeasonForm({
        anime_id: "",
        season_number: "",
        title: "",
      });
      fetchSeasonList();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEpisodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from("episodes").insert([{
        ...episodeForm,
        episode_number: parseInt(episodeForm.episode_number),
      }]);

      if (error) throw error;

      toast.success("Эпизод добавлен!");
      setEpisodeForm({
        season_id: "",
        episode_number: "",
        title: "",
        video_url: "",
      });
      fetchEpisodeList();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteSeason = async (id: string) => {
    try {
      const { error } = await supabase.from("seasons").delete().eq("id", id);
      if (error) throw error;
      toast.success("Сезон удален");
      fetchSeasonList();
      fetchEpisodeList();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    try {
      const { error } = await supabase.from("episodes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Эпизод удален");
      fetchEpisodeList();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 glow-text">Админ Панель</h1>

        <Tabs defaultValue="anime" className="space-y-6">
          <TabsList className="bg-card/50 border-primary/20">
            <TabsTrigger value="anime">Управление Аниме</TabsTrigger>
            <TabsTrigger value="seasons">Управление Сезонами</TabsTrigger>
            <TabsTrigger value="episodes">Управление Эпизодами</TabsTrigger>
            <TabsTrigger value="ads">Управление Рекламой</TabsTrigger>
          </TabsList>

          <TabsContent value="anime" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Добавить новое аниме</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnimeSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Название</Label>
                      <Input
                        value={animeForm.title}
                        onChange={(e) => setAnimeForm({ ...animeForm, title: e.target.value })}
                        required
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Категория</Label>
                      <Input
                        value={animeForm.category}
                        onChange={(e) => setAnimeForm({ ...animeForm, category: e.target.value })}
                        required
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Описание</Label>
                    <Textarea
                      value={animeForm.description}
                      onChange={(e) => setAnimeForm({ ...animeForm, description: e.target.value })}
                      required
                      rows={4}
                      className="bg-background/50 border-primary/30"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Рейтинг (0-10)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={animeForm.rating}
                        onChange={(e) => setAnimeForm({ ...animeForm, rating: e.target.value })}
                        required
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL изображения</Label>
                      <Input
                        type="url"
                        value={animeForm.image_url}
                        onChange={(e) => setAnimeForm({ ...animeForm, image_url: e.target.value })}
                        required
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary">
                    Добавить Аниме
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Список аниме ({animeList.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {animeList.map((anime) => (
                    <div
                      key={anime.id}
                      className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-primary/20"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={anime.image_url}
                          alt={anime.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-bold">{anime.title}</h3>
                          <p className="text-sm text-muted-foreground">{anime.category}</p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteAnime(anime.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seasons" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Добавить новый сезон</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSeasonSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Аниме</Label>
                    <select
                      value={seasonForm.anime_id}
                      onChange={(e) => setSeasonForm({ ...seasonForm, anime_id: e.target.value })}
                      required
                      className="w-full rounded-md border border-primary/30 bg-background/50 px-3 py-2"
                    >
                      <option value="">Выберите аниме</option>
                      {animeList.map((anime) => (
                        <option key={anime.id} value={anime.id}>
                          {anime.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Номер сезона</Label>
                      <Input
                        type="number"
                        min="1"
                        value={seasonForm.season_number}
                        onChange={(e) => setSeasonForm({ ...seasonForm, season_number: e.target.value })}
                        required
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Название сезона</Label>
                      <Input
                        value={seasonForm.title}
                        onChange={(e) => setSeasonForm({ ...seasonForm, title: e.target.value })}
                        required
                        placeholder="Например: Первый сезон"
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary">
                    Добавить Сезон
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Список сезонов ({seasonList.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seasonList.map((season) => (
                    <div
                      key={season.id}
                      className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-primary/20"
                    >
                      <div>
                        <h3 className="font-bold">{season.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {season.anime?.title} - Сезон {season.season_number}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteSeason(season.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="episodes" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Добавить новый эпизод</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEpisodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Сезон</Label>
                    <select
                      value={episodeForm.season_id}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, season_id: e.target.value })}
                      required
                      className="w-full rounded-md border border-primary/30 bg-background/50 px-3 py-2"
                    >
                      <option value="">Выберите сезон</option>
                      {seasonList.map((season) => (
                        <option key={season.id} value={season.id}>
                          {season.anime?.title} - {season.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Номер эпизода</Label>
                      <Input
                        type="number"
                        min="1"
                        value={episodeForm.episode_number}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })}
                        required
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Название эпизода</Label>
                      <Input
                        value={episodeForm.title}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                        required
                        placeholder="Например: Начало приключения"
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>URL видео (YouTube embed)</Label>
                    <Input
                      type="url"
                      value={episodeForm.video_url}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, video_url: e.target.value })}
                      required
                      placeholder="https://www.youtube.com/embed/..."
                      className="bg-background/50 border-primary/30"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary">
                    Добавить Эпизод
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Список эпизодов ({episodeList.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {episodeList.map((episode) => (
                    <div
                      key={episode.id}
                      className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-primary/20"
                    >
                      <div>
                        <h3 className="font-bold">
                          Эпизод {episode.episode_number}: {episode.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {episode.seasons?.anime?.title} - {episode.seasons?.title}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteEpisode(episode.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Добавить новую рекламу</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название рекламы</Label>
                    <Input
                      value={adForm.title}
                      onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                      required
                      className="bg-background/50 border-primary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>URL видео (YouTube embed)</Label>
                    <Input
                      type="url"
                      value={adForm.video_url}
                      onChange={(e) => setAdForm({ ...adForm, video_url: e.target.value })}
                      required
                      placeholder="https://www.youtube.com/embed/..."
                      className="bg-background/50 border-primary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ссылка для перехода</Label>
                    <Input
                      type="url"
                      value={adForm.redirect_url}
                      onChange={(e) => setAdForm({ ...adForm, redirect_url: e.target.value })}
                      required
                      placeholder="https://..."
                      className="bg-background/50 border-primary/30"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary">
                    Добавить Рекламу
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Список рекламы ({adList.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adList.map((ad) => (
                    <div
                      key={ad.id}
                      className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-primary/20"
                    >
                      <div>
                        <h3 className="font-bold">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Переход: {ad.redirect_url}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Активна</Label>
                          <Switch
                            checked={ad.is_active}
                            onCheckedChange={() => handleToggleAdStatus(ad.id, ad.is_active)}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteAd(ad.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
