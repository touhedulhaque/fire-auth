import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig)

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    photo: '',
    error: '',
    success: false
  })

  const provider = new firebase.auth.GoogleAuthProvider();
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
      .then(res => {
        const { displayName, photoURL, email } = res.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser)
        console.log(displayName, photoURL, email)

      })
      .catch(err => {
        console.log(err);
        console.log(err.message);

      })
  }

  const handleFbLogin= ()=>{
    firebase.auth().signInWithPopup(fbProvider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signedOutUser = {
          isSignedIn: false,
          name: '',
          email: '',
          password: '',
          photo: ''
        }
        setUser(signedOutUser)

      })
      .catch(err => {

      })
  }
  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);

    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if (isFieldValid) {
      // [...Cart, newItem]
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo)
    }
  }
  const handleSubmit = (e) => {
    // console.log(user.email, user.password)
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);

        })
        .catch(error => {
          // Handle Errors here.
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log('sign in user info', res.user);
         
        })
        .catch(function (error) {
          // Handle Errors here.
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  }

  const updateUserName = name => {
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    }).then(function () {
      // Update successful.
    }).catch(function (error) {
      // An error happened.
    });
  }
  return (
    <div className="main">
      <div className="margin">
        {
          user.isSignedIn ? <div class="wrap">
            <button class="button" onClick={handleSignOut}>Sign Out</button>
          </div>
            : <div class="wrap">
              <button class="button" onClick={handleSignIn}>Sign In</button>
            </div>
        } <br/>

        <button onClick={handleFbLogin} class="button">Sign in via Facebook</button>

        {
          user.isSignedIn && <div>
            <p>Welcome <strong>{user.name}</strong> </p>
            <p>Your Signed-In email: {user.email}</p>
            <img style={{ width: '150px', borderRadius: '100px' }} src={user.photo} alt="" />
          </div>
        }

        <h1>Our Own Authentication</h1>
        <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
        <label htmlFor="newUser">New User Sign Up</label><br />

        <form onSubmit={handleSubmit}>
          {newUser && <input type="text" name="name" onBlur={handleBlur} placeholder="User Name" />}<br />
          <input type="text" onBlur={handleBlur} name="email" placeholder="Email" required /><br />
          <input type="password" onBlur={handleBlur} name="password" placeholder="Password" required /><br />
          <input type="submit" value={newUser ? 'Sign up' : 'Sign in'} />
        </form>
        <p style={{ color: 'red' }}>{user.error}</p>
        {
          user.success && <p style={{ color: 'green' }}>User {newUser ? 'Created' : 'Logged In'} Successfully</p>
        }
      </div>

    </div>
  );
}

export default App;
