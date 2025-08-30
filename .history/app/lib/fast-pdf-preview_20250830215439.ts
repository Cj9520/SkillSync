/**
 * Fast PDF preview generator that creates realistic resume previews
 * without requiring full PDF.js rendering
 */
import type { PdfConversionResult } from './pdf2img';

export async function createRealisticPdfPreview(file: File): Promise<PdfConversionResult> {
  console.log('Creating realistic PDF preview');
  
  try {
    // Create canvas for realistic preview
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add page styling with shadow (similar to real PDF)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Add border
    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // Start drawing resume content based on standard format from the screenshots
    // Header section (name)
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FULL NAME', canvas.width / 2, 120);
    
    // Job title
    ctx.font = 'bold 16px Arial';
    ctx.fillText('SOFTWARE DEVELOPER', canvas.width / 2, 150);
    
    // Contact info
    ctx.font = '14px Arial';
    ctx.fillText('email@example.com | (555) 123-4567 | linkedin.com/in/username', canvas.width / 2, 180);
    
    // Divider line
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(100, 200, canvas.width - 200, 2);
    
    // Draw CONTACT section (left sidebar)
    ctx.fillStyle = '#555555';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('CONTACT', 80, 240);
    
    // Contact details
    const contactItems = ['Phone', 'Email', 'LinkedIn', 'Location'];
    contactItems.forEach((item, i) => {
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(item, 80, 270 + (i * 30));
      
      ctx.fillStyle = '#777777';
      ctx.font = '12px Arial';
      ctx.fillText(`Sample ${item.toLowerCase()} information`, 80, 285 + (i * 30));
    });
    
    // Draw EDUCATION section
    ctx.fillStyle = '#555555';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('EDUCATION', 80, 400);
    
    // University
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('University Name', 80, 430);
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Degree Title', 80, 450);
    
    // Year
    ctx.fillStyle = '#777777';
    ctx.font = '12px Arial';
    ctx.fillText('2019 - 2023', 80, 470);
    
    // Draw PROFILE section (right side)
    ctx.fillStyle = '#555555';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('PROFILE', 350, 240);
    
    // Profile paragraph (simulated lines)
    for (let i = 0; i < 4; i++) {
      const lineWidth = i === 3 ? (canvas.width - 430) / 2 : canvas.width - 430;
      ctx.fillStyle = '#dddddd';
      ctx.fillRect(350, 270 + (i * 20), lineWidth, 2);
    }
    
    // Draw PROJECT section
    ctx.fillStyle = '#555555';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('PROJECT', 350, 360);
    
    // Project entries
    const projectY = [390, 500];
    projectY.forEach((y, index) => {
      // Project name
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Project ${index + 1}`, 350, y);
      
      // Project duration
      ctx.fillStyle = '#777777';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`Jan 202${index + 3} - Aug 202${index + 3}`, canvas.width - 80, y);
      ctx.textAlign = 'left';
      
      // Project details (bullet points)
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('•', 350, y + 30 + (i * 20));
        
        ctx.fillStyle = '#dddddd';
        ctx.fillRect(370, y + 25 + (i * 20), canvas.width - 450, 2);
      }
    });
    
    // Draw SKILLS section
    ctx.fillStyle = '#555555';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('SKILLS', 350, 600);
    
    // Skills bubbles
    const skills = ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5', 'Skill 6'];
    let skillX = 350;
    let skillY = 630;
    
    skills.forEach((skill, i) => {
      if (i > 0 && i % 3 === 0) {
        skillY += 40;
        skillX = 350;
      }
      
      // Text width for bubble
      const textWidth = ctx.measureText(skill).width + 30;
      
      // Draw skill bubble
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath();
      ctx.roundRect(skillX, skillY - 20, textWidth, 26, 13);
      ctx.fill();
      
      // Draw skill text
      ctx.fillStyle = '#333333';
      ctx.font = '14px Arial';
      ctx.fillText(skill, skillX + 15, skillY);
      
      skillX += textWidth + 15;
    });
    
    // Add file name at the bottom
    const displayName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
    ctx.font = 'italic 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999999';
    ctx.fillText(displayName, canvas.width / 2, canvas.height - 50);
    
    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Preview blob created, size:', blob.size);
            // Create File from blob
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
        "image/png",
        0.95
      );
    });
  } catch (err) {
    console.error('PDF preview generation error:', err);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to create PDF preview: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
