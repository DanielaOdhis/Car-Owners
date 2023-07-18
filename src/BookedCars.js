import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function BookedCars({ onBackClick, profileData, carData }) {
  const [bookedCars, setBookedCars] = useState([]);

  useEffect(() => {
    if (profileData && profileData.id) {
      fetchBookedCars(profileData.id);
    }
  }, [profileData]);

  const fetchBookedCars = async (owner) => {
    try {
      const userDetailsResponse = await axios.get(`http://localhost:3004/api/ownerDetails/${owner}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      const userDetails = userDetailsResponse.data;
  
      if (userDetails && userDetails.id) {
        const response = await axios.get(`http://localhost:3004/api/bookedCars/${owner}`);
        const bookedCars = response.data;

        const carIds = bookedCars.map((bookedCar) => bookedCar.car_id);

        const carsWithDetails = await Promise.all(
          carIds.map(async (bookedCar) => {
            const carDetailsResponse = await axios.get(`http://localhost:3004/api/cars/${bookedCar}`);
            const carDetails = carDetailsResponse.data;
            const userDetailsResponse = await axios.get(`http://localhost:3004/api/userDetails/${bookedCars[0].user_id}`);

            return {
              ...bookedCar,
              car_details: carDetails[0],
              user_details: userDetailsResponse.data,
              book_details: bookedCars[0],
            };
          })
        );

        setBookedCars(carsWithDetails);
      } else {
        console.error('Invalid user details:', userDetails);
      }
    } catch (error) {
      console.error('Error fetching booked cars:', error);
    }
  };

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
      <h1>Booked Cars</h1>
      {bookedCars.length > 0 ? (
        <div>
          <div className='booked-car-details'>
            {bookedCars.map((booking) => (
              <div className='booked' key={booking.car_details.Car_ID}>
                <h2>{booking.car_details.Car_Type}</h2>
                <img src={bufferToBase64(booking.car_details.image)} alt={booking.car_details.Car_Type} />
                <p><b>Client's User Name</b>: {booking.user_details.username}</p>
                <p><b>Client's Phone Number</b>: {booking.user_details.phoneNumber}</p>
                <p><b>Booking Date</b>: {booking.book_details.booking_date}</p>
                <p><b>Pickup Time</b>: {booking.book_details.pickup_time}</p>
              <button onClick={onBackClick}>Back</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="no-cars-message">No booked cars found.</p>
          <button onClick={onBackClick}>Back</button>
        </div>
      )}
    </div>
  );
}
