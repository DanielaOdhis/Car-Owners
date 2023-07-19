import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OwnerCars from './OwnerCars.js';
import OwnerCarDetails from './OwnerCarDetails.js';
import Login from './login.js';
import Signup from './signup.js';
import Setting from './setting.png';
import Settings from './Settings.js';
import Profile from './Profile.js';
import UploadForm from './upload.js';
import BookedCars from './BookedCars.js';
import './App.css';

const App = () => {
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ email: '' });
  const [profileData, setProfileData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [showOwnerCars, setShowOwnerCars] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showBookedCars, setShowBookedCars] = useState(false);

  const handleBackClick = () => {
    setSelectedCar(null);
    setShowOwnerCars(true);
    setShowProfilePage(false);
    setShowSettings(false);
    setShowBookedCars(false);
    setShowUploadForm(false);
  };

  const handleSignup = async (formData) => {
    try {
      console.log('Signup form data:', formData);
      setShowLoginForm(true);
      setIsLoggedIn(true);
      setUser({ email: formData.email });
      console.log(formData);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogin = async (formData) => {
    try {
      console.log('Login form data:', formData);
      setShowLoginForm(false);
      setIsLoggedIn(true);
      setUser({ email: formData.email });
      console.log(formData);

      const response = await fetchProfileData(formData.email);
      console.log(response);
      onLogin(formData.email);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchProfileData = async (email) => {
    try {
      const response = await axios.get(`http://localhost:3004/api/ownerDetails/${email}`);
      setProfileData(response.data);
      console.log('Profile data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile data:', error);
      throw error;
    }
  };

  const onLogin = (email) => {
    console.log('User logged in:', email);
    fetchProfileData(email);
    setShowOwnerCars(true);
    setShowProfilePage(false);
    setShowBookedCars(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLoginForm(true);
    setUser(null);
    setProfileData(null);
    setShowOwnerCars(false);
    setShowBookedCars(false);
  };

  const handleDeleteAccount = () => {
    try {
      axios
        .delete(`http://localhost:3004/api/ownerDetails/${user.email}`)
        .then((response) => {
          console.log(response.data);
          handleLogout();
        })
        .catch((error) => {
          console.error('Error deleting user account:', error.response.data);
        });
    } catch (error) {
      console.error('Error deleting user account:', error);
    }
  };

  const handleProfileClick = () => {
    setShowProfilePage(true);
    setShowOwnerCars(false);
    setShowSettings(false);
    setShowBookedCars(false);
  };

  const handleClickOutsideDropdown = (event) => {
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton && !settingsButton.contains(event.target)) {
      setShowSettings(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutsideDropdown);
    return () => {
      document.removeEventListener('click', handleClickOutsideDropdown);
    };
  }, []);

  const handleCarClick = (car) => {
    setSelectedCar(car);
    setShowProfilePage(false);
    setShowBookedCars(false);
    setShowUploadForm(false);
    setShowSettings(false);
  };

  const handleShowUploadForm = () => {
    setShowUploadForm(true);
    setShowOwnerCars(false);
    setSelectedCar(null);
    setShowSettings(false);
    setShowBookedCars(false);
    setShowSettings(false);
  };

  const handleBookedCarsClick = () => {
    setShowBookedCars(true);
    setSelectedCar(null);
    setShowProfilePage(false);
    setShowOwnerCars(false);
    setShowSettings(false);
  };

  return (
    <div>
      {!isLoggedIn ? (
        showLoginForm ? (
          <div className="login-form">
            <h1>Login</h1>
            <Login onLogin={handleLogin} />
            <p>
              Don't have an account? <button onClick={() => setShowLoginForm(false)}>Sign up</button>
            </p>
          </div>
        ) : (
          <div className="signup-form">
            <h1>Sign Up</h1>
            <Signup onSignUp={handleSignup} />
            <p>
              Already have an account? <button onClick={() => setShowLoginForm(true)}>Login</button>
            </p>
          </div>
        )
      ) : (
        <div>
          {showProfilePage ? (
            <div>
              <Profile
                user={user}
                profileData={profileData}
                isLoggedIn={isLoggedIn}
                onBackClick={handleBackClick}
              />
            </div>
          ) : (
            <div>
              {showOwnerCars ? (
                selectedCar ? (
                  <OwnerCarDetails
                    car={selectedCar}
                    user={user}
                    onBackClick={handleBackClick}
                    profileData={profileData}
                  />
                ) : (
                  <OwnerCars
                    user={user}
                    onCarClick={handleCarClick}
                    profileData={profileData}
                    onShowUploadForm={handleShowUploadForm}
                    showUploadForm={showUploadForm}
                  />
                )
              ) : (
                showBookedCars ? (
                  <BookedCars
                    onBackClick={handleBackClick}
                    profileData={profileData}
                    user={user}
                  />
                ) : (
                  <UploadForm
                    user={user}
                    fetchProfileData={fetchProfileData}
                    onBackClick={handleBackClick}
                  />
                )
              )}

              {/* The Settings component is shown only if showOwnerCars is true */}
              {showOwnerCars && (
                <div className="settings-button" id="settings-button">
                  <button onClick={() => setShowSettings(!showSettings)}>
                    <img src={Setting} alt="Settings" />
                  </button>
                  {showSettings && (
                    <Settings
                      onLogout={handleLogout}
                      onProfileClick={handleProfileClick}
                      onBookedClick={handleBookedCarsClick}
                      onDeleteAccount={() => handleDeleteAccount(user.email)}
                      user={user}
                      onUpload={() => setShowOwnerCars(false)}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
