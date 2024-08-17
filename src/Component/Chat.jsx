import React, { useState } from 'react';
import GetAnswer from '../assets/Services/FetchData';

const Chat = () => {
  const [response, setResponse] = useState(null);
  const [query, setQuery] = useState('');
  const [Text, setText]=useState('');


  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      setQuery("")
      event.preventDefault(); 
      setText('Loading...')
      await fetchData();
      
     
    
    }
  };

  const handleChange = (event) => {
  
    setQuery(event.target.value);
  };

  

  const fetchData = async () => {
    if (query.trim()) {
      try {
        const text = await GetAnswer(query);
        console.log('API response:', text);

        setResponse(text.split('*').join(''));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  
  const askQuery = async () => {
    setText('Loading...')
    await fetchData();
  };

  return (
    <div className="w-full min-h-[60vh] flex justify-center items-center">
      <div className="w-[40%] min-h-[50vh] text-white p-4">
        <h1 className="text-3xl font-bold my-2">Welcome ChatQuery Application</h1>
        <p className="my-2 mx-1">Ask Your Query</p>
        <textarea
          placeholder="Write Your Query Here..."
          className="w-full min-h-[50px] text-black p-2 resize-none overflow-y-auto rounded-[10px]"
          rows="1" 
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          value={query} 
        ></textarea>
        <button
          className="mt-2 border-red-600 px-2 border-2 text-red-600 bg-black"
          onClick={askQuery}
        >
          Ask
        </button>
        <h2 className="mt-4 text-2xl">Response:</h2>
        <p>
          {response ? response : <div>{Text}</div>}
        </p>
      </div>
    </div>
  );
};

export default Chat;
