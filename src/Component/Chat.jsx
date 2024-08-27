import React, { useState, useContext } from "react";
import GetAnswer from "../Services/FetchData";
import { Typewriter } from "react-simple-typewriter";
import { MyContext } from "../Store/ContextStore";

const Chat = () => {
  const { AllQuestions, SetAllQuestions } = useContext(MyContext);
  const [response, setResponse] = useState(null);
  const [query, setQuery] = useState("");
  const [Allanswer, SetAnswer] = useState([]);
  const[disable, setdisable]=useState()

  const submitQuery = async () => {
    if (query.trim()) {
      SetAllQuestions((prev) => [...prev, query]);
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
      setdisable(false)
      const text = await GetAnswer(queryText);
      const cleanText = text.split("*").join("");
      if(text)
      {
         setdisable(true)
      }
      
      setResponse(cleanText);
      SetAnswer((prev) => [...prev, cleanText]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  return (
    <div className="w-full min-h-[85vh] mt-[50px] md:mt-[0px]">
      <div className="min-h-[85%] bg-black overflow-y-scroll p-4 pb-[80px]">
        {AllQuestions.length > 0 ? (
          AllQuestions.map((element, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-end">
                <div className="max-w-[75%] my-1 bg-purple-600 text-white rounded-lg p-3 shadow-lg">
                  {element}
                </div>
              </div>

              <div className="flex justify-start mt-2">
                <div className="max-w-[75%] bg-gray-300 text-black rounded-lg p-3 shadow-lg">
                  {Allanswer[index] ? (
                    <Typewriter
                      words={[Allanswer[index]]}
                      loop={1}
                      cursor
                      cursorStyle=""
                      typeSpeed={5} 
                      deleteSpeed={50}
                      delaySpeed={1000}
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No queries yet. Start the conversation!
            Sometimes it may provide wrong answer 
          </div>
        )}
      </div>

      <div className="w-full fixed bottom-0 left-0 md:left-10 border-1 border-white bg-gray-600 text-white p-4 flex justify-center items-center gap-2">
        <textarea
          placeholder="Write Your Query Here..."
          className={`  min-h-[50px] w-[80%] lg:w-[60%] text-white bg-black p-2 resize-none overflow-y-auto rounded-[10px] ${disable===true?"disabled": ''}`}
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
