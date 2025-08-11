import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReportItem {
  id: string;
  nombre: string;
  departamento: string;
  descripcion?: string | null;
}

export function ReportSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReportItem[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce
  const debouncedQuery = useDebouncedValue(query, 250);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from("reportes")
        .select("id, nombre, departamento, descripcion")
        .ilike("nombre", `%${debouncedQuery}%`)
        .order("updated_at", { ascending: false })
        .limit(8);

      if (!cancelled) {
        if (error) {
          console.error("Error searching reports:", error);
          setResults([]);
        } else {
          setResults(data || []);
        }
        setOpen(true);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goTo = (id: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/reportes/${id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      goTo(results[0].id);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Buscar reportes por nombre..."
        className="pl-10 bg-accent/50 border-0 focus:bg-background focus:border-primary transition-smooth"
      />
      {open && (
        <div className="absolute mt-2 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg z-50">
          {loading ? (
            <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
            </div>
          ) : results.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">Sin resultados</div>
          ) : (
            <ul className="max-h-80 overflow-auto py-1">
              {results.map((r) => (
                <li
                  key={r.id}
                  className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                  onClick={() => goTo(r.id)}
                >
                  <div className="font-medium truncate">{r.nombre}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.departamento}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
