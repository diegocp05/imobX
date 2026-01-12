import { useState, useEffect } from "react";
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

interface Contract {
  id: string;
  property_id: string;
  client_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  status: string;
  notes?: string;
}

interface ContractFormProps {
  contract?: Contract;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Property {
  id: string;
  name: string;
  status: string;
}

interface Client {
  id: string;
  name: string;
}

export function ContractForm({ contract, onSuccess, onCancel }: ContractFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    property_id: contract?.property_id || "",
    client_id: contract?.client_id || "",
    start_date: contract?.start_date || "",
    end_date: contract?.end_date || "",
    monthly_rent: contract?.monthly_rent?.toString() || "",
    status: contract?.status || "Ativo",
    notes: contract?.notes || "",
  });

  useEffect(() => {
    fetchPropertiesAndClients();
  }, []);

  const fetchPropertiesAndClients = async () => {
    try {
      const clientsRes = await supabase.from("clients").select("id, name");
      
      if (contract) {
        // Em modo de edição, carrega todos os imóveis
        const propertiesRes = await supabase.from("properties").select("id, name, status");
        if (propertiesRes.data) setProperties(propertiesRes.data);
      } else {
        // Em modo de criação, carrega apenas imóveis disponíveis
        const propertiesRes = await supabase
          .from("properties")
          .select("id, name, status")
          .eq("status", "Disponível");
        if (propertiesRes.data) setProperties(propertiesRes.data);
      }

      if (clientsRes.data) setClients(clientsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contractData = {
        property_id: formData.property_id,
        client_id: formData.client_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        monthly_rent: parseFloat(formData.monthly_rent),
        status: formData.status,
        notes: formData.notes || null,
      };

      if (contract) {
        const { error: contractError } = await supabase
          .from("contracts")
          .update(contractData)
          .eq("id", contract.id);

        if (contractError) throw contractError;

        // Atualiza status do imóvel baseado no status do contrato
        if (formData.status === "Encerrado" || formData.status === "Cancelado") {
          await supabase
            .from("properties")
            .update({ status: "Disponível" })
            .eq("id", formData.property_id);
        } else if (formData.status === "Ativo") {
          await supabase
            .from("properties")
            .update({ status: "Alugado" })
            .eq("id", formData.property_id);
        }

        toast({
          title: "Contrato atualizado!",
          description: "As informações do contrato foram atualizadas com sucesso.",
        });
      } else {
        const { error: contractError } = await supabase
          .from("contracts")
          .insert([contractData]);

        if (contractError) throw contractError;

        // Atualizar status do imóvel para Alugado
        if (formData.status === "Ativo") {
          await supabase
            .from("properties")
            .update({ status: "Alugado" })
            .eq("id", formData.property_id);
        }

        toast({
          title: "Contrato cadastrado!",
          description: "O contrato foi criado com sucesso.",
        });
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving contract:", error);
      toast({
        title: "Erro",
        description: error.message || `Não foi possível ${contract ? 'atualizar' : 'cadastrar'} o contrato.`,
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
          <Label htmlFor="property_id">Imóvel *</Label>
          <Select
            value={formData.property_id}
            onValueChange={(value) => setFormData({ ...formData, property_id: value })}
            required
          >
            <SelectTrigger id="property_id">
              <SelectValue placeholder="Selecione um imóvel" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <Select
            value={formData.client_id}
            onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            required
          >
            <SelectTrigger id="client_id">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Data Início *</Label>
          <Input
            id="start_date"
            type="date"
            required
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Data Fim *</Label>
          <Input
            id="end_date"
            type="date"
            required
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly_rent">Valor Mensal (R$) *</Label>
          <Input
            id="monthly_rent"
            type="number"
            step="0.01"
            required
            value={formData.monthly_rent}
            onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
            placeholder="2500.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Encerrado">Encerrado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Informações adicionais sobre o contrato..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-primary-glow">
          {loading ? (contract ? "Atualizando..." : "Cadastrando...") : (contract ? "Atualizar Contrato" : "Cadastrar Contrato")}
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