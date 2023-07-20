import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function BookedCars({ onBackClick, profileData }) {
  const [bookedCars, setBookedCars] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalBill, setTotalBill] = useState(0);

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
    const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
    let existingTotalTime = response.data[0].total_time || 0;
    let newTotalTime=(existingTotalTime);
    if (typeof existingTotalTime !== "number" || isNaN(existingTotalTime)) {
      existingTotalTime = 0; // Set a default value if parsing fails or it's NaN
      newTotalTime = existingTotalTime;
    }
    // the problem is here actually formattedStartTime is always 00.00.00
    
    const currentTime = Math.floor(Date.now() / 1000);
    const formattedStartTime = new Date(currentTime * 1000)
    // .toISOString().slice(11, 19);
    console.log(formattedStartTime)
    try{
      const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
      console.log(response.data)
      await axios.put(`http://localhost:3004/api/bookings/${response.data[0].id}`, {
        start_time: formattedStartTime,
        total_time: newTotalTime,
      });
      console.log("Timer successfully updated in the database!");
    } catch (error) {
      console.error('Error posting time data:', error);
    }
    setIsTimerRunning(true);
  }

  const handleStopTimer = async () => {
    console.log("Timer Stopping");
    const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
    const bookedCars = response.data[0];
    let t_time=bookedCars.total_time || 0;
    let new_total=(t_time*3600);
  
    let s_time=bookedCars.start_time;
    console.log("S_T: ",s_time)
    const currentTime = Math.floor(Date.now() / 1000);
    const formattedCurrentTime = new Date(currentTime * 1000).toISOString().slice(11, 19);
    console.log("F_C_T: ",formattedCurrentTime)
    console.log("N_T: ",formattedCurrentTime - s_time)
    const secondsToHours = (seconds) => {
      const hours = seconds / 3600;
      return isNaN(hours) ? 0 : Number(hours.toFixed(2));
    };
    new_total+=parseFloat(secondsToHours(currentTime - s_time));
     console.log("new total: ",new_total);
    try{
      const response = await axios.get(`http://localhost:3004/api/bookedCars/${profileData.id}`);
      const cars = await axios.get(`http://localhost:3004/api/cars/${response.data[0].car_id}`);
      await axios.put(`http://localhost:3004/api/bookings/${response.data[0].id}`, {
        start_time: s_time,
        total_time: new_total/3600,
      });
      console.log("Timer successfully updated in the database!");
      const carChargesPerHour = cars.data[0].Charges_Per_Hour;
      const bill = carChargesPerHour * ((new_total/3600)-1);
      setTotalBill(bill);
    } catch (error) {
      console.error('Error posting time data:', error);
    }
    setIsTimerRunning(false);
  }

  const formatTimeInHours = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

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
                    {isTimerRunning ? (
                  <>
                    <button onClick={handleStopTimer}>Stop Timer</button>
                  </>
                  ) : (
                  <>
                <button onClick={handleStartTimer}>Start Timer</button>
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
