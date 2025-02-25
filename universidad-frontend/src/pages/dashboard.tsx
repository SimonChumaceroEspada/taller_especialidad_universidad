import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:4000/database/tables', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setTables(response.data.sort((a: string, b: string) => a.localeCompare(b)));
    } catch (error) {
      console.error('Error fetching tables:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  const handleTableSelect = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:4000/database/tables/${tableName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setTableData(response.data);
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Seleccionar Tabla</h2>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedTable}
            onChange={(e) => handleTableSelect(e.target.value)}
          >
            <option value="">Seleccione una tabla</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">
            {selectedTable ? `Datos de ${selectedTable}` : 'Selecciona una tabla para ver sus datos'}
          </h2>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Cargando datos...</p>
            </div>
          ) : tableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(tableData[0]).map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value: any, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {value?.toString() ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              {selectedTable ? 'No hay datos disponibles en esta tabla' : 'Selecciona una tabla para ver sus datos'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 