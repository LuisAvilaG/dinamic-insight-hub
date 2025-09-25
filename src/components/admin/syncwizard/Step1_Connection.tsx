// /components/wizards/add-sync/Step1_Connection.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { GitBranch, Building, Box, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

// Definimos todas las props que este componente necesita del hook para funcionar.
interface Step1Props {
  syncName: string;
  onSyncNameChange: (value: string) => void;
  token: string;
  onTokenChange: (value: string) => void;
  isTokenValid: boolean;
  isLoading: boolean;
  onConnect: () => void;
  workspaces: { id: string; name: string }[];
  selectedWorkspace: string | null;
  onWorkspaceChange: (id: string) => void;
  spaces: { id: string; name: string }[];
  selectedSpace: string | null;
  onSpaceChange: (id: string) => void;
  isFullSync: boolean;
  onIsFullSyncChange: (checked: boolean) => void;
  onNext: () => void;
  onCancel: () => void;
}

export const Step1_Connection: React.FC<Step1Props> = ({
  syncName,
  onSyncNameChange,
  token,
  onTokenChange,
  isTokenValid,
  isLoading,
  onConnect,
  workspaces,
  selectedWorkspace,
  onWorkspaceChange,
  spaces,
  selectedSpace,
  onSpaceChange,
  isFullSync,
  onIsFullSyncChange,
  onNext,
  onCancel,
}) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GitBranch className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Paso 1: Conexión y Alcance</CardTitle>
            <CardDescription>Conecta tu ClickUp y define el modo de sincronización.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="sync-name">Nombre de la Sincronización</Label>
          <Input 
            id="sync-name" 
            placeholder="Ej: Reporte de Carga de Trabajo" 
            value={syncName} 
            onChange={(e) => onSyncNameChange(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="api-token">ClickUp API Token</Label>
          <div className="flex items-center space-x-2">
            <Input 
              id="api-token" 
              type="password" 
              value={token} 
              onChange={(e) => onTokenChange(e.target.value)} 
              placeholder="•••••••••••••••" 
              disabled={isTokenValid} 
            />
            <Button onClick={onConnect} disabled={isLoading || isTokenValid}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isTokenValid ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
              {isTokenValid ? 'Conectado' : 'Conectar'}
            </Button>
          </div>
        </div>
        
        {isTokenValid && (
          <>
            <div className="space-y-2">
              <Label>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground"/>
                  <span>Workspace</span>
                </div>
              </Label>
              <Select onValueChange={onWorkspaceChange} value={selectedWorkspace ?? ''}>
                <SelectTrigger><SelectValue placeholder="Elige un Workspace..." /></SelectTrigger>
                <SelectContent>
                  {workspaces.map((ws) => (<SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedWorkspace && (
              <div className="space-y-2">
                <Label>
                  <div className="flex items-center space-x-2">
                    <Box className="h-4 w-4 text-muted-foreground"/>
                    <span>Espacio</span>
                  </div>
                </Label>
                <Select onValueChange={onSpaceChange} value={selectedSpace ?? ''} disabled={!spaces.length}>
                  <SelectTrigger><SelectValue placeholder="Elige un Espacio..." /></SelectTrigger>
                  <SelectContent>
                    {spaces.map((space) => (<SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedSpace && (
              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold text-md">Modo de Configuración de Campos</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="full-sync-switch" className="flex flex-col space-y-1">
                    <span>Sincronización Completa de Campos</span>
                    <span className="font-normal text-xs text-muted-foreground">Analiza y sincroniza todos los campos disponibles en el espacio.</span>
                  </Label>
                  <Switch id="full-sync-switch" checked={isFullSync} onCheckedChange={onIsFullSyncChange} />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onNext} disabled={!syncName || !selectedSpace}>
          Siguiente <ArrowRight className="h-4 w-4 ml-2"/>
        </Button>
      </CardFooter>
    </Card>
  );
};