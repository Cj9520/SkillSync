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
  const navigate = useNavigate();

  useEffect(()=>{

    if(!isLoading &&  !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);

  },[isLoading])




  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);

      if (!resume) return;

      const data = JSON.parse(resume);

      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;

      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);

      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
      setFeedback(data.feedback);

      console.log({resumeUrl,imageUrl, feedback:data.feedback})
    };
  loadResume();
  }, [id]);

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
        <section className="feedback-section bg-[url('/images/bg-small.svg) bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl &&(
          <div className="animate-in fade-in duration-1000 gradient-boarder max-sm:m-0 h-[90%] max-2xl:h-fit w-fit">
            {/* Show both PDF viewer and image preview */}
            <div className="relative">
              {/* PDF iframe for actual content viewing */}
              <iframe
                src={resumeUrl}
                className="w-full h-[600px] rounded-2xl"
                title="Resume PDF"
                style={{border: 'none'}}
              ></iframe>
              
              {/* Fallback to image if iframe doesn't work */}
              <div className="mt-4">
                <a href={resumeUrl} target="blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Open PDF in new tab
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
