// import React, { useCallback } from "react";
// import { useReactFlow } from "reactflow";

// export default function ContextMenu({
//   id,
//   top,
//   left,
//   right,
//   bottom,
//   ...props
// }) {
//   const { getNode, setNodes, addNodes, setEdges } = useReactFlow();
//   const duplicateNode = useCallback(() => {
//     const node = getNode(id);
//     const position = {
//       x: node.position.x + 50,
//       y: node.position.y + 50,
//     };

//     addNodes({ ...node, id: `${node.id}-copy`, position });
//   }, [id, getNode, addNodes]);

//   const deleteNode = useCallback(() => {
//     setNodes((nodes) => nodes.filter((node) => node.id !== id));
//     setEdges((edges) => edges.filter((edge) => edge.source !== id));
//   }, [id, setNodes, setEdges]);

//   return (
//     <div
//       style={{ top, left, right, bottom }}
//       className="absolute z-10 bg-white border rounded-md shadow-xl outline"
//       {...props}
//     >
//       <p style={{ margin: "0.5em" }}>
//         <small>node: {id}</small>
//       </p>
//       <button
//         onClick={duplicateNode}
//         className="hover:bg-slate-200 bg-slate-100  block p-[0.5em] text-left w-[100%]"
//       >
//         <small>Duplicate</small>
//       </button>
//       <button
//         onClick={deleteNode}
//         className="hover:bg-slate-200 bg-slate-100 block p-[0.5em] text-left w-[100%]"
//       >
//         <small>Delete</small>
//       </button>
//     </div>
//   );
// }

import React, { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCopy, faTrash } from '@fortawesome/free-solid-svg-icons'; // Importing Font Awesome icons

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  ...props
}) {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();

  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    };
    addNodes({ ...node, id: `${node.id}-copy`, position });
  }, [id, getNode, addNodes]);

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
  }, [id, setNodes, setEdges]);

  const editNode = useCallback(() => {
    console.log(`Editing node: ${id}`);
  }, [id]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="absolute z-10 bg-transparent  "
      {...props}
    >
      <div className="flex space-x-2">
        <button
          onClick={editNode}
          className=" p-2 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="inline-block mr-2" />
          {/* <small>Edit</small> */}
        </button>
        <button
          onClick={duplicateNode}
          className=" p-2 flex items-center"
        >
          <FontAwesomeIcon icon={faCopy} className="inline-block mr-2" />
          {/* <small>Duplicate</small> */}
        </button>
        <button
          onClick={deleteNode}
          className=" p-2 flex items-center"
        >
          <FontAwesomeIcon icon={faTrash} className="inline-block mr-2" />
          {/* <small>Delete</small> */}
        </button>
      </div>
    </div>
  );
}
