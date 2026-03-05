import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import TaskForm from "../components/TaskForm.jsx";
import TaskTable from "../components/TaskTable.jsx";

export default function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTasks = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.assigned_to) params.assigned_to = filters.assigned_to;
      const response = await api.get("/tasks", { params });
      setTasks(response.data);
    } catch {
      // handled globally
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (payload) => {
    try {
      await api.post("/tasks", payload);
      toast.success("Task created");
      setEditingTask(null);
      await loadTasks({ status: statusFilter, assigned_to: assignedFilter });
    } catch {
      // handled globally
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingTask) return;
    try {
      await api.put(`/tasks/${editingTask.id}`, payload);
      toast.success("Task updated");
      setEditingTask(null);
      await loadTasks({ status: statusFilter, assigned_to: assignedFilter });
    } catch {
      // handled globally
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success("Task deleted");
      await loadTasks({ status: statusFilter, assigned_to: assignedFilter });
    } catch {
      // handled globally
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      toast.success("Status updated");
      await loadTasks({ status: statusFilter, assigned_to: assignedFilter });
    } catch {
      // handled globally
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "statusFilter") {
      setStatusFilter(value);
      loadTasks({ status: value || undefined, assigned_to: assignedFilter || undefined });
    } else if (name === "assignedFilter") {
      setAssignedFilter(value);
      loadTasks({ status: statusFilter || undefined, assigned_to: value || undefined });
    }
  };

  const handleAssignedToMe = () => {
    setAssignedFilter("me");
    loadTasks({ status: statusFilter || undefined, assigned_to: "me" });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Task Dashboard</h1>
          <p className="text-sm text-gray-700">
            Logged in as{" "}
            <span className="font-semibold">{user.username}</span>{" "}
            <span className="text-gray-500">(your id: {user.id})</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="statusFilter"
              value={statusFilter}
              onChange={handleFilterChange}
              className="border rounded px-3 py-2"
            >
              <option value="">All</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assigned To</label>
            <select
              name="assignedFilter"
              value={assignedFilter}
              onChange={handleFilterChange}
              className="border rounded px-3 py-2"
            >
              <option value="">All</option>
              <option value="me">Me</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => loadTasks({ status: statusFilter || undefined, assigned_to: assignedFilter || undefined })}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>
        {loading && <p className="text-sm text-gray-500 mt-2">Loading tasks...</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">
            {editingTask ? "Edit Task" : "Create Task"}
          </h2>
          <TaskForm
            onSubmit={editingTask ? handleUpdate : handleCreate}
            initialTask={editingTask}
            onCancel={() => setEditingTask(null)}
            currentUser={user}
          />
        </div>
        <div className="md:col-span-2">
          <TaskTable
            tasks={tasks}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            currentUser={user}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}

