const hashedPasswordPatterns = [
  // <algoritmo>$<salt>$<hash> (ej: SHA256$...$..., $SHA$...$..., $SHA512$...$...)
  /^\$?[A-Za-z0-9._-]+\$[^$]+\$[^$]+$/,
  // Formatos con prefijo de algoritmo (ej: $2a$10$..., $argon2id$..., $scrypt$...)
  /^\$[A-Za-z0-9]{1,16}\$/,
  // Hashes hexadecimales (MD5, SHA-1, SHA-256, SHA-384, SHA-512...)
  /^[a-f0-9]{32,}$/i,
];


const hashedPasswordMinLength = 24;


export function isHashedPassword(password: string | null) {
  if (password === null) {
    return false;
  }

  return (
    password.length >= hashedPasswordMinLength ||
    hashedPasswordPatterns.some((pattern) => pattern.test(password))
  );
}


export function computeHashedPassword(records: { password: string | null }[]) {
  return records.some(
    (record) => record.password !== null && !isHashedPassword(record.password),
  );
}
