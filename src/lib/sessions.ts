/**
 * @file sessions.ts
 * @description Utilidades para gestionar la sesión del usuario en el almacenamiento local.
 * @author Fahibram Cárcamo
 */

/**
 * Llave con la que se guarda el token en el local storage.
 *
 * @author Fahibram Cárcamo
 */
const TOKEN_KEY = 'auth_token'

/**
 * Llave con la que se guardan los items del carrito de compras en el local storage.
 *
 * @author Fahibram Cárcamo
 */
const CART_KEY = 'cart_items'

/**
 * Guarda el token de autenticación en el localStorage.
 *
 * @param token - El token JWT retornado por la ruta de login.
 * @author Fahibram Cárcamo
 */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Obtiene el token de autenticación almacenado en el localStorage.
 *
 * @returns El token almacenado, o null si no existe.
 * @author Fahibram Cárcamo
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Elimina el token de autenticación del localStorage útil para cerrar sesión del usuario.
 *
 * @author Fahibram Cárcamo
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Guarda los items del carrito de compras en el localStorage.
 *
 * @param items - Array de items del carrito a persistir.
 * @author Fahibram Cárcamo
 */
export function saveCart(items: unknown[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

/**
 * Obtiene los items del carrito de compras almacenados en el localStorage.
 *
 * @returns Array de items del carrito, o un array vacío si no existe o el JSON es inválido.
 * @author Fahibram Cárcamo
 */
export function getCart(): unknown[] {
  const raw = localStorage.getItem(CART_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Elimina los items del carrito de compras del localStorage.
 *
 * @author Fahibram Cárcamo
 */
export function removeCart(): void {
  localStorage.removeItem(CART_KEY)
}
