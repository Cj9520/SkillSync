import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

export const meta = () => {
  [
    { title: "SkillSync | Review" },
    { name: "description", content: "Detailed overview of your Resume" },
  ];
};

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPdfDirect, setIsPdfDirect] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    if(!isLoading &&  !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  },[isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      try {
        console.log('Loading resume data...');
        const resume = await kv.get(`resume:${id}`);
  
        if (!resume) {
          console.error('Resume not found');
          return;
        }
  
        const data = JSON.parse(resume);
        console.log('Resume data loaded:', data);
        
        // Check if we're using direct PDF viewing
        setIsPdfDirect(data.isPdfDirect || false);
  
        // Load the PDF
        const resumeBlob = await fs.read(data.resumePath);
        if (!resumeBlob) {
          console.error('Resume PDF not found');
          return;
        }
  
        // Create PDF blob and URL
        const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
        const resumeUrl = URL.createObjectURL(pdfBlob);
        setResumeUrl(resumeUrl);
        console.log('Resume URL set:', resumeUrl);
  
        // Load the preview image
        const imageBlob = await fs.read(data.imagePath);
        if (!imageBlob) {
          console.error('Preview image not found');
          return;
        }
        
        // Create image URL from blob
        const imageUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imageUrl);
        console.log('Image URL set:', imageUrl);
        
        // Set feedback data
        setFeedback(data.feedback);
        console.log('Feedback data loaded:', data.feedback);
        
        console.log('Resume data fully loaded:', { resumeUrl, imageUrl, feedback: data.feedback });
      } catch (error) {
        console.error('Error loading resume data:', error);
      }
    };
    
    loadResume();
  }, [id, fs, kv]);

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to HomePage
          </span>
        </Link>
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 max-sm:m-0 h-[90%] max-2xl:h-fit w-fit flex flex-col items-center">
              {/* Clean resume image display */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <img
                  src={imageUrl}
                  alt="Resume Preview"
                  className="max-h-[calc(100vh-120px)] object-contain"
                />
              </div>
              
              {/* Controls for PDF */}
              <div className="mt-4 flex justify-between items-center w-full">
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Open PDF in new tab
                </a>
                
                {/* Download button */}
                <a 
                  href={resumeUrl} 
                  download="resume.pdf" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </a>
              </div>
            </div>
          )}
        
        
        
        
        </section>


        <section className="feedback-section">
        <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
        {feedback ? (
          <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
            <Summary feedback={feedback}/>
            {/* Use the same score for ATS as the overall score for consistency */}
            <ATS score={feedback.overallScore || feedback.ATS.score || 0} suggestions={feedback.ATS.tips || [] }/>
            <Details feedback={feedback}/>
          </div>
        ):(
          <img src="/images/resume-scan-2.gif" className="w-full"/>
        )}
        </section>

      </div>
    </main>


  );
};

export default Resume;
