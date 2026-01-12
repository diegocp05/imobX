import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Home, DollarSign, User, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Match {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    preferred_neighborhoods: string[];
    preferred_types: string[];
    min_price: number;
    max_price: number;
  };
  property: {
    id: string;
    name: string;
    address: string;
    neighborhood: string;
    type: string;
    price: number;
    status: string;
  };
  matchScore: number;
  matchReasons: string[];
}

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            Match Encontrado
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Compatibilidade:</span>
            <Badge className={`${getScoreColor(match.matchScore)} text-white`}>
              {match.matchScore}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Property Info */}
        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              {match.property.name}
            </h4>
            <Badge variant="outline">{match.property.type}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {match.property.neighborhood}
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <DollarSign className="h-3 w-3" />
            R$ {match.property.price.toLocaleString("pt-BR")}/mês
          </div>
        </div>

        {/* Client Info */}
        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {match.client.name}
          </h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {match.client.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {match.client.phone}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Faixa: R$ {match.client.min_price?.toLocaleString("pt-BR")} - R$ {match.client.max_price?.toLocaleString("pt-BR")}
          </div>
        </div>

        {/* Match Reasons */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Motivos do Match:</p>
          <div className="flex flex-wrap gap-2">
            {match.matchReasons.map((reason, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                ✓ {reason}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/properties/${match.property.id}`)}
          >
            Ver Imóvel
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
            onClick={() => navigate(`/properties/${match.property.id}`)}
          >
            Agendar Visita
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
