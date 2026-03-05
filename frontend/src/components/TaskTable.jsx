export default function TaskTable({ tasks, onEdit, onDelete, currentUser, onStatusChange }) {
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
          {tasks.map((task) => {
            const isCreator = task.created_by === currentUser?.id;
            const isAssignee = task.assigned_to === currentUser?.id;
            return (
            <tr key={task.id}>
              <td className="px-4 py-2 text-sm text-gray-900">{task.title}</td>
              <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate">
                {task.description}
              </td>
              <td className="px-4 py-2 text-sm">
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task, e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                  disabled={!isCreator && !isAssignee}
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {task.assigned_to ?? "-"}
              </td>
              <td className="px-4 py-2 text-sm text-right space-x-2">
                {isCreator && (
                  <>
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
                  </>
                )}
              </td>
            </tr>
          )})}
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

