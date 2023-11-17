import React, { useEffect } from 'react';

const GoogleSignInButton = () => {
    const handleCredentialResponse = (response) => {
      console.log("Encoded JWT ID token: " + response.credential);
    };

    useEffect(() => {
      const initGoogleSignIn = () => {
        window.google.accounts.id.initialize({
          client_id: "181399207249-knbp77pe2roq3r7hrhajots12b64fa2v.apps.googleusercontent.com",
          callback: handleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("buttonDiv"),
          { theme: "outline", size: "large" }  // customization attributes
        );
        window.google.accounts.id.prompt(); // also display the One Tap dialog
      };

      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        // Load the Google Sign-In API script
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = initGoogleSignIn;
        document.body.appendChild(script);
      } else {
        initGoogleSignIn();
      }
    }, []); // Empty dependency array to run the effect only once on mount

    return (
      <div id="buttonDiv"></div>
    );
  }

  export default GoogleSignInButton;
