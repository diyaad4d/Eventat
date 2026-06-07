import api from './api';

// ─────────────────────────────────────────────────────────────
//  Upload Service
//  Endpoints: /vendor/profile/logo, /vendor/services/:id/images
//
//  NOTE: The backend currently stores files on local disk under
//  /uploads/. Cloudinary integration is Step 2.6.2.
//  These functions send multipart/form-data to the local upload
//  endpoints and return the stored /uploads/<filename> paths.
//
//  Use getImageUrl() to convert a stored path into a full URL
//  for use in <img src="..."> tags.
// ─────────────────────────────────────────────────────────────

/**
 * Upload a new vendor logo image.
 * Replaces the vendor's existing logo_url in vendor_profiles.
 * The backend saves the file and returns the new logo_url.
 * @param {File} file — File object from input[type=file]
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: { logo_url: string }
 * }>}
 */
export const uploadVendorLogo = (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return api
    .post('/vendor/profile/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};

/**
 * Upload one or more images for a vendor service.
 * Maximum 8 images total per service (enforced by the backend).
 * Accepts a single File or an array of File objects.
 * Each file is appended to the FormData under the field name 'images'.
 * @param {number} serviceId
 * @param {File | File[]} files
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: { images: Array<{ image_id: number, image_url: string, is_primary: boolean, sort_order: number }> }
 * }>}
 */
export const uploadServiceImages = (serviceId, files) => {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => formData.append('images', file));
  return api
    .post(`/vendor/services/${serviceId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};

/**
 * Delete a specific service image.
 * If the deleted image was the primary, the backend promotes the next image.
 * @param {number} serviceId
 * @param {number} imageId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteServiceImage = (serviceId, imageId) =>
  api.delete(`/vendor/services/${serviceId}/images/${imageId}`).then((res) => res.data);

/**
 * Build a full URL for a server-stored image path.
 * Returns null if path is falsy.
 * Returns the path unchanged if it is already a full URL (starts with 'http').
 * Otherwise prefixes with the server root (strips '/api' suffix from baseURL).
 *
 * Examples:
 *   getImageUrl('/uploads/abc123.jpg')
 *   → 'http://localhost:5000/uploads/abc123.jpg'
 *
 *   getImageUrl('https://res.cloudinary.com/...')
 *   → 'https://res.cloudinary.com/...'  (returned unchanged)
 *
 *   getImageUrl(null)  → null
 *
 * @param {string | null | undefined} path — e.g. '/uploads/abc123.jpg'
 * @returns {string | null}
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  // Already a full URL (Cloudinary, CDN, external) — return as-is
  if (path.startsWith('http')) return path;
  // Derive server root by stripping '/api' (with or without trailing slash)
  // from the Vite env variable so this works in all environments.
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
  const serverRoot = base.replace(/\/api\/?$/, '');
  return `${serverRoot}${path}`;
};
