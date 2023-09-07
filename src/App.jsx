import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OwnerCars from './Pages/OwnerCars.jsx';
import OwnerCarDetails from './Pages/OwnerCarDetails.jsx';
import Login from './Pages/login.jsx';
import Signup from './Pages/signup.jsx';
//import Setting from './setting.png';
import Settings from './Pages/Settings.jsx';
import Profile from './Pages/Profile.jsx';
import UploadForm from './Pages/upload.jsx';
import BookedCars from './Pages/BookedCars.jsx';
import Forgot from './Pages/forgotPassword.jsx';
import NotFound from './Pages/NotFound.jsx';
import Chats from './Pages/chats.jsx';
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

  useEffect(() => {
    // Check if the user is logged in based on stored data
    const loggedInUser = localStorage.getItem('loggedUser');
    if (loggedInUser) {
      setIsLoggedIn(true);
      fetchProfileData(loggedInUser); // Fetch profile data for the logged-in user
    }
  }, []);
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
                 <div >
                 {isLoggedIn && (
                    <div className="settings-button" id="settings-button">
                      <button onClick={() => setShowSettings(!showSettings)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="26" viewBox="0 0 20 21" fill="none">
                        <path d="M16.2368 11.025C16.1103 10.8798 16.0405 10.6932 16.0405 10.5C16.0405 10.3068 16.1103 10.1202 16.2368 9.975L17.2474 8.82955C17.3587 8.7044 17.4279 8.54692 17.4449 8.37972C17.4619 8.21252 17.4259 8.04418 17.3421 7.89886L15.7632 5.14659C15.6802 5.00144 15.5539 4.88638 15.4022 4.81782C15.2505 4.74926 15.0812 4.73069 14.9184 4.76477L13.4342 5.06705C13.2454 5.10636 13.0487 5.07467 12.8815 4.97795C12.7142 4.88124 12.5879 4.72618 12.5263 4.54205L12.0447 3.08636C11.9918 2.92837 11.8909 2.79114 11.7563 2.69408C11.6217 2.59701 11.4602 2.54502 11.2947 2.54545H8.13684C7.96468 2.5364 7.79432 2.58437 7.65176 2.68205C7.50921 2.77972 7.4023 2.92172 7.34737 3.08636L6.90526 4.54205C6.84368 4.72618 6.71735 4.88124 6.55009 4.97795C6.38283 5.07467 6.18622 5.10636 5.99737 5.06705L4.47368 4.76477C4.31938 4.7428 4.16208 4.76734 4.02159 4.83528C3.8811 4.90323 3.76371 5.01155 3.68421 5.14659L2.10526 7.89886C2.01934 8.04256 1.9807 8.20995 1.99488 8.37711C2.00906 8.54426 2.07533 8.70262 2.18421 8.82955L3.18684 9.975C3.31341 10.1202 3.38321 10.3068 3.38321 10.5C3.38321 10.6932 3.31341 10.8798 3.18684 11.025L2.18421 12.1705C2.07533 12.2974 2.00906 12.4557 1.99488 12.6229C1.9807 12.79 2.01934 12.9574 2.10526 13.1011L3.68421 15.8534C3.76718 15.9986 3.89351 16.1136 4.0452 16.1822C4.19688 16.2507 4.36618 16.2693 4.52895 16.2352L6.01316 15.933C6.20201 15.8936 6.39862 15.9253 6.56588 16.022C6.73314 16.1188 6.85947 16.2738 6.92105 16.458L7.40263 17.9136C7.45756 18.0783 7.56447 18.2203 7.70703 18.318C7.84958 18.4156 8.01995 18.4636 8.1921 18.4545H11.35C11.5155 18.455 11.677 18.403 11.8115 18.3059C11.9461 18.2089 12.047 18.0716 12.1 17.9136L12.5816 16.458C12.6432 16.2738 12.7695 16.1188 12.9368 16.022C13.104 15.9253 13.3006 15.8936 13.4895 15.933L14.9737 16.2352C15.1365 16.2693 15.3057 16.2507 15.4574 16.1822C15.6091 16.1136 15.7354 15.9986 15.8184 15.8534L17.3974 13.1011C17.4812 12.9558 17.5172 12.7875 17.5001 12.6203C17.4831 12.4531 17.414 12.2956 17.3026 12.1705L16.2368 11.025ZM15.0605 12.0909L15.6921 12.8068L14.6816 14.5727L13.75 14.3818C13.1814 14.2647 12.5899 14.362 12.0878 14.6553C11.5858 14.9486 11.208 15.4174 11.0263 15.9727L10.7263 16.8636H8.70526L8.42105 15.9568C8.23936 15.4015 7.86162 14.9327 7.35953 14.6394C6.85744 14.3461 6.26596 14.2488 5.69737 14.3659L4.76579 14.5568L3.73947 12.7989L4.37105 12.083C4.75944 11.6454 4.97416 11.079 4.97416 10.492C4.97416 9.90505 4.75944 9.33865 4.37105 8.90114L3.73947 8.18523L4.75 6.43523L5.68158 6.62614C6.25017 6.74324 6.84165 6.64593 7.34374 6.35266C7.84583 6.05939 8.22357 5.59058 8.40526 5.03523L8.70526 4.13636H10.7263L11.0263 5.04318C11.208 5.59854 11.5858 6.06734 12.0878 6.36061C12.5899 6.65388 13.1814 6.7512 13.75 6.63409L14.6816 6.44318L15.6921 8.20909L15.0605 8.925C14.6765 9.36151 14.4645 9.92463 14.4645 10.508C14.4645 11.0913 14.6765 11.6544 15.0605 12.0909ZM9.71579 7.31818C9.09122 7.31818 8.48067 7.50479 7.96136 7.85441C7.44204 8.20404 7.03729 8.70097 6.79827 9.28237C6.55926 9.86377 6.49672 10.5035 6.61857 11.1207C6.74042 11.738 7.04118 12.3049 7.48282 12.7499C7.92446 13.1949 8.48714 13.4979 9.09971 13.6207C9.71229 13.7435 10.3472 13.6804 10.9243 13.4396C11.5013 13.1988 11.9945 12.791 12.3415 12.2677C12.6885 11.7445 12.8737 11.1293 12.8737 10.5C12.8737 9.65613 12.541 8.84682 11.9488 8.25011C11.3565 7.65341 10.5533 7.31818 9.71579 7.31818ZM9.71579 12.0909C9.4035 12.0909 9.09823 11.9976 8.83857 11.8228C8.57892 11.648 8.37654 11.3995 8.25703 11.1088C8.13753 10.8181 8.10626 10.4982 8.16718 10.1896C8.2281 9.88102 8.37848 9.59755 8.5993 9.37506C8.82012 9.15257 9.10147 9.00105 9.40775 8.93966C9.71404 8.87827 10.0315 8.90978 10.32 9.03019C10.6085 9.1506 10.8551 9.35451 11.0286 9.61614C11.2021 9.87776 11.2947 10.1853 11.2947 10.5C11.2947 10.9219 11.1284 11.3266 10.8323 11.6249C10.5362 11.9233 10.1346 12.0909 9.71579 12.0909Z" fill="white"/>
                      </svg>
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
                   <Route path="/chats" element={<Chats />} />
                    <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
    </div>
    </BrowserRouter>
  );
};

export default App;
