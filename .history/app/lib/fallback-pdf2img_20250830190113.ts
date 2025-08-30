/**
 * Fallback PDF to image converter that doesn't rely on PDF.js
 * This is a simple alternative that treats the PDF as a generic image source
 */

import type { PdfConversionResult } from './pdf2img';

export async function convertPdfToImageFallback(file: File): Promise<PdfConversionResult> {
    try {
        // Create an object URL from the file
        const objectUrl = URL.createObjectURL(file);
        console.log('Created object URL for PDF:', objectUrl);
        
        // Create an image element to use as a drawing source
        const img = document.createElement('img');
        
        // Wait for the image to load
        const imageLoaded = new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load PDF as image'));
            
            // Set a timeout in case the image loading hangs
            setTimeout(() => reject(new Error('Timed out loading PDF as image')), 5000);
        });
        
        // Set the source to the PDF file (some browsers can render the first page)
        img.src = objectUrl;
        
        // Wait for the image to load
        await imageLoaded;
        console.log('Image loaded successfully');
        
        // Create a canvas to render the image
        const canvas = document.createElement('canvas');
        
        // Set dimensions 
        canvas.width = Math.min(800, img.width);
        canvas.height = Math.min(1000, img.height);
        
        // Get the drawing context
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        
        // Draw a white background (PDFs might have transparent background)
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        console.log('Image rendered to canvas');
        
        // Convert to blob
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    // Clean up the object URL
                    URL.revokeObjectURL(objectUrl);
                    
                    if (blob) {
                        console.log('Blob created, size:', blob.size);
                        // Create a File from the blob with the same name as the pdf
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        console.error('Failed to create blob from canvas');
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                'image/png',
                1.0
            );
        });
    } catch (err) {
        console.error('Fallback PDF conversion error:', err);
        return {
            imageUrl: "",
            file: null,
            error: `Fallback PDF conversion failed: ${err instanceof Error ? err.message : String(err)}`,
        };
    }
}
