import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", response.data.token); // Guardar el token
      alert("Inicio de sesión exitoso");
      window.location.href = "/dashboard"; // Redirigir al Dashboard
    } catch (error) {
      alert("Error en inicio de sesión");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="text" placeholder="Usuario" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Iniciar Sesión</button>
    </div>
  );
};

export default Login;
