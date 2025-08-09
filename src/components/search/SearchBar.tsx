import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Report {
  id: string;
  nombre: string;
  departamento: string;
  descripcion?: string;
}

interface SearchBarProps {
  className?: string;
}

export const SearchBar = ({ className = "" }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Report[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar reportes cuando cambia el query
  useEffect(() => {
    const searchReports = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reportes')
          .select('id, nombre, departamento, descripcion')
          .or(`nombre.ilike.%${query}%,departamento.ilike.%${query}%,descripcion.ilike.%${query}%`)
          .limit(8);

        if (error) throw error;
        
        setResults(data || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching reports:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchReports, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelectReport = (report: Report) => {
    navigate(`/reportes/${report.id}`);
    setQuery("");
    setIsOpen(false);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary font-medium rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar reportes, dashboards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-4 h-10 stripe-input bg-muted/50 border-0 hover:bg-muted/70 focus:bg-white focus:border-border placeholder:text-muted-foreground"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 stripe-card shadow-lg max-h-64 overflow-y-auto z-50">
          {results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {query.trim().length < 2 
                  ? "Escribe al menos 2 caracteres para buscar"
                  : "No se encontraron reportes"
                }
              </p>
            </div>
          ) : (
            <div className="py-1">
              <div className="text-xs font-medium text-muted-foreground px-4 py-2 border-b border-border">
                {results.length} reporte{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((report) => (
                <button
                  key={report.id}
                  onClick={() => handleSelectReport(report)}
                  className="w-full p-3 text-left hover:bg-muted transition-all rounded-md mx-1 my-1 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {highlightMatch(report.nombre, query)}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                          {report.departamento}
                        </Badge>
                      </div>
                      {report.descripcion && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {highlightMatch(report.descripcion, query)}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};