import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface AnimeCardProps {
  id: string;
  title: string;
  image_url: string;
  rating: number;
  category: string;
}

const AnimeCard = ({ id, title, image_url, rating, category }: AnimeCardProps) => {
  return (
    <Link to={`/anime/${id}`}>
      <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 anime-card-hover cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-white">{rating}</span>
          </div>
          <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground">
            {category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg line-clamp-2 text-foreground">{title}</h3>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AnimeCard;
