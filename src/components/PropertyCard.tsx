import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, DollarSign, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  type: string;
  price: number;
  status: string;
  images: string[];
  onEdit?: () => void;
}

const statusColors = {
  Disponível: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Alugado: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  Manutenção: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
};

export function PropertyCard({
  id,
  name,
  address,
  neighborhood,
  type,
  price,
  status,
  images,
  onEdit,
}: PropertyCardProps) {
  const imageUrl = images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa";

  return (
    <Card className="group overflow-hidden border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link to={`/properties/${id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <Badge
            className={cn(
              "absolute right-3 top-3",
              statusColors[status as keyof typeof statusColors]
            )}
          >
            {status}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">{name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{address}, {neighborhood}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {type}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border p-4">
          <div className="flex items-center gap-2 text-primary">
            <DollarSign className="h-5 w-5" />
            <span className="text-xl font-bold">
              R$ {price.toLocaleString("pt-BR")}
            </span>
            <span className="text-sm text-muted-foreground">/mês</span>
          </div>
        </CardFooter>
      </Link>
      {onEdit && (
        <div className="px-4 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </div>
      )}
    </Card>
  );
}