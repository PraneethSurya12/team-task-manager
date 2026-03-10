function TaskForm({
  title,
  setTitle,
  description,
  setDescription,
  dueDate,
  setDueDate,
  assignedTo,
  setAssignedTo,
  members,
  addTask
}) {

  return (

    <div className="mb-8">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <input
          id="taskTitle"
          name="taskTitle"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-xl"
        />

        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-xl"
        />

      </div>

      <textarea
  id="description"
  name="description"
  placeholder="Task Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="bg-slate-800 border border-slate-700 text-white placeholder-gray-400 p-3 rounded-xl mt-4 w-full"
/>

      <select
  value={assignedTo}
  onChange={(e) => setAssignedTo(e.target.value)}
  className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl mt-4 w-full"
>
        <option value="">Select Assignee</option>

        {members.map((member) => (
          <option key={member.user_id} value={member.user_id}>
            {member.email} ({member.role})
          </option>
        ))}
      </select>

      <button
        onClick={addTask}
        className="bg-indigo-600 hover:bg-indigo-500 transition text-white p-3 rounded-xl mt-4 w-full sm:w-auto"
      >
        Add Task
      </button>

    </div>

  );
}

export default TaskForm;