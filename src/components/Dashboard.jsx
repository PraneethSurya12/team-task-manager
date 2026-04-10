import AIInput from "./AIInput";
function Dashboard({ dashboardStats, setFilter }) {
  return (
    <>
    <AIInput />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">

      <div
        onClick={() => setFilter("all")}
        className="bg-slate-800 p-5 rounded-xl cursor-pointer hover:bg-slate-700 hover:scale-[1.03] transition duration-200 shadow"
      >
        <p className="text-sm text-gray-400">Total Tasks</p>
        <p className="text-xl font-bold">{dashboardStats.total}</p>
      </div>

      <div
        onClick={() => setFilter("pending")}
        className="bg-slate-800 p-5 rounded-xl cursor-pointer hover:bg-slate-700 hover:scale-[1.03] transition duration-200 shadow"
      >
        <p className="text-sm text-gray-400">Pending</p>
        <p className="text-xl font-bold">{dashboardStats.pending}</p>
      </div>

      <div
        onClick={() => setFilter("in_progress")}
        className="bg-slate-800 p-5 rounded-xl cursor-pointer hover:bg-slate-700 hover:scale-[1.03] transition duration-200 shadow"
      >
        <p className="text-sm text-gray-400">In Progress</p>
        <p className="text-xl font-bold">{dashboardStats.inProgress}</p>
      </div>
      
      <div
        onClick={() => setFilter("done")}
        className="bg-slate-800 p-5 rounded-xl cursor-pointer hover:bg-slate-700 hover:scale-[1.03] transition duration-200 shadow"
      >
        <p className="text-sm text-gray-400">Completed</p>
        <p className="text-xl font-bold">{dashboardStats.completed}</p>
      </div>

      <div
        onClick={() => setFilter("mine")}
        className="bg-slate-800 p-5 rounded-xl cursor-pointer hover:bg-slate-700 hover:scale-[1.03] transition duration-200 shadow"
      >
        <p className="text-sm text-gray-400">Assigned to Me</p>
        <p className="text-xl font-bold">{dashboardStats.mine}</p>
      </div>

    </div>
    </>
  );
}

export default Dashboard;