function validateReport(report) {
  const errors = [];
  
  if (!report.description || report.description.trim() === '') {
    errors.push('Description is required');
  }
  
  if (!report.userId) {
    errors.push('User ID is required');
  }
  
  if (!report.latitude || !report.longitude) {
    errors.push('Location coordinates are required');
  }
  
  const hasPhotos = report.photos && report.photos.length > 0;
  const hasSinglePhoto = report.photo;
  
  if (!hasPhotos && !hasSinglePhoto) {
    errors.push('At least one photo is required');
  }
  
  if (report.latitude && (report.latitude < -90 || report.latitude > 90)) {
    errors.push('Invalid latitude value');
  }
  
  if (report.longitude && (report.longitude < -180 || report.longitude > 180)) {
    errors.push('Invalid longitude value');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

module.exports = { validateReport };