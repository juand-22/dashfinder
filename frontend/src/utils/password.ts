const hashedPasswordPatterns = [
  // <algoritmo>$<salt>$<hash> (ej: SHA256$...$..., $SHA$...$..., $SHA512$...$...)
  /^\$?[A-Za-z0-9._-]+\$[^$]+\$[^$]+$/,
  // Formatos con prefijo de algoritmo (ej: $2a$10$..., $argon2id$..., $scrypt$...)
  /^\$[A-Za-z0-9]{1,16}\$/,
  // Hashes hexadecimales (MD5, SHA-1, SHA-256, SHA-384, SHA-512...)
  /^[a-f0-9]{32,}$/i,
];

// Los hashes almacenados no bajan de esta longitud (base64 de MD5 = 24,
// MD5 hex = 32, SHA-1 = 40, bcrypt = 60, SHA-256 = 64, argon2,
// <hex>:<salt>...), así que cualquier valor igual o más largo se considera
// hash aunque no coincida con un formato conocido.
const hashedPasswordMinLength = 24;

/**
 * Detecta si una contraseña almacenada corresponde a un hash.
 *
 * Util reutilizable por cualquier feature (buscador, dashmod, etc.).
 */
export function isHashedPassword(password: string | null) {
  return (
    password !== null &&
    (password.length >= hashedPasswordMinLength ||
      hashedPasswordPatterns.some((pattern) => pattern.test(password)))
  );
}
