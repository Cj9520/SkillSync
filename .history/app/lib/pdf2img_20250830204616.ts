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
        // Use a more direct approach with fewer logs
        console.log('Loading PDF.js...');
        const pdfjs = await import('pdfjs-dist');
        
        // Use the pre-built worker from the public directory
        // This is more efficient than creating a blob worker
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        console.log('PDF.js worker set to:', pdfjs.GlobalWorkerOptions.workerSrc);
        
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
        // Add a delay to ensure PDF.js is properly loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Starting PDF conversion');
        const lib = await loadPdfJs();
        console.log('PDF.js loaded successfully');

        // Read the file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        console.log('File read as ArrayBuffer, size:', arrayBuffer.byteLength);
        
        // Load document - ensure we're using the correct method
        // Using the fake worker mode, so increase the timeout and disable worker usage
        const loadingTask = lib.getDocument({
            data: arrayBuffer,
            disableAutoFetch: true,  // Disable streaming to improve reliability
            disableStream: true,     // Disable streaming to improve reliability
            nativeImageDecoderSupport: 'none'  // Don't try to use native decoders
        });
        
        const pdf = await loadingTask.promise;
        console.log('PDF document loaded, pages:', pdf.numPages);
        
        // Get first page
        const page = await pdf.getPage(1);
        console.log('First page loaded');

        // Set viewport
        const viewport = page.getViewport({ scale: 1.5 });
        console.log('Viewport created:', viewport.width, 'x', viewport.height);
        
        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error('Could not create canvas context');
        }

        // Render page
        console.log('Rendering page to canvas');
        await page.render({ 
            canvasContext: context, 
            viewport 
        }).promise;
        console.log('Page rendered successfully');

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