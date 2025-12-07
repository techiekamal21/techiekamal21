import React, { useEffect, useState } from 'react';
import { 
  ExternalLink, Briefcase, Code, Gamepad, Coffee, 
  Globe, Terminal, Cpu, Database, Layout, Heart, Sparkles,
  Github, Linkedin, Twitter, Mail, Instagram,
  Brain, Bot, Network, GitCommit, GitPullRequest, Star, RefreshCw, Clock, Activity
} from 'lucide-react';
import { fetchGitHubEvents, fetchUserRepos } from './services/github';
import { GitHubEvent, GitHubRepo } from './types';
import { StatsSection } from './components/StatsSection';

// --- Components ---

const FadeImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [opacity, setOpacity] = useState("opacity-0");
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} transition-opacity duration-1000 ${opacity}`}
      onLoad={() => setOpacity("opacity-100")}
    />
  );
};

const SectionHeader = ({ title, icon: Icon, color = "text-white" }: { title: string, icon?: any, color?: string }) => (
  <div className="flex items-center justify-center md:justify-start gap-3 mb-10 group">
    <div className={`p-3 rounded-xl bg-opacity-10 bg-white/5 border border-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
      {Icon && <Icon className={`w-6 h-6 ${color}`} />}
    </div>
    <h2 className="text-3xl font-bold text-white relative tracking-tight">
      {title}
      <span className={`absolute -bottom-3 left-0 w-12 h-1 bg-gradient-to-r from-${color.split('-')[1]} to-transparent rounded-full group-hover:w-full transition-all duration-500`}></span>
    </h2>
  </div>
);

const EcosystemCard = ({ title, url, icon: Icon, description, color, tags, badge }: any) => (
  <a 
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative glass-panel rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 overflow-hidden flex flex-col h-full border border-[#30363d] hover:shadow-2xl hover:shadow-neon-blue/10"
  >
    <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ padding: '1px' }}>
      <div className="h-full w-full bg-[#0d1117] rounded-2xl" />
    </div>

    <div className="relative z-10 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-[#161b22] border border-[#30363d] group-hover:border-transparent transition-colors`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-lg">
              {badge}
            </span>
          )}
          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed flex-grow">{description}</p>

      <div className="flex flex-wrap gap-2 mt-auto">
        {tags.map((tag: string, i: number) => (
          <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-[#161b22] border border-[#30363d] text-gray-400 font-mono">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </a>
);

const ProjectCard = ({ title, desc, tags, gifUrl }: { title: string, desc: string[], tags: string[], gifUrl: string }) => (
  <div className="glass-panel p-6 rounded-2xl border border-[#30363d] hover:border-neon-blue/50 transition-all duration-300 group hover:bg-[#161b22]/50">
    <div className="flex flex-col items-center text-center">
      <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-[#30363d] group-hover:border-neon-blue transition-colors bg-[#0d1117] shadow-xl">
        <img src={gifUrl} alt={title} className="w-full h-full object-cover scale-110" />
      </div>
      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-neon-blue transition-colors">{title}</h3>
      <div className="space-y-2 mb-6">
        {desc.map((d, i) => (
          <p key={i} className="text-gray-400 text-sm">{d}</p>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-auto">
        {tags.map((tag, i) => (
          <span key={i} className="px-3 py-1 text-xs font-medium text-neon-blue bg-neon-blue/5 rounded-full border border-neon-blue/20">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const SkillBadge = ({ url, alt }: { url: string, alt: string }) => (
  <img src={url} alt={alt} className="hover:scale-110 transition-transform duration-200 cursor-pointer shadow-lg rounded-md" />
);

const SocialButton = ({ href, icon: Icon, label, color }: { href: string, icon: any, label: string, color: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`group flex items-center gap-2 px-4 py-2 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-${color} hover:bg-${color}/10 transition-all duration-300`}
  >
    <Icon className={`w-4 h-4 text-gray-400 group-hover:text-${color} transition-colors`} />
    <span className="text-sm font-medium text-gray-300 group-hover:text-white whitespace-nowrap">{label}</span>
  </a>
);

// --- New Activity Feed Component ---
const LatestActivitySection = () => {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const data = await fetchGitHubEvents();
    // Filter for interesting events
    const interestingEvents = data.filter(e => 
      ['PushEvent', 'PullRequestEvent', 'WatchEvent', 'CreateEvent', 'IssuesEvent'].includes(e.type)
    );
    setEvents(interestingEvents);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'PushEvent': return <GitCommit className="w-5 h-5 text-neon-blue" />;
      case 'PullRequestEvent': return <GitPullRequest className="w-5 h-5 text-neon-purple" />;
      case 'WatchEvent': return <Star className="w-5 h-5 text-yellow-400" />;
      case 'IssuesEvent': return <Brain className="w-5 h-5 text-neon-green" />;
      default: return <Code className="w-5 h-5 text-gray-400" />;
    }
  };

  const getEventMessage = (event: GitHubEvent) => {
    switch(event.type) {
      case 'PushEvent': 
        return `Pushed ${event.payload.commits?.length || 1} commit(s) to`;
      case 'PullRequestEvent': 
        return `Opened PR "${event.payload.pull_request?.title}" in`;
      case 'WatchEvent': 
        return 'Starred repository';
      case 'IssuesEvent': 
        return `Opened issue "${event.payload.issue?.title}" in`;
      case 'CreateEvent':
        return `Created repository`;
      default: 
        return 'Contributed to';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-[#30363d] bg-[#161b22]/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
        <Activity className="w-24 h-24 text-neon-blue" />
      </div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
             <RefreshCw className={`w-5 h-5 text-neon-blue ${refreshing ? 'animate-spin' : ''}`} />
          </div>
          <h3 className="text-xl font-bold text-white">Latest Activity</h3>
        </div>
        <button 
          onClick={() => fetchEvents(true)}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-neon-blue transition-all"
        >
          <span className="text-xs font-mono text-gray-400 group-hover:text-white">Refresh</span>
          <RefreshCw className={`w-3 h-3 text-gray-400 group-hover:text-neon-blue transition-all ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4 relative z-10">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-[#0d1117]/50 border border-[#30363d]">
              <div className="w-10 h-10 rounded-full bg-gray-700/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700/50 rounded w-3/4" />
                <div className="h-3 bg-gray-700/50 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="group flex items-start gap-4 p-4 rounded-xl bg-[#0d1117]/50 border border-[#30363d] hover:border-neon-blue/30 transition-all hover:bg-[#161b22]">
              <div className="mt-1 p-2 rounded-full bg-[#161b22] border border-[#30363d] group-hover:border-neon-blue/50 transition-colors">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-gray-300 text-sm font-medium truncate pr-4">
                    <span className="text-gray-500">{getEventMessage(event)}</span> <span className="text-neon-blue font-bold">{event.repo.name}</span>
                  </p>
                  <span className="flex items-center text-xs text-gray-500 whitespace-nowrap bg-[#0d1117] px-2 py-1 rounded border border-[#30363d]">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(event.created_at)}
                  </span>
                </div>
                {event.payload.commits?.[0] && (
                  <p className="text-gray-500 text-xs mt-1 truncate font-mono bg-black/30 p-1.5 rounded border border-white/5">
                    "{event.payload.commits[0].message}"
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
           <div className="text-center py-8 text-gray-500">
             No recent public activity found.
           </div>
        )}
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);

  useEffect(() => {
    // Initial loading animation
    const timer = setTimeout(() => setLoading(false), 800);
    
    // Fetch repos for stats section
    const getData = async () => {
      const data = await fetchUserRepos();
      setRepos(data);
    };
    getData();

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-t-[#00D9FF] border-r-transparent border-b-[#BC13FE] border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-t-transparent border-r-neon-pink border-b-transparent border-l-neon-green rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#00D9FF]/20 overflow-x-hidden">
      
      {/* Enhanced Hero Header */}
      <header className="relative w-full h-[500px] flex flex-col items-center justify-start overflow-hidden">
        {/* Waving Background */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
           <img 
             src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=500&section=header&text=&fontSize=40&fontColor=fff&animation=fadeIn" 
             className="w-full h-full object-cover opacity-80"
             alt="Header Background"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1117]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 pt-20 flex flex-col items-center gap-6 text-center px-4">
           <div className="glass-panel px-6 py-2 rounded-full border-neon-blue/30 bg-black/40 backdrop-blur-md mb-4 animate-float">
             <span className="text-neon-blue font-bold tracking-wider text-sm uppercase">Welcome to My Digital Universe</span>
           </div>

           <img 
             src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=00D9FF&center=true&vCenter=true&multiline=true&width=700&height=180&lines=🚀+Entrepreneur+%7C+Engineer;🔬+AI%2FML+%7C+Data+Science;🌐+Telecom+%7C+Optical+Networks;💡+Innovation+%7C+Automation" 
             alt="Typing SVG" 
             className="h-auto w-full max-w-[700px] drop-shadow-lg" 
           />

           <div className="mt-4 transform hover:scale-105 transition-transform duration-300">
             <img src="https://komarev.com/ghpvc/?username=techiekamal21&label=Profile%20Views&color=0e75b6&style=flat-square" alt="Profile Views" className="h-8 shadow-lg shadow-neon-blue/20" />
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 space-y-32 pb-24">

        {/* About Me Section - Glass Card */}
        <section className="glass-panel rounded-3xl p-8 md:p-12 border border-[#30363d] bg-[#161b22]/60 shadow-2xl backdrop-blur-xl">
           <SectionHeader title="About Me" icon={Terminal} color="text-neon-blue" />
           
           <div className="flex flex-col lg:flex-row items-center gap-12">
             <div className="w-full lg:w-1/3 flex justify-center">
               <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                 <img src="https://user-images.githubusercontent.com/74038190/225813708-98b745f2-7d22-48cf-9150-083f1b00d6c9.gif" className="relative rounded-xl w-64 shadow-2xl" alt="Coding Gif" />
               </div>
             </div>
             
             <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-[#0d1117] p-6 rounded-2xl border border-[#30363d] hover:border-neon-blue/50 transition-colors">
                   <h3 className="text-white font-bold mb-3 flex items-center text-lg"><Briefcase className="w-5 h-5 mr-3 text-neon-blue"/> Currently Working On</h3>
                   <ul className="space-y-2 text-gray-400">
                     <li className="flex items-start"><span className="text-neon-blue mr-2">▹</span> Advanced automation solutions</li>
                     <li className="flex items-start"><span className="text-neon-blue mr-2">▹</span> Expanding Connect Kreations</li>
                     <li className="flex items-start"><span className="text-neon-blue mr-2">▹</span> Next-gen optical networks</li>
                   </ul>
                 </div>
                 
                 <div className="bg-[#0d1117] p-6 rounded-2xl border border-[#30363d] hover:border-neon-green/50 transition-colors">
                   <h3 className="text-white font-bold mb-3 flex items-center text-lg"><Cpu className="w-5 h-5 mr-3 text-neon-green"/> Currently Learning</h3>
                   <ul className="space-y-2 text-gray-400">
                     <li className="flex items-start"><span className="text-neon-green mr-2">▹</span> Cybersecurity & Hacking</li>
                     <li className="flex items-start"><span className="text-neon-green mr-2">▹</span> Django Mastery</li>
                     <li className="flex items-start"><span className="text-neon-green mr-2">▹</span> NLP & AI Agents</li>
                   </ul>
                 </div>

                 <div className="bg-[#0d1117] p-6 rounded-2xl border border-[#30363d] hover:border-neon-purple/50 transition-colors">
                   <h3 className="text-white font-bold mb-3 flex items-center text-lg"><Globe className="w-5 h-5 mr-3 text-neon-purple"/> Collaborating On</h3>
                   <ul className="space-y-2 text-gray-400">
                     <li className="flex items-start"><span className="text-neon-purple mr-2">▹</span> AI/ML Projects</li>
                     <li className="flex items-start"><span className="text-neon-purple mr-2">▹</span> Telecom Innovations</li>
                     <li className="flex items-start"><span className="text-neon-purple mr-2">▹</span> Open Source Tools</li>
                   </ul>
                 </div>

                 <div className="bg-[#0d1117] p-6 rounded-2xl border border-[#30363d] hover:border-neon-pink/50 transition-colors">
                   <h3 className="text-white font-bold mb-3 flex items-center text-lg"><Coffee className="w-5 h-5 mr-3 text-neon-pink"/> Ask Me About</h3>
                   <ul className="space-y-2 text-gray-400">
                     <li className="flex items-start"><span className="text-neon-pink mr-2">▹</span> DWDM/WSON Networks</li>
                     <li className="flex items-start"><span className="text-neon-pink mr-2">▹</span> Python Automation</li>
                     <li className="flex items-start"><span className="text-neon-pink mr-2">▹</span> Data Visualization</li>
                   </ul>
                 </div>
             </div>
           </div>
        </section>

        {/* Digital Ecosystem */}
        <section>
          <SectionHeader title="My Digital Ecosystem" icon={Globe} color="text-neon-purple" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <EcosystemCard 
              title="Connect Kreations"
              url="https://www.connectkreations.com"
              icon={Briefcase}
              description="Your hub for interview preparation, job updates, and developer productivity tools. Helping thousands of students land their dream jobs."
              color="from-blue-600 to-cyan-500"
              badge="FOUNDER"
              tags={['Jobs', 'Interview Prep', 'Productivity']}
            />
            <EcosystemCard 
              title="Ideaota"
              url="https://ideaota.com"
              icon={Code}
              description="Premium web services platform offering Resume Building, WordPress Development, and custom Full Stack SaaS solutions."
              color="from-pink-600 to-rose-500"
              badge="FOUNDER"
              tags={['Full Stack', 'Web Dev', 'Services']}
            />
            <EcosystemCard 
              title="CodeByArt"
              url="https://codebyart.com"
              icon={Gamepad}
              description="A playground for automation scripts, browser-based games, and technical tutorials for the modern developer."
              color="from-purple-600 to-indigo-500"
              badge="FOUNDER"
              tags={['Gaming', 'Automation', 'Blog']}
            />
          </div>
        </section>

        {/* AI & Machine Learning Intelligence */}
        <section>
          <SectionHeader title="AI & Machine Learning Intelligence" icon={Brain} color="text-neon-pink" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Strategic Overview */}
            <div className="glass-panel p-8 rounded-3xl border border-[#30363d] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Bot className="w-40 h-40 text-neon-pink" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Sparkles className="w-6 h-6 mr-3 text-neon-pink animate-pulse" />
                  Cognitive Computing Strategy
                </h3>
                
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                  Bridging the gap between theoretical Machine Learning models and production-grade applications. My focus lies in leveraging Generative AI to build autonomous agents that solve complex, real-world problems.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0d1117]/60 border border-[#30363d] hover:border-neon-pink/30 transition-colors">
                    <div className="p-2 rounded-lg bg-neon-pink/10 mt-1">
                      <Network className="w-5 h-5 text-neon-pink" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">Natural Language Processing</h4>
                      <p className="text-sm text-gray-400 mt-1">Specializing in RAG pipelines, Sentiment Analysis, and LLM fine-tuning for domain-specific applications.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0d1117]/60 border border-[#30363d] hover:border-neon-blue/30 transition-colors">
                    <div className="p-2 rounded-lg bg-neon-blue/10 mt-1">
                      <Bot className="w-5 h-5 text-neon-blue" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">Intelligent Automation</h4>
                      <p className="text-sm text-gray-400 mt-1">Designing self-correcting workflows and recruitment parsers that automate repetitive cognitive tasks.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Tech Stack & Live Tools */}
            <div className="flex flex-col gap-6">
                
                {/* Tech Stack Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-panel p-6 rounded-2xl border border-[#30363d] hover:border-neon-purple/50 transition-all group bg-[#161b22]/40">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-neon-purple" /> ML Core
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {['PyTorch', 'TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy'].map(tag => (
                                <span key={tag} className="px-2 py-1 text-xs font-mono rounded bg-[#0d1117] border border-[#30363d] text-gray-400 group-hover:text-gray-200 transition-colors">{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-[#30363d] hover:border-neon-green/50 transition-all group bg-[#161b22]/40">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Database className="w-4 h-4 text-neon-green" /> GenAI Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {['OpenAI API', 'LangChain', 'Hugging Face', 'Pinecone', 'LlamaIndex'].map(tag => (
                                <span key={tag} className="px-2 py-1 text-xs font-mono rounded bg-[#0d1117] border border-[#30363d] text-gray-400 group-hover:text-gray-200 transition-colors">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Featured AI Integration Card */}
                <div className="flex-grow glass-panel p-6 rounded-2xl border border-[#30363d] relative overflow-hidden group hover:shadow-2xl hover:shadow-neon-blue/10 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-xl font-bold text-white">Connect Kreations AI Suite</h4>
                                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black bg-neon-blue rounded-full">LIVE</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-6">
                                Experience our cutting-edge AI tools designed for career acceleration. Features include an <strong>ATS-Optimized Resume Parser</strong> and an <strong>AI Interview Coach</strong> that provides real-time feedback.
                            </p>
                        </div>
                        
                        <a href="https://www.connectkreations.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full px-4 py-3 bg-[#1f6feb]/20 hover:bg-[#1f6feb]/40 text-[#58a6ff] border border-[#1f6feb]/50 rounded-xl transition-all font-bold group-hover:scale-[1.02]">
                            Launch AI Tools <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                    </div>
                </div>

            </div>
          </div>
        </section>

        {/* Tech Arsenal */}
        <section className="text-center bg-[#161b22]/30 p-8 rounded-3xl border border-[#30363d] border-dashed">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Cpu className="w-8 h-8 text-yellow-400 animate-pulse" />
            <h2 className="text-3xl font-bold text-white">Tech Arsenal</h2>
          </div>
          
          <div className="space-y-8">
            <div className="glass-panel p-6 rounded-2xl inline-block hover:border-yellow-400/30 transition-colors">
              <p className="text-xs text-gray-500 mb-4 uppercase tracking-[0.2em] font-bold">Core Languages</p>
              <img src="https://skillicons.dev/icons?i=python,cpp,html,css,js,sql&theme=dark" alt="Languages" className="h-12" />
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              <div className="glass-panel p-6 rounded-2xl hover:border-neon-blue/30 transition-colors">
                 <p className="text-xs text-gray-500 mb-4 uppercase tracking-[0.2em] font-bold">Frameworks</p>
                 <img src="https://skillicons.dev/icons?i=django,flask,react,nodejs,bootstrap&theme=dark" alt="Frameworks" className="h-12" />
              </div>
              <div className="glass-panel p-6 rounded-2xl hover:border-neon-green/30 transition-colors">
                 <p className="text-xs text-gray-500 mb-4 uppercase tracking-[0.2em] font-bold">Infrastructure</p>
                 <img src="https://skillicons.dev/icons?i=git,github,linux,docker,aws,mysql,mongodb&theme=dark" alt="Tools" className="h-12" />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <SkillBadge url="https://img.shields.io/badge/Tableau-E97627?style=for-the-badge&logo=tableau&logoColor=white&labelColor=000000" alt="Tableau" />
              <SkillBadge url="https://img.shields.io/badge/Power_BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black&labelColor=000000" alt="PowerBI" />
              <SkillBadge url="https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white&labelColor=000000" alt="Pandas" />
              <SkillBadge url="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white&labelColor=000000" alt="Numpy" />
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section>
          <SectionHeader title="Featured Projects" icon={Layout} color="text-neon-pink" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProjectCard 
              title="PACE Automation"
              desc={["Streamlined optical network processes", "40% reduction in manual effort", "Python scripting & automation"]}
              tags={["Python", "Automation", "Optical"]}
              gifUrl="https://user-images.githubusercontent.com/74038190/212257467-871d32b7-e401-42e8-a166-fcfd7baa4c6b.gif"
            />
            <ProjectCard 
              title="Data Analysis Framework"
              desc={["Insightful dashboards & analytics", "Tableau & SQL integration", "Enhanced decision-making"]}
              tags={["Data Science", "SQL", "Tableau"]}
              gifUrl="https://user-images.githubusercontent.com/74038190/229223263-cf2e4b07-2615-4f87-9c38-e37600f8381a.gif"
            />
            <ProjectCard 
              title="Network Planning Tool"
              desc={["DWDM & WSON optimization", "Efficient resource utilization", "Network design & planning"]}
              tags={["Telecom", "Planning", "Optimization"]}
              gifUrl="https://user-images.githubusercontent.com/74038190/212284087-bbe7e430-757e-4901-90bf-4cd2ce3e1852.gif"
            />
            <ProjectCard 
              title="AI/ML Solutions"
              desc={["Intelligent automation systems", "Machine learning models", "Predictive analytics"]}
              tags={["AI", "ML", "Python"]}
              gifUrl="https://user-images.githubusercontent.com/74038190/212749447-bfb7e725-6987-49d9-ae85-2015e3e7cc41.gif"
            />
          </div>
        </section>

        {/* Latest Activity Feed */}
        <section>
          <LatestActivitySection />
        </section>

        {/* GitHub Analytics - Visual Upgrades */}
        <section className="space-y-12">
          <SectionHeader title="GitHub Analytics" icon={Database} color="text-neon-green" />
          
          <div className="glass-panel p-2 rounded-2xl overflow-hidden shadow-2xl shadow-neon-blue/5">
             <FadeImage 
                src="https://github-readme-activity-graph.vercel.app/graph?username=techiekamal21&custom_title=Kamal's%20Contribution%20Graph&bg_color=0D1117&color=00D9FF&line=00D9FF&point=FFFFFF&area_color=00D9FF&title_color=FFFFFF&area=true" 
                className="w-full h-auto rounded-xl" 
                alt="Activity Graph" 
             />
          </div>

          {/* New Local Stats Section - Replaces broken images */}
          <StatsSection repos={repos} />

          <div className="flex justify-center">
             <div className="glass-panel p-4 rounded-2xl w-full max-w-2xl hover:shadow-lg hover:shadow-neon-pink/20 transition-all">
                <FadeImage 
                  src="https://github-readme-streak-stats.herokuapp.com/?user=techiekamal21&theme=tokyonight&hide_border=true&background=0D1117&stroke=00D9FF&ring=00D9FF&fire=FF6B6B&currStreakLabel=FFFFFF" 
                  className="w-full h-auto" 
                  alt="Streak" 
                />
             </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl overflow-x-auto flex justify-center bg-[#161b22]/40">
             <img src="https://github-profile-trophy.vercel.app/?username=techiekamal21&theme=tokyonight&no-frame=true&no-bg=true&margin-w=4&row=1" className="h-32 min-w-[800px]" alt="Trophies" />
          </div>
        </section>

      </main>

      {/* Enhanced Footer */}
      <footer className="relative mt-32 w-full">
         
         {/* Contribution Snake - Positioned above footer wave */}
         <div className="max-w-7xl mx-auto px-4 mb-20 relative z-20">
            <div className="glass-panel p-1 rounded-2xl border border-[#30363d] overflow-hidden bg-[#0d1117]">
               <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest py-3 border-b border-[#30363d] mb-0 bg-[#161b22]">Contribution History</h3>
               <div className="w-full flex justify-center p-2 bg-[#0d1117]">
                  <img src="https://raw.githubusercontent.com/platane/snk/output/github-contribution-grid-snake-dark.svg" className="w-full max-w-5xl object-contain" alt="Snake Animation" />
               </div>
            </div>
         </div>

         {/* Content Container */}
         <div className="relative z-20 pb-48 px-4 text-center space-y-12">
            
            {/* Connect Section */}
            <div>
              <div className="flex items-center justify-center gap-3 mb-8">
                 <Sparkles className="w-6 h-6 text-neon-blue" />
                 <h2 className="text-3xl font-bold text-white">Connect & Collaborate</h2>
                 <Sparkles className="w-6 h-6 text-neon-blue" />
              </div>

              <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto">
                 {/* Socials Row */}
                 <div className="flex flex-wrap justify-center gap-4">
                     <SocialButton href="https://linkedin.com/in/kamal-patel-61a8201a0" icon={Linkedin} label="LinkedIn" color="blue-500" />
                     <SocialButton href="https://twitter.com/techiekamal07" icon={Twitter} label="Twitter" color="sky-400" />
                     <SocialButton href="https://instagram.com/techiekamal" icon={Instagram} label="Instagram" color="pink-500" />
                     <SocialButton href="mailto:codebyartdev@gmail.com" icon={Mail} label="Email" color="red-500" />
                     <SocialButton href="https://github.com/techiekamal21" icon={Github} label="GitHub" color="white" />
                 </div>
                 
                 <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2"></div>
                 
                 {/* Websites Row */}
                 <div className="flex flex-wrap justify-center gap-4">
                     <SocialButton href="https://www.connectkreations.com" icon={Briefcase} label="Connect Kreations" color="blue-400" />
                     <SocialButton href="https://ideaota.com" icon={Code} label="Ideaota" color="rose-500" />
                     <SocialButton href="https://codebyart.com" icon={Gamepad} label="CodeByArt" color="purple-500" />
                 </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="glass-panel max-w-md mx-auto p-6 rounded-2xl border-yellow-500/20 bg-yellow-500/5 hover:scale-105 transition-transform duration-300">
               <p className="text-white font-bold mb-4 flex items-center justify-center gap-2">
                 <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                 Support My Innovation Journey
               </p>
               <a 
                 href="https://www.buymeacoffee.com/techiekamal" 
                 target="_blank" 
                 rel="noreferrer"
                 className="inline-flex items-center gap-2 px-8 py-3 bg-[#FFDD00] text-black font-extrabold rounded-lg hover:bg-[#FFEA55] transition-all shadow-lg shadow-yellow-500/20"
               >
                 <Coffee className="w-5 h-5" />
                 BUY ME A COFFEE
               </a>
            </div>
         </div>

         {/* Animated Footer Wave & Copyright */}
         <div className="absolute bottom-0 left-0 w-full z-0 overflow-hidden">
             {/* CSS Animated SVG Wave */}
             <div className="w-full">
               <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
               viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
               <defs>
               <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
               <linearGradient id="wave-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "rgba(0, 217, 255, 0.2)", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "rgba(188, 19, 254, 0.2)", stopOpacity: 1 }} />
               </linearGradient>
               </defs>
               <g className="parallax">
               <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(0, 217, 255, 0.1)" />
               <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(188, 19, 254, 0.1)" />
               <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(0, 217, 255, 0.05)" />
               <use xlinkHref="#gentle-wave" x="48" y="7" fill="url(#wave-grad)" />
               </g>
               </svg>
             </div>
             
             {/* Copyright & Quote - Positioned relative to wave bottom */}
             <div className="absolute bottom-0 left-0 w-full text-center pb-4 z-10 px-4 bg-gradient-to-t from-[#0d1117] to-transparent">
                <p className="text-white/90 font-bold text-sm md:text-base drop-shadow-md tracking-wide mb-1 text-glow">
                  💡 "Innovation is at the core of my journey. Let's create the future together!" 💡
                </p>
                <p className="text-white/50 text-[10px] md:text-xs font-mono uppercase tracking-widest">© {new Date().getFullYear()} Kamal Patel. All rights reserved.</p>
             </div>
         </div>
      </footer>

    </div>
  );
}

export default App;