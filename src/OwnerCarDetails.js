import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OwnerCarDetails = ({ car, user, onBackClick }) => {
  const [ownerDetails, setOwnerDetails] = useState(null);

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3004/api/ownerDetails/${car.Owner_ID}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (response.data) {
          setOwnerDetails(response.data);
        }
      } catch (error) {
        console.error('Error fetching owner details:', error);
      }
    };

    fetchOwnerDetails();
  }, [car]);

  const bufferToBase64 = (buffer) => {
    if (!buffer || !buffer.data) {
      return '';
    }

    const bytes = new Uint8Array(buffer.data);
    const binary = bytes.reduce((str, byte) => str + String.fromCharCode(byte), '');
    const type = buffer.type.split('/')[1]; // Extract the file format from the MIME type
    const base64String = window.btoa(binary);
    return `data:image/${type};base64,${base64String}`;
  };

  return (
    <div>
      {car ? (
        <div className="selected-car-details">
          <h1>Car Details</h1>
          <img src={bufferToBase64(car.image)} alt={car.Car_Type} />
          <p>Availability Status: {car.Rental_Status}</p>
          <p>Price per Hour: {car.Charges_Per_Hour}$</p>
          <p>Price per Day: {car.Charges_Per_Day}$</p>
          <p>Location: {car.Location}</p>
          {ownerDetails && (
            <div>
              <h2>Owner Details</h2>
              <p>Owner Name: {ownerDetails.firstName}</p>
              <p>Email: {ownerDetails.email}</p>
              <p>Telephone: {ownerDetails.phoneNumber}</p>
            </div>
          )}
          <button onClick={onBackClick}>Back</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default OwnerCarDetails;
