/**
 * Fallback PDF to image converter that uses direct HTML5 methods
 * instead of relying on complex PDF.js integration
 */

import type { PdfConversionResult } from './pdf2img';

export async function convertPdfToImageFallback(file: File): Promise<PdfConversionResult> {
    console.log('Starting fallback PDF conversion');
    
    try {
        // Create a more reliable fallback using an iframe with the PDF directly
        // This works in most modern browsers
        const iframe = document.createElement('iframe');
        const objectUrl = URL.createObjectURL(file);
        console.log('Created object URL for PDF:', objectUrl);
        
        // Set up iframe with the PDF
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px'; // Hide from view
        iframe.style.width = '800px'; 
        iframe.style.height = '1200px';
        iframe.src = objectUrl;
        
        // Add iframe to the document temporarily
        document.body.appendChild(iframe);
        
        // Wait for iframe to load
        await new Promise<void>((resolve) => {
            iframe.onload = () => resolve();
            // Set a reasonable timeout
            setTimeout(() => resolve(), 3000);
        });
        
        console.log('PDF iframe loaded');
        
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
