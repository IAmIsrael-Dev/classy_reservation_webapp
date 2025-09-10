 
// Storage service for image uploads with Firebase integration
import {storage, isMockMode } from '../firebaseClient';

export type UploadProgressCallback = (progress: number) => void;

// Mock image URLs from Unsplash
const getRandomRestaurantImage = () => {
  const imageIds = [
    'photo-1517248135467-4c7edcad34c4', // Restaurant interior
    'photo-1555396273-367ea4eb4db5', // Restaurant exterior
    'photo-1414235077428-338989a2e8c0', // Fine dining
    'photo-1551218808-94e220e084d2', // Cafe interior
    'photo-1590846406792-0adc7f938f1d', // Modern restaurant
    'photo-1559329007-40df8822fe8e', // Cozy restaurant
  ];
  const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
  return `https://images.unsplash.com/${randomId}?w=800&q=80`;
};

// Upload single image
export const uploadImage = async (
  file: File,
  path: string,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  if (isMockMode()) {
    // Mock implementation
    return new Promise((resolve) => {
      console.log('Mock image upload:', file.name);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        onProgress?.(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          const mockUrl = getRandomRestaurantImage();
          console.log('✅ Mock image uploaded:', mockUrl);
          resolve(mockUrl);
        }
      }, 400);
    });
  }

  // Real Firebase implementation
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  try {
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
    
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('❌ Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('✅ Image uploaded successfully:', downloadURL);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error: unknown) {
    console.error('❌ Upload image error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
  }
};

// Upload restaurant images (backwards compatibility)
export const uploadRestaurantImage = (
  file: File,
  restaurantId: string,
  imageId: string,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const path = `restaurants/${restaurantId}/images/${imageId}`;
  return uploadImage(file, path, onProgress);
};

// Upload multiple restaurant images
export const uploadMultipleRestaurantImages = async (
  files: File[],
  restaurantId: string,
  onProgress?: (imageId: string, progress: number) => void
): Promise<string[]> => {
  console.log('Multiple image upload:', files.length, 'files');
  
  const uploadPromises = files.map((file, index) => {
    const imageId = `img_${index}_${Date.now()}`;
    
    return uploadRestaurantImage(
      file,
      restaurantId,
      imageId,
      (progress) => onProgress?.(imageId, progress)
    );
  });

  const urls = await Promise.all(uploadPromises);
  console.log('✅ All images uploaded:', urls.length);
  return urls;
};

// Mock delete restaurant image
export const deleteRestaurantImage = async (imageUrl: string): Promise<void> => {
  console.log('Mock image deletion:', imageUrl);
  await new Promise(resolve => setTimeout(resolve, 500));
};

// Validate image file before upload
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)'
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB'
    };
  }

  return { valid: true };
};