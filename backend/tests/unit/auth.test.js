const bcrypt = require('bcrypt');

describe('Authentication - Unit Tests', () => {
  test('password hashing works correctly', async () => {
    const password = 'userPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword).toContain('$2b$10$');
    
    const isValid = await bcrypt.compare(password, hashedPassword);
    expect(isValid).toBe(true);
  });

  test('password verification fails for wrong password', async () => {
    const password = 'userPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const isValid = await bcrypt.compare('wrongPassword', hashedPassword);
    expect(isValid).toBe(false);
  });
});