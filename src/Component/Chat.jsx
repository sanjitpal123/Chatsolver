import React, { useState, useContext, useEffect } from "react";
import GetAnswer from "../Services/FetchData";
import { Typewriter } from "react-simple-typewriter";
import { MyContext } from "../Store/ContextStore";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const Chat = () => {
  const { AllQuestions, SetAllQuestions } = useContext(MyContext);
  const [response, setResponse] = useState(null);
  const [query, setQuery] = useState("");
  const [Allanswer, SetAnswer] = useState([]);
  const [disable, setDisable] = useState(false);
  const [rvReady, setRvReady] = useState(false);
  const [Play, SetPlay] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    // Load ResponsiveVoice
    const script = document.createElement("script");
    script.src =
      "https://code.responsivevoice.org/responsivevoice.js?key=Pj0JikQu";
    script.async = true;

    script.onload = () => {
      console.log("ResponsiveVoice loaded successfully");
      setRvReady(true);
    };

    script.onerror = () => {
      console.error("Failed to load ResponsiveVoice script");
    };

    document.body.appendChild(script);

    // Setup MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks.length > 0) {
        // Hand detected
        if (!isRecognizing) {
          console.log("Hand detected, starting voice recognition...");
          startVoiceRecognition();
        }
      } else {
        // No hand detected
        if (isRecognizing) {
          console.log("No hand detected, stopping voice recognition...");
          stopVoiceRecognition();
        }
      }
    });

    const video = document.createElement('video');
    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, [isRecognizing]);

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
      setDisable(false);
      const text = await GetAnswer(queryText);
      const cleanText = text.split("*").join("");
      if (text) {
        setDisable(true);
      }

      setResponse(cleanText);
      SetAnswer((prev) => [...prev, cleanText]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const startVoiceRecognition = () => {
    if (!isRecognizing) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        console.log("Initializing SpeechRecognition...");
        const rec = new SpeechRecognition();
        rec.lang = 'en-US';
        rec.interimResults = false;

        rec.onstart = () => {
          console.log("Speech recognition started.");
        };

        rec.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('Voice recognized:', transcript);
          // Handle the recognized voice input here
        };

        rec.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };

        rec.onend = () => {
          console.log("Speech recognition ended.");
          if (isRecognizing) {
            startVoiceRecognition();
          }
        };

        rec.start();
        setIsRecognizing(true);

        // Reset timeout if recognition is started
        if (timeoutId) clearTimeout(timeoutId);

        // Set timeout to stop recognition after 5 seconds of no speech
        const id = setTimeout(() => {
          stopVoiceRecognition();
        }, 5000);
        setTimeoutId(id);
      } else {
        console.error("SpeechRecognition API is not supported in this browser.");
      }
    }
  };

  const stopVoiceRecognition = () => {
    if (isRecognizing) {
      console.log("Stopping SpeechRecognition...");
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        speechSynthesis.cancel();
      }

      setIsRecognizing(false);
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const handleSpeak = (text, index) => {
    const iconId = `icon-${index}`;
    let i = document.querySelector(`#${iconId}`);

    if (!Play) {
      console.log("play", Play);
      i.classList = "fa-solid fa-pause";

      if ("speechSynthesis" in window) {
        // Cancel any previous speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = speechSynthesis
          .getVoices()
          .find((voice) => voice.name === "Google UK English Female");
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;

        utterance.onend = () => {
          SetPlay(false);
          i.classList = "fa-solid fa-play";
        };

        speechSynthesis.speak(utterance);
        console.log("Speaking text:", text);
      }

      SetPlay(true);
    } else {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        i.classList = "fa-solid fa-play";
        SetPlay(false);
      } else if (speechSynthesis.paused) {
        speechSynthesis.resume();
        i.classList = "fa-solid fa-pause";
        SetPlay(true);
      }
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
                {Allanswer[index] ? (
                  <div className="flex flex-col">
                    <div className="max-w-[75%] bg-gray-300 text-black rounded-lg p-3 shadow-lg">
                      <Typewriter
                        words={[Allanswer[index]]}
                        loop={1}
                        cursor
                        cursorStyle=""
                        typeSpeed={5}
                        deleteSpeed={50}
                        delaySpeed={1000}
                      />
                    </div>
                    <button
                      className="w-[30px] h-[30px] bg-white mt-2 rounded-full"
                      onClick={() => handleSpeak(Allanswer[index], index)}
                    >
                      <i id={`icon-${index}`} className="fa-solid fa-play"></i>{" "}
                    </button>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No queries yet. Start the conversation! Sometimes it may provide the
            wrong answer.
          </div>
        )}
      </div>

      <div className="w-full fixed bottom-0 left-0 md:left-10 border-1 border-white bg-gray-600 text-white p-4 flex justify-center items-center gap-2">
        <textarea
          placeholder="Write Your Query Here..."
          className={`min-h-[50px] w-[80%] lg:w-[60%] text-white bg-black p-2 resize-none overflow-y-auto rounded-[10px] ${
            disable === true ? "disabled" : ""
          }`}
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
