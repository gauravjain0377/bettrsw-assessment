import { useEffect, useState } from "react";

export default function TaskForm({ onSubmit, initialTask, onCancel, currentUser }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    assigned_to: ""
  });

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "todo",
        assigned_to: initialTask.assigned_to || ""
      });
    }
  }, [initialTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      assigned_to: form.assigned_to ? Number(form.assigned_to) : null
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 h-20 focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Assigned To (User ID)
          </label>
          <input
            type="number"
            name="assigned_to"
            value={form.assigned_to}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder={
              currentUser ? `e.g. ${currentUser.id} for yourself` : undefined
            }
          />
          {currentUser && (
            <p className="mt-1 text-xs text-gray-500">
              Your user id is <span className="font-semibold">{currentUser.id}</span>. Use this if you want
              to assign the task to yourself.
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {initialTask ? "Update Task" : "Create Task"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

