import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContractForm } from "@/components/ContractForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, FileText, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Contract {
  id: string;
  property_id: string;
  client_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  status: string;
  notes: string;
  properties: { name: string; address: string };
  clients: { name: string; email: string };
}

const statusColors = {
  Ativo: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Finalizado: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  Cancelado: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | undefined>();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          properties (name, address),
          clients (name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
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
          <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
          <p className="text-muted-foreground">
            Gerencie contratos de locação
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingContract(undefined);
            setShowForm(true);
          }}
          className="gap-2 bg-gradient-to-r from-primary to-primary-glow"
        >
          <Plus className="h-4 w-4" />
          Novo Contrato
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContract ? "Editar Contrato" : "Cadastrar Novo Contrato"}
            </DialogTitle>
          </DialogHeader>
          <ContractForm
            contract={editingContract}
            onSuccess={() => {
              setShowForm(false);
              setEditingContract(undefined);
              fetchContracts();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingContract(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {contracts.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
          <p className="text-muted-foreground">Nenhum contrato cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {contracts.map((contract) => (
            <Card key={contract.id} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {contract.properties?.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {contract.properties?.address}
                    </p>
                  </div>
                  <Badge className={statusColors[contract.status as keyof typeof statusColors]}>
                    {contract.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cliente</span>
                    <span className="font-medium text-foreground">
                      {contract.clients?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor Mensal
                    </span>
                    <span className="font-bold text-primary">
                      R$ {contract.monthly_rent.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Período
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(contract.start_date).toLocaleDateString("pt-BR")} -{" "}
                      {new Date(contract.end_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                {contract.notes && (
                  <div className="rounded-lg bg-muted p-3">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">{contract.notes}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      setEditingContract(contract);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar Contrato
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
