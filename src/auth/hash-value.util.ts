import bcrypt from 'bcryptjs';

export async function hashValue(value: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(value, salt);
  return hash as string;
}

export async function hashValueSync(value: string) {
  const salt = await bcrypt(10);
  const hash = await bcrypt.hash(value, salt);
  return hash as string;
}
