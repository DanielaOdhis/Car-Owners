import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

export default function BookedCars() {
  const [bookedCars, setBookedCars] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  //const [isTimerRunning, setIsTimerRunning] = useState(false);
 // const [totalBill, setTotalBill] = useState(0);
 // const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("loggedUser");
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchBookedCars(userId);
    }
  }, [userId]);

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
        console.log("Cars:", bookedCars);

        const carsWithUserDetails = [];

        for (const bookedCar of bookedCars) {
          const carDetailsResponse = await axios.get(`http://localhost:3004/api/cars/${bookedCar.car_id}`);
          const carDetails = carDetailsResponse.data[0]; // Assuming carDetailsResponse.data is an array

          const userDetailsResponse = await axios.get(`http://localhost:3004/api/userDetails/${bookedCar.user_id}`);
          const userDetails = userDetailsResponse.data;

          const timerData = {
            isTimerRunning: false,
            elapsedTime: 0,
            intervalId: null,
            paymentReceived: true,
           // totalBill: 0,
          };

          const combinedDetails = {
            bookedCar,
            carDetails,
            userDetails,
            timerData,
          };

          carsWithUserDetails.push(combinedDetails);
        }
        console.log("cARSd:", carsWithUserDetails)
        setBookedCars(carsWithUserDetails);
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

  const deleteBookedCar = async (booking) => {
    if (!booking || !booking.bookedCar || !booking.bookedCar.id) {
      console.error('Invalid booking data');
      return;
    }

    try {
      //const carToDelete = bookedCars.find((car) => car.id === booking.bookedCar.id);
      const response = await axios.delete(`http://localhost:3004/api/bookedCars/${booking.bookedCar.id}`);
      console.log("Res:", booking.bookedCar)
      if (response.status === 200) {
        try {
          await axios.put(`http://localhost:3004/api/cars/${booking.carDetails.Car_ID}`, {
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
      deleteBookedCar(selectedBooking);
      setSelectedBooking(null);
    }
  };

  const cancelCancel = () => {
    setShowConfirmation(false);
    setSelectedBooking(null);
  };

  const handleStartTimer = async (booking) => {
    console.log("Booked cars ", booking);

    console.log("Timer Starting");

    if (!booking.timerData.isTimerRunning) {
      const response = await axios.get(`http://localhost:3004/api/bookedCar/${booking.bookedCar.id}`);
      console.log("wueh! ", response.data);
      let existingTotalTime = 0;
      let newTotalTime = existingTotalTime;
    //  booking.timerData.totalTime=0;
      if (typeof existingTotalTime !== "number" || isNaN(existingTotalTime)) {
        existingTotalTime = 0;
        newTotalTime = existingTotalTime;
      }

      const startTime = moment().format('YYYY-MM-DD HH:mm:ss');
      console.log("Time", startTime);
      console.log("Total:", newTotalTime)
      try {
        // const response = await axios.get(`http://localhost:3004/api/bookedCars/${userId}`);
        // console.log(response.data);
        await axios.put(`http://localhost:3004/api/bookings/${booking.bookedCar.id}`, {
          start_time: startTime,
          total_time: newTotalTime,
        });
        console.log("Timer successfully updated in the database!");
      } catch (error) {
        console.error('Error posting time data:', error);
      }
      const interval = setInterval(updateDisplay(booking), 1000);
      setIntervalId(interval);
      booking.timerData.isTimerRunning=true;
      console.log("Start:: ",booking.timerData.isTimerRunning);
    }
  }

  const continueTimer = async (booking) => {
    if (!booking.timerData.isTimerRunning) {
      const response = await axios.get(`http://localhost:3004/api/bookedCar/${booking.bookedCar.id}`);
      const bookedCar = response.data[0];
      console.log("Test ", bookedCar);
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

        // const cars = await axios.get(`http://localhost:3004/api/cars/${bookedCar.car_id}`);
        // const bill = cars.Charges_Per_Hour * (newTotalTime - 1);
        // setTotalBill(bill);
      } catch (error) {
        console.error('Error posting time data:', error);
      }

      const interval = setInterval(updateDisplay(booking), 1000);
      setIntervalId(interval);
      // setIsTimerRunning(true);
      booking.timerData.isTimerRunning = true;
    }
  };

  const handleStopTimer = async (booking) => {
    console.log("Timer Stopping");
    if (booking.timerData.isTimerRunning) {
      clearInterval(intervalId);
      setIntervalId(null);
      try {
        const response = await axios.get(`http://localhost:3004/api/bookedCar/${booking.bookedCar.id}`);
        //const cars = await axios.get(`http://localhost:3004/api/cars/${response.data[0].car_id}`);
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

        // const bill = cars.data[0].Charges_Per_Hour * (totalTime - 1);
        // setTotalBill(bill);
      } catch (error) {
        console.error('Error posting time data:', error);
      }

      booking.timerData.isTimerRunning =false;
      console.log("Stop::",booking.timerData.isTimerRunning);

       setBookedCars(prevBookedCars =>
        prevBookedCars.map(prevBooking =>
          prevBooking.carDetails.Car_ID === booking.carDetails.Car_ID
          ? { ...prevBooking, timerData: { ...booking.timerData, isTimerRunning: false }, paymentReceived: true }
          : prevBooking
        )
      );
     // setElapsedTime(0);
    }
  };
  const updateDisplay = (booking) => {
    if (!booking.timerData.isTimerRunning) {
      console.log("Updating display...");

      const start_time = moment(booking.bookedCar.start_time); // Parse the stored start time as a local moment object
      const currentTime = moment(); // Current local time
      const timeElapsed = currentTime.diff(start_time, 'seconds'); // Calculate the elapsed time in seconds
      // const elapsedTimeInHours = timeElapsed / 3600; // Convert the elapsed time to hours
      const elapsedTime=timeElapsed;
      booking.timerData.elapsedTime=elapsedTime;
      console.log("Elapsed::", elapsedTime);
      const displayElement = document.getElementById(`display-${booking.bookedCar.id}`);
      console.log("Display Element:", displayElement);

      if (displayElement) {
         const formattedTime = formatTimeInHours(elapsedTime*1000).format('HH:mm:ss');
         displayElement.innerText = formattedTime;
       }
    };
  }
  const formatTimeInHours = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    const formattedDate = new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return formattedDate;
  };

  const formatTime = (timeString) => {
    const formattedTime = new Date(timeString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });

    return formattedTime;
  };

  /*function padNumber(number) {
      return number.toString().padStart(2, "0");
  }
  
  function displayElapsedTimeInHours(timeInMilliseconds) {
      const totalHours = timeInMilliseconds / 3600000;
      const displayString = `Time Elapsed: ${totalHours.toFixed(2)} hrs`;
      document.getElementById("display").innerText = displayString;
  }*/

  const handleBackClick = () => {
    navigate('/My-Cars');
  }

  return (
    <div className="back">
      {loading ? (
        <div className="loading-container">
          <p className="loading-spinner">Loading...</p>
        </div>
      ) : (
        <div>
          {bookedCars.length > 0 ? (
            <div>
              <h1>Booked Cars</h1>
              {bookedCars.map((booking) => (
                <div className='booked-car-details'>
                <div className='booked' key={booking.carDetails.Car_ID} >
                  <div className="CarsB">
                  <h2>{booking.carDetails.Car_Type}</h2>
                  <div onClick={() => handleCancelClick(booking)}>
                    <img src={bufferToBase64(booking.carDetails.image)} alt={booking.carDetails.Car_Type} />
                  </div>
                  <p><b>Client's User Name</b>: {booking.userDetails.username}</p>
                  <p><b>Client's Phone Number</b>: {booking.userDetails.phoneNumber}</p>
                  <p><b>Booking Date</b>:  {formatDate(booking.bookedCar.booking_date)}</p>
                  <p><b>Pickup Time</b>: {formatTime(booking.bookedCar.pickup_time)}</p>
                  <p><b>Total Bill</b>: {(((booking.bookedCar.total_time-1)*booking.carDetails.Charges_Per_Hour).toFixed(2))}$</p>
                  {booking.total_time ? (
                    <p><b>Total Time Elapsed</b>: {formatTimeInHours(booking.bookedCar.total_time*3600)}</p>
                  ) : (
                    <div>
                      <div id={`display-${booking.id}`}>{formatTimeInHours(booking.bookedCar.total_time*3600)}</div>
                      {booking.paymentReceived ? (
                       <button onClick={() => console.log("Payment received")}>Payment received</button>
                       ) : (
                       <div>
                       </div>
                       )}
                      {booking.timerData.isTimerRunning ? (
                        <div>
                          <button onClick={() => handleStopTimer(booking)}>Stop Timer</button>
                        </div>
                      ) : (
                        <div>
                          <button onClick={() => handleStartTimer(booking)}>Start Timer</button>
                          <button onClick={() => continueTimer(booking)}>Continue Timer</button>
                        </div>
                      )}
                    </div>
                  )}
                  
                   </div>
                   </div>
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
      <div className="top">
      <button onClick={handleBackClick}>Back</button>
      </div>
      {showConfirmation && selectedBooking && selectedBooking.total_time < 0 &&(
        <div className="confirmation-modal">
          <p>You're about to cancel this order. Are you sure?</p>
          <button onClick={confirmCancel}>Confirm</button>
          <button onClick={cancelCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}