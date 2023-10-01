import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const UploadForm = ({ user, fetchProfileData, onBackClick }) => {
  const [carData, setCarData] = useState({
    Car_Type: '',
    Location: '',
    Owner_ID: '',
    Car_ID: '',
    Charges_Per_Hour: '',
    Rental_Status: '',
    image: null,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
const navigate=useNavigate();

  const handleChange = (event) => {
    if (event.target.name === 'image') {
      setCarData({ ...carData, [event.target.name]: event.target.files[0] });
    } else {
      setCarData({ ...carData, [event.target.name]: event.target.value });
    }
    //event.preventDefault();
  };

  const handleUploadProgress = (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setUploadProgress(percentCompleted);
   // progressEvent.preventDefault();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleSubmit = async (e) => {
    //e.preventDefault();

    if (
      !carData.Car_Type ||
      !carData.Location ||
      !carData.Car_ID ||
      !carData.Charges_Per_Hour ||
      !carData.Rental_Status ||
      !carData.image
    ) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    const formData = new FormData();
    formData.append('Car_Type', carData.Car_Type);
    formData.append('Location', carData.Location);
    formData.append('Car_ID', carData.Car_ID);
    formData.append('Charges_Per_Hour', carData.Charges_Per_Hour);
    formData.append('Rental_Status', carData.Rental_Status);
    formData.append('image', carData.image);

    try {
      const response = await axios.get(`http://localhost:3004/api/ownerDetails/${user.email}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data && response.data.id) {
        formData.append('Owner_ID', response.data.id);
      } else {
        setErrorMessage('Failed to retrieve owner ID');
        return;
      }

      await axios.post('http://localhost:3004/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: handleUploadProgress,
      });

      setCarData({
        Car_Type: '',
        Location: '',
        Owner_ID: '',
        Car_ID: '',
        Charges_Per_Hour: '',
        Rental_Status: '',
        image: null,
      });

      setErrorMessage('');
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('Failed to submit form');
    }
  };

  useEffect((e) => {
    const fetchOwnerID = async () => {
      try {
        const response = await axios.get(`http://localhost:3004/api/ownerDetails/${user.email}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data && response.data.id) {
          setCarData((prevCarData) => ({
            ...prevCarData,
            Owner_ID: response.data.id,
          }));
        }
      } catch (error) {
        console.error('Error fetching owner ID:', error);
      }
    };
   // e.preventDefault();
    fetchOwnerID();
  }, [user]);

  const handleBack=()=>{
    onBackClick();
    navigate('/My-Cars');
  }

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <h1>Car Uploads</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div>
        <label>Car Type:</label>
        <input type="text" name="Car_Type" value={carData.Car_Type} onChange={handleChange} />
      </div>
      <div>
        <label>Location:</label>
        <input type="text" name="Location" value={carData.Location} onChange={handleChange} />
      </div>
      <div>
        <label>Car Plate:</label>
        <input type="text" name="Car_ID" value={carData.Car_ID} onChange={handleChange} />
      </div>
      <div>
        <label>Charges Per Hour:</label>
        <input
          type="number"
          step="0.01"
          name="Charges_Per_Hour"
          value={carData.Charges_Per_Hour}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Rental Status:</label>
        <select name="Rental_Status" value={carData.Rental_Status} onChange={handleChange}>
          <option value="">Select</option>
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>
      <div>
        <label>Image:</label>
        <input type="file" name="image" onChange={handleChange} />
      </div>
      <br />
      {carData.image && (
        <div>
          <img
            src={URL.createObjectURL(carData.image)}
            alt="Car"
            width={200}
            height={150}
            onLoad={handleImageLoad}
          />
          <br />
          {!imageLoaded && (
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}
        </div>
      )}
      <br />
      <button type="submit">Upload</button>
      <button onClick={handleBack}>Back</button>
    </form>
  );
};

export default UploadForm;
