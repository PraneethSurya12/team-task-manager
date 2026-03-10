import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";
function TaskCard({
   task,
  members,
  user,
  userRole,
  editingId,
  startEditing,
  saveEdit,
  updateTaskStatus,
  deleteTask,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  getDueStatus
}) {

const [comments, setComments] = useState([]);
const [newComment, setNewComment] = useState("");
const [showDetails, setShowDetails] = useState(false);
const [file, setFile] = useState(null);
const [attachments, setAttachments] = useState([]);
const fetchComments = async () => {

  const { data, error } = await supabase
    .from("task_comments")
    .select("*")
    .eq("task_id", task.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setComments(data || []);
};
const fetchAttachments = async () => {

  const { data, error } = await supabase
    .from("task_attachments")
    .select("*")
    .eq("task_id", task.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setAttachments(data || []);
};

useEffect(() => {

  const loadData = async () => {
    await fetchComments();
    await fetchAttachments();
  };

  loadData();

}, [task.id]);
const addComment = async () => {

  if (!newComment.trim()) return;

  const { data, error } = await supabase
  .from("task_comments")
  .insert([
    {
      task_id: task.id,
      comment: newComment,
      created_by: user.email
    }
  ])
  .select();

  if (error) {
    console.error("Comment insert error:", error);
    return;
  }

  console.log("Comment inserted:", data);

  setNewComment("");
  fetchComments();
};
 const uploadFile = async () => {

  if (!file) return;

  const filePath = `${task.id}/${Date.now()}_${file.name}`;

  // upload to storage
  const { error: uploadError } = await supabase.storage
    .from("task-files")
    .upload(filePath, file);

  if (uploadError) {
    console.error(uploadError);
    return;
  }

  const { data } = supabase.storage
    .from("task-files")
    .getPublicUrl(filePath);

  const fileUrl = data.publicUrl;

  // store in DB
  await supabase
    .from("task_attachments")
    .insert([
      {
        task_id: task.id,
        file_name: file.name,
        file_url: fileUrl,
        uploaded_by: user.email
      }
    ]);

  setFile(null);
  fetchAttachments();
};

  return (
    <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 shadow hover:shadow-lg transition duration-200 space-y-3">

      <div className="flex-1">

        {editingId === task.id ? (
          <>
            <input
              className="border p-2 rounded w-full mb-2"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            <textarea
              className="border p-2 rounded w-full"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">

              <h3 className="text-lg font-semibold text-white">
                {task.title}
              </h3>

              <p className="text-sm text-gray-400">
                {task.description}
              </p>

            </div>

            <p className="text-xs text-gray-400">
              Created by: {task.created_by_email}
            </p>

            {task.assigned_to && (
              <p className="text-xs text-gray-500">
                Assigned to: {
                  members.find(
                    m => m.user_id === task.assigned_to
                  )?.email
                }
              </p>
            )}

            {task.status !== "done" && task.due_date && (
              <>
                <p className="text-sm text-blue-400 mt-1">
                  📅 Due: {new Date(task.due_date).toLocaleDateString()}
                </p>

                {(() => {
                  const dueInfo = getDueStatus(task.due_date);
                  return dueInfo ? (
                    <p className={`text-sm font-medium ${dueInfo.color}`}>
                      {dueInfo.text}
                    </p>
                  ) : null;
                })()}
              </>
            )}

          </>
        )}

      <span
  className={`px-3 py-1 text-xs rounded-full font-semibold
  ${
    task.status === "done"
      ? "bg-green-500/20 text-green-400"
      : task.status === "in_progress"
      ? "bg-blue-500/20 text-blue-400"
      : "bg-yellow-500/20 text-yellow-400"
  }`}
>
  {task.status.replace("_", " ")}
</span>

      </div>

      <div className="flex flex-wrap gap-3 mt-3">

        {editingId === task.id ? (
          <button
            onClick={() => saveEdit(task.id)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded"
          >
            Save
          </button>
        ) : (
          userRole === "admin" && (
            <button
              onClick={() => startEditing(task)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
          )
        )}

        {(userRole === "admin" || task.assigned_to === user.id) && (
          <select
  value={task.status}
  onChange={(e) =>
    updateTaskStatus(task.id, e.target.value)
  }
  className="bg-slate-700 text-white px-2 py-1 rounded text-sm"
>
  <option value="pending">Pending</option>
  <option value="in_progress">In Progress</option>
  <option value="done">Done</option>
</select>
        )}

        {userRole === "admin" && (
          <button
            onClick={() => deleteTask(task.id)}
            className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        )}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded"
        >
        Details
        </button>

      </div>
{showDetails && (
<div className="mt-4 border-t border-slate-700 pt-2">

  <p className="text-sm font-semibold mb-1">Comments</p>

  {comments.map((c) => (
    <div key={c.id} className="text-xs text-gray-400">
      <b>{c.created_by}</b>: {c.comment}
    </div>
  ))}

  <div className="flex gap-2 mt-2">

    <input
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="Write comment..."
      className="bg-slate-700 p-1 text-xs rounded flex-1"
    />

    <button
      onClick={addComment}
      className="bg-indigo-500 px-2 py-1 text-xs rounded"
    >
      Add
    </button>

<div className="mt-4">

  <p className="text-sm font-semibold mb-1">
    Attachments
  </p>

  {attachments.map((file) => (
    <div key={file.id} className="text-xs text-blue-400">
      <a href={file.file_url} target="_blank">
        {file.file_name}
      </a>
    </div>
  ))}

  <div className="flex gap-2 mt-2">

    <input
      type="file"
      onChange={(e) => setFile(e.target.files[0])}
      className="text-xs"
    />

    <button
      onClick={uploadFile}
      className="bg-indigo-500 px-2 py-1 text-xs rounded"
    >
      Upload
    </button>

  </div>

</div>
  </div>

</div>
      )}
    </div>
  );
}

export default TaskCard;