function Pagination({ page, setPage, totalCount, pageSize }) {

  return (
    <div className="flex justify-between items-center mt-6">

      <button
        disabled={page === 0}
        onClick={() => setPage((p) => Math.max(p - 1, 0))}
        className="px-4 py-2 bg-slate-700 rounded"
      >
        Previous
      </button>

      <span>
        Page {page + 1} of {Math.ceil(totalCount / pageSize)}
      </span>

      <button
        disabled={(page + 1) * pageSize >= totalCount}
        onClick={() => setPage((p) => p + 1)}
        className="px-4 py-2 bg-slate-700 rounded"
      >
        Next
      </button>

    </div>
  );
}

export default Pagination;