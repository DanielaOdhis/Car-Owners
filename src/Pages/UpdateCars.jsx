import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation} from 'react-router-dom';

const UpdateCars = () => {
  const [carData, setCarData] = useState({
    Car_ID: '',
    Car_Type: '',
    Location: '',
    Charges_Per_Hour: '',
    Rental_Status: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [car, setCar]=useState(false);

  const location=useLocation().search;
  const carId= new URLSearchParams(location).get("carId");

  const fetchOwnerCars = async (e) => {
    try {
      const response = await axios.get(`http://localhost:3004/api/cars/${carId}`);
      setCar(response.data[0]);
    } catch (error) {
      console.error('Error fetching owner cars:', error);
    }
    //e.preventDefault();
  };

  useEffect((e) => {
    fetchOwnerCars();
   // e.preventDefault();
  }, [carId]);

  useEffect((e) => {
    if (car) {
      setCarData({
        Car_ID: car.Car_ID,
        Car_Type: car.Car_Type,
        Location: car.Location,
        Charges_Per_Hour: car.Charges_Per_Hour,
        Rental_Status: car.Rental_Status,
      });
    };
    //e.preventDefault();
  }, [ car]);

  const handleChange = (event) => {
    if (event.target.name === 'image') {
      setCarData({ ...carData, image: event.target.files[0] });
    } else {
      setCarData({ ...carData, [event.target.name]: event.target.value });
    }
    //event.preventDefault();
  };

  const handleUploadProgress = (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setUploadProgress(percentCompleted);
    //progressEvent.preventDefault();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImage = async (e) => {
    //e.preventDefault();

    if (!carData.image) {
      setErrorMessage('Please upload an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', carData.image);

    try {
      await axios.put(`http://localhost:3004/api/cars/${carData.Car_ID}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: handleUploadProgress,
      });

      setCarData({ ...carData, image: null });
      setErrorMessage('');
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('Failed to submit form');
    }
  };

  const handleSubmit = async (e) => {
    //e.preventDefault();

    if (
      !carData.Car_ID ||
      !carData.Car_Type ||
      !carData.Location ||
      !carData.Charges_Per_Hour ||
      !carData.Rental_Status
    ) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    const formData = new FormData();
    formData.append('Car_ID', carData.Car_ID);
    formData.append('Car_Type', carData.Car_Type);
    formData.append('Location', carData.Location);
    formData.append('Charges_Per_Hour', carData.Charges_Per_Hour);
    formData.append('Rental_Status', carData.Rental_Status);

    try {
      await axios.put(`http://localhost:3004/api/cars/${carData.Car_ID}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCarData({
        Car_ID: '',
        Car_Type: '',
        Location: '',
        Charges_Per_Hour: '',
        Rental_Status: '',
      });

      setErrorMessage('');
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('Failed to submit form');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="update-cars-form">
        <h1>Update Car Details</h1>
        {errorMessage && <div className="error">{errorMessage}</div>}
        <div>
          <label>Car Plate:</label>
          <input type="text" name="Car_ID" defaultValue={carData.Car_ID} onChange={handleChange} />
        </div>
        <div>
          <label>Car Type:</label>
          <input type="text" name="Car_Type" defaultValue={carData.Car_Type} onChange={handleChange} />
        </div>
        <div>
          <label>Location:</label>
          <input type="text" name="Location" defaultValue={carData.Location} onChange={handleChange} />
        </div>
        <div>
          <label>Charges Per Hour:</label>
          <input
            type="number"
            step="0.01"
            name="Charges_Per_Hour"
            defaultValue={carData.Charges_Per_Hour}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Rental Status:</label>
          <select name="Rental_Status" defaultValue={carData.Rental_Status} onChange={handleChange}>
            <option defaultValue="">Select</option>
            <option defaultValue="Available">Available</option>
            <option defaultValue="Unavailable">Unavailable</option>
          </select>
        </div>
        <div>
          <br />
          <button type="submit">Update</button>
        </div>
      </form>

      <form onSubmit={handleImage} className="update-cars-form">
        <h2>Update Image</h2>
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
        <button type="submit">Upload Image</button>
      </form>
    </div>
  );
};

export default UpdateCars;
