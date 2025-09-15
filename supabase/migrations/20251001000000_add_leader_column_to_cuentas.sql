-- Añade la columna "Líder" a la tabla "Cuentas" para definir la jerarquía.
ALTER TABLE public."Cuentas"
ADD COLUMN "Líder" UUID;

-- Añade una clave foránea para asegurar que el "Líder" sea un usuario válido.
-- Si un líder es eliminado, el campo "Líder" de sus subordinados se establecerá como nulo.
ALTER TABLE public."Cuentas"
ADD CONSTRAINT fk_lider_user_id
FOREIGN KEY ("Líder")
REFERENCES public."Cuentas"(user_id)
ON DELETE SET NULL;
