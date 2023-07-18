import axios from 'axios';
import React, {useState, useEffect} from 'react';

export default function Update({profileData}) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
      fetchData();
    }, );
    const fetchData = async () => {
      try {
        if (profileData) {
          setUsername(profileData.username);
          setEmail(profileData.email);
          setFirstName(profileData.firstName);
          setLastName(profileData.lastName);
          setPhoneNumber(profileData.phoneNumber);
          setPassword(profileData.password);
        }
      } catch (error) {
        console.log('Error fetching data:', error);
      }
    };
    const handleUpdateClick= async (e)=> {
        e.preventDefault();
        await axios.put(`http://localhost:3004/api/ownerDetails/${email}` , {username, email, firstName, lastName, phoneNumber, password})
        .then((response) => {console.log(response.data);})
        .catch((error) => {console.log(error);});
        if (!username || !password || !email || !firstName || !lastName || !phoneNumber) {
            setErrorMessage('Please fill in all fields.');
            return;
          }
    }
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };


    return (
        <div>
            <div>
                <form onSubmit={handleUpdateClick}>
                    <h2>Update Details</h2>
                    <div>
                    <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      /><br /><br />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      /><br /><br />
      <input
        type="text"
        placeholder="Telephone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      /><br /><br />
      <input
        type="tel"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br /><br />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />
      <div>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={togglePasswordVisibility}
        />
        <label>Show Password</label>
      </div>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <button type="submit">Update</button>
                    </div>
                </form>
            </div>
        </div>
    )
}