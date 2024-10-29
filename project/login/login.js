
document.querySelector(".AdminCode-up").value="omarvenom1234";
document.querySelector(".AdminCode-div").style.display="none";










/////* start firebase */////

import {docName, sendPasswordResetEmail ,getAuth ,createUserWithEmailAndPassword,sendEmailVerification ,signInWithEmailAndPassword ,signOut ,firebaseConfig,initializeApp ,getFirestore,getCountFromServer, collection, query, where, getDocs,getDoc, setDoc, updateDoc, addDoc, doc,deleteDoc,onSnapshot,orderBy, limit,startAt, startAfter,endAt  } from "../firebase.js";


firebase.initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = firebase.storage();

let X;

async function getCit(db,X) {
  const citiesCol = collection(db,`${X}`);
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
}
/*1*/



// let mainHostUrl = "http://localhost:3001";
let mainHostUrl = "https://saraha-5emt.onrender.com";






let signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User signed up", userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error.message);
      Swal.fire("Error signing up",error.message.slice(16),"error")
    }
};
  

  
let signOutUser = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
};
  




/*Start Sing In*/


document.querySelector(".btn-sign-in").addEventListener("click",async()=>{
    let email =  document.querySelector(".email-in").value;
    let password =  document.querySelector(".password-in").value;


    if (email.trim()!==""&&password.trim()!=="") {

        Swal.fire({
            title: 'Please Wait!',
            didOpen: () => {
              Swal.showLoading()
            }
        });

        /* start auth sign */


        try {
            let userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User signed in:", userCredential.user);

            let user = userCredential.user;
            if (user.emailVerified) {
              
              console.log("User signed in:", user);
              console.log(user.uid);






              const options = {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/9.3.3'},
                body: `{"idToken":"${user.accessToken}"}`
              };

              fetch(`${mainHostUrl}/auth/sign-in`, options)
              .then(response => {
                  if (!response.ok) {
                      // Handle HTTP errors
                      return response.json().then(errorData => {
                          // Log or process the error data
                          throw new Error(`HTTP error ${response.status}: ${errorData.message || response.statusText}`);
                      });
                  }
                  return response.json(); // Parse JSON if response is ok
              })
              .then(response => {
              
          
                  // Check if response contains a token
                  if (response.token) {
                      console.log(response);
                      let token = response.token;
          
                      // Save token to local storage
                      localStorage.setItem(`${docName}_token`, JSON.stringify(token));
          
                      // Redirect to another page
                      location.href = "../index.html?user="+user.uid;
                  } else {
                      // Handle missing token
                      throw new Error("Token not found in response");
                  }
              })
              .catch(err => {
                  // Handle both HTTP and network errors
                  console.error("Error:", err.message);
                  // Optionally, show an error message to the user
                  alert("An error occurred: " + err.message);
              });
          
            } else {

              console.log("Email not verified. Sending verification email.");
              await sendEmailVerification(user);
              console.log("Signed out unverified user. Verification email sent to:", user.email);
              Swal.fire("Your email is not verified", "Please check your email for the verification link","error");
            
            }


        } catch (error) {
            console.error("Error signing in:", error.message);
            Swal.fire(error.message.slice(22,-2),"","error")
        }


        /* end auth sign */


    } else {Swal.fire("","Enter Email And Password","error")}

});

/*End Sing In*/









/* start create account */

document.querySelector(".btn-sign-up").addEventListener("click",async()=>{
    let username = document.querySelector(".username-up").value.trim();
    let password = document.querySelector(".password-up").value.trim();
    let email = document.querySelector(".email-up").value.trim();
    let adminCodeUp = document.querySelector(".AdminCode-up").value.trim();

    if(username!=""&&password!=""&&email!=""&&adminCodeUp!="")
    {

        Swal.fire({
            title: 'Please Wait!',
            didOpen: () => {
              Swal.showLoading()
            }
        });

        let id = Math.floor(Math.random() * 1000000000000);


        /* start auth */

        let theObjectReq = {
            "username":username,
            "email":email,
            "password":password,
            "role":"user",
            "date":"2024/5/1",
            "numberToOrderBy":Date.now()
        }

        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/9.2.0','admincode': `${adminCodeUp}`},
            body: JSON.stringify(theObjectReq)
        };
          
        let responseStatus;
        fetch(`${mainHostUrl}/auth/register`, options)
            .then(response => {
                responseStatus = response.status; // Capture the status code
                return response.json().then(data => ({ status: response.ok, data })); // Combine status and data
            })
            .then(async (response) => {
                // console.log(response);
                // console.log(responseStatus);
        
                if (response.status) {
                    document.querySelector(".username-up").value = "";
                    document.querySelector(".password-up").value = "";
                    document.querySelector(".email-up").value = "";
                    document.querySelector(".AdminCode-up").value = "";
        
                    Swal.fire(
                        'Account has been Created',
                        'You Can Now Log In',
                        'success'
                    );
        
                    document.querySelector("#tab-1").click();
                } else {
                    
                    Swal.fire(
                        'Error',
                        `${response.data.error === undefined ? response.data.message : response.data.error}`,
                        'error'
                    );
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
                Swal.fire(
                    'Error',
                    'Something went wrong. Please try again later.',
                    'error'
                );
            });
        
        /* end auth */


    }else {
        Swal.fire("","Enter Username,Password, Email and admin Code ","error");
    };

});

/* end create account */

















/* start Forgot account Password account */

document.querySelector(".ForgotPassword").addEventListener("click",()=>{
    
    Swal.fire({
        title: ' Reset Password ',
        html: `
    
        <div class="mainForm" style="overflow-y: hidden; overflow-c: scroll; font-size: 19px!important; font-family: 'Cairo', sans-serif; font-weight: bold!important;">
        
            <label for="Email">Enter Your Email: </label>
            <input style="width: 98%;" class="InputSwal" type="text" dir="rtl" autocomplete="off" id="Email">

        </div>
        
        `,
        confirmButtonText: 'Ok',
        showCancelButton: true,
    }).then(async (result) => {

        
        if (result.isConfirmed) {


            let Email = document.querySelector("#Email").value.trim();
        

            if(Email!==""){

                Swal.fire({
                    title: 'Please Wait!',
                    didOpen: () => {
                      Swal.showLoading()
                    }
                })

                const options = {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'User-Agent': 'insomnia/9.3.3'},
                    body: `{"email":"${Email}"}`
                };
                  
                fetch(`${mainHostUrl}/auth/sendPasswordReset`, options)
                .then(response => response.json())
                .then(response => {
                    Swal.fire('',`${response.message}`,"info");
                    console.log(response.message)
                })
                .catch(err => console.error(err));



            };
        
        };

    });


});    



/* end Forgot account Password  */























// await getDoc(doc(db, "accounts", "L8tRIutxitBgha5OdTby")).then(e=>cs(e.data()))



