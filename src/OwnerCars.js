import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OwnerCars = ({ user, profileData, onCarClick, onShowUploadForm, showUploadForm }) => {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerCars = async () => {
      try {
        const response = await axios.get(`http://localhost:3004/api/cars/${profileData.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data && response.data.length > 0) {
          setCars(response.data);
        }
      } catch (error) {
        console.error('Error fetching owner cars:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnerCars();
  }, [profileData]);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (cars.length === 0) {
    return (
      <div>
        <p className='no-cars-message'>No cars found.</p>
        <button onClick={onShowUploadForm}>Click Here to get Started</button>
      </div>
    );
  }

  return (
    <div>
      <h1>My Cars</h1>
      <div className="grid-container">
        {cars.map((car, index) => (
          <div key={index} className="grid-item" onClick={() => onCarClick(car)}>
            <h2>{car.Car_Type}</h2>
            <img src={bufferToBase64(car.image)} alt={car.Car_Type} />
            <p>Availability Status: {car.Rental_Status}</p>
            <p>Price per Hour: {car.Charges_Per_Hour}$</p>
            <p>Price per Day: {car.Charges_Per_Day}$</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerCars;
