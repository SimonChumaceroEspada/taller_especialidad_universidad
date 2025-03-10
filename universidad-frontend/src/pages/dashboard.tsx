import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

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
    const newSelectedTables = tables.reduce(
      (acc, table) => {
        acc[table] = newSelectAll;
        return acc;
      },
      {} as { [key: string]: boolean }
    );
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
    } catch (error) {
      console.error("Error al reiniciar la aplicación:", error);
      alert("Error al reiniciar la aplicación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Tablas</h2>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAllChange}
              className="mr-2"
            />
            <label>Seleccionar todas</label>
          </div>
          <ul>
            {tables.map((table) => (
              <li key={table} className="mb-2">
                <input
                  type="checkbox"
                  checked={selectedTables[table] || false}
                  onChange={() => handleCheckboxChange(table)}
                  className="mr-2"
                />
                <button
                  onClick={() => handleTableSelect(table)}
                  className="text-blue-500 underline"
                >
                  {table}
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleCrudOperations}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            Realizar operaciones CRUD
          </button>
          <button
            onClick={handleRestartApplication}
            className="mt-4 bg-green-500 text-white py-2 px-4 rounded"
          >
            Reiniciar aplicación
          </button>
        </div>

        {selectedTable && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">
              Datos de la tabla: {selectedTable}
            </h2>
            {loading ? (
              <p>Cargando datos...</p>
            ) : (
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    {tableData.length > 0 &&
                      Object.keys(tableData[0]).map((key) => (
                        <th key={key} className="py-2 px-4 border-b">
                          {key}
                        </th>
                      ))}
                    <th className="py-2 px-4 border-b">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((record) => (
                    <tr key={record.id}>
                      {Object.keys(record).map((key) => (
                        <td key={key} className="py-2 px-4 border-b">
                          {record[key]}
                        </td>
                      ))}
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => setEditingRecord(record)}
                          className="text-blue-500 underline mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record)}
                          className="text-red-500 underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {selectedTable && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Crear nuevo registro</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateRecord();
              }}
            >
              {tableData.length > 0 &&
                Object.keys(tableData[0]).map((key) => (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={newRecord[key] || ""}
                      onChange={(e) =>
                        setNewRecord({ ...newRecord, [key]: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              <button
                type="submit"
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
                Crear
              </button>
            </form>
          </div>
        )}

        {editingRecord && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Editar registro</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditRecord();
              }}
            >
              {Object.keys(editingRecord).map((key) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="bg-yellow-500 text-white py-2 px-4 rounded"
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setEditingRecord(null)}
                className="ml-2 bg-gray-500 text-white py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
