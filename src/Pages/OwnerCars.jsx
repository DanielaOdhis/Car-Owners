import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
//import "../App.css";

const OwnerCars = () => {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate=useNavigate();
  const userId=localStorage.getItem("loggedUser");
  //e.preventDefault()

  useEffect(() => {
    const fetchOwnerCars = async (e) => {
      try {
        const response = await axios.get(`http://localhost:3004/api/cars/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data && response.data.length > 0) {
          setCars(response.data);
        }
        console.log("local:",localStorage.getItem("loggedUser"));
      } catch (error) {
        console.error('Error fetching owner cars:', error);
      } finally {
        setIsLoading(false);
      }
     // e.preventDefault();
    };

    fetchOwnerCars();
  }, [userId]);

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

  const availableCars = cars.filter((car) => car.Rental_Status === 'Available');

  const handleUpload=()=>{
    navigate('/uploads');
  }

  return (
    <div className="grid">
      {isLoading ? (
        <div className="loading-container">
          <p className="loading-spinner">Loading...</p>
        </div>
      ) : (
        <>
          {availableCars.length === 0 ? (
            <div>
              {cars.length === 0 ? (
                <div>
                  <h1>My Cars</h1>
                  <p className="no-cars-message">No cars found.</p>
                  <button onClick={handleUpload}>Click Here to get Started</button>
                </div>
              ) : (
                <p>All Cars Have Been Booked!</p>
              )}
            </div>
          ) : (
            <div>
            <h1>My Cars</h1>
            <div className="grid-container">
                {availableCars.map((car, index) => (
          <div key={index} className="grid-item" onClick={()=>console.log("This ::",car)}>
            <Link to={`/Car-Details?carId=${car.Car_ID}`} key={index} className="link">
            <h2>{car.Car_Type}</h2>
            <div className="triangles-container">
                <div className="triangle triangle-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="500" height="450" viewBox="0 0 277 274" fill="none">
  <g filter="url(#filter0_d_1_9)">
    <path d="M70.5308 232.751C54.943 238.049 43.4376 218.003 55.8759 207.216L241.173 46.5299C250.885 38.1072 266 45.0063 266 57.8623V155.563C266 161.986 261.91 167.697 255.828 169.765L70.5308 232.751Z" fill="#9B8079"/>
  </g>
  <defs>
    <filter id="filter0_d_1_9" x="0.609161" y="-17.1668" width="315.391" height="290.793" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="-10"/>
      <feGaussianBlur stdDeviation="25"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_9"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_9" result="shape"/>
    </filter>
  </defs>
</svg>
                  </div>
                  <div className="triangle triangle-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="500" height="450" viewBox="0 0 277 292" fill="none">
  <g filter="url(#filter0_d_1_10)">
    <path d="M70.5308 250.466C54.943 255.765 43.4376 235.718 55.8759 224.932L241.173 64.2451C250.885 55.8225 266 62.7216 266 75.5776V173.278C266 179.702 261.91 185.412 255.828 187.48L70.5308 250.466Z" fill="#9B8079"/>
  </g>
  <defs>
    <filter id="filter0_d_1_10" x="0.609161" y="0.548454" width="315.391" height="290.793" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="-10"/>
      <feGaussianBlur stdDeviation="25"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_10"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_10" result="shape"/>
    </filter>
  </defs>
</svg>
                  </div>
                  <div className="triangle triangle-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="500" height="340" viewBox="0 0 247 232" fill="none">
  <g filter="url(#filter0_d_1_11)">
    <path d="M40.5308 220.345C24.943 225.644 13.4376 205.597 25.8759 194.811L211.173 34.1244C220.885 25.7018 236 32.6009 236 45.4568V143.157C236 149.581 231.91 155.292 225.828 157.359L40.5308 220.345Z" fill="#9B8079"/>
  </g>
  <defs>
    <filter id="filter0_d_1_11" x="0.609161" y="0.427719" width="255.391" height="230.793" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="-10"/>
      <feGaussianBlur stdDeviation="10"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_11"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_11" result="shape"/>
    </filter>
  </defs>
</svg>
                  </div>
                  </div>
            <img src={bufferToBase64(car.image)} alt={car.Car_Type} />
            <div className="available">
            <p>Availability Status: {car.Rental_Status}</p>
            <p>Price per Hour: {car.Charges_Per_Hour}$</p>
            </div>
            </Link>
          </div>
       ))}
       </div>
       </div>
     )}
   </>
 )}
</div>
);
};

export default OwnerCars;
