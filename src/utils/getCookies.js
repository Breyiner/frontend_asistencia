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
  let arrayCookies = stringCookies.split("; ");

  // Variable para almacenar el valor encontrado
  let cookie = null;
  
  // Usa for...of + break (sale inmediatamente al encontrar)
  for (const elemento of arrayCookies) {
    let [key, value] = elemento.split('=');
    
    if (key === name) {
      cookie = value;
      break;
    }
  }

  // Manejo explícito de null
  if (cookie === null || cookie === undefined) {
    return "";
  }

  // Decodifica el valor
  return decodeURIComponent(cookie);
};
