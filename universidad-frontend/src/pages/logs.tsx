import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import LogsViewer from "../components/LogsViewer";
import LogTable from "../components/LogTable";
import EncryptedLogTable from "../components/EncryptedLogTable";

export default function Logs() {
  const [activeTab, setActiveTab] = useState<'regular' | 'encrypted'>('regular');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Registros de Actividad del Sistema
          </h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow"
          >
            Volver al Panel
          </button>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-base ${
                  activeTab === 'regular'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('regular')}
              >
                Logs Estándar
              </button>
              <button
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-base ${
                  activeTab === 'encrypted'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('encrypted')}
              >
                Logs Encriptados (Hex)
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'regular' ? (
          <LogTable limit={100} refreshInterval={3000} />
        ) : (
          <EncryptedLogTable limit={100} refreshInterval={5000} />
        )}

        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Información sobre los logs</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              <strong>Logs estándar:</strong> Registran las operaciones CRUD realizadas en las tablas del sistema 
              con la información almacenada en texto plano.
            </p>
            <p>
              <strong>Logs encriptados:</strong> Contienen la misma información que los logs estándar, pero 
              la información está encriptada para mayor seguridad. Se muestra en formato hexadecimal.
            </p>
            {activeTab === 'encrypted' && (
              <div className="p-4 mt-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">¿Qué son los datos hexadecimales?</h3>
                <p className="text-sm">
                  La representación hexadecimal muestra cada byte como dos dígitos hexadecimales (00-FF).
                  Esta es la forma en que los datos encriptados se almacenan realmente en la base de datos,
                  garantizando la seguridad de la información sensible hasta que se requiera desencriptarla
                  mediante los algoritmos y claves adecuados.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Los logs se actualizan automáticamente para mostrar la actividad más reciente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
