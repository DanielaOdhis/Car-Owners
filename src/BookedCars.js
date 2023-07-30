import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

export default function BookedCars({ onBackClick, profileData }) {
  const [bookedCars, setBookedCars] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [totalBill, setTotalBill] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (profileData && profileData.id) {
      fetchBookedCars(profileData.id);
    }
  }, [profileData]);

  useEffect(() => {
    if (selectedBooking) {
      setBookedCars(prevBookedCars =>
        prevBookedCars.map(booking =>
          booking.id === selectedBooking.id ? { ...booking, } : booking
        )
      );
    }
  }, [selectedBooking]);

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
        fetchBookedCars(profileData.id);
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

   /* const handleStartTimer = async (selectedBooking) => {
    console.log("Timer Starting");
    if (isTimerRunning) {
      clearInterval(intervalRef.current);
      setIsTimerRunning(false);

      if (selectedBooking && startTime) {
        const currentTime = Math.floor(Date.now() / 1000);
        const totalTimeElapsed = currentTime - startTime;
        const formattedStartTime = new Date(startTime * 1000).toISOString().slice(11, 19);

        const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
        console.log(response.data[0]);
        let existingTotalTime = [response.data[0].total_time] || 0;
        console.log("existingTotalTime", existingTotalTime);
        if (typeof existingTotalTime !== "number") {
          existingTotalTime = parseFloat(existingTotalTime); // Convert to a number if it's a string
        }
        console.log("Elapsed Time", totalTimeElapsed );
        const newTotalTime = (existingTotalTime + totalTimeElapsed);
        console.log("newTotalTime", newTotalTime);

        try {
          const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
          const cars = await axios.get(`http://localhost:3004/api/cars/${response.data[0].car_id}`);


          await axios.put(`http://localhost:3004/api/bookings/${response.data[0].id}`, {
            start_time: formattedStartTime,
            total_time: newTotalTime/3600,
          });

          const carChargesPerHour = cars.data[0].Charges_Per_Hour;
          const bill = carChargesPerHour * ((newTotalTime/3600)-1);
          setTotalBill(bill);

          console.log('Time data posted successfully.');
        } catch (error) {
          console.error('Error posting time data:', error);
        }

        setBookedCars(prevBookedCars =>
          prevBookedCars.map(booking =>
            booking.id === selectedBooking.id ? { ...booking, total_time: newTotalTime } : booking
          )
        );
        setIsTimerRunning(false);
        setElapsedTime(prevElapsedTime => prevElapsedTime + totalTimeElapsed); // Update elapsed time correctly
      }
    } else {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
      intervalRef.current = interval;
      setIsTimerRunning(true);
      setStartTime(Math.floor(Date.now() / 1000));
    }
  };*/

  const handleStartTimer = async () => {
    console.log("Timer Starting");
    if (!isTimerRunning) {
      const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
      let existingTotalTime = response.data[0].total_time || 0;
      let newTotalTime = existingTotalTime;
      if (typeof existingTotalTime !== "number" || isNaN(existingTotalTime)) {
        existingTotalTime = 0;
        newTotalTime = existingTotalTime;
      }

      const startTime = moment().format('YYYY-MM-DD HH:mm:ss');
      console.log("Time", startTime);

      try {
        const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
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
      const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
      const bookedCar = response.data[0];
      console.log(bookedCar.start_time)
      let existingTotalTime = bookedCar.total_time || 0;

      let newTotalTime = existingTotalTime;
      if (typeof existingTotalTime !== "number" || isNaN(existingTotalTime)) {
        existingTotalTime = 0;
        newTotalTime = existingTotalTime;
      }

      const start_time = moment(bookedCar.start_time); // Parse the stored start time as a local moment object
      const currentTime = moment(); // Current local time
      const timeElapsed = currentTime.diff(start_time, 'seconds'); // Calculate the elapsed time in seconds
      newTotalTime += timeElapsed / 3600; // Convert the elapsed time to hours and add to the existing total time

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
        const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
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
    const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
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

  return (
    <div>
      <h1>Booked Cars</h1>
      {bookedCars.length > 0 ? (
        <div>
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
                  <>
                  <div id="display">00:00:00</div>

                    {isTimerRunning ? (
                  <>
                    <button onClick={handleStopTimer}>Stop Timer</button>
                  </>
                  ) : (
                  <>
                <button onClick={handleStartTimer}>Start Timer</button>
                <button onClick={continueTimer}>Continue Timer</button>
                </>
                )}
                </>
              )}
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
