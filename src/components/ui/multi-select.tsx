
import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Button } from './button';

type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  }
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, placeholder = "Select options...", className, actionButton }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const handleSelect = (value: string) => {
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }
  };

  const filteredOptions = options.filter(option => 
    !selected.includes(option.value) && 
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <CommandPrimitive onKeyDown={(e) => {
      if (e.key === "Escape") setOpen(false);
    }} className="overflow-visible bg-transparent">
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {selected.map((value) => {
            const label = options.find(option => option.value === value)?.label;
            return (
              <Badge key={value} variant="secondary">
                {label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleUnselect(value)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            placeholder={placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
            value={inputValue}
            onValueChange={setInputValue}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandGroup className="h-full overflow-auto">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      handleSelect(option.value);
                      setInputValue("");
                    }}
                    className={"cursor-pointer"}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {actionButton && (
                <div className="p-1">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                            actionButton.onClick();
                            setOpen(false);
                        }}
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        {actionButton.label}
                    </Button>
                </div>
              )}
            </CommandList>
          </div>
        )}
      </div>
    </CommandPrimitive>
  );
};
