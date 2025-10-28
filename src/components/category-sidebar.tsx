import {
  Monitor,
  Shirt,
  Home,
  Dumbbell,
  Sparkles,
  Book,
  Grid3x3,
} from "lucide-react";
import { Button } from "./ui/button";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const iconMap: Record<string, any> = {
  Monitor,
  Shirt,
  Home,
  Dumbbell,
  Sparkles,
  Book,
};

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Grid3x3;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <aside className="w-64 bg-white border-r p-6 h-[calc(100vh-73px)] sticky top-[73px]">
      <h2 className="mb-4">Categories</h2>
      <div className="space-y-2">
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onSelectCategory(null)}
        >
          <Grid3x3 className="w-5 h-5 mr-3" />
          All Products
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectCategory(category.id)}
          >
            <span className="mr-3">{getIcon(category.icon)}</span>
            {category.name}
          </Button>
        ))}
      </div>
    </aside>
  );
}
