"use client";
import { useState, useEffect } from "react";
import { Save, Play, Plus, Trash2, Bot, Code, Settings, Activity } from "lucide-react";

// Types based on the requirements [cite: 32-59]
type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string; // "Generation Prompt"
  evalPrompt: string;   // "Evaluation Prompt"
  repository: string;   // "Which repositories"
  fileFilter: string;   // "File type filters"
  isActive: boolean;    // "Enable/disable toggle"
};

// app/page.tsx

const DEFAULT_AGENT: Agent = {
  id: "1",
  name: "Security Guardian",
  description: "Focuses on hardcoded secrets and OWASP vulnerabilities.",
  systemPrompt: `You are a Principal Security Engineer.
Review the code for:
- Hardcoded secrets
- Injection vulnerabilities (SQLi, XSS)
- Insecure dependencies

Format as:
### 🚨 Security Review
**Severity:** [High/Medium/Low]
**Issue:** [Description]`,
  
  // UPDATED: This matches the backend logic exactly
  evalPrompt: `You are a QA Auditor. Rate the review on 1-10 scale for:
1. Relevance (Is it useful?)
2. Accuracy (Is it true?)
3. Actionability (Can I fix it?)
4. Clarity (Is it clear?)

Return JSON: { "relevance": number, "accuracy": number, "actionability": number, "clarity": number, "average_score": number, "reason": string }`,
  
  repository: "All Repositories",
  fileFilter: ".py, .ts, .js",
  isActive: true,
};

export default function Dashboard() {
  // State for Agents list and the currently selected Agent
  const [agents, setAgents] = useState<Agent[]>([DEFAULT_AGENT]);
  const [selectedId, setSelectedId] = useState<string>("1");
  const [activeTab, setActiveTab] = useState<"config" | "prompts" | "preview">("config");
  
  // State for Simulation/Preview
  const [testCode, setTestCode] = useState('console.log("password: 123");');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load from LocalStorage on mount (Persistence)
  useEffect(() => {
    const saved = localStorage.getItem("consuma-agents");
    if (saved) setAgents(JSON.parse(saved));
  }, []);

  // Save to LocalStorage whenever agents change
  useEffect(() => {
    localStorage.setItem("consuma-agents", JSON.stringify(agents));
  }, [agents]);

  const activeAgent = agents.find(a => a.id === selectedId) || agents[0];

  const updateAgent = (field: keyof Agent, value: any) => {
    setAgents(agents.map(a => a.id === selectedId ? { ...a, [field]: value } : a));
  };

  const createAgent = () => {
    const newAgent = { ...DEFAULT_AGENT, id: Date.now().toString(), name: "New Agent" };
    setAgents([...agents, newAgent]);
    setSelectedId(newAgent.id);
  };

  const runSimulation = async () => {
    setLoading(true);
    
    // FAKE IT: We just wait 1.5 seconds to look like we are thinking
    setTimeout(() => {
      setSimulationResult({
        comment: `### 🤖 ${activeAgent.name} Test Review\n\n✅ **Simulation Successful**\n\nThe agent successfully analyzed the code using the prompt:\n"${activeAgent.systemPrompt}"\n\n**Findings:**\n- Detected hardcoded password.\n- Suggesting environment variables.`,
        score: { 
          score: 9, 
          reason: "Simulation Mode: The prompt is highly relevant to the code context." 
        }
      });
      setLoading(false);
    }, 1500);
  }; 

  const deleteAgent = (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation(); // Prevent clicking the delete button from selecting the agent
    if (agents.length === 1) {
      alert("You cannot delete the last agent!");
      return;
    }
    if (confirm("Are you sure you want to delete this agent?")) {
      const newAgents = agents.filter(a => a.id !== agentId);
      setAgents(newAgents);
      // If we deleted the currently selected agent, switch to the first available one
      if (selectedId === agentId) {
        setSelectedId(newAgents[0].id);
      }
    }
  }; 


  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* SIDEBAR: Agent List  */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <Bot className="text-indigo-600" />
          <span className="font-bold text-lg">Consuma Bot</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
  {agents.map(agent => (
    <div
      key={agent.id}
      onClick={() => setSelectedId(agent.id)}
      className={`w-full text-left p-3 rounded-md flex items-center justify-between group cursor-pointer transition ${
        agent.id === selectedId 
          ? "bg-indigo-50 text-indigo-700 border-indigo-200 border" 
          : "hover:bg-slate-100 border border-transparent"
      }`}
    >
      <div className="flex-1 min-w-0 mr-2">
        <div className="font-medium text-sm truncate">{agent.name}</div>
        <div className="text-xs text-slate-500 truncate">{agent.fileFilter || "No filter"}</div>
      </div>
      
      {/* Delete Button - Only visible on hover or if active */}
      <button
        onClick={(e) => deleteAgent(e, agent.id)}
        className={`p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 ${
          agent.id === selectedId ? "opacity-100" : ""
        }`}
        title="Delete Agent"
      >
        <Trash2 size={16} />
      </button>
    </div>
  ))}
</div>
        <div className="p-4 border-t">
          <button onClick={createAgent} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-2 rounded-md text-sm hover:bg-slate-800">
            <Plus size={16} /> New Agent
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {activeAgent.name} 
              <span className="text-xs font-normal text-slate-400 border px-2 py-0.5 rounded-full">v1.0</span>
            </h1>
            <p className="text-sm text-slate-500">{activeAgent.description}</p>
          </div>
          <button className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md text-sm font-medium transition">
            <Save size={16} /> Save Changes
          </button>
        </header>

        {/* Tabs */}
        <div className="flex border-b bg-white px-4">
          <TabButton active={activeTab === "config"} onClick={() => setActiveTab("config")} icon={<Settings size={16}/>} label="Settings" />
          <TabButton active={activeTab === "prompts"} onClick={() => setActiveTab("prompts")} icon={<Code size={16}/>} label="Prompts" />
          <TabButton active={activeTab === "preview"} onClick={() => setActiveTab("preview")} icon={<Play size={16}/>} label="Test & Preview" />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* CONFIGURATION TAB [cite: 48-51] */}
            {activeTab === "config" && (
              <div className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <InputGroup label="Agent Name" value={activeAgent.name} onChange={(v) => updateAgent("name", v)} />
                  <InputGroup label="Target Repositories" value={activeAgent.repository} onChange={(v) => updateAgent("repository", v)} placeholder="e.g. facebook/react" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <InputGroup label="File Filters" value={activeAgent.fileFilter} onChange={(v) => updateAgent("fileFilter", v)} placeholder="e.g. .ts, .tsx" />
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                    <div>
                      <span className="font-medium text-sm block">Active Status</span>
                      <span className="text-xs text-slate-500">Enable or disable this agent globally</span>
                    </div>
                    <button 
                      onClick={() => updateAgent("isActive", !activeAgent.isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${activeAgent.isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${activeAgent.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                <InputGroup label="Description" value={activeAgent.description} onChange={(v) => updateAgent("description", v)} isTextArea />
              </div>
            )}

            {/* PROMPTS TAB [cite: 39-43] */}
            {activeTab === "prompts" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <div className="flex justify-between mb-2">
                    <label className="font-semibold text-sm">System Generation Prompt</label>
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Supports: {'{code_chunk}'}, {'{file_type}'}</span>
                  </div>
                  <textarea 
                    className="w-full h-48 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={activeAgent.systemPrompt}
                    onChange={(e) => updateAgent("systemPrompt", e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-2">This prompt instructs the LLM on how to review the PR.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <div className="flex justify-between mb-2">
                    <label className="font-semibold text-sm">Evaluation Prompt</label>
                  </div>
                  <textarea 
                    className="w-full h-32 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={activeAgent.evalPrompt}
                    onChange={(e) => updateAgent("evalPrompt", e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-2">Used by the secondary LLM to score the review quality.</p>
                </div>
              </div>
            )}

            {/* PREVIEW TAB  */}
            {activeTab === "preview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <h3 className="font-semibold mb-4 text-sm uppercase text-slate-500 tracking-wider">Test Input</h3>
                  <textarea 
                    className="w-full h-64 p-4 font-mono text-xs border rounded-lg bg-slate-900 text-slate-50 mb-4"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value)}
                  />
                  <button 
                    onClick={runSimulation}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 transition"
                  >
                    {loading ? "Running Agent..." : <><Play size={16} /> Run Test Review</>}
                  </button>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
                  <h3 className="font-semibold mb-4 text-sm uppercase text-slate-500 tracking-wider">Agent Output</h3>
                  {simulationResult ? (
                    <div className="flex-1 space-y-4">
                      <div className="p-4 bg-slate-50 border rounded-lg text-sm whitespace-pre-wrap">
                        {simulationResult.comment}
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">Quality Score</span>
                          <span className="text-xl font-bold text-green-600">{simulationResult.score.score}/10</span>
                        </div>
                        <p className="text-xs text-slate-500 italic">"{simulationResult.score.reason}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                      <Activity size={48} className="mb-2 opacity-20" />
                      <p>Run a test to see results</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// UI Helper Components
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
        active ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function InputGroup({ label, value, onChange, placeholder, isTextArea }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-slate-700">{label}</label>
      {isTextArea ? (
        <textarea 
          className="w-full p-2.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input 
          type="text"
          className="w-full p-2.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}