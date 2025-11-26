import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

// Define the shape of the successful login response
interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Define the shape of the error response
interface ErrorResponse {
  detail: string;
}

export const LoginPage = () => {
  const [email, setEmail] = useState(''); // Renamed from username to email for clarity
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { // More specific event type
    e.preventDefault();
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // Backend expects 'username' field
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        // Assuming the error response has a 'detail' field as is common in FastAPI
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      login(data.access_token);
      navigate('/');

    } catch (err) {
      // Type-safe error handling
      let errorMessage = 'An unknown error occurred.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error('Login error:', errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Hasło:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zaloguj</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;