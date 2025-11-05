import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PropertyForm({ onSuccess, onCancel }: PropertyFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    neighborhood: "",
    type: "Casa",
    price: "",
    status: "Disponível",
    description: "",
    images: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imagesArray = formData.images
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url);

      const { error } = await supabase.from("properties").insert([
        {
          name: formData.name,
          address: formData.address,
          neighborhood: formData.neighborhood,
          type: formData.type,
          price: parseFloat(formData.price),
          status: formData.status,
          description: formData.description,
          images: imagesArray,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Imóvel cadastrado!",
        description: "O imóvel foi adicionado com sucesso.",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error creating property:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o imóvel.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            placeholder="Ex: Casa Jardim Botânico"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Casa">Casa</SelectItem>
              <SelectItem value="Apartamento">Apartamento</SelectItem>
              <SelectItem value="Comercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço *</Label>
          <Input
            id="address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Ex: Rua das Acácias, 321"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro *</Label>
          <Input
            id="neighborhood"
            required
            value={formData.neighborhood}
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
            placeholder="Ex: Jardim Botânico"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="2500.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Disponível">Disponível</SelectItem>
              <SelectItem value="Alugado">Alugado</SelectItem>
              <SelectItem value="Manutenção">Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição detalhada do imóvel..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">URLs das Imagens (separadas por vírgula)</Label>
        <Textarea
          id="images"
          value={formData.images}
          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          placeholder="https://exemplo.com/imagem1.jpg, https://exemplo.com/imagem2.jpg"
          rows={2}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-primary-glow">
          {loading ? "Cadastrando..." : "Cadastrar Imóvel"}
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
