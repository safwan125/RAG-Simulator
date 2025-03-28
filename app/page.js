"use client";

import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const initialNodes = [
  { id: "P1", data: { label: "Process P1" }, position: { x: 100, y: 100 }, style: { backgroundColor: "#4F46E5" } },
  { id: "R1", data: { label: "Resource R1" }, position: { x: 300, y: 100 }, style: { backgroundColor: "#2563EB" } },
];

const initialEdges = [];

const Navbar = () => (
  <nav className="bg-gray-900 text-white p-4 flex justify-between">
    <h1 className="text-xl font-bold">RAG Simulator</h1>
    <div className="space-x-4">
      <Link to="/" className="hover:text-gray-300">Home</Link>
      <Link to="/about" className="hover:text-gray-300">About Us</Link>
      <Link to="/tutorial" className="hover:text-gray-300">Tutorial</Link>
    </div>
  </nav>
);

const GraphSimulator = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    if (window.confirm("Do you want to delete this edge?")) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
  }, [setEdges]);

  const addNode = (type) => {
    if (nodes.length >= 10) {
      alert("Maximum node limit reached!");
      return;
    }
    const newId = `${type}${nodes.length + 1}`;
    const newNode = {
      id: newId,
      data: { label: `${type} ${newId}` },
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      style: { backgroundColor: type === "P" ? "#4F46E5" : "#2563EB" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const detectCycle = () => {
    const graph = Object.fromEntries(nodes.map((node) => [node.id, []]));
    edges.forEach((edge) => graph[edge.source].push(edge.target));
  
    const visited = new Set(), recStack = new Set(), deadlockNodes = new Set();
    
    const dfs = (node) => {
      if (recStack.has(node)) {
        deadlockNodes.add(node);
        return true;
      }
      if (visited.has(node)) return false;
      
      visited.add(node);
      recStack.add(node);
      for (let neighbor of graph[node] || []) {
        if (dfs(neighbor)) deadlockNodes.add(node);
      }
      recStack.delete(node);
    };
  
    nodes.forEach((node) => !visited.has(node.id) && dfs(node.id));
  
    setNodes((nds) =>
      nds.map((node) =>
        deadlockNodes.has(node.id)
          ? { ...node, style: { backgroundColor: "#DC2626", color: "white" } }
          : { ...node, style: { backgroundColor: node.id.startsWith("P") ? "#4F46E5" : "#2563EB" } }
      )
    );
  
    alert(deadlockNodes.size ? "Deadlock Detected!" : "No Deadlock Detected!");
  };

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="w-4/5 h-5/6 bg-white border border-gray-300 rounded-xl shadow-2xl p-6 flex flex-col">
          <h1 className="text-center text-3xl font-bold text-gray-800 mb-4">Resource Allocation Graph Simulator</h1>
          <div className="flex h-full">
            <div className="w-72 p-5 bg-gray-200 border-r border-gray-300 rounded-l-xl flex flex-col gap-4">
              <button className="bg-green-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-500 transition" onClick={() => addNode("P")}>➕ Add Process</button>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-500 transition" onClick={() => addNode("R")}>➕ Add Resource</button>
              <button className="bg-red-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-500 transition" onClick={detectCycle}>⚠️ Check Deadlock</button>
            </div>
            <div className="flex-grow h-full bg-gray-50 border border-gray-300 rounded-r-xl p-4">
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange} 
                onConnect={onConnect} 
                onEdgeClick={onEdgeClick}  // Added this line to pass the onEdgeClick handler
                fitView
              >
                <Background color="#ddd" gap={16} />
                <Controls />
                <MiniMap nodeColor={(node) => (node.style.backgroundColor || "#4F46E5")} maskColor="#E5E7EB" />
              </ReactFlow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutUs = () => (
  <div className="flex flex-col h-screen">
    <Navbar />
    <div className="flex-grow flex flex-col items-center justify-center bg-gray-800 text-white p-10">
      <h1 className="text-3xl font-bold">About Us</h1>
      <p className="mt-4 max-w-2xl text-center">
        Welcome to the <strong>Resource Allocation Graph (RAG) Simulator</strong>! We provide an interactive way to learn about deadlock detection and resource allocation.
      </p>
    </div>
  </div>
);

const Tutorial = () => (
  <div className="flex flex-col h-screen">
    <Navbar />
    <div className="flex-grow flex flex-col items-center justify-center bg-gray-800 text-white p-10">
      <h1 className="text-3xl font-bold">Tutorial</h1>
      <p className="mt-4 max-w-2xl text-center">
        Learn how to use the simulator: Add processes, allocate resources, and check for deadlocks in real time.
      </p>
    </div>
  </div>
);

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<GraphSimulator />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/tutorial" element={<Tutorial />} />
    </Routes>
  </Router>
);

export default App;