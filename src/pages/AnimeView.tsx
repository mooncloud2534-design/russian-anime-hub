import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const AnimeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<any>(null);
  const [advertisement, setAdvertisement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const { data, error } = await supabase
          .from("anime")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setAnime(data);

        // Получаем активную рекламу
        const { data: adData } = await supabase
          .from("advertisements")
          .select("*")
          .eq("is_active", true)
          .limit(1)
          .single();

        setAdvertisement(adData);
      } catch (error: any) {
        toast.error("Ошибка загрузки аниме");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [id, navigate]);

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

  if (!anime) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6 border-primary/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20">
              <div className="aspect-video bg-black">
                <iframe
                  src={anime.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  title={anime.title}
                />
              </div>
            </Card>

            {advertisement && (
              <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-accent/20 glow-border">
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 text-accent">Реклама</h3>
                  <div
                    className="aspect-video bg-black cursor-pointer"
                    onClick={() => window.open(advertisement.redirect_url, "_blank")}
                  >
                    <iframe
                      src={advertisement.video_url}
                      className="w-full h-full pointer-events-none"
                      title={advertisement.title}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Нажмите на видео, чтобы узнать больше
                  </p>
                </div>
              </Card>
            )}

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 glow-text">{anime.title}</h1>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-primary/90 text-primary-foreground">
                      {anime.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{anime.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">Описание</h2>
                <p className="text-muted-foreground leading-relaxed">{anime.description}</p>
              </div>
            </Card>
          </div>

          <div>
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 overflow-hidden sticky top-24">
              <img
                src={anime.image_url}
                alt={anime.title}
                className="w-full aspect-[3/4] object-cover"
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeView;
