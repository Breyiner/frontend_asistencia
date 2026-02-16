/**
 * Obtiene el valor de una cookie por nombre.
 * 
 * Parsea document.cookie que es un string como:
 * "cookie1=value1; cookie2=value2; cookie3=value3"
 * 
 * Proceso:
 * 1. Divide document.cookie por "; " → array de strings
 * 2. Divide cada string por "=" → [clave, valor]
 * 3. Busca la cookie con el nombre solicitado
 * 4. Retorna el valor decodificado
 * 
 * @function
 * @param {string} name - Nombre de la cookie a buscar
 * @returns {string} Valor de la cookie decodificado
 * 
 * @example
 * getCookie("access_token");
 * // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 * @example
 * getCookie("theme");
 * // "dark"
 */
export const getCookie = (name) => {

    // Obtiene todas las cookies como string
    let stringCookies = document.cookie;

    // Divide en array de cookies individuales
    // "a=1; b=2" → ["a=1", "b=2"]
    let arrayCookies = stringCookies.split("; ");

    // Variable para almacenar el valor encontrado
    let cookie = null;
    
    // Itera sobre cada cookie
    arrayCookies.forEach((elemento) => {

        // Divide cada cookie en clave y valor
        // "a=1" → ["a", "1"]
        let [key, value] = elemento.split('=');
        
        // Si la clave coincide con el nombre buscado (comparación ==)
        if(key == name) cookie = value;

    });

    // Decodifica el valor (las cookies se encodean con encodeURIComponent)
    // Maneja caracteres especiales como espacios, acentos, etc.
    return decodeURIComponent(cookie);
}