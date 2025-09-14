import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddWidget, WidgetType } from "./AddWidget";
import { WidgetTypeSelector } from "./WidgetTypeSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tables } from '@/types/supabase';

type WidgetData = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface AddWidgetDialogProps {
  dashboardId: string;
  onSave: () => void;
  widgets: WidgetData[];
}

type WizardStep = 'select_type' | 'set_name' | 'configure';

export const AddWidgetDialog = ({ dashboardId, onSave, widgets }: AddWidgetDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>('select_type');
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [widgetTitle, setWidgetTitle] = useState('');

  const resetWizard = () => {
    setStep('select_type');
    setSelectedType(null);
    setWidgetTitle('');
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(resetWizard, 300); // Reset after closing animation
    }
  };

  const handleTypeSelect = (type: WidgetType) => {
    setSelectedType(type);
    setWidgetTitle(`Nuevo Widget de ${type.replace('_', ' ')}`);
    setStep('set_name');
  };

  const handleNameSet = () => {
    if (widgetTitle.trim()) {
      setStep('configure');
    }
  };

  const handleSaveAndClose = () => {
    onSave();
    handleOpenChange(false);
  };
  
  const handleBack = () => {
    if (step === 'configure') {
      setStep('set_name');
    } else if (step === 'set_name') {
      setStep('select_type');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'select_type':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Paso 1: Selecciona el tipo de widget</DialogTitle>
            </DialogHeader>
            <WidgetTypeSelector onSelectType={handleTypeSelect} />
          </>
        );
      case 'set_name':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Paso 2: Dale un nombre a tu widget</DialogTitle>
            </DialogHeader>
            <div className="py-8">
              <Label htmlFor="widget-title">Título del Widget</Label>
              <Input 
                id="widget-title" 
                value={widgetTitle} 
                onChange={(e) => setWidgetTitle(e.target.value)}
                placeholder="Ej: Ventas Mensuales"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>Atrás</Button>
              <Button onClick={handleNameSet} disabled={!widgetTitle.trim()}>Siguiente</Button>
            </DialogFooter>
          </>
        );
      case 'configure':
        if (!selectedType || !widgetTitle) return null;
        return (
          <AddWidget
            onSave={handleSaveAndClose}
            onBack={handleBack}
            dashboardId={dashboardId}
            widgetType={selectedType}
            title={widgetTitle}
            widgets={widgets}
          />
        );
      default:
        return null;
    }
  };

  const getDialogClass = () => {
    if (step === 'select_type') return "max-w-2xl";
    if (step === 'set_name') return "max-w-lg";
    return "max-w-6xl w-full h-[80vh]"; // Changed from 4xl to 6xl
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Añadir Widget</Button>
      </DialogTrigger>
      <DialogContent className={getDialogClass()}>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};
