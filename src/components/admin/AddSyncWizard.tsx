
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, Building, Box, Folder, ArrowRight, ArrowLeft, Loader2, CheckCircle, Database, Settings, Expand, Move, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  saveUserClickUpToken,
  getUserClickUpToken,
  getClickUpWorkspaces,
  getClickUpSpaces,
  getClickUpFolders,
  getClickUpListsInFolder,
  getClickUpListsInSpace,
  getClickUpFieldsFromSampleTask
} from '@/integrations/clickup/api';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScheduleSelector, Schedule } from './ScheduleSelector';

// --- List of mandatory fields ---
const MANDATORY_FIELDS = new Set(['id', 'name', 'project', 'folder', 'space']);

// --- Intelligent Grouping Logic ---
const STOP_WORDS = new Set(['de', 'la', 'el', 'a', 'y', 'for', 'the', 'and', 'in', 'on', 'with', 'at', 'by']);
const GENERIC_KEYS = new Set(['project', 'report', 'informe', 'reporte']);

const getCleanKeywords = (name) => {
    return name.toLowerCase().replace(/[-_()]/g, ' ').split(' ').filter(word => word && !STOP_WORDS.has(word));
};

const groupListsByName = (lists) => {
    if (!lists) return [];
    const groups = new Map();
    lists.forEach(list => {
        const keywords = getCleanKeywords(list.name);
        if (keywords.length === 0) return;
        let key = keywords[0];
        if (GENERIC_KEYS.has(key) && keywords.length > 1) {
            key = keywords.slice(0, 2).join(' ');
        }
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(list);
    });
    return Array.from(groups.entries()).map(([name, listArray]) => ({
        typeName: name,
        count: listArray.length,
        lists: listArray,
        sampleListId: listArray[0].id
    }));
};

// --- Reusable Panel Component for Templates ---
const TemplatesPanel = ({ listTypeGroups, activeMappings, onConfigure, onToggleActive, onMoveList, listExclusions, onToggleListExclusion, onSelectAll, onDeselectAll, isModal = false, onExpand }) => (
    <div className={`p-4 border rounded-lg ${isModal ? 'h-full flex flex-col' : ''}`}>
        <div className="flex justify-between items-center mb-2">
            <div>
                <h3 className="font-semibold text-md">Plantillas de Listas Detectadas</h3>
                <p className="text-sm text-muted-foreground">Reorganiza moviendo listas entre grupos si es necesario.</p>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="link" size="sm" onClick={onSelectAll}>Seleccionar Todo</Button>
                <Button variant="link" size="sm" onClick={onDeselectAll}>Deseleccionar Todo</Button>
                {!isModal && <Button variant="ghost" size="icon" onClick={onExpand}><Expand className="h-4 w-4"/></Button>}
            </div>
        </div>
        <div className={`space-y-2 pr-2 ${isModal ? 'flex-grow overflow-y-auto' : 'max-h-60 overflow-y-auto'}`}>
            {listTypeGroups.map(group => (
                <Collapsible key={group.typeName} className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                        <CollapsibleTrigger asChild>
                            <button className="text-left">
                                <p className="font-medium capitalize">{group.typeName}</p>
                                <p className="text-xs text-muted-foreground">{group.count} lista(s)</p>
                            </button>
                        </CollapsibleTrigger>
                        <div className="flex items-center space-x-3">
                            <Button variant="outline" size="sm" onClick={() => onConfigure(group)} disabled={!activeMappings.has(group.typeName)}><Settings className="h-4 w-4 mr-2"/>Configurar</Button>
                            <Switch checked={activeMappings.has(group.typeName)} onCheckedChange={(checked) => onToggleActive(group.typeName, checked)}/>
                        </div>
                    </div>
                    <CollapsibleContent className="p-3 pl-6 border-l border-dashed ml-3 space-y-2">
                        {group.lists.map(list => (
                            <div key={list.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id={`list-exc-${list.id}`} checked={!listExclusions.has(list.id)} onCheckedChange={(checked) => onToggleListExclusion(list.id, !checked)} disabled={!activeMappings.has(group.typeName)}/>
                                    <Label htmlFor={`list-exc-${list.id}`} className="text-sm font-normal text-muted-foreground">{list.name}</Label>
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm"><Move className="h-4 w-4 mr-2"/>Mover</Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 p-0">
                                        <Command>
                                            <CommandInput placeholder="Mover a..." />
                                            <CommandEmpty>No se encontraron plantillas.</CommandEmpty>
                                            <CommandGroup>
                                                {listTypeGroups.filter(g => g.typeName !== group.typeName).map(destGroup => (
                                                    <CommandItem key={destGroup.typeName} onSelect={() => onMoveList(list.id, group.typeName, destGroup.typeName)}>
                                                        {destGroup.typeName}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    </div>
);

const AddSyncWizard = ({ onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [syncName, setSyncName] = useState('');
  const [token, setToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isFullSync, setIsFullSync] = useState(false);
  const [allLists, setAllLists] = useState([]);
  const [listTypeGroups, setListTypeGroups] = useState([]);
  const [isTimeTrackingEnabled, setIsTimeTrackingEnabled] = useState(true);
  const [isTemplateMode, setIsTemplateMode] = useState(true);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState(null); 
  const [fieldsForModal, setFieldsForModal] = useState([]); // Renamed from availableFields
  const [allAvailableFields, setAllAvailableFields] = useState(new Map()); // New state to store all unique fields
  const [fieldMappings, setFieldMappings] = useState({});
  const [activeMappings, setActiveMappings] = useState(new Set());
  const [listExclusions, setListExclusions] = useState(new Set());

  // Step 3 State
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [cronSchedule, setCronSchedule] = useState('');
  const [syncMode, setSyncMode] = useState('incremental');

  useEffect(() => {
    const checkForExistingToken = async () => {
      if (!user) return;
      setIsLoading(true);
      const existingToken = await getUserClickUpToken();
      if (existingToken) {
        setToken(existingToken);
        try {
          setWorkspaces(await getClickUpWorkspaces(existingToken));
          setIsTokenValid(true);
        } catch (err) { toast({ title: "Token existente inválido", variant: 'destructive'}); }
      }
      setIsLoading(false);
    };
    checkForExistingToken();
  }, [user, toast]);

  const handleTokenValidationAndConnect = async () => {
    if (!token) return toast({ title: "Token requerido", variant: "destructive" });
    setIsLoading(true);
    try {
      await saveUserClickUpToken(token);
      setWorkspaces(await getClickUpWorkspaces(token));
      setIsTokenValid(true);
      toast({ title: "¡Conexión exitosa!" });
    } catch (err) {
      toast({ title: "Error de conexión", variant: "destructive" });
      setIsTokenValid(false);
    } finally { setIsLoading(false); }
  };
  
  const handleWorkspaceChange = async (workspaceId) => {
    console.log(`%c[AddSyncWizard] Workspace changed to: ${workspaceId}`, 'color: dodgerblue');
    setSelectedWorkspace(workspaceId);
    setSelectedSpace(null);
    setSpaces([]);
    setAllLists([]);
    setListTypeGroups([]);
    if (!workspaceId) return;
    setIsLoading(true);
    try { setSpaces(await getClickUpSpaces(token, workspaceId)); }
    catch (error) { toast({ title: "Error al cargar espacios", variant: "destructive" }); }
    finally { setIsLoading(false); }
  };
  
  const handleSpaceChange = async (spaceId) => {
    console.log(`%c[AddSyncWizard] Space changed to: ${spaceId}`, 'color: dodgerblue');
    setSelectedSpace(spaceId);
    setAllLists([]);
    setListTypeGroups([]);
    if (!spaceId) return; 
    
    setIsLoading(true);
    try {
      const [spaceLists, folderData] = await Promise.all([ getClickUpListsInSpace(token, spaceId), getClickUpFolders(token, spaceId) ]);
      let combinedLists = [...spaceLists];
       if (folderData?.length > 0) {
        const listsFromFoldersPromises = folderData.map(f => 
            getClickUpListsInFolder(token, f.id).catch(err => {
                console.warn(`Could not fetch lists for folder ${f.name} (${f.id}):`, err);
                toast({ title: `Advertencia`, description: `No se pudieron cargar las listas de la carpeta "${f.name}".`, variant: "default"});
                return []; 
            })
        );
        const listsFromFolders = (await Promise.all(listsFromFoldersPromises)).flat();
        combinedLists = combinedLists.concat(listsFromFolders);
      }
      setAllLists(combinedLists);
      const groups = groupListsByName(combinedLists);
      setListTypeGroups(groups);
      setActiveMappings(new Set(groups.map(g => g.typeName)));
    } catch (error) { toast({ title: "Error al cargar listas", variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const handleConfigureColumns = async (item) => {
      setCurrentEditingItem(item);
      setIsColumnsModalOpen(true);
      setIsModalLoading(true);
      try {
          const sampleListId = item.sampleListId || item.id;
          const fields = await getClickUpFieldsFromSampleTask(token, sampleListId);
          
          // Update allAvailableFields (the master map)
          setAllAvailableFields(prev => {
              const newMap = new Map(prev);
              fields.forEach(field => {
                  if (!newMap.has(field.id)) {
                      newMap.set(field.id, field);
                  }
              });
              return newMap;
          });

          // Set fields for the modal
          setFieldsForModal([
              { name: 'Campos Estándar', fields: fields.filter(f => f.custom === false) },
              { name: 'Campos Personalizados', fields: fields.filter(f => f.custom === true) }
          ]);
          
          const mandatoryFieldIds = new Set(
              fields.filter(f => MANDATORY_FIELDS.has(f.name)).map(f => f.id)
          );
          const key = item.typeName || item.id;
          setFieldMappings(prev => ({
              ...prev,
              [key]: new Set([...(prev[key] || []), ...mandatoryFieldIds])
          }));

      } catch (error) { 
          toast({ title: "Error al leer la estructura", description: error.message, variant: "destructive"});
          setIsColumnsModalOpen(false);
      } finally { 
          setIsModalLoading(false); 
      }
  };

  const handleFieldSelection = (fieldId, isSelected) => {
      const key = currentEditingItem.typeName || currentEditingItem.id;
      setFieldMappings(prev => {
          const newMappings = { ...prev };
          if (!newMappings[key]) {
              newMappings[key] = new Set();
          }
          isSelected ? newMappings[key].add(fieldId) : newMappings[key].delete(fieldId);
          return newMappings;
      });
  };

    const handleToggleListExclusion = (listId, isExcluded) => {
      setListExclusions(prev => {
          const newExclusions = new Set(prev);
          isExcluded ? newExclusions.add(listId) : newExclusions.delete(listId);
          return newExclusions;
      })
  }

  const handleMoveList = (listId, sourceGroupName, destGroupName) => {
      setListTypeGroups(prev => {
          const newGroups = JSON.parse(JSON.stringify(prev));
          const sourceGroup = newGroups.find(g => g.typeName === sourceGroupName);
          const destGroup = newGroups.find(g => g.typeName === destGroupName);
          if (!sourceGroup || !destGroup) return prev;
          const listIndex = sourceGroup.lists.findIndex(l => l.id === listId);
          if (listIndex === -1) return prev;
          const [movedList] = sourceGroup.lists.splice(listIndex, 1);
          destGroup.lists.push(movedList);
          sourceGroup.count = sourceGroup.lists.length;
          destGroup.count = destGroup.lists.length;
          return newGroups.filter(g => g.lists.length > 0);
      });
  };

  const handleToggleActive = (key, isActive) => {
    setActiveMappings(prev => {
        const next = new Set(prev);
        isActive ? next.add(key) : next.delete(key);
        return next;
    });
    // If deactivating a template/list, ensure its field mappings are cleared
    if (!isActive) {
        setFieldMappings(prev => {
            const newMappings = { ...prev };
            delete newMappings[key];
            return newMappings;
        });
    }
  };


  const handleFinalizeSync = async () => {
      console.log('%c[AddSyncWizard] Starting handleFinalizeSync...', 'color: green; font-weight: bold;');
      setIsLoading(true);

      const finalFieldSelections = new Set();

      // Collect all selected fields from active mappings
      for (const [key, selectedFieldIds] of Object.entries(fieldMappings)) {
          if (activeMappings.has(key)) { // Only include fields from active templates/lists
              selectedFieldIds.forEach(fieldId => finalFieldSelections.add(fieldId));
          }
      }

      // Construct the fields array from allAvailableFields based on finalFieldSelections
      const selectedFieldsPayload = Array.from(finalFieldSelections).map(fieldId => allAvailableFields.get(fieldId));


      const payload = {
          syncConfig: {
              name: syncName,
              workspace: selectedWorkspace,
              space: selectedSpace,
              cron_schedule: cronSchedule,
              config: schedule,
              mode: syncMode,
              is_full_sync: isFullSync,
          },
          mappings: {
              fields: selectedFieldsPayload.filter(Boolean) // Filter out any undefined if a fieldId somehow didn't map
          }
      };

      console.log('%c[AddSyncWizard] Payload to be sent:', 'color: orange;', payload);
      
      // Verification log
      if (!payload.syncConfig.name || !payload.syncConfig.workspace || !payload.syncConfig.space || !payload.syncConfig.cron_schedule) {
          console.error('%c[AddSyncWizard] VALIDATION FAILED: One or more key fields are missing in the payload.', 'color: red; font-weight: bold;', payload.syncConfig);
      }

      try {
          console.log('%c[AddSyncWizard] Invoking Supabase function "setup-sync-tables"...', 'color: green;');
          const { data, error } = await supabase.functions.invoke('setup-sync-tables', { body: payload });
          
          if (error) {
            // This is the critical log for the 500 error
            console.error('%c[AddSyncWizard] Supabase function returned an ERROR:', 'color: red; font-weight: bold;', error);
            throw error;
          }

          console.log('%c[AddSyncWizard] Supabase function executed successfully. Response data:', 'color: green;', data);
          toast({ title: "¡Sincronización Guardada!", description: `La tabla ${data.tableName} ha sido preparada.`});
          onCancel(true); // Close wizard and signal a refresh
      } catch (error) {
          console.error('%c[AddSyncWizard] CATCH BLOCK: An error occurred during finalization.', 'color: red; font-weight: bold;', error);
          toast({ title: "Error al Guardar", description: error.message, variant: "destructive"});
      } finally {
          setIsLoading(false);
      }
  };

  const handleNextStep = () => step === 1 && isFullSync ? setStep(3) : setStep(step + 1);
  const goToPrevStep = () => setStep(step - 1);
  
  return (
    <>
      {step === 1 && (
        <Card className="border-0 shadow-none">
            <CardHeader><div className="flex items-center space-x-3 mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><GitBranch className="h-6 w-6" /></div><div><CardTitle>Paso 1: Conexión y Alcance</CardTitle><CardDescription>Conecta tu ClickUp y define el modo de sincronización.</CardDescription></div></div></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Label htmlFor="sync-name">Nombre de la Sincronización</Label><Input id="sync-name" placeholder="Ej: Reporte de Carga de Trabajo" value={syncName} onChange={(e) => setSyncName(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="api-token">ClickUp API Token</Label><div className="flex items-center space-x-2"><Input id="api-token" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="•••••••••••••••" disabled={isTokenValid} /><Button onClick={handleTokenValidationAndConnect} disabled={isLoading || isTokenValid}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isTokenValid ? <CheckCircle className="mr-2 h-4 w-4" /> : null}{isTokenValid ? 'Conectado' : 'Conectar'}</Button></div></div>
              {isTokenValid && (
                <>
                  <div className="space-y-2"><Label><div className="flex items-center space-x-2"><Building className="h-4 w-4 text-muted-foreground"/><span>Workspace</span></div></Label><Select onValueChange={handleWorkspaceChange} value={selectedWorkspace}><SelectTrigger><SelectValue placeholder="Elige un Workspace..." /></SelectTrigger><SelectContent>{workspaces.map((ws) => (<SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>))}</SelectContent></Select></div>
                  {selectedWorkspace && <div className="space-y-2"><Label><div className="flex items-center space-x-2"><Box className="h-4 w-4 text-muted-foreground"/><span>Espacio</span></div></Label><Select onValueChange={handleSpaceChange} value={selectedSpace} disabled={!spaces.length}><SelectTrigger><SelectValue placeholder="Elige un Espacio..." /></SelectTrigger><SelectContent>{spaces.map((space) => (<SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>))}</SelectContent></Select></div>}
                  {selectedSpace && <div className="p-4 border rounded-lg space-y-3"><h3 className="font-semibold text-md">Modo de Sincronización</h3><div className="flex items-center justify-between"><Label htmlFor="full-sync-switch" className="flex flex-col space-y-1"><span>Sincronización Completa</span><span className="font-normal text-xs text-muted-foreground">Trae todos los datos sin configuración manual.</span></Label><Switch id="full-sync-switch" checked={isFullSync} onCheckedChange={setIsFullSync} /></div></div>}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2"><Button variant="ghost" onClick={() => onCancel(false)}>Cancelar</Button><Button onClick={handleNextStep} disabled={!syncName || !selectedSpace}>Siguiente <ArrowRight className="h-4 w-4 ml-2"/></Button></CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-0 shadow-none">
            <CardHeader><div className="flex items-center space-x-3 mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Database className="h-6 w-6" /></div><div><CardTitle>Paso 2: Configuración de Datos</CardTitle><CardDescription>Define cómo quieres mapear los datos de ClickUp.</CardDescription></div></div></CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg"><h3 className="font-semibold text-md">Modo de Configuración</h3><div className="flex items-center justify-between"><Label htmlFor="template-mode-switch" className="flex flex-col space-y-1"><span>Detección Automática de Plantillas</span><span className="font-normal text-xs text-muted-foreground">Agrupa listas por nombre para una configuración más rápida.</span></Label><Switch id="template-mode-switch" checked={isTemplateMode} onCheckedChange={setIsTemplateMode} /></div></div>
              <Separator />
              { isTemplateMode ? <TemplatesPanel listTypeGroups={listTypeGroups} activeMappings={activeMappings} onConfigure={handleConfigureColumns} listExclusions={listExclusions} onToggleListExclusion={handleToggleListExclusion} onToggleActive={handleToggleActive} onMoveList={handleMoveList} onSelectAll={() => setActiveMappings(new Set(listTypeGroups.map(g => g.typeName)))} onDeselectAll={() => setActiveMappings(new Set())} onExpand={() => setIsTemplatesModalOpen(true)} /> : (
                <div className="p-4 border rounded-lg"><h3 className="font-semibold text-md mb-2">Configuración Manual</h3><div className="space-y-2 max-h-60 overflow-y-auto pr-2">{allLists.map(list => (<div key={list.id} className="flex items-center justify-between p-3 border rounded-md"><div><p className="font-medium">{list.name}</p></div><div className="flex items-center space-x-4"><Button variant="outline" size="sm" onClick={() => handleConfigureColumns(list)} disabled={!activeMappings.has(list.id)}><Settings className="h-4 w-4 mr-2"/>Configurar</Button><Switch checked={activeMappings.has(list.id)} onCheckedChange={(checked) => handleToggleActive(list.id, checked)}/></div></div>))}</div></div>
              )}
              <Separator />
              <div className="p-4 border rounded-lg"><h3 className="font-semibold text-md mb-2">Registros de Tiempo</h3><div className="flex items-center justify-between"><Label htmlFor="time-tracking-switch" className="font-medium">Sincronizar Registros de Tiempo</Label><Switch id="time-tracking-switch" checked={isTimeTrackingEnabled} onCheckedChange={setIsTimeTrackingEnabled} /></div></div>
            </CardContent>
            <CardFooter className="flex justify-between"><Button variant="outline" onClick={goToPrevStep}><ArrowLeft className="h-4 w-4 mr-2" />Anterior</Button><Button onClick={handleNextStep}>Siguiente<ArrowRight className="h-4 w-4 ml-2" /></Button></CardFooter>
        </Card>
      )}
      
      {step === 3 && (
        <Card className="border-0 shadow-none">
            <CardHeader><div className="flex items-center space-x-3 mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Clock className="h-6 w-6" /></div><div><CardTitle>Paso 3: Destino y Programación</CardTitle><CardDescription>Configura la frecuencia y el modo de la sincronización.</CardDescription></div></div></CardHeader>
            <CardContent className="space-y-6">
                <ScheduleSelector onChange={(newSchedule, newCron) => {
                    console.log('%c[AddSyncWizard] Schedule updated:', 'color: purple', { schedule: newSchedule, cron: newCron });
                    setSchedule(newSchedule);
                    setCronSchedule(newCron);
                }} />
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-md mb-4">Modo de Sincronización</h3>
                    <RadioGroup value={syncMode} onValueChange={setSyncMode}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="incremental" id="incremental" /><Label htmlFor="incremental">Incremental (Recomendado)</Label></div>
                        <p className="text-xs text-muted-foreground pl-6">Solo sincroniza tareas nuevas o modificadas desde la última ejecución.</p>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="full" id="full" /><Label htmlFor="full">Reemplazo Completo</Label></div>
                        <p className="text-xs text-muted-foreground pl-6">Borra todos los datos existentes en la tabla y los carga de nuevo.</p>
                    </RadioGroup>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={goToPrevStep}><ArrowLeft className="h-4 w-4 mr-2" />Anterior</Button>
                <Button onClick={handleFinalizeSync} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Guardar y Activar Sincronización
                </Button>
            </CardFooter>
        </Card>
      )}

      {isColumnsModalOpen && (
          <Dialog open={isColumnsModalOpen} onOpenChange={setIsColumnsModalOpen}>
            <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Configurar Columnas para: <span className="capitalize font-bold">{currentEditingItem?.typeName || currentEditingItem?.name}</span></DialogTitle><DialogDescription>Selecciona los campos para esta plantilla o lista.</DialogDescription></DialogHeader>
                <div className="max-h-[50vh] overflow-y-auto p-1 pr-4">
                {isModalLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="mr-2 h-6 w-6 animate-spin"/>Cargando campos...</div>
                ) : (
                    fieldsForModal.map(group => ( group.fields.length > 0 && 
                        <div key={group.name} className="mb-4">
                            <h4 className="font-semibold text-sm mb-2 pb-1 border-b">{group.name}</h4>
                            <div className="space-y-2">
                                {group.fields.map(field => {
                                    const isMandatory = MANDATORY_FIELDS.has(field.name);
                                    return (
                                        <div key={field.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`field-${field.id}`} 
                                                onCheckedChange={(checked) => handleFieldSelection(field.id, checked)}
                                                checked={isMandatory || fieldMappings[currentEditingItem?.typeName || currentEditingItem?.id]?.has(field.id) || false}
                                                disabled={isMandatory}
                                            />
                                            <Label htmlFor={`field-${field.id}`} className={`font-normal ${isMandatory ? 'text-muted-foreground' : ''}`}>
                                                {field.name} {isMandatory && '(obligatorio)'}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
                </div>
              <DialogFooter><Button onClick={() => setIsColumnsModalOpen(false)}>Guardar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
      )}

      {isTemplatesModalOpen && (
        <Dialog open={isTemplatesModalOpen} onOpenChange={setIsTemplatesModalOpen}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader><DialogTitle>Gestión de Plantillas de Listas</DialogTitle><DialogDescription>Vista expandida para gestionar todas las plantillas detectadas.</DialogDescription></DialogHeader>
                <div className="flex-grow overflow-y-auto pr-4">
                  <TemplatesPanel listTypeGroups={listTypeGroups} activeMappings={activeMappings} onConfigure={handleConfigureColumns} listExclusions={listExclusions} onToggleListExclusion={handleToggleListExclusion} onToggleActive={handleToggleActive} onMoveList={handleMoveList} onSelectAll={() => setActiveMappings(new Set(listTypeGroups.map(g => g.typeName)))} onDeselectAll={() => setActiveMappings(new Set())} isModal={true} />
                </div>
                <DialogFooter><Button onClick={() => setIsTemplatesModalOpen(false)}>Cerrar</Button></DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AddSyncWizard;
