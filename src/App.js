import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OwnerCars from './Pages/OwnerCars.js';
import OwnerCarDetails from './Pages/OwnerCarDetails.js';
import Login from './Pages/login.js';
import Signup from './Pages/signup.js';
import Setting from './setting.png';
import Settings from './Pages/Settings.js';
import Profile from './Pages/Profile.js';
import UploadForm from './Pages/upload.js';
import BookedCars from './Pages/BookedCars.js';
import Forgot from './Pages/forgotPassword.js';
import NotFound from './Pages/NotFound.js';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
  const [showForgot, setShowForgot] = useState(false);

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
      setShowLoginForm(true);
      setIsLoggedIn(true);
      setUser({ email: formData.email });
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogin = async (formData) => {
    try {
      setShowLoginForm(false);
      setIsLoggedIn(true);
      setUser({ email: formData.email });
      //const response = await fetchProfileData(formData.email);
      onLogin(formData.email);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchProfileData = async (email) => {
    try {
      const response = await axios.get(`http://localhost:3004/api/ownerDetails/${email}`);
      setProfileData(response.data);
      localStorage.setItem('loggedUser', JSON.stringify(response.data.id));
    } catch (error) {
      console.error('Error fetching profile data:', error);
      throw error;
    }
  };

  const onLogin = (email) => {
    setIsLoggedIn(true);
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
    localStorage.removeItem('loggedInUser');
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

 /* const handleCarClick = (car) => {
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
  }; */

  const handleBookedCarsClick = () => {
    setShowBookedCars(true);
    setSelectedCar(null);
    setShowProfilePage(false);
    setShowOwnerCars(false);
    setShowSettings(false);
  };



  return (
    <BrowserRouter>
    <div>
     {/* {!isLoggedIn ? (
        <>
          {showLoginForm && !showForgot ? (
            <div className="login-form">
              <h1>Login</h1>
              <Login onLogin={handleLogin} />
              <p>
                Don't have an account? <button onClick={() => setShowLoginForm(false)}>Sign up</button>
              </p>
              <div onClick={handleForgot} className="forgot-container">
                <p>Forgot Password?</p>
              </div>
            </div>
          ) : (
            <>
              {showForgot ? (
                <div>
                <Forgot onBack={handleForgotLog} />
                </div>
              ) : (
                <div className="signup-form">
                  <h1>Sign Up</h1>
                  <Signup onSignUp={handleSignup} />
                  <p>
                    Already have an account? <button onClick={() => setShowLoginForm(true)}>Login</button>
                  </p>
                </div>
              )}
            </>
          )}
        </>
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
                  )}*/}
                 <div >
                 {isLoggedIn && (
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
                    <Routes>
                      <Route path='/' element={<Login onLogin={handleLogin} />} />
                      <Route path="/forgot-Password" element={<Forgot  />} />
                      <Route path="/signup" element={<Signup onSignUp={handleSignup} />} />
                      <Route path="/profile" element={<Profile user={user} profileData={profileData} isLoggedIn={isLoggedIn} onBackClick={handleBackClick} />} />
                      <Route path="/uploads" element={ <UploadForm
                    user={user}
                    fetchProfileData={fetchProfileData}
                    onBackClick={handleBackClick}
                  />} />
                  <Route path="/Booked-Cars" element={ <BookedCars
                    onBackClick={handleBackClick}
                    profileData={profileData}
                    user={user}
                  />} />
                  <Route path="My-Cars" element={ <OwnerCars
                  />} />
                  <Route path="Car-Details" element={<OwnerCarDetails
                    user={user}
                    onBackClick={handleBackClick}
                  />} />
                    <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
    </div>
    </BrowserRouter>
  );
};

export default App;
