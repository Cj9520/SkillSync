/**
 * Optimized PDF previewer that doesn't rely on PDF.js
 * This creates a visually appealing resume preview quickly without the overhead of PDF parsing
 */

import type { PdfConversionResult } from './pdf2img';

/**
 * Creates a professional-looking resume preview for a PDF file without actually parsing the PDF
 * This is much faster than using PDF.js and works for quick preview purposes
 */
export async function createFastPdfPreview(file: File): Promise<PdfConversionResult> {
    console.log('Creating fast PDF preview');
    
    try {
        // Create a canvas for the preview
        const canvas = document.createElement('canvas');
        
        // Use standard dimensions
        canvas.width = 800;
        canvas.height = 1130;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        
        // Create a professional resume template
        // Page background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a subtle border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, canvas.width-2, canvas.height-2);
        
        // Add subtle page shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.shadowColor = 'transparent';
        
        // Display PDF name at the top
        const fileName = file.name.length > 40 ? file.name.substring(0, 37) + '...' : file.name;
        
        // Header section
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, 120);
        
        // PDF icon in header
        ctx.fillStyle = '#4263eb';
        ctx.fillRect(30, 30, 60, 60);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PDF', 60, 70);
        
        // PDF name
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(fileName, 110, 60);
        
        // File info
        const fileSize = (file.size / 1024).toFixed(1) + ' KB';
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Arial';
        ctx.fillText(`Size: ${fileSize}`, 110, 85);
        
        // Resume content preview
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('Resume Preview', 30, 160);
        
        // Draw a horizontal line
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(30, 180, canvas.width - 60, 2);
        
        // Experience section
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Work Experience', 30, 220);
        
        // Generate random experience entries
        for (let i = 0; i < 3; i++) {
            const y = 260 + (i * 120);
            
            // Job title
            ctx.fillStyle = '#334155';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`Position Title`, 50, y);
            
            // Company and dates
            ctx.fillStyle = '#64748b';
            ctx.font = '14px Arial';
            ctx.fillText(`Company Name • 2020 - Present`, 50, y + 25);
            
            // Description lines
            ctx.fillStyle = '#e2e8f0';
            for (let j = 0; j < 3; j++) {
                const lineY = y + 50 + (j * 20);
                const width = Math.random() * 300 + 300; // Random width for visual variety
                ctx.fillRect(50, lineY, width, 8);
            }
        }
        
        // Education section
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Education', 30, 650);
        
        // University
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('University Degree', 50, 690);
        
        // University details
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Arial';
        ctx.fillText('University Name • 2016 - 2020', 50, 715);
        
        // Skills section
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Skills', 30, 770);
        
        // Skill pills
        const skills = ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5', 'Skill 6'];
        let skillX = 50;
        let skillY = 800;
        
        ctx.font = '14px Arial';
        
        for (const skill of skills) {
            // Measure text width
            const metrics = ctx.measureText(skill);
            const width = metrics.width + 20;
            
            // If we'd overflow, move to next line
            if (skillX + width > canvas.width - 50) {
                skillX = 50;
                skillY += 40;
            }
            
            // Draw skill pill
            ctx.fillStyle = '#f1f5f9';
            ctx.beginPath();
            ctx.roundRect(skillX, skillY - 15, width, 30, 15);
            ctx.fill();
            
            // Draw skill text
            ctx.fillStyle = '#334155';
            ctx.fillText(skill, skillX + 10, skillY + 5);
            
            // Move to next position
            skillX += width + 10;
        }
        
        // Footer with current date
        const date = new Date().toLocaleDateString();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Generated: ${date}`, canvas.width - 30, canvas.height - 20);
        
        console.log('Fast PDF preview created');
        
        // Convert to blob and return
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        console.log('Preview blob created, size:', blob.size);
                        // Create a File from the blob
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        console.error('Failed to create preview blob');
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create preview image blob",
                        });
                    }
                },
                "image/png",
                0.9
            );
        });
    } catch (err) {
        console.error('Preview generation error:', err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to create preview: ${err instanceof Error ? err.message : String(err)}`,
        };
    }
}
