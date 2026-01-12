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

interface VisitScheduleFormProps {
  propertyId: string;
  propertyName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

export function VisitScheduleForm({ propertyId, propertyName, onSuccess, onCancel }: VisitScheduleFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    client_id: "",
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await supabase.from("clients").select("id, name, email");
      if (data) setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}:00`;

      const { error } = await supabase.from("visits").insert([
        {
          property_id: propertyId,
          client_id: formData.client_id,
          scheduled_date: scheduledDateTime,
          status: "Agendada",
          notes: formData.notes,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Visita agendada!",
        description: `A visita para ${propertyName} foi agendada com sucesso.`,
      });

      onSuccess?.();
    } catch (error: any) {
      console.error("Error scheduling visit:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível agendar a visita.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-muted p-3">
        <p className="text-sm font-medium text-foreground">Imóvel: {propertyName}</p>
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
                {client.name} - {client.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="scheduled_date">Data *</Label>
          <Input
            id="scheduled_date"
            type="date"
            required
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduled_time">Horário *</Label>
          <Input
            id="scheduled_time"
            type="time"
            required
            value={formData.scheduled_time}
            onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Informações adicionais sobre a visita..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-primary-glow">
          {loading ? "Agendando..." : "Agendar Visita"}
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
