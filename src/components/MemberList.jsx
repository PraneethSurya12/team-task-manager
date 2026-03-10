function MemberList({ members }) {

  return (
    <div className="mb-6">

      <h2 className="font-semibold mb-2">
        Workspace Members
      </h2>

      {members.map((member) => (
        <div key={member.user_id} className="text-sm">
          {member.role === "admin" ? "👑" : "👤"} {member.email}
        </div>
      ))}

    </div>
  );

}

export default MemberList;