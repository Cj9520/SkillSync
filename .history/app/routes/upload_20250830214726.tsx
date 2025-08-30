import {type FormEvent, useState, useEffect} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {convertPdfToImageFallback} from "~/lib/fallback-pdf2img";
import {createRealisticPdfPreview} from "~/lib/fast-pdf-preview";
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
            
            // Create a realistic preview image of the PDF
            setStatusText('Generating realistic PDF preview...');
            
            // Generate the preview using our dedicated function
            const result = await createRealisticPdfPreview(file);
            
            // Check if preview generation was successful
            if (!result.file || !result.imageUrl) {
                setStatusText('Error: Failed to generate preview image. Falling back to simple preview.');
                // Fallback to simpler method if needed
                try {
                    iframe.onload = resolve;
                    // Fallback timeout in case load event doesn't fire
                    setTimeout(resolve, 2000);
                });
                
                // Create a canvas for capturing the iframe content
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 1100;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Draw iframe content to canvas
                    try {
                        // Use html2canvas fallback if available
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Draw the PDF preview frame
                        ctx.fillStyle = '#f5f5f5';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Add some styling to make it look like a PDF
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
                        
                        // Add a subtle shadow
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                        ctx.shadowBlur = 15;
                        ctx.shadowOffsetX = 5;
                        ctx.shadowOffsetY = 5;
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(25, 25, canvas.width - 50, canvas.height - 50);
                        ctx.shadowBlur = 0;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        
                        // Add file name at the top
                        const displayName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
                        ctx.fillStyle = '#333333';
                        ctx.font = 'bold 18px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(displayName, canvas.width / 2, 60);
                        
                        // Draw a realistic resume layout
                        ctx.fillStyle = '#333333';
                        // Name area (large text at top)
                        ctx.font = 'bold 24px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('Resume', canvas.width / 2, 120);
                        
                        // Contact info line
                        ctx.font = '14px Arial';
                        ctx.fillText('contact@example.com | (555) 123-4567 | linkedin.com/in/username', canvas.width / 2, 150);
                        
                        // Horizontal rule
                        ctx.fillStyle = '#dddddd';
                        ctx.fillRect(50, 170, canvas.width - 100, 2);
                        
                        // Section headers and content blocks
                        const sections = ['PROFESSIONAL SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS'];
                        let yPos = 210;
                        
                        sections.forEach(section => {
                            // Section header
                            ctx.fillStyle = '#333333';
                            ctx.font = 'bold 16px Arial';
                            ctx.textAlign = 'left';
                            ctx.fillText(section, 50, yPos);
                            
                            // Horizontal rule
                            ctx.fillStyle = '#dddddd';
                            ctx.fillRect(50, yPos + 10, canvas.width - 100, 1);
                            
                            // Content placeholder
                            yPos += 40;
                            ctx.fillStyle = '#666666';
                            ctx.font = '12px Arial';
                            
                            // Add different content based on section
                            if (section === 'PROFESSIONAL SUMMARY') {
                                for (let i = 0; i < 3; i++) {
                                    ctx.fillRect(50, yPos + (i * 16), canvas.width - 100, 1);
                                }
                                yPos += 60;
                            } else if (section === 'EXPERIENCE') {
                                // Job title and date
                                ctx.fillStyle = '#333333';
                                ctx.font = 'bold 14px Arial';
                                ctx.fillText('Position Title', 50, yPos);
                                ctx.font = 'italic 12px Arial';
                                ctx.fillText('Company Name', 50, yPos + 20);
                                ctx.fillText('Jan 2020 - Present', canvas.width - 150, yPos + 20);
                                
                                // Bullet points
                                yPos += 40;
                                for (let i = 0; i < 3; i++) {
                                    ctx.fillStyle = '#333333';
                                    ctx.font = 'bold 14px Arial';
                                    ctx.fillText('•', 50, yPos + (i * 20));
                                    ctx.fillStyle = '#666666';
                                    ctx.font = '12px Arial';
                                    ctx.fillRect(65, yPos + (i * 20) - 4, canvas.width - 170, 1);
                                }
                                yPos += 80;
                            } else if (section === 'EDUCATION') {
                                ctx.fillStyle = '#333333';
                                ctx.font = 'bold 14px Arial';
                                ctx.fillText('Degree Name', 50, yPos);
                                ctx.font = 'italic 12px Arial';
                                ctx.fillText('University Name', 50, yPos + 20);
                                ctx.fillText('2015 - 2019', canvas.width - 150, yPos + 20);
                                yPos += 50;
                            } else if (section === 'SKILLS') {
                                ctx.font = '12px Arial';
                                const skills = ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5', 'Skill 6'];
                                let skillX = 50;
                                let skillY = yPos;
                                
                                skills.forEach((skill, i) => {
                                    if (i > 0 && i % 3 === 0) {
                                        skillY += 30;
                                        skillX = 50;
                                    }
                                    
                                    // Draw skill bubble
                                    const textWidth = ctx.measureText(skill).width + 20;
                                    
                                    // Draw rounded rectangle
                                    ctx.fillStyle = '#f0f0f0';
                                    ctx.beginPath();
                                    ctx.roundRect(skillX, skillY - 15, textWidth, 20, 10);
                                    ctx.fill();
                                    
                                    // Draw text
                                    ctx.fillStyle = '#333333';
                                    ctx.fillText(skill, skillX + 10, skillY);
                                    
                                    skillX += textWidth + 15;
                                });
                            }
                        });
                    } catch (renderErr) {
                        console.error('Error rendering PDF preview:', renderErr);
                        
                        // Fallback to simple styled preview
                        ctx.fillStyle = '#f8f9fa';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Add paper styling
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);
                        
                        // Add shadow effect
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                        ctx.shadowBlur = 20;
                        ctx.shadowOffsetX = 5;
                        ctx.shadowOffsetY = 5;
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(45, 45, canvas.width - 90, canvas.height - 90);
                        ctx.shadowBlur = 0;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        
                        // Header with file name
                        const displayName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
                        ctx.fillStyle = '#333333';
                        ctx.font = 'bold 20px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('Resume Preview', canvas.width / 2, 100);
                        ctx.font = '16px Arial';
                        ctx.fillText(displayName, canvas.width / 2, 130);
                        
                        // Placeholder content
                        for (let i = 0; i < 10; i++) {
                            const y = 180 + (i * 40);
                            ctx.fillStyle = '#e0e0e0';
                            ctx.fillRect(100, y, canvas.width - 200, 16);
                            
                            if (i % 3 === 0) {
                                ctx.fillStyle = '#d0d0d0';
                                ctx.fillRect(100, y - 30, 200, 20);
                            }
                        }
                    }
                }
                
                // Clean up
                URL.revokeObjectURL(pdfUrl);
                document.body.removeChild(tempDiv);
                
                return canvas;
            } catch (previewError) {
                console.error('Error creating PDF preview:', previewError);
                
                // Fallback to simple canvas
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 1100;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Create a basic preview
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Add a border
                    ctx.strokeStyle = '#dddddd';
                    ctx.lineWidth = 5;
                    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
                    
                    // Add file name
                    const displayName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
                    ctx.fillStyle = '#333333';
                    ctx.font = 'bold 24px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Resume', canvas.width / 2, 100);
                    ctx.font = '16px Arial';
                    ctx.fillText(displayName, canvas.width / 2, 130);
                }
                
                return canvas;
            }
            
            // Convert canvas to blob
            const blob = await new Promise<Blob | null>((resolve) => {
                // Use the canvas we created in the previous step
                const canvas = await canvasPromise;
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