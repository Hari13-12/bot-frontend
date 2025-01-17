import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import './chatsam.css';
import chatbot from '../images/chatbot.png';
import human from '../images/human.png';
import Cookies from 'js-cookie';
import ReactMarkdown from 'react-markdown';

const Chatsam = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchedQuery, setFetchedQuery] = useState(''); // State for the fetched query
  const chatEndRef = useRef(null);
  const rowsPerPage = 10;

  const navigate = useNavigate();

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const tok = Cookies.get('auth_token');
    const ws = new WebSocket("ws://localhost:8000/message/ws", [], {
      headers: {
        cookie: `auth_token=${tok};refresh_token=""`,
      },
    });
  
    ws.onopen = () => {
      console.log("WebSocket connected!");
    };
  
    ws.onmessage = (event) => {
      console.log("Received message:", event.data);
      setIsLoading(false);
      try {
        const receivedData = JSON.parse(event.data);
        setFetchedQuery(receivedData.query || ""); // Store the fetched query
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: receivedData.message || receivedData.toString() },
        ]);
        fetchTableData(receivedData); // Pass data to fetchTableData
      } catch (error) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: event.data },
        ]);
      }
    };
  
    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      navigate("/");
      
    };
  
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      navigate("/");
    };
  
    setSocket(ws);
  
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);
  const fetchTableData = (receivedData) => {
    try {
      const data = receivedData?.query_results; // Use optional chaining to avoid null/undefined errors
      if (data && Array.isArray(data.data)) { // Check if data.data exists and is an array
        const rows = data.data;
        console.log("Query Results Data:", rows);
        setApiData(rows);
        setFilteredData(rows);
        setError(null);
      } else {
        console.log("No data to display");
        setApiData([]);
        setFilteredData([]);
        console.log("No data to display"); // Set error message
      }
    } catch (err) {
      console.error("Error processing API data:", err);
      setApiData([]);
      setFilteredData([]);
      setError(err.message); // Set error message
    }
  };
  

  const handleSend = () => {
    if (inputValue.trim()) {
      const userMessage = { sender: 'user', text: inputValue };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setApiData([]);
      setFilteredData([]);
      setIsLoading(true);

      if (socket && socket.readyState === WebSocket.OPEN) {
        const messagePayload = { message: inputValue };
        socket.send(JSON.stringify(messagePayload));
      } else {
        console.error('WebSocket not connected');
        navigate("/");
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: 'WebSocket is not connected.' },
        ]);
        setIsLoading(false);
      }

      setInputValue('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSearch = (e) => {
    const searchText = e.target.value.toLowerCase();
    const filteredRows = apiData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText)
      )
    );
    setFilteredData(filteredRows);
    setCurrentPage(1);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fetchedQuery).then(() => {
      alert('Query copied to clipboard!');
    });
  };

  const renderTable = () => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedRows = filteredData.slice(start, end);

    return (
      <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        <table className="table table-bordered">
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <tr>
              {filteredData.length > 0 &&
                Object.keys(filteredData[0]).map((key) => <th key={key}>{key}</th>)}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, idx) => (
                  <td key={idx}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPagination = () => {
    const pageCount = Math.ceil(filteredData.length / rowsPerPage);
    if (pageCount <= 1) return null;
  
    const maxPagesToShow = 10; // Maximum pages to display at once
    const currentChunk = Math.ceil(currentPage / maxPagesToShow); // Current chunk of pages
    const chunkStart = (currentChunk - 1) * maxPagesToShow + 1;
    const chunkEnd = Math.min(chunkStart + maxPagesToShow - 1, pageCount);
  
    const pagesInChunk = Array.from({ length: chunkEnd - chunkStart + 1 }, (_, index) => chunkStart + index);
  
    return (
      <div className="pagination" style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
        {/* Previous Chunk Button */}
        {chunkStart > 1 && (
          <button onClick={() => setCurrentPage(chunkStart - maxPagesToShow)}>Previous</button>
        )}
  
        {/* Page Numbers */}
        {pagesInChunk.map((page) => (
          <button
            key={page}
            className={page === currentPage ? 'active' : ''}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
  
        {/* Next Chunk Button */}
        {chunkEnd < pageCount && (
          <button onClick={() => setCurrentPage(chunkEnd + 1)}>Next</button>
        )}
      </div>
    );
  };
  

  return (
    <div className="container-fluid">
      <div className="row" style={{ height: '100vh' }}>
        <div className="col-3 bg-dark" style={{ 
          height: '100%', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="chat" style={{ 
            flexGrow: 1,
            overflowY: 'auto',
            marginBottom: '60px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#666 #333'
          }}>
            <div class="left-scroll">
            {messages.map((msg, index) => (
              <div key={index}>
                {msg.sender === 'user' ? (
                  <div className="human">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '10px' }}>
                      <p style={{ color: 'white', backgroundColor: '#0645f2', padding: '8px 12px', borderRadius: '10px', margin: 0 }}>{msg.text}</p>
                      <img src={human} alt="Human Logo" width={30} height={30} style={{ marginLeft: '10px', marginRight: '10px' }} />
                    </div>
                  </div>
                ) : (
                  <div className="bot">
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
                      <img src={chatbot} alt="Bot Logo" width={30} height={30} style={{ marginRight: '10px', marginLeft: '25px' }} />
                      <p style={{ color: 'white', backgroundColor: '#333', padding: '8px 12px', borderRadius: '10px', margin: 0 }}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
            </div>
          </div>
        </div>

        <div className="col-9 bg-white query-results" style={{ 
  height: '100%',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column'
        }}>
          <h2>Query Results</h2>

          {/* Query Display and Copy Button */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <input
              type="text"
              value={fetchedQuery}
              readOnly
              style={{ flex: 1, padding: '10px', marginRight: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ccc' }}
            />
            <button
              onClick={copyToClipboard}
              style={{ backgroundColor: '#0645f2', color: 'white', padding: '10px 15px', border: 'none', cursor: 'pointer' }}
            >
              Copy
            </button>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search..."
              onChange={handleSearch}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
          </div>
          {isLoading ? (
            <div className="loader-container">
              <div className="ripple"></div>
            </div>
          ) : error ? (
            <div className="error" style={{ color: 'red' }}>
              <p>Error: {error}</p>
            </div>
          ) : (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {renderTable()}
              {renderPagination()}
            </div>
          )}
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100%',
        backgroundColor: 'black',
        padding: '10px',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000
      }}>
        <input
          type="text"
          placeholder="Enter your message here..."
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInputValue(e.target.value)}
          style={{ width: '90%', backgroundColor: 'white', color: 'black', border: '1px solid #ccc', padding: '10px', fontSize: '16px' }}
        />
        <button
          onClick={handleSend}
          style={{ backgroundColor: '#0645f2', color: 'white', border: 'none', padding: '10px 15px', fontSize: '16px', cursor: 'pointer' }}
        >
          Send
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{ backgroundColor: '#0645f2', color: 'white', border: 'none', padding: '10px 15px', fontSize: '16px', cursor: 'pointer' }}
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default Chatsam;
