import {type FormEvent, useState, useEffect} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {convertPdfToImageFallback} from "~/lib/fallback-pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";


const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);

        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([file]);
        if(!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Processing PDF...');
        try {
            // Upload the PDF file as is
            setStatusText('Uploading PDF file...');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) {
                setStatusText('Error: Failed to upload file');
                return;
            }
            
            // Create a simple image representation of the PDF for thumbnails
            setStatusText('Generating PDF preview...');
            
            // Create a simple placeholder image
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 1100;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Create a nice-looking PDF preview
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
                
                // Create lines to represent content
                ctx.fillStyle = '#dee2e6';
                for (let i = 0; i < 8; i++) {
                    const y = 180 + (i * 50);
                    ctx.fillRect(40, y, canvas.width - 80, 24);
                    if (i < 6) {
                        ctx.fillRect(40, y + 30, (canvas.width - 80) / 2, 12);
                    }
                }
            }
            
            // Convert canvas to blob
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
            });
            
            if (!blob) {
                setStatusText('Error: Failed to generate preview image');
                return;
            }
            
            // Create an image file for the thumbnail
            const imageFile = new File([blob], file.name.replace(/\.pdf$/i, '') + '.png', { type: 'image/png' });
            
            // Upload the image
            setStatusText('Uploading the preview image...');
            const uploadedImage = await fs.upload([imageFile]);
            if(!uploadedImage) {
                setStatusText('Error: Failed to upload preview image');
                return;
            }

        setStatusText('Preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,  // This contains the actual PDF file
            imagePath: uploadedImage.path,  // This contains the preview image
            companyName, jobTitle, jobDescription,
            feedback: '',
            isPdfDirect: true  // Flag to indicate we're using direct PDF viewing
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        )
        if (!feedback) return setStatusText('Error: Failed to analyze resume');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting...');
        console.log(data);
        navigate(`/resume/${uuid}`);
        } catch (error) {
            console.error('Error during analysis:', error);
            setStatusText(`Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>








                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload