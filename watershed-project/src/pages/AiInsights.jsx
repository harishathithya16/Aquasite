import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, AlertTriangle, CheckCircle2, Image as ImageIcon, MapPin, Send, User } from 'lucide-react';

export default function AiInsights() {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [contextAsset, setContextAsset] = useState(null);
  
  const chatEndRef = useRef(null);

  // 1. Detect the latest upload on page load and fetch its permanent image
  useEffect(() => {
    const loadContext = async () => {
      const savedUpload = sessionStorage.getItem('drishti_analysis_data');
      if (savedUpload) {
        const asset = JSON.parse(savedUpload);
        
        try {
          const res = await fetch('http://localhost:5000/api/interventions');
          if (res.ok) {
            const data = await res.json();
            const dbMatch = data.find(item => item.id === asset.id);
            if (dbMatch && dbMatch.image_url) {
              asset.image_url = dbMatch.image_url;
            }
          }
        } catch (error) {
          console.error("Failed to fetch permanent image URL:", error);
        }

        setContextAsset(asset);
        
        // Auto-fill the FIRST prompt based on the asset's health
        if (asset.integrity_score < 75) {
          setInputText(`CRITICAL ANOMALY: The recent field upload for '${asset.type}' at coordinates ${asset.lat}, ${asset.lng} shows a degraded integrity score of ${asset.integrity_score}%. The system has flagged this structure. Based on historical watershed data, what are the immediate mitigation and repair strategies?`);
        } else {
          setInputText(`ROUTINE CHECK: The recent field upload for '${asset.type}' at coordinates ${asset.lat}, ${asset.lng} shows a healthy integrity score of ${asset.integrity_score}%. What are the recommended long-term maintenance strategies?`);
        }
      } else {
        // If no context, add a welcome message from the AI
        setChatHistory([{
          sender: 'ai',
          text: "Welcome to the AquaSite AI Engine. I can analyze watershed anomalies, suggest structural repairs, and provide cost estimates. Upload an image in the DRISHTI Upload tab to automatically link context, or describe an issue below."
        }]);
      }
    };

    loadContext();
  }, []);

  // 2. Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, streamingText, isGenerating]);

  // 3. Handle sending a message
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    
    const userMessage = inputText.trim();
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputText('');
    setIsGenerating(true);
    
    // Simulate AI "Thinking" delay
    setTimeout(() => {
      let fullText = "";
      const isFirstQuery = chatHistory.length === 0 || (chatHistory.length === 1 && chatHistory[0].text.includes("Welcome"));

      // Determine response logic
      if (isFirstQuery && contextAsset && contextAsset.integrity_score < 75) {
        fullText = `**Diagnostic Report: Structural Anomaly Detected**\n\nBased on the visual topological data and an integrity score of ${contextAsset.integrity_score}%, the ${contextAsset.type} is showing signs of micro-fracturing or material degradation likely caused by recent hydrological pressure.\n\n**Immediate Mitigation Strategies:**\n1. **Deploy Ground Team:** Dispatch a physical inspection crew to coordinates ${contextAsset.lat}, ${contextAsset.lng} within 48 hours to assess the primary spillway or embankment.\n2. **Temporary Reinforcement:** Apply geo-textile sandbagging to the weakened downstream face to prevent further erosion.\n3. **Flow Regulation:** If applicable, temporarily divert upstream channel flow to reduce hydrostatic pressure on the weakened sector.\n\n*Failure to act may result in localized flooding and a negative impact on the projected ${contextAsset.ndvi_change || '-5%'} NDVI growth in this sector.*`;
      } else if (isFirstQuery && contextAsset) {
        fullText = `**Diagnostic Report: Optimal Structural Health**\n\nThe ${contextAsset.type} at ${contextAsset.lat}, ${contextAsset.lng} is currently operating at ${contextAsset.integrity_score}% efficiency. Geometry remains stable with no critical anomalies detected.\n\n**Recommended Maintenance:**\n1. **De-silting:** Schedule routine de-silting before the next monsoon cycle to maintain maximum water retention capacity.\n2. **Vegetation Clearing:** Ensure deep-rooted invasive vegetation is cleared from the immediate embankment to prevent root-wedging.\n3. **Continuous Monitoring:** Retain the current satellite monitoring schedule to track the expected ${contextAsset.ndvi_change || '+2%'} NDVI improvement in the surrounding vegetation buffer.`;
      } else {
        // MOCK SMART FOLLOW-UPS (Based on keywords in user message)
        const lowerInput = userMessage.toLowerCase();
        if (lowerInput.includes('cost') || lowerInput.includes('budget') || lowerInput.includes('fund') || lowerInput.includes('price')) {
          fullText = "Based on the standard State Schedule of Rates (SSR), deploying a rapid response team and applying geo-textile reinforcement for this type of structure costs approximately **₹45,000 - ₹60,000**. \n\nWould you like me to draft an emergency funding request report for the District Collector?";
        } else if (lowerInput.includes('team') || lowerInput.includes('who') || lowerInput.includes('contact')) {
          fullText = "I recommend dispatching the **District Water Management Authority (DWMA) Quick Response Team**. Their historical average ETA to this specific sector is 4.5 hours.\n\nShould I initiate an automated alert to their dashboard?";
        } else {
          fullText = "Noted. I have logged this parameter into the watershed maintenance database. Is there anything specific you would like to analyze further regarding this asset's geographic data, soil composition, or structural materials?";
        }
      }

      // Typewriter Effect
      let i = 0;
      setIsGenerating(false);
      setStreamingText('');
      
      const typingInterval = setInterval(() => {
        setStreamingText(prev => prev + fullText.charAt(i));
        i++;
        if (i >= fullText.length) {
          clearInterval(typingInterval);
          setChatHistory(prev => [...prev, { sender: 'ai', text: fullText }]);
          setStreamingText('');
        }
      }, 15); // Speed of typing

    }, 1500);
  };

  // Helper to format bold text and newlines in AI response
  const formatResponse = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i} className="block mb-2 last:mb-0">
        {line.split('**').map((part, index) => 
          index % 2 === 1 ? <strong key={index} className="text-gray-900">{part}</strong> : part
        )}
      </span>
    ));
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Bot className="mr-2 text-blue-600" /> AI Diagnostic Chat
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Chat directly with the AquaSite AI to analyze environmental anomalies, generate repair costs, and dispatch teams.
        </p>
      </div>

      {/* Linked Asset Context Card (Pinned to Top) */}
      {contextAsset && (
        <div className={`flex-shrink-0 p-3 rounded-xl border flex items-center space-x-4 ${contextAsset.integrity_score < 75 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border shadow-sm relative">
            {(contextAsset.image_url || contextAsset.originalImage) ? (
              <img 
                src={contextAsset.image_url || contextAsset.originalImage} 
                alt="Context" 
                className="w-full h-full object-cover" 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544253303-34e83f0f70f8?w=200&q=80' }}
              />
            ) : (
              <ImageIcon className="w-full h-full p-4 text-gray-400" />
            )}
          </div>
          <div className="flex-1 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                {contextAsset.type}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center ${
                  contextAsset.integrity_score < 75 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {contextAsset.integrity_score < 75 ? <AlertTriangle size={10} className="mr-1"/> : <CheckCircle2 size={10} className="mr-1"/>}
                  {contextAsset.status} ({contextAsset.integrity_score}%)
                </span>
              </h3>
              <p className="text-xs text-gray-600 mt-1 flex items-center">
                <MapPin size={12} className="mr-1 text-gray-400" /> {contextAsset.lat}, {contextAsset.lng}
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full animate-pulse">
              Context Linked to Chat
            </span>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-50">
          
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mx-3">
                  {msg.sender === 'user' ? (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
                      <User size={16} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                      <Bot size={18} />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                }`}>
                  {msg.sender === 'ai' ? formatResponse(msg.text) : msg.text}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="flex flex-row max-w-[85%]">
                <div className="flex-shrink-0 mx-3">
                  <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                    <Bot size={18} />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 rounded-tl-none shadow-sm flex items-center space-x-1.5 h-12">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Streaming Text (Typewriter effect active bubble) */}
          {streamingText && (
            <div className="flex justify-start">
              <div className="flex flex-row max-w-[85%] md:max-w-[75%]">
                <div className="flex-shrink-0 mx-3">
                  <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                    <Bot size={18} />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm text-sm leading-relaxed">
                  {formatResponse(streamingText)}
                  <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse align-middle"></span>
                </div>
              </div>
            </div>
          )}

          {/* Invisible div to scroll to */}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-200">
          <form 
            onSubmit={handleSend}
            className="flex items-end bg-gray-50 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all overflow-hidden p-1"
          >
            <textarea
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none px-4 py-3 text-sm text-gray-700 outline-none"
              placeholder="Ask a follow-up question (e.g., 'What will the repairs cost?')"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                // Allow pressing Enter to send (Shift+Enter for new line)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || isGenerating || streamingText.length > 0}
              className="mb-1 mr-1 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex-shrink-0"
            >
              <Send size={18} className={isGenerating || streamingText.length > 0 ? 'opacity-50' : ''} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400 font-medium">
              Jal-Drishti AI can make mistakes. Verify critical infrastructure metrics with field teams.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}