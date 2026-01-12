import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  min_price?: number;
  max_price?: number;
  preferred_neighborhoods: string[];
  preferred_types: string[];
}

interface ClientFormProps {
  client?: Client;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    min_price: client?.min_price?.toString() || "",
    max_price: client?.max_price?.toString() || "",
  });
  const [neighborhoods, setNeighborhoods] = useState<string[]>(
    client?.preferred_neighborhoods || []
  );
  const [types, setTypes] = useState<string[]>(client?.preferred_types || []);
  const [neighborhoodInput, setNeighborhoodInput] = useState("");
  const [typeInput, setTypeInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        min_price: formData.min_price ? parseFloat(formData.min_price) : null,
        max_price: formData.max_price ? parseFloat(formData.max_price) : null,
        preferred_neighborhoods: neighborhoods,
        preferred_types: types,
      };

      if (client) {
        const { error } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", client.id);

        if (error) throw error;

        toast({
          title: "Cliente atualizado!",
          description: "As informações do cliente foram atualizadas com sucesso.",
        });
      } else {
        const { error } = await supabase.from("clients").insert([clientData]);

        if (error) throw error;

        toast({
          title: "Cliente cadastrado!",
          description: "O cliente foi adicionado com sucesso.",
        });
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving client:", error);
      toast({
        title: "Erro",
        description: error.message || `Não foi possível ${client ? 'atualizar' : 'cadastrar'} o cliente.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addNeighborhood = () => {
    if (neighborhoodInput && !neighborhoods.includes(neighborhoodInput)) {
      setNeighborhoods([...neighborhoods, neighborhoodInput]);
      setNeighborhoodInput("");
    }
  };

  const addType = () => {
    if (typeInput && !types.includes(typeInput)) {
      setTypes([...types, typeInput]);
      setTypeInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="João Silva"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="joao@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(21) 98765-4321"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_price">Preço Mínimo (R$)</Label>
          <Input
            id="min_price"
            type="number"
            step="0.01"
            value={formData.min_price}
            onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
            placeholder="2000.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_price">Preço Máximo (R$)</Label>
          <Input
            id="max_price"
            type="number"
            step="0.01"
            value={formData.max_price}
            onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
            placeholder="4000.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Bairros Preferidos</Label>
        <div className="flex gap-2">
          <Input
            value={neighborhoodInput}
            onChange={(e) => setNeighborhoodInput(e.target.value)}
            placeholder="Digite um bairro"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addNeighborhood())}
          />
          <Button type="button" onClick={addNeighborhood} variant="outline">
            Adicionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {neighborhoods.map((n) => (
            <Badge key={n} variant="secondary" className="gap-1">
              {n}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setNeighborhoods(neighborhoods.filter((nb) => nb !== n))}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tipos Preferidos</Label>
        <div className="flex gap-2">
          <Input
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
            placeholder="Casa, Apartamento, Comercial"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addType())}
          />
          <Button type="button" onClick={addType} variant="outline">
            Adicionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {types.map((t) => (
            <Badge key={t} variant="secondary" className="gap-1">
              {t}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setTypes(types.filter((tp) => tp !== t))}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-primary-glow">
          {loading ? (client ? "Atualizando..." : "Cadastrando...") : (client ? "Atualizar Cliente" : "Cadastrar Cliente")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}