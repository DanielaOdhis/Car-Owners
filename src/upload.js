import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
  const [carData, setCarData] = useState({
    Car_Type: '', Location: '', Owner_Name: '', Owner_Email: '', Owner_Telephone: '', Charges_Per_Hour: '', Charges_Per_Day: '', Rental_Status: '',image: null,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleChange = (event) => {
    if (event.target.name === 'image') {
      setCarData({ ...carData, [event.target.name]: event.target.files[0] });
    } else {
      setCarData({ ...carData, [event.target.name]: event.target.value });
    }
  };
  const handleUploadProgress = (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    setUploadProgress(percentCompleted);
  };
  const handleImageLoad = () => {
    setImageLoaded(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !carData.Car_Type ||!carData.Location ||!carData.Owner_Name ||!carData.Owner_Email ||!carData.Owner_Telephone ||!carData.Charges_Per_Hour ||!carData.Charges_Per_Day ||!carData.Rental_Status ||!carData.image
    ) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    const formData = new FormData();
    formData.append('Car_Type', carData.Car_Type);
    formData.append('Location', carData.Location);
    formData.append('Owner_Name', carData.Owner_Name);
    formData.append('Owner_Email', carData.Owner_Email);
    formData.append('Owner_Telephone', carData.Owner_Telephone);
    formData.append('Charges_Per_Hour', carData.Charges_Per_Hour);
    formData.append('Charges_Per_Day', carData.Charges_Per_Day);
    formData.append('Rental_Status', carData.Rental_Status);
    formData.append('image', carData.image);

    try {
      await axios.post('http://localhost:3004/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: handleUploadProgress,
      });

      // Clear the form
      setCarData({
        Car_Type: '', Location: '', Owner_Name: '', Owner_Email: '', Owner_Telephone: '', Charges_Per_Hour: '',Charges_Per_Day: '',Rental_Status: '',image: null,
      });

      setErrorMessage('');
    } catch (error) {
      console.error(error);
    }
  };

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
        <label>Owner Name:</label>
        <input type="text" name="Owner_Name" value={carData.Owner_Name} onChange={handleChange} />
      </div>
      <div>
        <label>Owner Email:</label>
        <input type="email" name="Owner_Email" value={carData.Owner_Email} onChange={handleChange} />
      </div>
      <div>
        <label>Owner Telephone:</label>
        <input type="tel" name="Owner_Telephone" value={carData.Owner_Telephone} onChange={handleChange} />
      </div>
      <div>
        <label>Charges Per Hour:</label>
        <input type="number" step="0.01" name="Charges_Per_Hour" value={carData.Charges_Per_Hour} onChange={handleChange} />
      </div>
      <div>
        <label>Charges Per Day:</label>
        <input type="number" step="0.01" name="Charges_Per_Day" value={carData.Charges_Per_Day} onChange={handleChange} />
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
      </div><br/>
      {carData.image && (
        <div>
          <img
            src={URL.createObjectURL(carData.image)}
            alt="Car"
            width={200}
            height={150}
            onLoad={handleImageLoad}
          /><br />
          {!imageLoaded && (
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      <br />
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadForm;
