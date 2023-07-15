import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateCars from './UpdateCars';

const OwnerCarDetails = ({ car, user, onBackClick, profileData, fetchCarDetails }) => {
  const [ownerDetails, setOwnerDetails] = useState(null);

  const fetchOwnerDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3004/api/ownerDetails/${profileData.email}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data) {
        setOwnerDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching owner details:', error);
    }
  };

  useEffect(() => {
    fetchOwnerDetails();
  }, [profileData]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3004/api/cars/${car.Car_ID}`);
      fetchCarDetails();
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  const bufferToBase64 = (buffer) => {
    if (!buffer || !buffer.data) {
      return '';
    }

    const bytes = new Uint8Array(buffer.data);
    const binary = bytes.reduce((str, byte) => str + String.fromCharCode(byte), '');
    const type = buffer.type.split('/')[1];
    const base64String = window.btoa(binary);
    return `data:image/${type};base64,${base64String}`;
  };

  return (
    <div>
      {car ? (
        <div className="selected-car-details">
          <h1>Car Details</h1>
          <h2>{car.Car_Type}</h2>
          <img src={bufferToBase64(car.image)} alt={car.Car_Type} />
          <p>Availability Status: {car.Rental_Status}</p>
          <p>Price per Hour: {car.Charges_Per_Hour}$</p>
          <p>Price per Day: {car.Charges_Per_Day}$</p>
          <p>Location: {car.Location}</p>
          <p>Car Plate: {car.Car_ID}</p>
          {ownerDetails && (
            <div>
              <h2>Owner Details</h2>
              <p>Owner Name: {ownerDetails.firstName}</p>
              <p>Email: {ownerDetails.email}</p>
              <p>Telephone: {ownerDetails.phoneNumber}</p>
            </div>
          )}
          <button onClick={handleDelete}>Delete Car</button>
          <button onClick={onBackClick}>Back</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <div className='update'>
        <UpdateCars user={user} fetchProfileData={fetchOwnerDetails} onBackClick={onBackClick} />
      </div>
    </div>
  );
};

export default OwnerCarDetails;
