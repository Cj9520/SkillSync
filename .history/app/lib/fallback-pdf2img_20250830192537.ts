/**
 * This file is maintained for backwards compatibility but is no longer used directly.
 * We now handle PDF display directly using iframe in the UI.
 */

import type { PdfConversionResult } from './pdf2img';

export async function convertPdfToImageFallback(file: File): Promise<PdfConversionResult> {
    console.log('Using direct PDF rendering approach');
    
    try {
        // Create object URL for the PDF
        const objectUrl = URL.createObjectURL(file);
        console.log('Created object URL for PDF:', objectUrl);
        
        // Create a canvas for a placeholder image
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1100;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not create canvas context');
        }
        
        // Store the PDF file directly, and we'll use the iframe to display it
        
        // Create a canvas to render the PDF
        const canvas = document.createElement('canvas');
        
        // Set dimensions for the screenshot
        canvas.width = 800;
        canvas.height = 1200;
        
        // Use html2canvas to capture the iframe content
        // This is a simple implementation that creates a basic image from whatever
        // the browser renders in the iframe
        
        // Get the drawing context
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        
        // Draw a white background first
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        try {
            // Try to draw the iframe contents to canvas (this is the best effort approach)
            // Note: this may not work perfectly in all browsers due to security restrictions
            if (iframe.contentDocument && iframe.contentDocument.body) {
                // We can't directly render DOM elements - this is just a placeholder
                // Create a more professional resume placeholder with the file name
                // Background
                ctx.fillStyle = '#f8f9fa';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Header area
                ctx.fillStyle = '#4263eb';
                ctx.fillRect(0, 0, canvas.width, 120);
                
                // Title
                ctx.fillStyle = 'white';
                ctx.font = 'bold 28px Arial';
                ctx.textAlign = 'left';
                ctx.fillText('Resume', 40, 70);
                
                // File name
                const displayName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
                ctx.font = '16px Arial';
                ctx.fillText(displayName, 40, 100);
                
                // Content placeholders (lines)
                ctx.fillStyle = '#dee2e6';
                for (let i = 0; i < 8; i++) {
                    const y = 180 + (i * 50);
                    ctx.fillRect(40, y, canvas.width - 80, 24);
                    
                    // Add shorter line below for "details"
                    if (i < 6) {
                        ctx.fillRect(40, y + 30, (canvas.width - 80) / 2, 12);
                    }
                }
                
                // Job title area
                ctx.fillStyle = '#e9ecef';
                ctx.fillRect(40, 140, canvas.width - 80, 24);
            } else {
                // Create a placeholder image with text
                ctx.fillStyle = 'black';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('PDF Preview', canvas.width / 2, canvas.height / 2);
                ctx.font = '16px Arial';
                ctx.fillText('(PDF conversion requires server-side processing)', canvas.width / 2, canvas.height / 2 + 30);
            }
        } catch (err) {
            console.error('Error rendering iframe to canvas:', err);
            
            // Create a placeholder image with text
            ctx.fillStyle = 'black';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PDF Preview', canvas.width / 2, canvas.height / 2);
        }
        
        console.log('Canvas created with PDF representation');
        
        // Convert to blob
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    try {
                        // Clean up resources
                        URL.revokeObjectURL(objectUrl);
                        document.body.removeChild(iframe);
                        
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
                    } catch (e) {
                        console.error('Error in blob creation:', e);
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Error in blob processing",
                        });
                    }
                },
                'image/png',
                1.0
            );
        });
    } catch (err) {
        console.error('Fallback PDF conversion error:', err);
        
        // Create a basic placeholder image instead of failing
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1100;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            // Draw a placeholder image with the PDF name
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'black';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`PDF: ${file.name}`, canvas.width / 2, canvas.height / 2);
            ctx.font = '18px Arial';
            ctx.fillText('Preview not available', canvas.width / 2, canvas.height / 2 + 40);
            
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });
                        
                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Fallback generation failed",
                        });
                    }
                }, 'image/png', 1.0);
            });
        }
        
        return {
            imageUrl: "",
            file: null,
            error: `Fallback PDF conversion failed: ${err instanceof Error ? err.message : String(err)}`,
        };
    }
}
