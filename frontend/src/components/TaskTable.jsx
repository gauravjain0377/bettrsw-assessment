export default function TaskTable({ tasks, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-white shadow rounded">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-4 py-2 text-sm text-gray-900">{task.title}</td>
              <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate">
                {task.description}
              </td>
              <td className="px-4 py-2 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    task.status === "done"
                      ? "bg-green-100 text-green-800"
                      : task.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {task.assigned_to ?? "-"}
              </td>
              <td className="px-4 py-2 text-sm text-right space-x-2">
                <button
                  onClick={() => onEdit(task)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(task)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-4 text-center text-sm text-gray-500"
              >
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

