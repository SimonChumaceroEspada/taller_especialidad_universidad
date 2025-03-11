import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTables, setSelectedTables] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectAll, setSelectAll] = useState(false);
  const [newRecord, setNewRecord] = useState<any>({});
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchTables();
  }, []);

  // muestra el token
  console.log(localStorage.getItem("access_token"));
  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://localhost:4000/database/tables",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTables(
        response.data.sort((a: string, b: string) => a.localeCompare(b))
      );
    } catch (error) {
      console.error("Error fetching tables:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        window.location.href = "/login";
      }
    }
  };

  const handleTableSelect = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://localhost:4000/database/tables/${tableName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTableData(response.data);
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (tableName: string) => {
    setSelectedTables((prevSelectedTables) => ({
      ...prevSelectedTables,
      [tableName]: !prevSelectedTables[tableName],
    }));
  };

  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const newSelectedTables = tables.reduce((acc, table) => {
      acc[table] = newSelectAll;
      return acc;
    }, {} as { [key: string]: boolean });
    setSelectedTables(newSelectedTables);
  };

  const handleCrudOperations = async () => {
    const selectedTableNames = Object.keys(selectedTables).filter(
      (table) => selectedTables[table]
    );
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://localhost:4000/database/crud-operations",
        { tables: selectedTableNames },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Operaciones CRUD realizadas con éxito");
    } catch (error) {
      console.error("Error realizando operaciones CRUD:", error);
      alert("Error realizando operaciones CRUD");
    }
  };

  const handleCreateRecord = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const url = `http://localhost:4000/database/tables/${selectedTable}`;
      console.log("Intentando crear registro en:", url);
      console.log("Datos del registro:", newRecord);
      const response = await axios.post(url, newRecord, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Respuesta del servidor:", response);
      setNewRecord({});
      handleTableSelect(selectedTable);
      alert("Registro creado con éxito");
    } catch (error) {
      console.error("Error creando registro:", error);
      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Datos de respuesta:", error.response?.data);
        alert(
          "Error creando registro: " +
            (error.response?.data?.message || "Desconocido")
        );
      } else {
        alert("Error creando registro: " + (error as Error).message);
      }
    }
  };

  const handleEditRecord = async () => {
    console.log("Editing Record:", editingRecord);
    try {
      if (!editingRecord) {
        alert("Registro no encontrado");
        return;
      }

      // Obtener la primera clave del objeto
      const firstKey = Object.keys(editingRecord)[0];
      const id = editingRecord[firstKey];
      console.log("ID del registro a editar:", id);

      if (!id) {
        console.log("ID del registro a editar:", id);
        alert("ID del registro no encontrado");
        return;
      }

      const token = localStorage.getItem("access_token");
      const url = `http://localhost:4000/database/tables/${selectedTable}/${id}`;
      console.log("Intentando actualizar registro en:", url);
      console.log("Datos del registro:", editingRecord);

      const response = await axios.put(url, editingRecord, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Respuesta del servidor:", response);
      setEditingRecord(null);
      handleTableSelect(selectedTable);
      alert("Registro editado con éxito");
    } catch (error) {
      console.error("Error editando registro:", error);
      if (axios.isAxiosError(error)) {
        alert(
          "Error editando registro: " +
            (error.response?.data?.message || "Desconocido")
        );
      } else {
        alert("Error editando registro: " + (error as Error).message);
      }
    }
  };

  const handleDeleteRecord = async (record: any) => {
    console.log("Intentando eliminar registro:", record);
    try {
      if (!record) {
        alert("Registro no encontrado");
        return;
      }
      // Obtener la primera clave del objeto
      const firstKey = Object.keys(record)[0];
      const id = record[firstKey];
      console.log("ID del registro a eliminar:", id);
      if (!id) {
        console.log("ID del registro a eliminar:", id);
        alert("ID del registro no encontrado");
        return;
      }
      const token = localStorage.getItem("access_token");
      const url = `http://localhost:4000/database/tables/${selectedTable}/${id}`;
      console.log("Intentando eliminar registro en:", url);
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Registro eliminado:", response.data);
      handleTableSelect(selectedTable); // Refrescar los datos de la tabla
      alert("Registro eliminado con éxito");
    } catch (error) {
      console.error("Error eliminando registro:", error);
      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Datos de respuesta:", error.response?.data);
        alert(
          "Error eliminando registro: " +
            (error.response?.data?.message || "Desconocido")
        );
      } else {
        alert("Error eliminando registro: " + (error as Error).message);
      }
    }
  };

  const handleRestartApplication = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://localhost:4000/database/restart",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      // Esperar 5 segundos y luego intentar reconectar
      setTimeout(() => {
        reconnectAfterRestart();
      }, 5000);
    } catch (error) {
      console.error("Error al reiniciar la aplicación:", error);
      alert("Error al reiniciar la aplicación");
      setLoading(false);
    }
  };

  // Función para reconectar después del reinicio
  const reconnectAfterRestart = async () => {
    let attempts = 0;
    const maxAttempts = 20; // Más intentos
    const attemptInterval = 3000; // Más tiempo entre intentos (3s)

    const tryReconnect = async () => {
      attempts++;
      try {
        console.log(`Intento de reconexión ${attempts}/${maxAttempts}...`);

        // Intentar una solicitud simple para verificar si el servidor está activo
        const response = await axios.get("http://localhost:4000/health", {
          timeout: 5000, // Añadir timeout
        });

        console.log("Respuesta recibida:", response.data);

        // Si llegamos aquí, el servidor está de vuelta
        console.log("Reconexión exitosa después del reinicio");
        setLoading(false);
        fetchTables(); // Refrescar los datos
      } catch (error) {
        console.log(
          `Intento de reconexión ${attempts}/${maxAttempts} fallido:`,
          (error as Error).message
        );

        if (attempts < maxAttempts) {
          // Mostrar mensaje de espera
          if (attempts % 3 === 0) {
            // Cada 3 intentos
            console.log(
              `Esperando que el servidor vuelva a estar en línea (${attempts}/${maxAttempts})...`
            );
          }

          // Programar otro intento
          setTimeout(tryReconnect, attemptInterval);
        } else {
          // Demasiados intentos fallidos
          setLoading(false);
          alert(
            "No se pudo reconectar con el servidor después del reinicio. Por favor, actualice la página manualmente o verifique los logs del servidor."
          );
        }
      }
    };

    // Esperar un poco más antes del primer intento
    setTimeout(() => {
      tryReconnect();
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Panel de Administración</h1>
          <button
            onClick={() => navigate('/logs')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ver Logs del Sistema
          </button>
        </div>

        {/* Tables grid section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-700">Tablas disponibles</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                  className="w-4 h-4 accent-blue-500"
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-gray-700 font-medium">Seleccionar todas</label>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700 w-10">#</th>
                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700 w-12">Seleccionar</th>
                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">Nombre de la tabla</th>
                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700 w-20">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tables.map((table, index) => (
                    <tr 
                      key={table}
                      className={`${
                        selectedTable === table ? "bg-blue-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-colors duration-150`}
                    >
                      <td className="py-2 px-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          checked={selectedTables[table] || false}
                          onChange={() => handleCheckboxChange(table)}
                          className="w-4 h-4 accent-blue-500"
                        />
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-800">{table}</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => handleTableSelect(table)}
                          className={`px-3 py-1 text-sm font-medium rounded ${
                            selectedTable === table 
                              ? "bg-blue-600 text-white" 
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          }`}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-between items-center border-t pt-4">
              <div className="text-sm text-gray-500">
                {tables.length} tablas encontradas
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCrudOperations}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  Operaciones CRUD
                </button>
                <button
                  onClick={handleRestartApplication}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reiniciar aplicación
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table data and forms */}
        {selectedTable && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-2">
                  Datos de la tabla: <span className="text-blue-600">{selectedTable}</span>
                </h2>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          {tableData.length > 0 &&
                            Object.keys(tableData[0]).map((key) => (
                              <th key={key} className="py-3 px-4 text-left text-lg font-semibold uppercase tracking-wider">
                                {key}
                              </th>
                            ))}
                          <th className="py-3 px-4 text-left text-lg font-semibold uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {tableData.map((record, index) => (
                          <tr 
                            key={index} 
                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            {Object.keys(record).map((key) => (
                              <td key={key} className="py-3 px-4 text-gray-700 text-base">
                                {record[key]}
                              </td>
                            ))}
                            <td className="py-3 px-4 flex space-x-3">
                              <button
                                onClick={() => setEditingRecord(record)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-base transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record)}
                                className="text-red-600 hover:text-red-800 font-medium text-base transition-colors"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-2">Crear nuevo registro</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateRecord();
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tableData.length > 0
                      ? Object.keys(tableData[0]).map((key) => (
                          <div key={key} className="mb-0">
                            <label className="block text-base font-medium text-gray-700 mb-1">
                              {key}
                            </label>
                            <input
                              type="text"
                              value={newRecord[key] || ""}
                              onChange={(e) =>
                                setNewRecord({ ...newRecord, [key]: e.target.value })
                              }
                              className="w-full px-4 py-3 border text-base border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                        ))
                      : null}
                  </div>
                  <button
                    type="submit"
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white py-3 px-6 text-base font-medium rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    Crear Registro
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-1">
              {editingRecord && (
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                  <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-2">Editar registro</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditRecord();
                    }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      {Object.keys(editingRecord).map((key) => (
                        <div key={key} className="mb-0">
                          <label className="block text-base font-medium text-gray-700 mb-1">
                            {key}
                          </label>
                          <input
                            type="text"
                            value={editingRecord[key] || ""}
                            onChange={(e) =>
                              setEditingRecord({
                                ...editingRecord,
                                [key]: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border text-base border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col space-y-3">
                      <button
                        type="submit"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 text-base font-medium rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                      >
                        Guardar cambios
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingRecord(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 text-base font-medium rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {!editingRecord && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-700">Ayuda</h2>
                  <div className="text-gray-600 space-y-4">
                    <p>Seleccione una tabla de la lista para ver su contenido.</p>
                    <p>Puede crear nuevos registros usando el formulario de la izquierda.</p>
                    <p>Para editar un registro, haga clic en el botón "Editar" junto al registro deseado.</p>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mt-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Acciones rápidas</h3>
                      <ul className="list-disc pl-5 space-y-1 text-blue-700">
                        <li>Haga clic en "Ver" para examinar una tabla</li>
                        <li>Seleccione varias tablas para operaciones CRUD</li>
                        <li>Use el botón de reinicio cuando sea necesario</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
