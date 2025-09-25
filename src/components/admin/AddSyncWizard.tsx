// /components/wizards/add-sync/AddSyncWizard.tsx

import React from 'react';
import { useSyncWizard } from './syncwizard/useSyncWizard';
import { Step1_Connection } from './syncwizard/Step1_Connection';
import { Step2_Configuration } from './syncwizard/Step2_Configuration';
import { Step2_TimeEntriesConfiguration } from './syncwizard/Step2_TimeEntriesConfiguration'; // Importar el nuevo componente
import { Step3_Schedule } from './syncwizard/Step3_Schedule';
import { ConfigureColumnsModal } from './syncwizard/ConfigureColumnsModal';
import { ManageTemplatesModal } from './syncwizard/ManageTemplatesModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock, ListTodo, ArrowRight } from 'lucide-react';

// Las props del componente principal no cambian.
interface AddSyncWizardProps {
  onCancel: (success?: boolean) => void;
}

const AddSyncWizard: React.FC<AddSyncWizardProps> = ({ onCancel }) => {
  // 1. Llamamos a nuestro hook para obtener toda la lógica y el estado.
  const wizard = useSyncWizard(onCancel);

  // El item key nos ayuda a obtener los mappings correctos para el modal.
  const itemKey = wizard.currentEditingItem?.typeName || wizard.currentEditingItem?.id;

  return (
    <>
      {/* Paso 0: Seleccionar tipo de sincronización */}
      {wizard.step === 0 && (
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>Paso 0: Selecciona el tipo de sincronización</CardTitle>
            <CardDescription>
              Elige si quieres sincronizar tareas de ClickUp o registros de tiempo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                wizard.syncType === 'tasks' ? 'border-primary ring-2 ring-primary' : 'hover:border-gray-300'
              }`}
              onClick={() => wizard.setSyncType('tasks')}
            >
              <ListTodo className="h-6 w-6 text-primary" />
              <div>
                <h4 className="font-semibold">Sincronizar Tareas</h4>
                <p className="text-sm text-muted-foreground">Importa y actualiza tus tareas, sus campos y estados.</p>
              </div>
              {wizard.syncType === 'tasks' && <Check className="h-5 w-5 text-primary ml-auto" />}
            </div>
            <div 
              className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${ 
                wizard.syncType === 'time_entries' ? 'border-primary ring-2 ring-primary' : 'hover:border-gray-300' 
              }`}
              onClick={() => wizard.setSyncType('time_entries')}
            >
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <h4 className="font-semibold">Sincronizar Registros de Tiempo</h4>
                <p className="text-sm text-muted-foreground">Importa los registros de tiempo asociados a tus tareas.</p>
              </div>
              {wizard.syncType === 'time_entries' && <Check className="h-5 w-5 text-primary ml-auto" />}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => onCancel(false)}>Cancelar</Button>
            <Button onClick={wizard.handleNextStep} disabled={!wizard.syncType}>
              Siguiente <ArrowRight className="h-4 w-4 ml-2"/>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Paso 1: Conexión y Alcance */}
      {wizard.step === 1 && (
        <Step1_Connection
          syncName={wizard.syncName}
          onSyncNameChange={wizard.setSyncName}
          token={wizard.token}
          onTokenChange={wizard.setToken}
          isTokenValid={wizard.isTokenValid}
          isLoading={wizard.isLoading}
          onConnect={wizard.handleTokenValidationAndConnect}
          workspaces={wizard.workspaces}
          selectedWorkspace={wizard.selectedWorkspace}
          onWorkspaceChange={wizard.handleWorkspaceChange}
          spaces={wizard.spaces}
          selectedSpace={wizard.selectedSpace}
          onSpaceChange={wizard.handleSpaceChange}
          isFullSync={wizard.isFullSync}
          onIsFullSyncChange={wizard.setIsFullSync}
          onNext={wizard.handleNextStep}
          onCancel={wizard.handlePrevStep}
        />
      )}

      {/* Paso 2: Configuración de Datos (Condicional según syncType) */}
      {wizard.step === 2 && wizard.syncType === 'tasks' && (
        <Step2_Configuration
          isTemplateMode={wizard.isTemplateMode}
          onIsTemplateModeChange={wizard.setIsTemplateMode}
          listTypeGroups={wizard.listTypeGroups}
          activeMappings={wizard.activeMappings}
          onToggleActive={wizard.handleToggleActive}
          onConfigure={wizard.handleConfigureColumns}
          listExclusions={wizard.listExclusions}
          onToggleListExclusion={wizard.handleToggleListExclusion}
          onMoveList={wizard.handleMoveList}
          onSelectAllTemplates={wizard.handleSelectAllTemplates}
          onDeselectAllTemplates={wizard.handleDeselectAllTemplates}
          onExpandTemplates={() => wizard.setIsTemplatesModalOpen(true)}
          allLists={wizard.allLists}
          isTimeTrackingEnabled={wizard.isTimeTrackingEnabled}
          onTimeTrackingChange={wizard.setIsTimeTrackingEnabled}
          onNext={wizard.handleNextStep}
          onBack={wizard.handlePrevStep}
        />
      )}

      {wizard.step === 2 && wizard.syncType === 'time_entries' && (
        <Step2_TimeEntriesConfiguration
          onNext={wizard.handleNextStep}
          onBack={wizard.handlePrevStep}
          timeSyncInitialHistoryLoad={wizard.timeSyncInitialHistoryLoad}
          onTimeSyncInitialHistoryLoadChange={wizard.setTimeSyncInitialHistoryLoad}
          timeSyncScope={wizard.timeSyncScope}
          onTimeSyncScopeChange={wizard.setTimeSyncScope}
          timeSyncCustomStartDate={wizard.timeSyncCustomStartDate}
          onTimeSyncCustomStartDateChange={wizard.setTimeSyncCustomStartDate}
          timeSyncCustomEndDate={wizard.timeSyncCustomEndDate}
          onTimeSyncCustomEndDateChange={wizard.setTimeSyncCustomEndDate}
        />
      )}

      {/* Paso 3: Destino y Programación */}
      {wizard.step === 3 && (
        <Step3_Schedule
          syncMode={wizard.syncMode}
          onSyncModeChange={wizard.setSyncMode}
          onScheduleChange={(schedule, cron) => {
            wizard.setSchedule(schedule);
            wizard.setCronSchedule(cron);
          }}
          onBack={wizard.handlePrevStep}
          onSave={wizard.handleFinalizeSync}
          isLoading={wizard.isLoading}
        />
      )}
      
      {/* Modales */}
      {wizard.isColumnsModalOpen && (
        <ConfigureColumnsModal
          isOpen={wizard.isColumnsModalOpen}
          onOpenChange={wizard.setIsColumnsModalOpen}
          isLoading={wizard.isModalLoading}
          item={wizard.currentEditingItem}
          fieldGroups={wizard.fieldsForModal}
          selectedFields={wizard.fieldMappings[itemKey]}
          onFieldSelect={wizard.handleFieldSelection}
        />
      )}

      {wizard.isTemplatesModalOpen && (
        <ManageTemplatesModal
          isOpen={wizard.isTemplatesModalOpen}
          onOpenChange={wizard.setIsTemplatesModalOpen}
          listTypeGroups={wizard.listTypeGroups}
          activeMappings={wizard.activeMappings}
          listExclusions={wizard.listExclusions}
          onConfigure={wizard.handleConfigureColumns}
          onToggleActive={wizard.handleToggleActive}
          onMoveList={wizard.handleMoveList}
          onToggleListExclusion={wizard.handleToggleListExclusion}
          onSelectAll={wizard.handleSelectAllTemplates}
          onDeselectAll={wizard.handleDeselectAllTemplates}
        />
      )}
    </>
  );
};

export default AddSyncWizard;