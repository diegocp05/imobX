import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClientForm } from "@/components/ClientForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferred_neighborhoods: string[];
  preferred_types: string[];
  min_price: number;
  max_price: number;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie sua base de clientes
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingClient(undefined);
            setShowForm(true);
          }}
          className="gap-2 bg-gradient-to-r from-primary to-primary-glow"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Editar Cliente" : "Cadastrar Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            client={editingClient}
            onSuccess={() => {
              setShowForm(false);
              setEditingClient(undefined);
              fetchClients();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingClient(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {clients.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
          <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">{client.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Preferências:</p>
                  <div className="flex flex-wrap gap-2">
                    {client.preferred_types?.map((type, i) => (
                      <Badge key={i} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {client.preferred_neighborhoods?.slice(0, 2).map((neighborhood, i) => (
                      <Badge key={i} variant="secondary">
                        {neighborhood}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-sm text-muted-foreground">
                  Faixa: R$ {client.min_price?.toLocaleString("pt-BR")} - R${" "}
                  {client.max_price?.toLocaleString("pt-BR")}
                </div>

                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      setEditingClient(client);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar Cliente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
