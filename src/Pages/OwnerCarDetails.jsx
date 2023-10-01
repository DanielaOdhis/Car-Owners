import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateCars from './UpdateCars';
import {useNavigate, useLocation} from 'react-router-dom';

const OwnerCarDetails = ({ user, onBackClick, fetchCarDetails }) => {
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [car, setCar]= useState(null);

  const  userId=localStorage.getItem("loggedUser");
  const navigate=useNavigate();
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

  const fetchOwnerDetails = async (e) => {
    try {
      const response = await axios.get(`http://localhost:3004/api/ownerDetails/${userId}`, {
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
    //e.preventDefault();
  };

  useEffect(() => {
    fetchOwnerDetails();
    fetchOwnerCars();
  }, );

  const handleDelete = async (e) => {
    try {
      await axios.delete(`http://localhost:3004/api/cars/${carId}`);
      fetchCarDetails();
    } catch (error) {
      console.error('Error deleting car:', error);
    }
    //e.preventDefault();
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

  const handleBackClick=()=>{
    onBackClick();
    navigate('/My-Cars');
  }
  return (
    <div>
      {car ? (
        <div className="selected-car-details">
          <h2>{car.Car_Type}</h2>
          <img src={bufferToBase64(car.image)} alt={car.Car_Type} />
          <p>Availability Status: {car.Rental_Status}</p>
          <p>Price per Hour: {car.Charges_Per_Hour}$</p>
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
          <button onClick={handleBackClick}>Back</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <div className='update'>
        <UpdateCars />
      </div>
    </div>
  );
};

export default OwnerCarDetails;
