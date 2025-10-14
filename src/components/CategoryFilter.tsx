import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === "Все" ? "default" : "outline"}
        onClick={() => onSelectCategory("Все")}
        className={selectedCategory === "Все" ? "bg-primary text-primary-foreground" : "border-primary/30"}
      >
        Все
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          onClick={() => onSelectCategory(category)}
          className={selectedCategory === category ? "bg-primary text-primary-foreground" : "border-primary/30"}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
