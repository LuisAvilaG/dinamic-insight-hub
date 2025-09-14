import * as React from "react";
import { cva } from "class-variance-authority";
import { CheckIcon, XIcon, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted:
          "inverted",
      },
    },
    defaultVariants: { 
      variant: "default",
    },
  }
)

interface MultiSelectProps extends React.PropsWithChildren {
  options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  variant?: "default" | "secondary" | "destructive" | "inverted";
  asChild?: boolean;
  className?: string;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, value, onChange, variant, asChild = false, className, placeholder = "Select options", ...props }, ref) => {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (selectedValue: string) => {
      onChange(value.filter((v) => v !== selectedValue));
    };

    // Close the popover when the user presses escape.
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("w-full justify-between", className)}
              onClick={() => setOpen(!open)}
            >
               <div className="flex gap-1 flex-wrap">
                {value.length > 0 ? (
                    value.map((val) => {
                        const option = options.find(opt => opt.value === val);
                        return (
                            <Badge
                                key={val}
                                className={cn("mr-1", multiSelectVariants({ variant }))}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnselect(val);
                                }}
                            >
                                {option ? option.label : val}
                                <XIcon className="ml-1 h-3 w-3" />
                            </Badge>
                        );
                    })
                ) : (
                    <span className="text-sm text-muted-foreground">{placeholder}</span>
                )}
            </div>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command className={className}>
            <CommandInput placeholder="Buscar columna..." />
            <CommandList>
              <CommandEmpty>No se encontraron columnas.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        if (isSelected) {
                          handleUnselect(option.value);
                        } else {
                          onChange([...value, option.value]);
                        }
                      }}
                    >
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                      )}>
                        <CheckIcon className={cn("h-4 w-4")} />
                      </div>
                      {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />} 
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {value.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onChange([])}
                      className="justify-center text-center"
                    >
                      Limpiar selección
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
        {props.children}
      </Popover>
    );
  }
);
