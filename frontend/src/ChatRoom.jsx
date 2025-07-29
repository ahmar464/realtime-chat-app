// src/components/ChatRoom.jsx
import React, { useState, useEffect, useRef } from "react";

const ChatRoom = () => {
  const [username, setUsername] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);

  useEffect(() => {
    if (!username) return;

    socket.current = new WebSocket("ws://localhost:8000/ws/chat/default/");

    socket.current.onopen = () => {
      console.log("WebSocket connection established.");
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    socket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.current.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    return () => {
      socket.current.close();
    };
  }, [username]);

  const sendMessage = () => {
    if (
      socket.current &&
      socket.current.readyState === WebSocket.OPEN &&
      message.trim() !== ""
    ) {
      const fullMessage = `${username}: ${message}`;
      socket.current.send(JSON.stringify({ message: fullMessage }));
      setMessage("");
    } else {
      console.warn("WebSocket is not open or message is empty.");
    }
  };

  if (!username) {
    return (
      <div className="flex flex-col items-center mt-20">
        <h2 className="text-xl font-bold mb-4">Enter your username</h2>
        <input
          type="text"
          className="border p-2 rounded w-64"
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
        />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            if (inputUsername.trim()) {
              setUsername(inputUsername.trim());
            }
          }}
        >
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Welcome, {username}
      </h2>
      <div className="border h-96 overflow-y-scroll p-4 rounded bg-gray-100">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            {msg}
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
