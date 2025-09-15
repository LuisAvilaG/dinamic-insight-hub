
// Usamos require para un script simple de Node.
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Leemos la configuración del cliente de Supabase directamente del archivo del proyecto.
const clientFileContent = fs.readFileSync('src/integrations/supabase/client.ts', 'utf-8');

// Extraemos la URL y la clave anónima usando expresiones regulares.
const urlMatch = clientFileContent.match(/const supabaseUrl =\s*['"](.+?)['"]/);
const keyMatch = clientFileContent.match(/const supabaseAnonKey =\s*['"](.+?)['"]/);

if (!urlMatch || !keyMatch) {
  console.error("No se pudo extraer la URL o la clave de Supabase del archivo client.ts");
  process.exit(1);
}

const supabaseUrl = urlMatch[1];
const supabaseAnonKey = keyMatch[1];

// Creamos una instancia del cliente de Supabase.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addWidget() {
  console.log("Añadiendo el widget de prueba al dashboard...");

  const dashboardId = 'e446e407-a59f-4d01-a5e2-f76adb39a459';
  const testWidgetId = 'e446e407-a59f-4d01-a5e2-f76adb39a459'; // El ID que me proporcionaste

  // Llamamos a la función RPC 'insert_widget'.
  const { error } = await supabase.rpc('insert_widget', {
    p_dashboard_id: dashboardId,
    p_widget_type_text: 'TEST', // Nuestro tipo de widget de prueba
    p_config: { title: 'Widget de Prueba Estático' }, // Configuración mínima
    p_layout: { x: 0, y: 0, w: 6, h: 4 } // Posición y tamaño en la cuadrícula
    // El ID se autogenerará, pero lo añadimos para identificarlo.
    // En una implementación real, el ID lo devuelve la DB.
  });

  if (error) {
    console.error("Error al insertar el widget:", error.message);
    // Intentemos con una actualización por si el widget ya existe con ese ID.
    console.log("Intentando actualizar un widget existente con el mismo ID...");
    const { error: updateError } = await supabase
      .from('report_widgets')
      .update({ 
          widget_type: 'TEST',
          config: { title: 'Widget de Prueba (Actualizado)' },
          layout: { x: 0, y: 0, w: 6, h: 4 }
      })
      .eq('id', testWidgetId);

      if (updateError) {
        console.error("Error también al actualizar:", updateError.message);
        process.exit(1);
      } else {
        console.log("¡Widget de prueba actualizado con éxito!");
      }
  } else {
    console.log("¡Widget de prueba insertado con éxito!");
  }
}

addWidget();
