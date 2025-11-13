const { validateReport } = require('../../utils/validation');  // This should work now

describe('Report Validation - Unit Tests', () => {
  describe('Valid Reports', () => {
    test('valid report with photos array', () => {
      const report = {
        description: 'Overflowing bins at market',
        userId: '507f1f77bcf86cd799439011',
        latitude: -1.2921,
        longitude: 36.8219,
        photos: ['photo1.jpg', 'photo2.jpg']
      };
      const result = validateReport(report);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('valid report with single photo field', () => {
      const report = {
        description: 'Illegal dumping site',
        userId: '507f1f77bcf86cd799439011',
        latitude: -1.3045,
        longitude: 36.8132,
        photo: 'dumping_photo.jpg'
      };
      const result = validateReport(report);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Invalid Reports', () => {
    test('reject report without any photos', () => {
      const report = {
        description: 'No photos provided',
        userId: '507f1f77bcf86cd799439011',
        latitude: -1.2921,
        longitude: 36.8219
      };
      const result = validateReport(report);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one photo is required');
    });

    test('reject report with empty description', () => {
      const report = {
        description: '',
        userId: '507f1f77bcf86cd799439011',
        latitude: -1.2921,
        longitude: 36.8219,
        photos: ['photo1.jpg']
      };
      const result = validateReport(report);
      expect(result.isValid).toBe(false);
    });

    test('reject report missing location coordinates', () => {
      const report = {
        description: 'Missing coordinates',
        userId: '507f1f77bcf86cd799439011',
        photos: ['photo1.jpg']
      };
      const result = validateReport(report);
      expect(result.isValid).toBe(false);
    });

    test('reject report with invalid latitude', () => {
      const report = {
        description: 'Invalid coordinates',
        userId: '507f1f77bcf86cd799439011',
        latitude: -100,
        longitude: 36.8219,
        photos: ['photo1.jpg']
      };
      const result = validateReport(report);
      expect(result.isValid).toBe(false);
    });
  });
});