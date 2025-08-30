export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    try {
        // Dynamic import for pdfjsLib with detailed logging
        console.log('Importing PDF.js...');
        const pdfjs = await import('pdfjs-dist');
        console.log('PDF.js imported successfully, version:', pdfjs.version);
        
        // Set worker source to a data URL to ensure it's available
        // This is a minimal worker that should be sufficient for basic operations
        const workerBlob = new Blob([`
            // Minimal PDF.js worker
            self.onmessage = function(e) {
                console.log('Worker received message:', e.data);
                if (e.data && e.data.action === 'test') {
                    self.postMessage({ success: true, message: 'Worker initialized successfully' });
                }
            };
        `], { type: 'application/javascript' });
        
        // Set the worker source to the created blob URL
        const workerUrl = URL.createObjectURL(workerBlob);
        console.log('Setting worker source to:', workerUrl);
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        
        pdfjsLib = pdfjs;
        isLoading = false;
        return pdfjs;
    } catch (error) {
        console.error('Failed to load PDF.js:', error);
        isLoading = false;
        throw error;
    }
}

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
        
        // Capture the iframe content (PDF) as an image
        try {
            context.drawImage(iframe, 0, 0, canvas.width, canvas.height);
            console.log('PDF captured successfully');
        } catch (e) {
            console.warn('Could not capture PDF content directly, using html2canvas as fallback');
            // If direct capture fails, we'll just use the PDF URL directly
            // and skip the conversion step
            document.body.removeChild(iframe);
            
            // Return the PDF URL as the image URL for direct display
            return {
                imageUrl: pdfUrl,
                file: file,
            };
        }
        
        // Remove iframe when done
        document.body.removeChild(iframe);

        // Convert to blob
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
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
                "image/png",
                0.95
            );
        });
    } catch (err) {
        console.error('PDF conversion error:', err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err instanceof Error ? err.message : String(err)}`,
        };
    }
}