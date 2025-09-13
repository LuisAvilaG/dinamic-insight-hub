-- migrations/20251002130000_create_dashboard_rls_policies.sql

-- =====================================================================================
-- MIGRACIÓN PARA POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS)
-- FECHA: 2025-10-02
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Crear las políticas de RLS necesarias para que los usuarios autenticados
--            puedan gestionar dashboards y widgets. Sin estas políticas, las
--            operaciones de escritura (INSERT, UPDATE) son denegadas por defecto
--            cuando RLS está activado, causando un error de violación de política.
-- =====================================================================================

-- 1. Políticas para la tabla 'report_dashboards'
-- Permite a cualquier usuario autenticado realizar todas las operaciones (CRUD).
-- En una aplicación real, esto podría restringirse a roles de administrador específicos.
CREATE POLICY "Allow full access for authenticated users on dashboards"
ON be_exponential.report_dashboards
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Políticas para la tabla 'report_widgets'
-- Permite a cualquier usuario autenticado realizar todas las operaciones (CRUD).
CREATE POLICY "Allow full access for authenticated users on widgets"
ON be_exponential.report_widgets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
