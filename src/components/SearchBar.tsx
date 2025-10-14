import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Поиск аниме..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-card/50 backdrop-blur-sm border-primary/30 focus:border-primary h-12 text-lg"
      />
    </div>
  );
};

export default SearchBar;
