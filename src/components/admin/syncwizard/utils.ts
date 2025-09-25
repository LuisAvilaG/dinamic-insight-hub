// /components/wizards/add-sync/utils.ts

/**
 * Define los campos que son obligatorios y no pueden ser deseleccionados por el usuario.
 */
export const MANDATORY_FIELDS = new Set(['id', 'name', 'project', 'folder', 'space']);

/**
 * Lista de palabras comunes a ignorar al procesar los nombres de las listas.
 */
const STOP_WORDS = new Set(['de', 'la', 'el', 'a', 'y', 'for', 'the', 'and', 'in', 'on', 'with', 'at', 'by']);

/**
 * Palabras clave genéricas que, si se encuentran, impulsan a usar dos palabras para la clave del grupo.
 */
const GENERIC_KEYS = new Set(['project', 'report', 'informe', 'reporte']);

/**
 * Interfaz para definir la estructura de una lista de ClickUp.
 * (Añade más propiedades si las necesitas en otras partes de tu código).
 */
interface ClickUpList {
  id: string;
  name: string;
  [key: string]: any; // Permite otras propiedades que no hemos definido
}

/**
 * Interfaz para el resultado de agrupar las listas.
 */
interface ListGroup {
  typeName: string;
  count: number;
  lists: ClickUpList[];
  sampleListId: string;
}

/**
 * Limpia y divide el nombre de una lista en palabras clave relevantes.
 * @param name - El nombre de la lista.
 * @returns Un array de palabras clave en minúsculas.
 */
const getCleanKeywords = (name: string): string[] => {
    if (!name) return [];
    return name.toLowerCase()
               .replace(/[-_()]/g, ' ') // Reemplaza símbolos por espacios
               .split(' ')
               .filter(word => word && !STOP_WORDS.has(word)); // Filtra palabras vacías y stop words
};

/**
 * Agrupa un array de listas de ClickUp basándose en palabras clave comunes en sus nombres.
 * @param lists - Un array de objetos de lista de ClickUp.
 * @returns Un array de objetos ListGroup, donde cada uno representa una "plantilla" detectada.
 */
export const groupListsByName = (lists: ClickUpList[]): ListGroup[] => {
    if (!lists || lists.length === 0) return [];
    
    const groups = new Map<string, ClickUpList[]>();

    lists.forEach(list => {
        const keywords = getCleanKeywords(list.name);
        if (keywords.length === 0) return; // Si no hay palabras clave, se ignora la lista

        // Usa la primera palabra clave como clave, o las dos primeras si la primera es genérica
        let key = keywords[0];
        if (GENERIC_KEYS.has(key) && keywords.length > 1) {
            key = keywords.slice(0, 2).join(' ');
        }

        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)?.push(list);
    });

    // Convierte el mapa a un array con el formato requerido por la UI
    return Array.from(groups.entries()).map(([name, listArray]) => ({
        typeName: name,
        count: listArray.length,
        lists: listArray,
        sampleListId: listArray[0].id, // Usa la primera lista como muestra para obtener campos
    }));
};