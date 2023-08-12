import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import {useNavigate } from 'react-router-dom';

export default function BookedCars() {
  const [bookedCars, setBookedCars] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [totalBill, setTotalBill] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("loggedUser");
  const navigate=useNavigate();

  useEffect(() => {
    if (userId) {
      fetchBookedCars(userId);
    }
  }, );

  useEffect(() => {
    if (selectedBooking) {
      setBookedCars(prevBookedCars =>
        prevBookedCars.map(booking =>
          booking.id === selectedBooking.id ? { ...booking, } : booking
        )
      );
    }
  }, [selectedBooking]);

  const fetchBookedCars = async () => {
    try {
      const userDetailsResponse = await axios.get(`http://localhost:3004/api/ownerDetails/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const userDetails = userDetailsResponse.data;

      if (userDetails && userDetails.id) {
        const response = await axios.get(`http://localhost:3004/api/bookedCars/${userId}`);
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
        setLoading(false);
      } else {
        console.error('Invalid user details:', userDetails);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching booked cars:', error);
      setLoading(false);
    }
  };

  const deleteBookedCar = async (id) => {
    try {
      const carToDelete = bookedCars.find((car) => car.id === id);

      const response = await axios.delete(`http://localhost:3004/api/bookedCars/${carToDelete.book_details.id}`);

      if (response.status === 200) {
        try {
          await axios.put(`http://localhost:3004/api/cars/${carToDelete.car_details.Car_ID}`, {
            Rental_Status: 'Available',
          });
          console.log('Availability status updated successfully.');
        } catch (error) {
          console.error('Error updating availability status:', error);
        }
        console.log('Booking canceled successfully.');
        fetchBookedCars(userId);
      } else {
        console.error('Error canceling booking:', response.statusText);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
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

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmation(true);
  };

  const confirmCancel = () => {
    setShowConfirmation(false);
    if (selectedBooking) {
      deleteBookedCar(selectedBooking.id);
      setSelectedBooking(null);
    }
  };

  const cancelCancel = () => {
    setShowConfirmation(false);
    setSelectedBooking(null);
  };

  const handleStartTimer = async () => {
    console.log("Timer Starting");
    if (!isTimerRunning) {
      const response = await axios.get(`http://localhost:3004/api/bookedCars/${userId}`);
      let existingTotalTime = response.data[0].total_time || 0;
      let newTotalTime = existingTotalTime;
      if (typeof existingTotalTime !== "number" || isNaN(existingTotalTime)) {
        existingTotalTime = 0;
        newTotalTime = existingTotalTime;
      }

      const startTime = moment().format('YYYY-MM-DD HH:mm:ss');
      console.log("Time", startTime);

      try {
        const response = await axios.get(`http://localhost:3004/api/bookedCars/${userId}`);
        console.log(response.data);
        await axios.put(`http://localhost:3004/api/bookings/${response.data[0].id}`, {
          start_time: startTime,
          total_time: newTotalTime / 3600,
        });
        console.log("Timer successfully updated in the database!");
      } catch (error) {
        console.error('Error posting time data:', error);
      }
      const interval = setInterval(updateDisplay, 1000);
      setIntervalId(interval);
      setIsTimerRunning(true);
    }
  };

  const continueTimer = async () => {
    if (!isTimerRunning) {
      const response = await axios.get(`http://localhost:3004/api/bookedCars/${userId}`);
      const bookedCar = response.data[0];
      console.log(bookedCar.start_time)
      let existingTotalTime = bookedCar.total_time || 0;

      let newTotalTime = existingTotalTime;
      if (typeof existingTotalTime !== "number" || isNaN(existingTotalTime)) {
        existingTotalTime = 0;
        newTotalTime = existingTotalTime;
      }

      const start_time = moment(bookedCar.start_time);
      const currentTime = moment();
      const timeElapsed = currentTime.diff(start_time, 'seconds');
      newTotalTime += timeElapsed / 3600;

      try {
        await axios.put(`http://localhost:3004/api/bookings/${bookedCar.id}`, {
          start_time: start_time.format('YYYY-MM-DD HH:mm:ss'), // Convert back to the database format
          total_time: newTotalTime,
        });
        console.log('Timer successfully updated in the database!');

        const cars = await axios.get(`http://localhost:3004/api/cars/${bookedCar.car_id}`);
        const bill = cars.data[0].Charges_Per_Hour * (newTotalTime - 1);
        setTotalBill(bill);
      } catch (error) {
        console.error('Error posting time data:', error);
      }

      const interval = setInterval(updateDisplay, 1000);
      setIntervalId(interval);
      setIsTimerRunning(true);
    }
  };

  const handleStopTimer = async () => {
    console.log("Timer Stopping");
    if (isTimerRunning) {
      clearInterval(intervalId);
      setIntervalId(null);
      try {
        const response = await axios.get(`http://localhost:3004/api/bookedCars/${userId}`);
        const cars = await axios.get(`http://localhost:3004/api/cars/${response.data[0].car_id}`);
        const start_time = moment(response.data[0].start_time); // Parse the stored start time as a local moment object
        const currentTime = moment(); // Current local time
        const timeElapsed = currentTime.diff(start_time, 'seconds'); // Calculate the elapsed time in seconds
        const existingTotalTime = response.data[0].total_time || 0;
        const totalTime = (existingTotalTime + timeElapsed) / 3600; // Convert the total elapsed time to hours
  
        await axios.put(`http://localhost:3004/api/bookings/${response.data[0].id}`, {
          start_time: start_time.format('YYYY-MM-DD HH:mm:ss'), // Convert back to the database format
          total_time: totalTime,
        });
        console.log('Timer stopped and updated in the database.');
  
        const bill = cars.data[0].Charges_Per_Hour * (totalTime - 1);
        setTotalBill(bill);
      } catch (error) {
        console.error('Error posting time data:', error);
      }
  
      setIsTimerRunning(false);
      setElapsedTime(0);
    }
  };

  const updateDisplay = async () => {
    const response = await axios.get(`http://localhost:3004/api/bookedCars/${userId}`);
    const cars = await axios.get(`http://localhost:3004/api/cars/${response.data[0].car_id}`);
    const start_time = moment(response.data[0].start_time); // Parse the stored start time as a local moment object
    const currentTime = moment(); // Current local time
    const timeElapsed = currentTime.diff(start_time, 'seconds'); // Calculate the elapsed time in seconds
    const elapsedTimeInHours = timeElapsed / 3600; // Convert the elapsed time to hours
    const bill = cars.data[0].Charges_Per_Hour * (elapsedTimeInHours - 1);

    setElapsedTime(timeElapsed);
    setTotalBill(bill);

    const displayElement = document.getElementById('display');
    if (displayElement) {
      const formattedTime = moment.utc(timeElapsed * 1000).format('HH:mm:ss');
      displayElement.innerText = formattedTime;
    }
  };

  const formatTimeInHours = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

/*function padNumber(number) {
    return number.toString().padStart(2, "0");
}

function displayElapsedTimeInHours(timeInMilliseconds) {
    const totalHours = timeInMilliseconds / 3600000;
    const displayString = `Time Elapsed: ${totalHours.toFixed(2)} hrs`;
    document.getElementById("display").innerText = displayString;
}*/

const handleBackClick=()=>{
  navigate('/My-Cars');
}
  return (
    <div>
      <h1>Booked Cars</h1>
      {loading ? (
        <div className="loading-container">
          <p className="loading-spinner">Loading...</p>
        </div>
      ) : (
        <div>
          {bookedCars.length > 0 ? (
          <div className='booked-car-details'>
            {bookedCars.map((booking) => (
              <div className='booked' key={booking.car_details.Car_ID} >
                <h2>{booking.car_details.Car_Type}</h2>
                <div onClick={() => handleCancelClick(booking)}>
                  <img src={bufferToBase64(booking.car_details.image)} alt={booking.car_details.Car_Type} />
                </div>
                <p><b>Client's User Name</b>: {booking.user_details.username}</p>
                <p><b>Client's Phone Number</b>: {booking.user_details.phoneNumber}</p>
                <p><b>Booking Date</b>: {booking.book_details.booking_date}</p>
                <p><b>Pickup Time</b>: {booking.book_details.pickup_time}</p>
                <p><b>Total Bill</b>: {totalBill}$</p>
                {booking.total_time ? (
                    <p><b>Total Time Elapsed</b>: {formatTimeInHours(booking.total_time)}</p>
                  ) : (
                    <div>
                      <div id="display">00:00:00</div>
                      {isTimerRunning ? (
                        <button onClick={handleStopTimer}>Stop Timer</button>
                      ) : (
                        <div>
                          <button onClick={handleStartTimer}>Start Timer</button>
                          <button onClick={continueTimer}>Continue Timer</button>
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={handleBackClick}>Back</button>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="no-cars-message">No booked cars found.</p>
              <button onClick={handleBackClick}>Back</button>
            </div>
          )}
        </div>
      )}
      {showConfirmation && (
        <div className="confirmation-modal">
          <p>You're about to cancel this order. Are you sure?</p>
          <button onClick={confirmCancel}>Confirm</button>
          <button onClick={cancelCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}