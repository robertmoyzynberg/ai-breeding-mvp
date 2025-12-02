import React from "react";

function OffspringList({ offspring = [] }) {
  return (
    <div>
      <h2>Offspring List</h2>
      {offspring.length === 0 ? (
        <p>No offspring yet.</p>
      ) : (
        <ul>
          {offspring.map((child) => (
            <li key={child.id}>{child.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OffspringList;

