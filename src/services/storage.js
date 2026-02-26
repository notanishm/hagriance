import { supabase, handleSupabaseError } from '../lib/supabase';

/**
 * Client-side file encryption using Web Crypto API
 * Files are encrypted before upload and decrypted after download
 */

// Secure random values generator
const secureRandom = (length) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};

// Derive encryption key from user password using PBKDF2
const deriveKey = async (password, salt) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Generate file checksum for integrity verification
const generateChecksum = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
};

// Magic bytes signatures for allowed file types
const FILE_SIGNATURES = {
  'pdf': [0x25, 0x50, 0x44, 0x46],
  'jpg': [0xFF, 0xD8, 0xFF],
  'jpeg': [0xFF, 0xD8, 0xFF],
  'png': [0x89, 0x50, 0x4E, 0x47],
};

// Validate file signature (magic bytes)
const validateFileSignature = async (file) => {
  const arrayBuffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const ext = file.name.toLowerCase().split('.').pop();
  
  const signature = FILE_SIGNATURES[ext];
  if (!signature) return false;
  
  return signature.every((byte, index) => bytes[index] === byte);
};

// Encrypt file using AES-256-GCM
export const encryptFile = async (file, userPassword) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const salt = secureRandom(16);
    const iv = secureRandom(12);
    const key = await deriveKey(userPassword, salt);
    const checksum = await generateChecksum(file);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      arrayBuffer
    );

    const encryptedPackage = {
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
      fileName: sanitizeFilename(file.name),
      fileType: file.type,
      fileSize: file.size,
      checksum,
      timestamp: Date.now(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(encryptedPackage)], {
      type: 'application/json',
    });

    return { blob, metadata: encryptedPackage, error: null };
  } catch (error) {
    console.error('Encryption error:', error);
    return { blob: null, metadata: null, error: error.message };
  }
};

// Decrypt file using AES-256-GCM
export const decryptFile = async (encryptedData, userPassword) => {
  try {
    let encryptedPackage;

    if (typeof encryptedData === 'string') {
      encryptedPackage = JSON.parse(encryptedData);
    } else {
      encryptedPackage = encryptedData;
    }

    const salt = new Uint8Array(encryptedPackage.salt);
    const iv = new Uint8Array(encryptedPackage.iv);
    const data = new Uint8Array(encryptedPackage.data);

    const key = await deriveKey(userPassword, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const file = new File([decrypted], encryptedPackage.fileName, {
      type: encryptedPackage.fileType,
    });

    return { file, metadata: encryptedPackage, error: null };
  } catch (error) {
    console.error('Decryption error:', error);
    return { file: null, metadata: null, error: 'Decryption failed. Wrong password?' };
  }
};

/**
 * File validation
 */
export const validateFile = async (file) => {
  const MAX_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only PDF, JPG, and PNG are allowed.' };
  }

  const ext = file.name.toLowerCase().split('.').pop();
  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: 'Invalid file extension' };
  }

  const validSignature = await validateFileSignature(file);
  if (!validSignature) {
    return { valid: false, error: 'File content does not match declared type' };
  }

  return { valid: true, error: null };
};

/**
 * Rate limiting for uploads (client-side tracking)
 */
const uploadHistory = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;

const checkRateLimit = (userId) => {
  const now = Date.now();
  const history = uploadHistory.get(userId) || [];
  const recentUploads = history.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentUploads.length >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: RATE_LIMIT_WINDOW - (now - recentUploads[0]) };
  }
  
  return { allowed: true, retryAfter: 0 };
};

const recordUpload = (userId) => {
  const history = uploadHistory.get(userId) || [];
  history.push(Date.now());
  uploadHistory.set(userId, history.slice(-100));
};

/**
 * Supabase Storage Service
 */
export const storageService = {
  async uploadFile(file, userId, fileType, userPassword) {
    try {
      const rateLimit = checkRateLimit(userId);
      if (!rateLimit.allowed) {
        return { data: null, error: `Rate limit exceeded. Retry after ${Math.ceil(rateLimit.retryAfter / 1000)}s` };
      }

      const validation = await validateFile(file);
      if (!validation.valid) {
        return { data: null, error: validation.error };
      }

      const { blob, metadata, error: encryptError } = await encryptFile(file, userPassword);
      if (encryptError) {
        return { data: null, error: encryptError };
      }

      const fileId = crypto.randomUUID();
      const sanitizedName = sanitizeFilename(file.name);
      const filePath = `${userId}/${fileType}/${fileId}.encrypted`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, blob, {
          contentType: 'application/json',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      recordUpload(userId);

      const { error: dbError } = await supabase.from('file_metadata').insert({
        id: fileId,
        user_id: userId,
        file_type: fileType,
        file_name: sanitizedName,
        file_size: file.size,
        original_type: file.type,
        storage_path: filePath,
        encrypted: true,
        uploaded_at: new Date().toISOString(),
        checksum: metadata.checksum,
      });

      if (dbError) {
        await supabase.storage.from('documents').remove([filePath]);
        throw dbError;
      }

      return { data: { fileId, path: filePath, metadata }, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async downloadFile(fileId, userPassword) {
    try {
      const { data: metadata, error: metaError } = await supabase
        .from('file_metadata')
        .select('*')
        .eq('id', fileId)
        .single();

      if (metaError) throw metaError;

      const { data: blob, error: downloadError } = await supabase.storage
        .from('documents')
        .download(metadata.storage_path);

      if (downloadError) throw downloadError;

      const text = await blob.text();
      const { file, metadata: decryptMeta, error: decryptError } = await decryptFile(text, userPassword);

      if (decryptError) {
        return { data: null, error: decryptError };
      }

      if (metadata.checksum && decryptMeta.checksum !== metadata.checksum) {
        return { data: null, error: 'File integrity check failed. File may be corrupted.' };
      }

      return { data: file, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async uploadFileUnencrypted(file, userId, fileType) {
    try {
      const validation = await validateFile(file);
      if (!validation.valid) {
        return { data: null, error: validation.error };
      }

      const fileId = crypto.randomUUID();
      const sanitizedName = sanitizeFilename(file.name);
      const ext = file.name.split('.').pop();
      const filePath = `${userId}/${fileType}/${fileId}.${ext}`;
      const checksum = await generateChecksum(file);

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { error: dbError } = await supabase.from('file_metadata').insert({
        id: fileId,
        user_id: userId,
        file_type: fileType,
        file_name: sanitizedName,
        file_size: file.size,
        original_type: file.type,
        storage_path: filePath,
        encrypted: false,
        uploaded_at: new Date().toISOString(),
        checksum,
      });

      if (dbError) throw dbError;

      return { data: { fileId, path: filePath }, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async listUserFiles(userId, fileType = null) {
    try {
      let query = supabase
        .from('file_metadata')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (fileType) {
        query = query.eq('file_type', fileType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async deleteFile(fileId, userId) {
    try {
      const { data: metadata, error: metaError } = await supabase
        .from('file_metadata')
        .select('storage_path, user_id')
        .eq('id', fileId)
        .single();

      if (metaError) throw metaError;
      if (metadata.user_id !== userId) {
        return { data: null, error: 'Unauthorized to delete this file' };
      }

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([metadata.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('file_metadata')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  async verifyFileIntegrity(fileId) {
    try {
      const { data: metadata, error } = await supabase
        .from('file_metadata')
        .select('checksum, storage_path')
        .eq('id', fileId)
        .single();

      if (error) throw error;

      const { data: blob, error: downloadError } = await supabase.storage
        .from('documents')
        .download(metadata.storage_path);

      if (downloadError) throw downloadError;

      const text = await blob.text();
      const parsed = JSON.parse(text);

      return {
        data: {
          isValid: parsed.checksum === metadata.checksum,
          storedChecksum: metadata.checksum,
          actualChecksum: parsed.checksum,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },
};

export default storageService;
