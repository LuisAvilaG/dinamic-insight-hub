// /components/wizards/add-sync/useSyncWizard.ts

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
import { groupListsByName, MANDATORY_FIELDS } from './utils';
import { Schedule } from '../ScheduleSelector';

export const useSyncWizard = (onCancel: (success: boolean) => void) => {
    const { user } = useAuth();
    const { toast } = useToast();
    
    // --- ESTADO DEL WIZARD ---
    const [step, setStep] = useState(0);
    const [syncType, setSyncType] = useState<'tasks' | 'time_entries'>('tasks');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [syncName, setSyncName] = useState('');
    const [token, setToken] = useState('');
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [spaces, setSpaces] = useState<any[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
    const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
    const [isFullSync, setIsFullSync] = useState(false);
    const [allLists, setAllLists] = useState<any[]>([]);
    const [listTypeGroups, setListTypeGroups] = useState<any[]>([]);
    const [isTemplateMode, setIsTemplateMode] = useState(true);
    const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
    const [currentEditingItem, setCurrentEditingItem] = useState<any>(null); 
    const [fieldsForModal, setFieldsForModal] = useState<any[]>([]);
    const [allAvailableFields, setAllAvailableFields] = useState(new Map());
    const [fieldMappings, setFieldMappings] = useState<Record<string, Set<string>>>({});
    const [activeMappings, setActiveMappings] = useState(new Set<string>());
    const [listExclusions, setListExclusions] = useState(new Set<string>());
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [cronSchedule, setCronSchedule] = useState('');
    const [syncMode, setSyncMode] = useState<'incremental' | 'full'>('incremental');
    const [isTimeTrackingEnabled, setIsTimeTrackingEnabled] = useState(false);
    
    // --- Nuevos estados para la sincronización de registros de tiempo ---
    const [timeSyncInitialHistoryLoad, setTimeSyncInitialHistoryLoad] = useState(false);
    const [timeSyncScope, setTimeSyncScope] = useState<'last_week' | 'last_30_days' | 'custom_range' | null>(null);
    const [timeSyncCustomStartDate, setTimeSyncCustomStartDate] = useState<Date | null>(null);
    const [timeSyncCustomEndDate, setTimeSyncCustomEndDate] = useState<Date | null>(null);

    // --- EFECTOS ---
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

    // --- MANEJADORES DE LÓGICA ---
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

    const handleWorkspaceChange = async (workspaceId: string) => {
        setSelectedWorkspace(workspaceId);
        setSelectedSpace(null); setSpaces([]); setAllLists([]); setListTypeGroups([]);
        if (!workspaceId) return;
        setIsLoading(true);
        try { setSpaces(await getClickUpSpaces(token, workspaceId)); }
        catch (error) { toast({ title: "Error al cargar espacios", variant: "destructive" }); }
        finally { setIsLoading(false); }
    };
      
    const handleSpaceChange = async (spaceId: string) => {
        setSelectedSpace(spaceId);
        setAllLists([]); setListTypeGroups([]);
        if (!spaceId) return; 
        setIsLoading(true);
        try {
            const [spaceLists, folderData] = await Promise.all([ getClickUpListsInSpace(token, spaceId), getClickUpFolders(token, spaceId) ]);
            let combinedLists = [...spaceLists];
            if (folderData?.length > 0) {
                const listsFromFolders = (await Promise.all(folderData.map(f => getClickUpListsInFolder(token, f.id).catch(() => [])))).flat();
                combinedLists = combinedLists.concat(listsFromFolders);
            }
            setAllLists(combinedLists);
            const groups = groupListsByName(combinedLists);
            setListTypeGroups(groups);
            setActiveMappings(new Set(groups.map(g => g.typeName)));
        } catch (error) { toast({ title: "Error al cargar listas", variant: "destructive" }); }
        finally { setIsLoading(false); }
    };

    const handleConfigureColumns = async (item: any) => {
        setCurrentEditingItem(item);
        setIsColumnsModalOpen(true);
        setIsModalLoading(true);
        try {
            const sampleListId = item.sampleListId || item.id;
            const fields = await getClickUpFieldsFromSampleTask(token, sampleListId);
            setAllAvailableFields(prev => {
                const newMap = new Map(prev);
                fields.forEach(field => { if (!newMap.has(field.id)) newMap.set(field.id, field); });
                return newMap;
            });
            setFieldsForModal([
                { name: 'Campos Estándar', fields: fields.filter(f => !f.custom) },
                { name: 'Campos Personalizados', fields: fields.filter(f => f.custom) }
            ]);
            const mandatoryFieldIds = new Set(fields.filter(f => MANDATORY_FIELDS.has(f.name)).map(f => f.id));
            const key = item.typeName || item.id;
            setFieldMappings(prev => ({ ...prev, [key]: new Set([...(prev[key] || []), ...mandatoryFieldIds]) }));
        } catch (error: any) { 
            toast({ title: "Error al leer la estructura", description: error.message, variant: "destructive"});
            setIsColumnsModalOpen(false);
        } finally { 
            setIsModalLoading(false); 
        }
    };

    const handleFieldSelection = (fieldId: string, isSelected: boolean) => {
        const key = currentEditingItem.typeName || currentEditingItem.id;
        setFieldMappings(prev => {
            const newMappings = { ...prev };
            if (!newMappings[key]) newMappings[key] = new Set();
            isSelected ? newMappings[key].add(fieldId) : newMappings[key].delete(fieldId);
            return newMappings;
        });
    };

    const handleMoveList = (listId: string, sourceGroupName: string, destGroupName: string) => {
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

    const handleToggleActive = (key: string, isActive: boolean) => {
        setActiveMappings(prev => {
            const next = new Set(prev);
            isActive ? next.add(key) : next.delete(key);
            return next;
        });
        if (!isActive) {
            setFieldMappings(prev => {
                const newMappings = { ...prev };
                delete newMappings[key];
                return newMappings;
            });
        }
    };
    
    const handleToggleListExclusion = (listId: string, isExcluded: boolean) => {
        setListExclusions(prev => {
            const next = new Set(prev);
            isExcluded ? next.add(listId) : next.delete(listId);
            return next;
        });
    };

    const handleSelectAllTemplates = () => setActiveMappings(new Set(listTypeGroups.map(g => g.typeName)));
    const handleDeselectAllTemplates = () => setActiveMappings(new Set());
    
    const handleFinalizeSync = async () => {
        setIsLoading(true);
      
        const templates = [];
        let allSelectedFields = new Set();
      
        if (syncType === 'tasks') {
            if (isTemplateMode) {
                for (const group of listTypeGroups) {
                    if (activeMappings.has(group.typeName)) {
                        const selectedFieldsForGroup = fieldMappings[group.typeName] || new Set();
                        templates.push({
                            name: group.typeName,
                            field_ids: Array.from(selectedFieldsForGroup),
                            list_ids: group.lists
                                .filter(list => !listExclusions.has(list.id))
                                .map(list => list.id),
                        });
                        selectedFieldsForGroup.forEach(fieldId => allSelectedFields.add(fieldId));
                    }
                }
            } else { // Manual mode
                const manualLists = [];
                for (const list of allLists) {
                    if(activeMappings.has(list.id)){
                        manualLists.push(list.id);
                        const selectedFieldsForList = fieldMappings[list.id] || new Set();
                        selectedFieldsForList.forEach(fieldId => allSelectedFields.add(fieldId));
                    }
                }
                if(manualLists.length > 0){
                    templates.push({
                        name: 'manual_selection',
                        field_ids: Array.from(allSelectedFields),
                        list_ids: manualLists
                    });
                }
            }
        
            if (isFullSync) {
                const allFieldsPromises = allLists.map(list => getClickUpFieldsFromSampleTask(token, list.id).catch(() => []));
                const allFieldsArrays = await Promise.all(allFieldsPromises);
                const allFieldsMap = new Map();
                allFieldsArrays.flat().forEach(field => {
                    if (!allFieldsMap.has(field.id)) allFieldsMap.set(field.id, field);
                });
                allSelectedFields = new Set(Array.from(allFieldsMap.keys()));
            }
        
            if (allSelectedFields.size === 0) {
              toast({ title: "No hay campos seleccionados", description: "Por favor, configura al menos una plantilla o lista y selecciona sus campos.", variant: "destructive" });
              setIsLoading(false);
              return;
            }
        }

        // Validaciones específicas para time_entries
        if (syncType === 'time_entries') {
            if (!timeSyncScope) {
                toast({ title: "Configuración de tiempo requerida", description: "Por favor, selecciona un rango de sincronización continua para los registros de tiempo.", variant: "destructive" });
                setIsLoading(false);
                return;
            }
            if (timeSyncScope === 'custom_range' && (!timeSyncCustomStartDate || !timeSyncCustomEndDate)) {
                toast({ title: "Rango de fechas personalizado incompleto", description: "Por favor, define una fecha de inicio y fin para la sincronización personalizada.", variant: "destructive" });
                setIsLoading(false);
                return;
            }
        }
      
        const finalFields = Array.from(allSelectedFields).map(id => allAvailableFields.get(id)).filter(Boolean);
      
        const selectedWorkspaceObj = workspaces.find(ws => ws.id === selectedWorkspace);
        const selectedSpaceObj = spaces.find(sp => sp.id === selectedSpace);
      
        const payload: any = {
          syncConfig: {
            name: syncName,
            workspace: selectedWorkspace,
            workspaceName: selectedWorkspaceObj?.name,
            space: selectedSpace,
            spaceName: selectedSpaceObj?.name,
            cron_schedule: cronSchedule,
            is_full_sync_fields: isFullSync,
            sync_type: syncType,
          },
          schedule: schedule,
          mode: syncMode,
        };

        if (syncType === 'tasks') {
            payload.mappings = {
                fields: finalFields,
                templates: templates,
            };
        } else if (syncType === 'time_entries') {
            payload.syncConfig.time_entries_settings = {
                initial_history_load: timeSyncInitialHistoryLoad,
                sync_scope: timeSyncScope,
                custom_start_date: timeSyncCustomStartDate?.toISOString() || null,
                custom_end_date: timeSyncCustomEndDate?.toISOString() || null,
            };
        }

        // Remove mappings and is_full_sync_fields for time_entries to keep payload clean
        if (syncType === 'time_entries') {
            delete payload.syncConfig.is_full_sync_fields; // Not relevant for time_entries
            delete payload.mappings; // Not relevant for time_entries
        }

        if (syncType === 'tasks' && !payload.mappings) {
          toast({ title: "Configuración de tareas incompleta", description: "Los campos de mapeo son requeridos para la sincronización de tareas.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
      
        try {
          const { data, error } = await supabase.functions.invoke('setup-sync-tables', { body: payload });
          if (error) throw error;
          toast({ title: "¡Sincronización Guardada!", description: "La primera importación de datos ha comenzado." });
          onCancel(true);
        } catch (error: any) {
          toast({ title: "Error al Guardar", description: error.message, variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };

    // --- NAVEGACIÓN ---
    const handleNextStep = () => {
        if (step === 0) {
            setStep(1);
        } else if (step === 1) {
            if (syncType === 'tasks' && isFullSync) {
                setStep(3);
            } else if (syncType === 'tasks' && !isFullSync) {
                setStep(2);
            } else if (syncType === 'time_entries') {
                setStep(2); // Go to the new time entries config step
            }
        } else {
            setStep(step + 1);
        }
    };

    const handlePrevStep = () => {
        if (step === 1) {
            setStep(0);
        } else if (step === 2 && syncType === 'time_entries') {
            setStep(1); // From time entries config back to connection
        } else if (step === 2 && syncType === 'tasks' && isFullSync) {
            setStep(1); // This case should not happen if logic is correct, but for safety
        } else if (step === 2 && syncType === 'tasks' && !isFullSync) {
            setStep(1); // From tasks config back to connection
        } else if (step === 3 && syncType === 'tasks' && isFullSync) {
            setStep(1);
        } else if (step === 3 && syncType === 'tasks' && !isFullSync) {
            setStep(2);
        } else if (step === 3 && syncType === 'time_entries') {
            setStep(2); // From schedule back to time entries config
        } else {
            setStep(step - 1);
        }
    };

    // --- API PÚBLICA DEL HOOK ---
    return {
        step, setStep,
        syncType, setSyncType,
        isLoading,
        isModalLoading,
        syncName, setSyncName,
        token, setToken,
        isTokenValid,
        workspaces,
        spaces,
        selectedWorkspace,
        selectedSpace,
        isFullSync, setIsFullSync,
        allLists,
        listTypeGroups,
        isTemplateMode, setIsTemplateMode,
        isColumnsModalOpen, setIsColumnsModalOpen,
        isTemplatesModalOpen, setIsTemplatesModalOpen,
        currentEditingItem,
        fieldsForModal,
        fieldMappings,
        activeMappings,
        listExclusions,
        schedule, setSchedule,
        cronSchedule, setCronSchedule,
        syncMode, setSyncMode,
        isTimeTrackingEnabled, setIsTimeTrackingEnabled,

        // Nuevos estados y setters para time_entries
        timeSyncInitialHistoryLoad, setTimeSyncInitialHistoryLoad,
        timeSyncScope, setTimeSyncScope,
        timeSyncCustomStartDate, setTimeSyncCustomStartDate,
        timeSyncCustomEndDate, setTimeSyncCustomEndDate,

        // Handlers y funciones
        handleTokenValidationAndConnect,
        handleWorkspaceChange,
        handleSpaceChange,
        handleConfigureColumns,
        handleFieldSelection,
        handleMoveList,
        handleToggleActive,
        handleToggleListExclusion,
        handleSelectAllTemplates,
        handleDeselectAllTemplates,
        handleFinalizeSync,
        handleNextStep,
        handlePrevStep,
    };
};