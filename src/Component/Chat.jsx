import React, { useState } from "react";
import GetAnswer from "../Services/FetchData";

const Chat = () => {
  const [response, setResponse] = useState(null);
  const [query, setQuery] = useState("");
  const [AllQuestion, SetQuestion] = useState([]);
  const [Allanswer, SetAnswer] = useState([]);

  const submitQuery = async () => {
    if (query.trim()) {
      SetQuestion((prev) => [...prev, query]);
      const currentQuery = query;
      setQuery("");
      await fetchData(currentQuery);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitQuery();
    }
  };

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const fetchData = async (queryText) => {
    try {
      const text = await GetAnswer(queryText);
      const cleanText = text.split("*").join("");
      setResponse(cleanText);
      SetAnswer((prev) => [...prev, cleanText]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="w-full min-h-[80vh] mt-[50px] md:mt-[0px] relative">
      <div className="min-h-[85%] bg-black overflow-y-scroll p-4 pb-[80px]">
        {AllQuestion.length > 0 ? (
          AllQuestion.map((element, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-end">
                <div className="max-w-[75%] bg-purple-600 text-white rounded-lg p-3 shadow-lg">
                  {element}
                </div>
              </div>

              <div className="flex justify-start mt-2">
                <div className="max-w-[75%] bg-gray-300 text-black rounded-lg p-3 shadow-lg">
                  {Allanswer[index] || "Loading..."}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No queries yet. Start the conversation!
          </div>
        )}
      </div>

      <div className="w-full fixed bottom-0 left-0 md:left-10 border-1 border-white bg-gray-600 text-white p-4 flex justify-center items-center gap-2">
        <textarea
          placeholder="Write Your Query Here..."
          className="min-h-[50px]w-[80%] md:w-[60%] text-white bg-black p-2 resize-none overflow-y-auto rounded-[10px]"
          rows="1"
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          value={query}
        ></textarea>
        <div
          onClick={submitQuery}
          className="w-[40px] cursor-pointer h-[40px] rounded-full flex justify-center items-center bg-purple-500"
        >
          <i className="fa-solid fa-paper-plane text-white"></i>
        </div>
      </div>
    </div>
  );
};

export default Chat;
