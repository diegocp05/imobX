import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/StatsCard";
import { Building2, Home, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  monthlyRevenue: number;
  upcomingVisits: number;
}

interface Visit {
  id: string;
  scheduled_date: string;
  status: string;
  properties: { name: string };
  clients: { name: string };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    availableProperties: 0,
    rentedProperties: 0,
    monthlyRevenue: 0,
    upcomingVisits: 0,
  });
  const [upcomingVisits, setUpcomingVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Buscar propriedades
      const { data: properties } = await supabase.from("properties").select("*");
      
      // Buscar contratos ativos
      const { data: contracts } = await supabase
        .from("contracts")
        .select("monthly_rent")
        .eq("status", "Ativo");

      // Buscar visitas futuras
      const { data: visits } = await supabase
        .from("visits")
        .select(`
          id,
          scheduled_date,
          status,
          properties (name),
          clients (name)
        `)
        .eq("status", "Agendada")
        .gte("scheduled_date", new Date().toISOString())
        .order("scheduled_date", { ascending: true })
        .limit(5);

      const totalProperties = properties?.length || 0;
      const availableProperties = properties?.filter((p) => p.status === "Disponível").length || 0;
      const rentedProperties = properties?.filter((p) => p.status === "Alugado").length || 0;
      const monthlyRevenue = contracts?.reduce((sum, c) => sum + Number(c.monthly_rent), 0) || 0;

      setStats({
        totalProperties,
        availableProperties,
        rentedProperties,
        monthlyRevenue,
        upcomingVisits: visits?.length || 0,
      });

      setUpcomingVisits(visits || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do desempenho da sua imobiliária
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Imóveis"
          value={stats.totalProperties}
          icon={<Building2 className="h-6 w-6 text-primary" />}
        />
        <StatsCard
          title="Disponíveis"
          value={stats.availableProperties}
          icon={<Home className="h-6 w-6 text-green-600" />}
        />
        <StatsCard
          title="Alugados"
          value={stats.rentedProperties}
          icon={<Home className="h-6 w-6 text-blue-600" />}
        />
        <StatsCard
          title="Receita Mensal"
          value={`R$ ${stats.monthlyRevenue.toLocaleString("pt-BR")}`}
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          trend={{ value: "12%", isPositive: true }}
        />
      </div>

      {/* Upcoming Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Próximas Visitas ({stats.upcomingVisits})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingVisits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma visita agendada
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {visit.properties?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {visit.clients?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(visit.scheduled_date).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(visit.scheduled_date).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
