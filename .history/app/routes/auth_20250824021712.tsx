import { useEffect } from "react";
import { usePuterStore } from "~/lib/puter"
import { useLocation, useNavigate } from "react-router";

export const meta = () => {[
  {title: 'JobSync | Auth'},
  {name: 'description', content: 'Log into your account'},
]}


const Auth = () => {
  const {isLoading,auth} =usePuterStore();
  const loaction=useLocation();
  const next=loaction.search.split('next=')[1];
  const navigate=useNavigate();

//if the user is authenticated, navigate to the next page
//if the user is not authenticated, show the login page

  useEffect(()=>{

    if(auth.isAuthenticated) navigate(next)

  },[auth.isAuthenticated,next])



  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
      <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
        <div className="flex flex-col gap-2 text-center">
           <h1>Welcome</h1>
           <h2>Log in to Continue your job journey</h2>
        </div>

        <div>
          {isLoading ? (
            <button className="auth-button animate-pulse">
              <p>Sigining you in...</p>
            </button>
          ):(
            <>
              {auth.isAuthenticated? (
                <button className="auth-button" onClick={auth.signOut}>
                  <p>Logout</p>
                </button>
              ):(
                <button className="auth-button" onClick={auth.signIn}>
                  <p>Log In</p>
                </button>
              )
            }
            </>
          )}
        </div>

      </section>
    </main>
  )
}

export default Auth
