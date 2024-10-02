import React, { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  updateEdge,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ContextMenu from "./ContextMenu";
import { toPng } from "html-to-image";
import "reactflow/dist/style.css";

// import { FaHeart } from "react-icons/fa";
import { useGlobalContext } from "./context";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    position: { x: 500, y: 100 },
    data: { label: "Double click to open context menu" },
    style: {
      background: "#98FB98",
    },
  },
  {
    id: "2",
    position: { x: 500, y: 200 },
    data: { label: "Click to update" },
    style: {
      background: "#AFEEEE",
    },
  },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

function downloadImage(dataUrl) {
  const a = document.createElement("a");

  a.setAttribute("download", "flowchart.png");
  a.setAttribute("href", dataUrl);
  a.click();
}
const imageWidth = 1024;
const imageHeight = 768;
const Content = () => {
  const { isSidebarOpen} = useGlobalContext();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeName, setNodeName] = useState();
  const [nodeId, setNodeId] = useState();
  const [nodeColor, setNodeColor] = useState("#ffffff");
  const [selectedElements, setSelectedElements] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const edgeUpdateSuccessful = useRef(true);
  const [menu, setMenu] = useState(null);
  const ref = useRef(null);
  const [newNodeInput, setNewNodeInput] = useState({
    id: "",
    name: "",
    color: "#ffffff",
  });
  const { setViewport } = useReactFlow();
  const { getNodes } = useReactFlow();
  const onClick = () => {
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );

    toPng(document.querySelector(".react-flow__viewport"), {
      backgroundColor: "#eef",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImage);
  };
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const [id, setId] = useState(0);

  const getId = useCallback(() => {
    setId((prevId) => prevId + 1);
    return `node_${id}`;
  }, [id]);

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY - 60,
        left:
          event.clientX < pane.width - 200 &&
          (isSidebarOpen ? event.clientX - 300 : event.clientX),
        right:
          event.clientX >= pane.width - 200 &&
          pane.width - (isSidebarOpen ? event.clientX - 300 : event.clientX),
        bottom:
          event.clientY >= pane.height - 200 &&
          pane.height - event.clientY + 70,
      });
    },
    [setMenu, isSidebarOpen]
  );
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedElements([node]);
    setNodeName(node.data.label);
    setNodeId(node.id);
    setNodeColor(node.style.background);
  }, []);
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => {
      edgeUpdateSuccessful.current = true;
      setEdges((els) => updateEdge(oldEdge, newConnection, els));
    },
    [setEdges]
  );

  const onEdgeUpdateEnd = useCallback(
    (_, edge) => {
      if (!edgeUpdateSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }

      edgeUpdateSuccessful.current = true;
    },
    [setEdges]
  );

  const handleCreateNode = () => {
    const newNode = {
      id: newNodeInput.id.length > 0 ? newNodeInput.id : getId(),
      position: { x: 400, y: 50 }, // You can set the initial position as needed
      data: {
        label:
          newNodeInput.name.length > 0 ? newNodeInput.name : "Default Name",
      },
      style: {
        background:
          newNodeInput.color.length > 0 ? newNodeInput.color : nodeColor, // Default color
      },
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
    setNewNodeInput({ id: "", name: "", color: "#ffffff" });
  };
  useEffect(() => {
    if (selectedElements.length > 0) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedElements[0]?.id) {
            node.data = {
              ...node.data,
              label: nodeName,
            };
            node.style = {
              ...node.style,
              background: nodeColor,
            };
          }
          return node;
        })
      );
    } else {
      setNodeName(""); // Clear nodeName when no node is selected
      setNodeColor("#ffffff");
    }
  }, [nodeName, nodeColor, selectedElements, setNodes]);

  const handleUpdateNode = (event) => {
    const { name, value } = event.target;

    // Update the corresponding state based on the input name

    if (name === "name") setNodeName(value);
    else if (name === "background") setNodeColor(value.background);

    // Find the selected node and update its data
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: { ...n.data, [name]: value },
              style: {
                ...n.style,
                [name]: value,
              },
            }
          : n
      )
    );
  };

  const onDragStart = (event, nodeType, nodeName) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("nodeName", nodeName); // Add this line
    event.dataTransfer.effectAllowed = "move";
};


  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

const onDrop = useCallback(
    (event) => {
        event.preventDefault();

        const type = event.dataTransfer.getData("application/reactflow");
        const nodeName = event.dataTransfer.getData("nodeName"); // Get the node name

        // check if the dropped element is valid
        if (typeof type === "undefined" || !type) {
            return;
        }

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        const newNode = {
            id: getId(),
            type,
            position,
            data: { label: nodeName || "Default Name" }, // Use the node name here
            style: {
                background: "#ffffff",
            },
        };

        setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, getId, setNodes]
);


  const flowKey = "example-flow";
  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport, setEdges]);
  const downloadJSON = () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject(); // Get the current flowchart data
      const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.setAttribute('download', 'flowchart.json');
      a.setAttribute('href', URL.createObjectURL(blob));
      a.click();
    }
  };
  
  const onSaveClick = () => {
    downloadJSON(); // Download as JSON
  };
  return (
    <ReactFlow
      ref={ref}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onInit={setReactFlowInstance}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onEdgeUpdate={onEdgeUpdate}
      onEdgeUpdateStart={onEdgeUpdateStart}
      onEdgeUpdateEnd={onEdgeUpdateEnd}
      onPaneClick={onPaneClick}
      onNodeContextMenu={onNodeContextMenu}
    >
      
      {/* sidebar */}
      <div
        className={`transition-all  duration-500  fixed top-0 ${
           isSidebarOpen ? "right-0" : "-right-96"
        }`}
      >
        <div className="relative flex flex-col w-96 h-screen min-h-screen px-4 py-8 overflow-y-auto bg-white border-r">
          {/* <hr className="my-0 mt-[0.20rem]" /> */}
          <div className="flex flex-col justify-between flex-1 mt-3">
            <div className="flex flex-col justify-start space-y-5 h-[calc(100vh-135px)]">           
 <div className="flex flex-col justify-start space-y-5 h-[calc(100vh-135px)] ">
 
      {/* Drag and Drop Section */}
      
  {!selectedElements.length > 0 && (
    <div className="flex flex-col space-y-3">
  <p className="text-lg text-center  text-white rounded bg-purple-900 h-8">Select Node</p>
  <p className=" text-center rounded  text-black"  style={{ backgroundColor: '#bcbcbc', marginBottom: 8, marginTop : 17 }}>Text Generation Node</p>
  
  <div className="flex flex-row space-x-3"> {/* Two buttons in a row */}
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default", "Generate Post")} // Pass the name here

        draggable
      >
        Generate Post
      </div>
    </div>
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default", "  Article Generator")}
        draggable
      >
        Article Generator
      </div>
    </div>
  </div>
  
  <div className="flex flex-row space-x-3">
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default","Paragraph Generate")}
        draggable
      >Paragraph Generate</div>
    </div>
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default"," Grammar Correction")}
        draggable
      >
        Grammar Correction
      </div>
    </div>
  </div>
  
  <div className="flex flex-row space-x-3">
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" ,"Blog Intro")}
        draggable
      >
        Blog Intro
      </div>
    </div>
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" , "Blog Outline")}
        draggable
      >
       Blog Outline
      </div>
    </div>
  </div>
  <div className="flex flex-row space-x-3">
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" , "Video Description")}
        draggable
      >
        Video Description
      </div>
    </div>
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" , "Instagram Caption")}
        draggable
      >
        Instagram Caption
      </div>
    </div>
  </div>
</div>


  )}
  {!selectedElements.length > 0 && (
    <div className="flex flex-col space-y-3">
  <p className=" text-center rounded text-black "style={{ backgroundColor: '#bcbcbc', marginBottom: 8, }} >Video Node</p>
  
  <div className="flex flex-row space-x-3"> {/* Two buttons in a row */}
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" , "AI Avtar")}
        draggable
      >
        AI Avtar
      </div>
    </div>
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" , "Image to Video")}
        draggable
      >
       Image to Video
      </div>
    </div>
  </div>
  
 
  


</div>


  )}
  {!selectedElements.length > 0 && (
    <div className="flex flex-col space-y-3">
  <p className=" text-center rounded text-black "style={{ backgroundColor: '#bcbcbc', marginBottom: 8, }} >Audio Node</p>
  
  <div className="flex flex-row space-x-3"> {/* Two buttons in a row */}
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" , " Text to speech")}
        draggable
      >
        Text to speech
      </div>
    </div>
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" , " Voice Clone")}
        draggable
      >
       Voice Clone
      </div>
    </div>
  </div>
  <div className="flex space-x-3"> 
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" , " AI Voice over")}
        draggable
      >
       AI Voice over</div>
    </div>
  </div>
  
 
  


</div>


  )}
  {!selectedElements.length > 0 && (
    <div className="flex flex-col space-y-3 ">
  <p className=" text-center rounded text-black "style={{ backgroundColor: '#bcbcbc', marginBottom: 8, }} >Image Node</p>
  
  <div className="flex flex-row space-x-3"> {/* Two buttons in a row */}
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" , "AI Avtar")}
        draggable
      >
        AI Avtar
      </div>
    </div>
    <div className="flex flex-1 p-1 rounded inn">
      <div
        className="font-medium text-center rounded cursor-grab w-full"
        onDragStart={(event) => onDragStart(event, "default" , "Image to Video")}
        draggable
      >
       Image to Video
      </div>
    </div>
  </div>
  
 
  


</div>


  )}


      {/* Update Node Section - Show when a node is selected */}
      {selectedElements.length > 0 && (
        
        <div className="flex flex-col space-y-4 p-1 bg-white rounded-md shadow-md w-93">
  {/* Title */}
  <div className="flex items-center justify-center space-x-2">
  <button
    className="p-2 bg-purple-900 text-white rounded flex items-center"
    onClick={() => {
      setSelectedElements([]); // Clear selected elements
    }}
  >
    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
    <span className="sr-only">Go Back</span>
  </button>

  <div className="text-lg text-center rounded text-white bg-purple-900 h-8 w-full flex items-center px-2">
    Add Information
  </div>
</div>


  {/* Toggles */}
  <div className="flex flex-col space-y-2">
    <label className="flex items-center space-x-2">
      <input type="checkbox" className="toggle-switch" />
      <span className="font-medium text-sm">Include Your Brand</span>
    </label>
    <label className="flex items-center space-x-2">
      <input type="checkbox" className="toggle-switch" />
      <span className="font-medium text-sm">Generate Bulk Posts</span>
    </label>
  </div>

  {/* Article Title */}
{/* Article Title */}
<label className="font-semibold text-sm">Article Title</label>
<input
  type="text"
  name="name"
  placeholder="Article Title"
  value={nodeName}
  onChange={handleUpdateNode}
  className="p-2 border border-gray-300 rounded-md text-sm"
/>


  {/* Focus Keywords */}
  <label className="font-semibold text-sm">
    Focus Keywords (Separate with Comma)
  </label>
  <input
    type="text"
    name="focusKeywords"
    placeholder="Focus Keywords (Separate with Comma)"
    className="p-2 border border-gray-300 rounded-md text-sm"
  />

  {/* Language and Maximum Length */}
  <div className="flex space-x-4">
    <div className="flex-1">
      <label className="font-semibold text-sm">Language</label>
      <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
        <option>English (USA)</option>
        {/* Add other options as needed */}
      </select>
    </div>
    <div className="flex-1">
      <label className="font-semibold text-sm">Maximum Length</label>
      <input
        type="number"
        name="maxLength"
        defaultValue={1000}
        className="w-full p-2 border border-gray-300 rounded-md text-sm"
      />
    </div>
  </div>

  {/* Creativity and Tone of Voice */}
  <div className="flex space-x-4">
    <div className="flex-1">
      <label className="font-semibold text-sm">Creativity</label>
      <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
        <option>Good</option>
        {/* Add other options */}
      </select>
    </div>
    <div className="flex-1">
      <label className="font-semibold text-sm">Tone of Voice</label>
      <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
        <option>Professional</option>
        {/* Add other options */}
      </select>
    </div>
  </div>

  {/* Select Model */}
  <label className="font-semibold text-sm">Select Model</label>
  <select className="p-2 border border-gray-300 rounded-md text-sm">
    <option>Select model</option>
    {/* Add options */}
  </select>

  {/* Generate Button */}
  <button className="mt-4 bg-purple-900 text-white py-2 rounded-md">
    Generate
  </button>
</div>

      )}

      <hr className="my-0" />

      {/* Controls Section */}
      <div className="flex flex-col space-y-3">
        <div className="text-lg font-bold text-black">Controls</div>
        <div className="flex flex-row space-x-3">
          <button             className="flex-1 p-2 text-sm text-white rounded bg-slate-700 hover:bg-slate-800 active:bg-slate-900"
 onClick={onSaveClick}>Save</button>
          <button
            className="flex-1 p-2 text-sm text-white rounded bg-slate-700 hover:bg-slate-800 active:bg-slate-900"
            onClick={onRestore}
          >
            Restore
          </button>
          <button
            className="flex-1 p-2 text-sm text-white rounded bg-slate-700 hover:bg-slate-800 active:bg-slate-900"
            onClick={onClick}
          >
            Download
          </button>
        </div>
      </div>
    </div>
           
            </div>
          </div>
        </div>
      </div>
      <Controls />
      <MiniMap zoomable pannable />
      <Background variant="dots" gap={12} size={1} />
      {/* context menu */}
      {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
    </ReactFlow>
  );
};

const ReactFlowProviderContent = () => {
  const { isSidebarOpen } = useGlobalContext();
  return (
    <ReactFlowProvider>
      <div
        className={`h-[calc(100vh-74px)] flex flex-col  ${
  isSidebarOpen ? "mr-96" : ""
        }`}
      >
        <Content />
      </div>
    </ReactFlowProvider>
  );
};
export default ReactFlowProviderContent;
