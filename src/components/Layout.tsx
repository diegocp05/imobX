import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, Users, FileText, Search } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Imóveis", href: "/properties", icon: Building2 },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Contratos", href: "/contracts", icon: FileText },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const [propertiesRes, clientsRes] = await Promise.all([
        supabase
          .from("properties")
          .select("*")
          .or(`name.ilike.%${query}%,neighborhood.ilike.%${query}%`)
          .limit(5),
        supabase
          .from("clients")
          .select("*")
          .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(5),
      ]);

      const results = [
        ...(propertiesRes.data?.map((p) => ({ ...p, type: "property" })) || []),
        ...(clientsRes.data?.map((c) => ({ ...c, type: "client" })) || []),
      ];

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ImobX</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <p className="text-xs text-muted-foreground">© 2025 ImobX</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-card px-6">
          <div className="flex w-full items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar imóvel ou cliente... (Ctrl+K)"
                className="pl-10 cursor-pointer"
                onClick={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                    e.preventDefault();
                    setSearchOpen(true);
                  }
                }}
              />
            </div>
          </div>
        </header>

        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput placeholder="Digite para buscar..." onValueChange={handleSearch} />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            {searchResults.length > 0 && (
              <>
                <CommandGroup heading="Imóveis">
                  {searchResults
                    .filter((r) => r.type === "property")
                    .map((property) => (
                      <CommandItem
                        key={property.id}
                        onSelect={() => {
                          window.location.href = `/properties/${property.id}`;
                          setSearchOpen(false);
                        }}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>{property.name} - {property.neighborhood}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Clientes">
                  {searchResults
                    .filter((r) => r.type === "client")
                    .map((client) => (
                      <CommandItem
                        key={client.id}
                        onSelect={() => {
                          window.location.href = `/clients`;
                          setSearchOpen(false);
                        }}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>{client.name} - {client.email}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </CommandDialog>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
