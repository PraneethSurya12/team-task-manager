import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import MemberList from "./components/MemberList";
import Pagination from "./components/Pagination";
import TaskCard from "./components/TaskCard";
import TaskForm from "./components/TaskForm";


function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
  mine: 0,
});
  const pageSize = 5;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [sortBy, setSortBy] = useState("due_date");
  

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  // 🔹 Fetch tasks for logged-in user
const fetchTasks = async (wsId) => {
  if (!wsId) return;

  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("workspace_id", wsId);
  if (searchTerm) {
  query = query.or(
    `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
  );
}

  // 🔥 APPLY FILTER IN DATABASE
  if (filter === "mine") {
    query = query.eq("assigned_to", user.id);
  }

  if (filter === "pending") {
    query = query.eq("status", "pending");
  }

  if (filter === "in_progress") {
  query = query.eq("status", "in_progress");
  }

  if (filter === "done") {
    query = query.eq("status", "done");
  }
    //sorting
    if (sortBy === "due_date") {
      query = query.order("due_date", { ascending: true, nullsFirst: false });
    }

    if (sortBy === "created_at") {
      query = query.order("created_at", { ascending: false });
    }

    if (sortBy === "status") {
      query = query.order("status", { ascending: true });
    }
    const { data, count, error } = await query.range(from, to);
    console.log("Sorting by:", sortBy);

  if (error) {
    console.error(error);
    return;
  }

  setTasks(data || []);
  setTotalCount(count || 0);
};
const fetchDashboardStats = async (wsId, userId) => {
  if (!wsId || !userId) return;

  const { count: total } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", wsId);

  const { count: pending } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", wsId)
    .eq("status", "pending");

  const { count: inProgress } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", wsId)
    .eq("status", "in_progress");

  const { count: completed } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", wsId)
    .eq("status", "done");

  const { count: mine } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", wsId)
    .eq("assigned_to", userId);

  setDashboardStats({
    total,
    pending,
    inProgress,
    completed,
    mine,
  });
};
const initializeWorkspace = async (userId) => {
  // 1️⃣ Get membership for current user
  const { data: membership, error } = await supabase
  .from("workspace_members")
  .select("workspace_id, role")
  .eq("user_id", userId)
  .single(); // ✅ no arguments

console.log("Membership returned:", membership); // ✅ closed bracket

if (error) {
  console.error("Membership fetch error:", error);
  return null;
}

if (!membership) {
  alert("No workspace assigned. Contact admin.");
  return null;
}

const wsId = membership.workspace_id;
const role = membership.role;

console.log("Detected role:", role);
console.log("Workspace ID:", wsId);

setWorkspaceId(wsId);
setUserRole(role);

  // 2️⃣ Fetch all members for that workspace (with email)
  const { data: memberData, error: memberError } = await supabase
  .rpc("get_workspace_members", {
    p_workspace_id: wsId,
  });
  console.log("Members from RPC:", memberData); 
if (memberError) {
  console.error("Member fetch error:", memberError);
  setMembers([]);
} else {
  console.log("Members:", memberData); // optional for debugging
  setMembers(memberData || []);
}
  return wsId;
};
 
  // 🔹 Add Task
  const addTask = async () => {
    console.log("addTask triggered");
  if (!title || !user || !workspaceId) return;

  if (userRole === "admin" && !assignedTo) {
    alert("Please select assignee");
    return;
  }

  // 1️⃣ Insert Task
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        title,
        description,
        status: "pending",
        due_date: dueDate || null,
        workspace_id: workspaceId,
        user_id: user.id,
        assigned_to: assignedTo,
        created_by_email: user.email,
      },
    ])
    .select();

  if (error) {
    console.error("Task insert error:", error);
    return;
  }

  console.log("Inserted task:", data);

  setMessage("Task created successfully!");
  setTimeout(() => setMessage(""), 3000);

  // 2️⃣ Insert Activity
  const { error: activityError } = await supabase
    .from("task_activity")
    .insert([
      {
        task_id: data[0].id,
        action: "created task",
        performed_by: user.email,
      },
    ]);

  if (activityError) {
    console.error("Activity insert error:", activityError);
  } else {
    console.log("Activity inserted successfully");
  }

  setTitle("");
  setDescription("");
  setDueDate("");
};
  // 🔹 Delete Task
  const deleteTask = async (id) => {

  // 🔥 Insert activity BEFORE deleting
  await supabase.from("task_activity").insert([
    {
      task_id: id,
      action: "deleted task",
      performed_by: user.email,
    },
  ]);
  setMessage("Task deleted successfully");
  setTimeout(() => setMessage(""), 3000);
  await supabase.from("tasks").delete().eq("id", id);
};
const updateTaskStatus = async (taskId, newStatus) => {

  // 1️⃣ Update UI instantly
  setTasks((prevTasks) =>
    prevTasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
            completed_at:
              newStatus === "done"
                ? new Date().toISOString()
                : null
          }
        : task
    )
  );

  setDashboardStats((prev) => {
  const updated = { ...prev };

  // Adjust counters
  if (newStatus === "done") {
    updated.completed += 1;
    if (updated.pending > 0) updated.pending -= 1;
    if (updated.inProgress > 0) updated.inProgress -= 1;
  }

  if (newStatus === "in_progress") {
    updated.inProgress += 1;
    if (updated.pending > 0) updated.pending -= 1;
  }

  return updated;
});
  // 2️⃣ Update database
  const { error } = await supabase
    .from("tasks")
    .update({
      status: newStatus,
      completed_at:
        newStatus === "done"
          ? new Date().toISOString()
          : null
    })
    .eq("id", taskId);

  if (error) {
    console.error(error);
    return;
  }
};
 // 🔹 Check logged-in user
 useEffect(() => {

  const initialize = async (currentUser) => {

    if (!currentUser) {
      // Reset state when logged out
      setWorkspaceId(null);
      setUserRole(null);
      setMembers([]);
      setTasks([]);
      setDashboardStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        mine: 0,
      });
      return;
    }

    const wsId = await initializeWorkspace(currentUser.id);

    if (!wsId) return;

    await fetchTasks(wsId);
    await fetchDashboardStats(wsId, currentUser.id);

    const channel = supabase
      .channel("realtime-tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `workspace_id=eq.${wsId}`,
        },
        () => {
          fetchTasks(wsId);
          fetchDashboardStats(wsId, currentUser.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Listen for login/logout
  const { data: listener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      initialize(currentUser);
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };

}, []);
const refreshData = async () => {
  if (!workspaceId || !user) return;

  await fetchTasks(workspaceId);
  await fetchDashboardStats(workspaceId, user.id);
};

useEffect(() => {
  setPage(0);
}, [filter, searchTerm]);

useEffect(() => {
  refreshData();
}, [workspaceId, page, filter, searchTerm, sortBy]);

useEffect(() => {
  refreshData();
}, [workspaceId, user]);

// eslint-disable-next-line react-hooks/exhaustive-deps

  // 🔹 Start Editing
  const startEditing = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  // 🔹 Save Edit
  const saveEdit = async (id) => {
    await supabase
  .from("tasks")
  .update({
    title: editTitle,
    description: editDescription,
  })
  .eq("id", id);

// 🔥 Insert activity
await supabase.from("task_activity").insert([
  {
    task_id: id,
    action: "edited task",
    performed_by: user.email,
  },
]);

setEditingId(null);
    
  };
  const changePassword = async () => {
  if (!newPassword || newPassword.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Password updated successfully!");
    setNewPassword("");
    setShowChangePassword(false);
  }
};
const inviteMember = async () => {

  if (!inviteEmail.includes("@")) {
  alert("Please enter a valid email address");
  return;
  }

  if (!inviteEmail || !workspaceId) return;

  const { error } = await supabase.rpc("invite_user_to_workspace", {
    invited_email: inviteEmail,
    workspace_uuid: workspaceId,
  });

  if (error) {
    alert("User must sign up first before being invited.");
    return;
  }

  alert("User added to workspace successfully!");
  setInviteEmail("");
};

  // 🔹 Logout
  const logout = async () => {
    await supabase.auth.signOut();
  };

  const getDueStatus = (dueDate) => {
  if (!dueDate) return null;

  const today = new Date();
  const due = new Date(dueDate);

  // Remove time for accurate day comparison
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due - today;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {   
    return {
      text: `Overdue by ${Math.abs(diffDays)} day(s)`,
      color: "text-red-600",
    };
  }

  if (diffDays === 0) {
    return {
      text: "Due Today",
      color: "text-yellow-600",
    };
  }

  return {
    text: `Due in ${diffDays} day(s)`,
    color: "text-green-600",
  };
};

  // 🔐 If not logged in → show login screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Auth setUser={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 p-6">
      <div className="w-full max-w-5xl mx-auto bg-slate-900/90 backdrop-blur border border-slate-800 shadow-2xl rounded-2xl p-6 sm:p-8">
        {message && (
        <div className="mb-4 bg-green-500/20 text-green-400 p-3 rounded-lg text-sm">
        {message}
        </div>
        )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 border-b border-slate-800 pb-4">
        <div>
  <h1 className="text-2xl sm:text-3xl font-bold text-indigo-400">
    Task Management
  </h1>
  <p className="text-sm text-slate-400">
    Logged in as: {user?.email}
  </p>
  <span
  className={`inline-block mt-1 px-3 py-1 text-xs rounded-full ${
    userRole === "admin"
      ? "bg-purple-200 text-purple-800"
      : "bg-gray-200 text-gray-800"
  }`}
>
  {userRole === "admin" ? "👑 Admin" : "👤 Member"}
</span>
</div>

  <div className="flex gap-3">
    <button
      onClick={() => setShowChangePassword(!showChangePassword)}
      className="bg-gray-600 text-white px-4 py-2 rounded-lg"
    >
      Change Password
    </button>

    <button
      onClick={logout}
      className="bg-black text-white px-4 py-2 rounded-lg"
    >
      Logout
    </button>
  </div>
</div> 
{showChangePassword && (
  <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl mb-6">
    <input
  id="newPassword"
  name="newPassword"
  type="password"
  placeholder="New Password"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
  className="border p-2 rounded mr-2"
/>
    <button
      onClick={changePassword}
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      Update Password
    </button>
  </div>
)}
{userRole === "admin" && (
  <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl mb-6">
    <h2 className="font-semibold mb-2">Invite Team Member</h2>
    <div className="flex gap-2">
     <input
  id="inviteEmail"
  name="inviteEmail"
  type="email"
  placeholder="Enter user email"
  value={inviteEmail}
  onChange={(e) => setInviteEmail(e.target.value)}
  className="border p-2 rounded flex-1 bg-slate-800 text-white placeholder-gray-400"
/>
      <button
        onClick={inviteMember}
        className="bg-indigo-500 text-white px-4 py-2 rounded"
      >
        Invite
      </button>
    </div>
  </div>
)}
<MemberList members={members} />
<Dashboard
  dashboardStats={dashboardStats}
  userRole={userRole}
  setFilter={setFilter}
/>
  {userRole === "admin" && (
<TaskForm
title={title}
setTitle={setTitle}
description={description}
setDescription={setDescription}
dueDate={dueDate}
setDueDate={setDueDate}
assignedTo={assignedTo}
setAssignedTo={setAssignedTo}
members={members}
addTask={addTask}
/>
)} 
<div className="flex gap-3 mb-4">
  <input
  id="searchTasks"
  name="searchTasks"
  type="text"
  placeholder="Search tasks..."
  value={searchTerm}
  onChange={(e) => {
  setSearchTerm(e.target.value);
  setPage(0);
}}
  className="w-full bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-xl"
/>
<select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
  className="bg-slate-800 border border-slate-700 text-white p-2 rounded"
>
  <option value="due_date">Sort by Due Date</option>
  <option value="created_at">Sort by Created Time</option>
  <option value="status">Sort by Status</option>
</select>
</div>
<div className="space-y-4">

  {tasks.length === 0 && (
    <p className="text-center text-gray-500">
      No tasks available
    </p>
  )}

  {tasks.map((task) => (
    <TaskCard
      key={task.id}
      task={task}
      members={members}
      user={user}
      userRole={userRole}
      editingId={editingId}
      startEditing={startEditing}
      saveEdit={saveEdit}
      updateTaskStatus={updateTaskStatus}
      deleteTask={deleteTask}
      editTitle={editTitle}
      setEditTitle={setEditTitle}
      editDescription={editDescription}
      setEditDescription={setEditDescription}
      getDueStatus={getDueStatus}
    />
  ))}

</div>
<Pagination
  page={page}
  setPage={setPage}
  totalCount={totalCount}
  pageSize={pageSize}
/>
       </div>
    </div>
  );
}

export default App;