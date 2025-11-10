import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VisitScheduleForm } from "@/components/VisitScheduleForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, DollarSign, Home, Calendar, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Property {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  type: string;
  price: number;
  status: string;
  description: string;
  images: string[];
}

const statusColors = {
  Disponível: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Alugado: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  Manutenção: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVisitForm, setShowVisitForm] = useState(false);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Imóvel não encontrado</p>
      </div>
    );
  }

  const mainImage = property.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa";

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/properties")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Imóveis
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Images */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-96">
              <img
                src={mainImage}
                alt={property.name}
                className="h-full w-full object-cover"
              />
              <Badge
                className={`absolute right-4 top-4 ${statusColors[property.status as keyof typeof statusColors]}`}
              >
                {property.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{property.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{property.address}, {property.neighborhood}</span>
            </div>
          </div>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{property.type}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor</span>
                <div className="flex items-center gap-2 text-primary">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-2xl font-bold">
                    R$ {property.price.toLocaleString("pt-BR")}
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-3 font-semibold text-foreground">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowVisitForm(true)}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
              disabled={property.status === "Manutenção"}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Visita
            </Button>
            <Button variant="outline" className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Editar Imóvel
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showVisitForm} onOpenChange={setShowVisitForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Agendar Visita</DialogTitle>
          </DialogHeader>
          <VisitScheduleForm
            propertyId={property.id}
            propertyName={property.name}
            onSuccess={() => {
              setShowVisitForm(false);
            }}
            onCancel={() => setShowVisitForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
