import React, { useState, useEffect } from "react";
import axios from "axios";

interface LogData {
  id: number;
  table_name: string;
  id_registro_tabla_modificada: string | number;
  action: string;
  date: string;
  encrypted?: boolean; // Nuevo campo para indicar si los datos están encriptados
  raw?: boolean;
}

interface LogsViewerProps {
  type: 'regular' | 'encrypted';
  refreshInterval?: number; // in milliseconds
  limit?: number;
}

const LogsViewer: React.FC<LogsViewerProps> = ({ 
  type, 
  refreshInterval = 5000, 
  limit = 50 
}) => {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastId, setLastId] = useState<number>(0);
  const [desencriptacionFallida, setDesencriptacionFallida] = useState<boolean>(false);
  const [showRawData, setShowRawData] = useState<boolean>(type === 'encrypted');

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("No se ha encontrado un token de autenticación");
        return;
      }
      
      let url = '';
      if (type === 'regular') {
        url = `http://localhost:4000/logs?limit=${limit}`;
      } else {
        url = `http://localhost:4000/encrypted-logs/hex?limit=${limit}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Transformar datos para garantizar que todos sean renderizables como strings
      const processedLogs = response.data.map((log: any) => ({
        ...log,
        // Asegurarse de que cada campo sea una cadena de texto renderizable
        table_name: typeof log.table_name === 'string' ? log.table_name : JSON.stringify(log.table_name),
        id_registro_tabla_modificada: typeof log.id_registro_tabla_modificada === 'string' || typeof log.id_registro_tabla_modificada === 'number'
          ? log.id_registro_tabla_modificada
          : JSON.stringify(log.id_registro_tabla_modificada),
        action: typeof log.action === 'string' ? log.action : JSON.stringify(log.action),
        date: typeof log.date === 'string' ? log.date : JSON.stringify(log.date),
      }));
      
      setLogs(processedLogs);
      
      // Verificar si los datos están encriptados
      if (response.data.length > 0 && response.data[0].encrypted) {
        setDesencriptacionFallida(true);
      } else {
        setDesencriptacionFallida(false);
      }
      
      if (response.data.length > 0) {
        setLastId(response.data[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching ${type} logs:`, error);
      setError(`Error al cargar los logs: ${(error as Error).message}`);
      setLoading(false);
    }
  };

  const checkForNewLogs = async () => {
    if (lastId === 0) return;
    
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      
      let url = '';
      if (type === 'regular') {
        url = `http://localhost:4000/logs/latest?lastId=${lastId}&limit=10`;
      } else {
        // For encrypted logs we'll just refresh all since decryption happens on server
        url = `http://localhost:4000/encrypted-logs/hex?limit=${limit}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.length > 0) {
        const newLastId = response.data[0].id;
        if (newLastId > lastId) {
          fetchLogs(); // Fetch all logs if there's new data
          setLastId(newLastId);
        }
      }
    } catch (error) {
      console.error(`Error checking for new ${type} logs:`, error);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    const intervalId = setInterval(() => {
      checkForNewLogs();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, type, limit]);

  // Function to format date string
  const formatDate = (dateStr: string) => {
    if (desencriptacionFallida && type === 'encrypted') {
      return dateStr; // Devolver el valor en hex si está encriptado
    }
    
    try {
      // Solo intentar convertir a fecha si parece una fecha válida
      if (/^\d{4}-\d{2}-\d{2}|^\d{4}\/\d{2}\/\d{2}/.test(dateStr)) {
        const date = new Date(dateStr);
        return date.toLocaleString();
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  // Función para renderizar cualquier valor de manera segura
  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-2">
        {type === 'regular' ? 'Registros de Log' : 'Registros de Log Encriptados (Formato Hexadecimal)'}
        <span className="text-sm text-gray-500 font-normal ml-2">
          (actualización cada {refreshInterval / 1000} segundos)
        </span>
      </h2>
      
      {desencriptacionFallida && type === 'encrypted' && (
        <div className="p-4 mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-bold">Advertencia de desencriptación</p>
          <p>No se ha podido desencriptar los logs. Se muestran los datos en formato alternativo.</p>
          <p className="text-sm mt-2">
            Ejecute el script SQL de corrección de funciones proporcionado para habilitar la desencriptación.
          </p>
        </div>
      )}
      
      {type === 'encrypted' && (
        <div className="p-4 mb-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
          <p className="font-bold">Visualización de Datos Encriptados</p>
          <p>Se está mostrando la representación hexadecimal de los datos encriptados.</p>
          <p className="text-sm mt-2">
            Cada byte se representa como dos dígitos hexadecimales (00-FF).
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Cargando logs...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded-md">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-2 px-3 text-left text-sm font-semibold">ID</th>
                <th className="py-2 px-3 text-left text-sm font-semibold">Tabla</th>
                <th className="py-2 px-3 text-left text-sm font-semibold">ID Registro</th>
                <th className="py-2 px-3 text-left text-sm font-semibold">Acción</th>
                <th className="py-2 px-3 text-left text-sm font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-700">{log.id}</td>
                    <td className="py-2 px-3 text-gray-700">
                      {desencriptacionFallida && type === 'encrypted' 
                        ? <span className="font-mono text-xs">{renderValue(log.table_name)}</span> 
                        : renderValue(log.table_name)}
                    </td>
                    <td className="py-2 px-3 text-gray-700">
                      {desencriptacionFallida && type === 'encrypted' 
                        ? <span className="font-mono text-xs">{renderValue(log.id_registro_tabla_modificada)}</span> 
                        : renderValue(log.id_registro_tabla_modificada)}
                    </td>
                    <td className="py-2 px-3 text-gray-700">
                      <div className={`${desencriptacionFallida && type === 'encrypted' ? 'font-mono text-xs' : ''} max-w-xs overflow-hidden text-ellipsis whitespace-nowrap`} 
                           title={renderValue(log.action)}>
                        {renderValue(log.action)}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-gray-700">
                      {desencriptacionFallida && type === 'encrypted' 
                        ? <span className="font-mono text-xs">{renderValue(log.date)}</span> 
                        : formatDate(renderValue(log.date))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No se encontraron registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-right">
        <button
          onClick={fetchLogs}
          className="bg-blue-100 text-blue-600 hover:bg-blue-200 py-2 px-4 rounded-md text-sm transition-colors"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
};

export default LogsViewer;
