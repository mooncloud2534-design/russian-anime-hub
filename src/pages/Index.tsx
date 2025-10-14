import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AnimeCard from "@/components/AnimeCard";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import Navbar from "@/components/Navbar";

const Index = () => {
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [filteredAnime, setFilteredAnime] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchAnime();
  }, []);

  useEffect(() => {
    filterAnime();
  }, [animeList, searchQuery, selectedCategory]);

  const fetchAnime = async () => {
    const { data } = await supabase
      .from("anime")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setAnimeList(data);
      
      // Получаем уникальные категории
      const uniqueCategories = [...new Set(data.map((anime: any) => anime.category))];
      setCategories(uniqueCategories as string[]);
    }
  };

  const filterAnime = () => {
    let filtered = animeList;

    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter((anime) =>
        anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anime.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по категории
    if (selectedCategory !== "Все") {
      filtered = filtered.filter((anime) => anime.category === selectedCategory);
    }

    setFilteredAnime(filtered);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold glow-text mb-2">Anime Dom Pro</h1>
            <p className="text-xl text-muted-foreground">
              Смотрите лучшие аниме онлайн в высоком качестве
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {filteredAnime.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              {searchQuery || selectedCategory !== "Все"
                ? "Аниме не найдено"
                : "Загрузка..."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                title={anime.title}
                image_url={anime.image_url}
                rating={anime.rating}
                category={anime.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
