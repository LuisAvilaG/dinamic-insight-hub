
-- ========== POLÍTICA DE SELECCIÓN PARA LÍDERES EN LA TABLA DE APROBADORES ==========
--
-- ANÁLISIS DEL ERROR: La causa raíz del problema persistente es que la tabla `vacaciones_aprobadores`,
-- que define la jerarquía de líder-empleado, era completamente inaccesible (ni siquiera para lectura)
-- para cualquier usuario que no fuera 'Admin'. Esto impedía que el sistema pudiera verificar
-- que un líder es, de hecho, el aprobador de un empleado.
--
-- SOLUCIÓN: Esta política corrige el problema otorgando permiso de LECTURA (SELECT) en la tabla `vacaciones_aprobadores`.
-- La regla es simple: un usuario puede ver las filas de la tabla donde él mismo figura como el aprobador.
-- Esto permite que el resto de la lógica de seguridad funcione correctamente.

CREATE POLICY "Líderes pueden ver sus propias asignaciones de equipo"
ON public.vacaciones_aprobadores
FOR SELECT
USING (aprobador_user_id = auth.uid());
