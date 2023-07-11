import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
  const [carData, setCarData] = useState({
    Car_Type: '',
    Location: '',
    Owner_Name: '',
    Owner_Email: '',
    Owner_Telephone: '',
    Charges_Per_Hour: '',
    Charges_Per_Day: '',
    Rental_Status: '',
    image: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setCarData({
      ...carData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any required fields are empty
    if (!carData.Car_Type || !carData.Location || !carData.Owner_Name || !carData.Owner_Email || !carData.Owner_Telephone || !carData.Charges_Per_Hour || !carData.Charges_Per_Day || !carData.Rental_Status || !carData.image) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4001/uploadcars', carData);
      console.log(response.data);

      // Clear the form
      setCarData({
        Car_Type: '',
        Location: '',
        Owner_Name: '',
        Owner_Email: '',
        Owner_Telephone: '',
        Charges_Per_Hour: '',
        Charges_Per_Day: '',
        Rental_Status: '',
        image: ''
      });

      // Reset the error message
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
      </div>
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadForm;
