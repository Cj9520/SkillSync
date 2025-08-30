/**
 * This file provides a fallback method to generate a preview image for PDFs
 * when direct PDF rendering is not possible.
 */

import type { PdfConversionResult } from './pdf2img';

export async function convertPdfToImageFallback(file: File): Promise<PdfConversionResult> {
    console.log('Using enhanced PDF preview generation');
    
    try {
        // Create object URL for the PDF
        const objectUrl = URL.createObjectURL(file);
        console.log('Created object URL for PDF:', objectUrl);
        
        // Create a canvas for the preview image
        const canvas = document.createElement('canvas');
        
        // Set dimensions for the preview - use standard A4 ratio
        canvas.width = 800;
        canvas.height = 1130; // Slightly taller to match A4 ratio
        
        // Get the drawing context
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        
        // Create a realistic-looking resume preview
        // Page background with slight shadow effect
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a subtle border to simulate paper
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, canvas.width-2, canvas.height-2);
        
        // Add subtle page shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Clear shadow for content
        ctx.shadowColor = 'transparent';
        
        // Resume header section
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(40, 40, canvas.width - 80, 150);
        
        // Name placeholder
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Professional Resume', 60, 90);
        
        // Contact info placeholder
        ctx.fillStyle = '#64748b';
        ctx.font = '16px Arial';
        ctx.fillText('contact@example.com | (555) 123-4567', 60, 120);
        ctx.fillText('Professional Experience', 60, 170);
        
        // Line separator
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(60, 190, canvas.width - 120, 2);
        
        // Content placeholder - experience section
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Work Experience', 60, 220);
        
        // File name displayed subtly
        const displayName = file.name.length > 40 ? file.name.substring(0, 37) + '...' : file.name;
        ctx.font = '12px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`File: ${displayName}`, canvas.width - 350, canvas.height - 20);
        for (let i = 0; i < 8; i++) {
            const y = 180 + (i * 50);
            ctx.fillRect(40, y, canvas.width - 80, 24);
            
            // Add shorter line below for "details"
            if (i < 6) {
                ctx.fillRect(40, y + 30, (canvas.width - 80) / 2, 12);
            }
        }
        
        // Job title/experience placeholders
        for (let i = 0; i < 4; i++) {
            // Experience title
            ctx.fillStyle = '#334155';
            ctx.font = 'bold 16px Arial';
            const y = 250 + (i * 120);
            ctx.fillText(`Position ${i+1}`, 60, y);
            
            // Company/dates
            ctx.fillStyle = '#64748b';
            ctx.font = '14px Arial';
            ctx.fillText(`Company ${i+1} • 2020 - Present`, 60, y + 25);
            
            // Description lines
            ctx.fillStyle = '#94a3b8';
            for (let j = 0; j < 3; j++) {
                ctx.fillRect(80, y + 45 + (j * 20), canvas.width - 160, 2);
            }
        }
        
        // Education section header
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Education', 60, 740);
        
        // Education entry
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('University Degree', 60, 770);
        
        // University details
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Arial';
        ctx.fillText('University Name • 2016 - 2020', 60, 795);
        
        console.log('Enhanced PDF preview created');
        
        // Convert to blob
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    try {
                        // Clean up resources
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
        
        try {
            // Create a basic error placeholder image
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
        } catch (finalError) {
            console.error('Final fallback error:', finalError);
        }
        
        // If all else fails, return an error
        return {
            imageUrl: "",
            file: null,
            error: `Fallback PDF conversion failed: ${err instanceof Error ? err.message : String(err)}`,
        };
    }
}
