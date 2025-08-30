import React from "react";
import { Link } from "react-router";
import ScoreCircle from "./ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath, isPdfDirect },
}: {
  resume: Resume;
}) => {


  const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [isPdf, setIsPdf] = useState(false);

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if(!blob) return;
            
            // Check if this is a PDF blob (for direct PDF display)
            const isPdfFile = blob.type === 'application/pdf' || isPdfDirect;
            setIsPdf(isPdfFile);
            
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        }

        loadResume();
    }, [imagePath, isPdfDirect]);






  return (
    <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
                    {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            {resumeUrl && (
                <div className="resume-preview-container animate-in fade-in duration-1000">
                    <div className="bg-white rounded-lg shadow-md p-2 w-full h-full">
                        {isPdf ? (
                            <iframe
                                src={resumeUrl}
                                title="Resume PDF"
                                className="w-full h-[350px] max-sm:h-[200px]"
                                style={{ border: 'none' }}
                            ></iframe>
                        ) : (
                            <img
                                src={resumeUrl}
                                alt="Resume Preview"
                                className="w-full h-[350px] max-sm:h-[200px] object-contain"
                            />
                        )}
                    </div>
                </div>
            )}
        </Link>
  )
}

export default ResumeCard;
