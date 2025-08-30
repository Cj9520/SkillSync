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
        
        // Create image URL
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
            <div className="animate-in fade-in duration-1000 max-sm:m-0 h-[90%] max-2xl:h-fit w-fit mx-auto">
              {/* PDF Display with better UI */}
              <div className="relative bg-[#424242] rounded-lg shadow-xl p-4 w-[400px]">
                {/* PDF Viewer Toolbar */}
                <div className="flex justify-between items-center mb-2">
                  <div></div> {/* Empty space for alignment */}
                  <div className="flex space-x-2">
                    <a href={resumeUrl} download="resume.pdf" className="text-white p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                    <button className="text-white p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                    <button className="text-white p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* PDF Content - Using the image */}
                <div className="bg-white rounded-lg overflow-hidden">
                  <img 
                    src={imageUrl}
                    alt="Resume Preview" 
                    className="w-full h-auto object-contain border border-gray-200"
                  />
                </div>
                
                {/* PDF Controls - Bottom */}
                <div className="mt-4 flex justify-between items-center">
                  <a 
                    href={resumeUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white text-sm hover:underline"
                  >
                    Open original PDF
                  </a>
                </div>
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
