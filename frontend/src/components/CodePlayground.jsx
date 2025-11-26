// frontend/src/components/CodePlayground.jsx
import React, { useEffect, useRef, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaBroom, FaUndo, FaCode, FaHome } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import "./CodePlayground.scss"; // Import the new stylesheet

const languageDefaults = {
  javascript: `// console.log can be used to display output
function greet(name) {
  return "Hello, " + name + "!";
}
console.log(greet("IntervuAI User"));`,
  typescript: `// TypeScript is supported!
interface User {
  name: string;
  id: number;
}
const user: User = { name: "TypeScript User", id: 1 };
console.log(user);`,
  html: `<!-- Note: This runs in a sandbox, not a real browser DOM -->
<h1>Hello, World!</h1>
<p>This is a paragraph inside the sandbox.</p>`,
  css: `/* CSS can be edited, but does not affect this page */
body {
  background-color: #2a2a2a;
  color: white;
  font-family: sans-serif;
}`
};

export default function CodePlayground() {
   const navigate = useNavigate();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(() => {
      const savedCode = localStorage.getItem(`code-playground-${language}`);
      return savedCode || languageDefaults[language];
  });
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);
  const iframeRef = useRef(null);
  const editorRef = useRef(null); // Ref to hold the editor instance

  // Save code to localStorage whenever it changes
  useEffect(() => {
    const debounceSave = setTimeout(() => {
        localStorage.setItem(`code-playground-${language}`, code);
    }, 500);
    return () => clearTimeout(debounceSave);
  }, [code, language]);

  // Handle language change
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const savedCode = localStorage.getItem(`code-playground-${lang}`);
    setCode(savedCode || languageDefaults[lang]);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const formatCode = () => {
    if (editorRef.current) {
        editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };
  
  const resetCode = () => {
    setCode(languageDefaults[language]);
  };

  // Build iframe content (no changes here)
  const iframeHtml = `<!doctype html><html><head><meta charset="utf-8"/><title>Sandbox</title><style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial;color:#d1d5db;background:#1e1e1e;padding:8px;}</style></head><body><script>
    (function(){const send=(type,data)=>{parent.postMessage({source:'playground-iframe',type,data},'*');};console.log=function(){try{const args=Array.from(arguments).map(a=>{try{return JSON.stringify(a);}catch(e){return String(a);}});send('log',args.join(' '));}catch(err){send('log',String(err));}};console.error=function(){const args=Array.from(arguments).map(a=>{try{return JSON.stringify(a);}catch(e){return String(a);}});send('error',args.join(' '));};window.onerror=function(msg,url,line,col,err){send('error',msg+' at '+line+':'+col);};window.addEventListener('message',async(ev)=>{if(!ev.data||ev.data.source!=='playground-parent')return;send('clear','');try{const userCode=ev.data.code;const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;const fn=new AsyncFunction(userCode);const result=await fn();if(typeof result!=='undefined'){send('log',JSON.stringify(result));}send('done','');}catch(err){send('error',err&&err.message?err.message:String(err));send('done','');}});})();
  </script></body></html>`;

  // Message listener from iframe (no changes here)
  useEffect(() => {
    const onMessage=(e)=>{if(!e.data||e.data.source!=="playground-iframe")return;const{type,data}=e.data;if(type==="clear")setOutput([]);else if(type==="log")setOutput(prev=>[...prev,{kind:"log",text:data}]);else if(type==="error")setOutput(prev=>[...prev,{kind:"error",text:data}]);else if(type==="done")setRunning(false);};window.addEventListener("message",onMessage);return()=>window.removeEventListener("message",onMessage);
  }, []);

  // Send code to iframe
  const run = () => {
    if (!iframeRef.current) return;
    setOutput([]);
    setRunning(true);
    iframeRef.current.contentWindow?.postMessage({ source: "playground-parent", code }, "*");
  };

  const clearOutput = () => setOutput([]);

  return (
    <div className="code-playground">
      <div className="editor-pane">
        <div className="editor-header">
           <button onClick={() => navigate('/')} className="home-button" title="Go to Home Screen">
            <FaHome />
          </button>
          <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
          <div className="editor-actions">
            <button onClick={formatCode} title="Format Code"><FaCode /> Format</button>
            <button onClick={resetCode} title="Reset Code"><FaUndo /> Reset</button>
          </div>
        </div>
        <Editor
          height="calc(100vh - 40px)" // Adjust height based on header
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v || "")}
          onMount={handleEditorDidMount}
        />
      </div>

      <div className="output-pane">
        <div className="output-header">
          <button onClick={run} disabled={running} className="btn-primary">
            {running ? <AiOutlineLoading3Quarters className="spinner" /> : <FaPlay />}
            {running ? "Running..." : "Run"}
          </button>
          <button onClick={clearOutput} disabled={running} className="btn-secondary">
            <FaBroom /> Clear
          </button>
        </div>

        <div className="console-output">
          {running && <div className="console-line kind-info">Running code...</div>}
          {!running && output.length === 0 && <div className="console-line kind-info">Console output will appear here</div>}
          {output.map((line, i) => (
            <div key={i} className={`console-line kind-${line.kind}`}>
              {line.text}
            </div>
          ))}
        </div>
      </div>
      
      <iframe ref={iframeRef} title="sandbox" sandbox="allow-scripts" style={{ display: "none" }} srcDoc={iframeHtml} />
    </div>
  );
}