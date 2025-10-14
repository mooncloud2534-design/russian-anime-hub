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

  useEffect(() => {
    checkAdmin();
    fetchAnimeList();
    fetchAdList();
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
        video_url: "",
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

                  <div className="space-y-2">
                    <Label>URL видео (YouTube embed)</Label>
                    <Input
                      type="url"
                      value={animeForm.video_url}
                      onChange={(e) => setAnimeForm({ ...animeForm, video_url: e.target.value })}
                      required
                      placeholder="https://www.youtube.com/embed/..."
                      className="bg-background/50 border-primary/30"
                    />
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
