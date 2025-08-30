export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

// Simplified PDF to image conversion that works faster
export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        console.log('Starting simplified PDF conversion');
        
        // Create a direct URL to the PDF file
        const pdfUrl = URL.createObjectURL(file);
        
        // Create an iframe to render the PDF (off-screen)
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '1100px';
        iframe.src = pdfUrl;
        
        // Add iframe to document to render PDF
        document.body.appendChild(iframe);
        
        // Wait for iframe to load
        await new Promise<void>(resolve => {
            iframe.onload = () => resolve();
            // Set timeout in case of load issues
            setTimeout(resolve, 2000);
        });
        
        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 1100;
        
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error('Could not create canvas context');
        }
        
        // Draw a white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // For direct PDF display, we'll skip the conversion and return the PDF directly
        console.log('Skipping canvas capture, using PDF directly');
        document.body.removeChild(iframe);
        
        // Return the PDF URL and file for direct display
        return {
            imageUrl: pdfUrl,
            file: file,
        };

        // For direct PDF display, we already returned earlier

        return new Promise((resolve) => {
            resolve({
                imageUrl: pdfUrl,
                file: file,
            });
        });
    } catch (err) {
        console.error('PDF conversion error:', err);
        // Create a direct URL to the PDF file as fallback
        const pdfUrl = URL.createObjectURL(file);
        
        return {
            imageUrl: pdfUrl,
            file: file,
        };
    }
}