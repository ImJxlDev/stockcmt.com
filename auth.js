
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyASSWp40LFfREeHTrYGVLwLs6Q6vxsqrpg",
    authDomain: "login-6099d.firebaseapp.com",
    projectId: "login-6099d",
    storageBucket: "login-6099d.firebasestorage.app",
    messagingSenderId: "235808835099",
    appId: "1:235808835099:web:00d23746d100ad0f395abe"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  

  const submit = document.getElementById('submit');
  submit.addEventListener("click",function (event) {
    event.preventDefault()
    alert(s)
  })
