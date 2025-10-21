import { type Editor } from '@ckeditor/ckeditor5-core';
import api from './api'; // Your configured axios instance

export class MyUploadAdapter {
  private loader: any;

  constructor(loader: any) {
    // The file loader instance to use during the upload.
    this.loader = loader;
  }

  // Starts the upload process.
  upload() {
    return this.loader.file
      .then((file: File) => new Promise((resolve, reject) => {
        const formData = new FormData();
        // 'upload' is the field name your Django backend will expect
        formData.append('upload', file); 

        // Send the file to your backend API endpoint
        api.post('images/upload/', formData) // Make sure this endpoint exists in Django
          .then(response => {
            // Check if the backend response has the expected URL
            if (response.data && response.data.url) {
              // Tell CKEditor the URL of the uploaded image
              resolve({ default: response.data.url }); 
            } else {
              reject('Invalid response from server');
            }
          })
          .catch(error => {
            console.error('CKEditor image upload error:', error);
            const errorMsg = error.response?.data?.error || 'Image upload failed';
            reject(errorMsg);
          });
      }));
  }

  // Aborts the upload process.
  abort() {
    // Handle cancellation if needed (e.g., using axios cancellation tokens)
  }
}