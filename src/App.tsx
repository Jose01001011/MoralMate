import { FormEvent, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  FileText,
  HandHeart,
  HeartHandshake,
  Home,
  Info,
  Landmark,
  LockKeyhole,
  LogIn,
  Mail,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';

type Screen = 'landing' | 'login' | 'signup' | 'home' | 'chat' | 'history' | 'profile' | 'privacy' | 'help' | '404';
type AuthMode = 'login' | 'signup';

type IconType = typeof BookOpen;

const categories: { label: string; description: string; icon: IconType; tint: string }[] = [
  { label: 'Academic support', description: 'Assessment, study and course concerns', icon: BookOpen, tint: 'blue' },
  { label: 'Wellbeing and mental health', description: 'Space to explore how you are feeling', icon: Brain, tint: 'mint' },
  { label: 'Financial support', description: 'Funding, costs and practical concerns', icon: Landmark, tint: 'gold' },
  { label: 'Other concern', description: 'Something else on your mind', icon: MoreHorizontal, tint: 'slate' },
];

const navItems: { label: string; screen: Screen; icon: IconType }[] = [
  { label: 'Home', screen: 'home', icon: Home },
  { label: 'Chat', screen: 'chat', icon: MessageCircle },
  { label: 'History', screen: 'history', icon: Clock3 },
  { label: 'Profile', screen: 'profile', icon: UserRound },
];

function Mascot({ small = false }: { small?: boolean }) {
  return (
    <div className={`mascot ${small ? 'mascot-small' : ''}`} aria-label="MoralMate robot mascot">
      <div className="mascot-aerial" />
      <div className="mascot-head"><span className="mascot-eye" /><span className="mascot-eye" /><i /></div>
      <div className="mascot-body"><span /><span /></div>
    </div>
  );
}

function Logo({ onClick }: { onClick?: () => void }) {
  return <button className="logo" onClick={onClick} aria-label="MoralMate home"><span className="logo-mark"><Sparkles size={17} /></span><span>Moral<span>Mate</span></span></button>;
}

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [showEthical, setShowEthical] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError('');
    setScreen(mode);
  };

  const protectedNavigate = (next: Screen) => {
    setMobileNavOpen(false);
    if (!isSignedIn) {
      setAuthMode('login');
      setScreen('login');
      return;
    }
    setScreen(next);
  };

  const handleAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') || '');
    if (authMode === 'signup' && password.length < 8) {
      setAuthError('Please use at least 8 characters for your password.');
      return;
    }
    if (!form.get('email') && !form.get('studentNumber')) {
      setAuthError('Enter your university email or student number to continue.');
      return;
    }
    if (!password) {
      setAuthError('Enter your password to continue.');
      return;
    }
    setAuthError('');
    setIsSignedIn(true);
    setScreen('home');
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = chatInput.trim();
    if (!value) return;
    setMessages((current) => [...current, value]);
    setChatInput('');
  };

  const renderScreen = () => {
    if (screen === 'landing') return <Landing onAuth={openAuth} />;
    if (screen === 'login' || screen === 'signup') return <AuthScreen mode={authMode} onModeChange={openAuth} onSubmit={handleAuth} error={authError} showPassword={showPassword} setShowPassword={setShowPassword} />;
    if (screen === 'home') return <HomeScreen onStart={() => protectedNavigate('chat')} onNavigate={protectedNavigate} />;
    if (screen === 'chat') return <ChatScreen input={chatInput} setInput={setChatInput} messages={messages} onSend={sendMessage} showEthical={showEthical} setShowEthical={setShowEthical} onHuman={() => protectedNavigate('help')} />;
    if (screen === 'history') return <HistoryScreen />;
    if (screen === 'profile') return <ProfileScreen saved={profileSaved} onSave={() => setProfileSaved(true)} onLogout={() => { setIsSignedIn(false); setScreen('landing'); }} onNavigate={setScreen} />;
    if (screen === 'privacy') return <PrivacyScreen />;
    if (screen === 'help') return <HelpScreen />;
    return <NotFound onHome={() => setScreen(isSignedIn ? 'home' : 'landing')} />;
  };

  const publicScreen = screen === 'landing' || screen === 'login' || screen === 'signup' || screen === '404';
  if (publicScreen) return <div className="public-shell"><header className="public-header"><Logo onClick={() => setScreen('landing')} /><div className="public-header-actions"><button className="text-button" onClick={() => openAuth('login')}>Log in</button><button className="button button-primary button-small" onClick={() => openAuth('signup')}>Sign up <ArrowRight size={16} /></button></div></header>{renderScreen()}<footer className="public-footer"><span>© MoralMate</span><button onClick={() => setScreen('privacy')}>Privacy & data</button><button onClick={() => setScreen('help')}>Help</button></footer></div>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-top"><Logo onClick={() => protectedNavigate('home')} /><button className="close-nav" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <div className="sidebar-label">Your space</div>
      <nav className="side-nav">{navItems.map(({ label, screen: itemScreen, icon: Icon }) => <button key={label} className={screen === itemScreen ? 'nav-item active' : 'nav-item'} onClick={() => protectedNavigate(itemScreen)}><Icon size={19} /><span>{label}</span>{screen === itemScreen && <span className="nav-active-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={() => setScreen('privacy')}><ShieldCheck size={19} /><span>Privacy & data</span></button><button className="nav-item" onClick={() => setScreen('help')}><CircleHelp size={19} /><span>Help & contact</span></button><div className="sidebar-user"><span className="user-avatar"><UserRound size={17} /></span><div><strong>Your account</strong><small>Private session</small></div><button aria-label="Account settings" onClick={() => protectedNavigate('profile')}><Settings size={17} /></button></div></div>
    </aside>
    {mobileNavOpen && <button className="nav-overlay" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}
    <main className="main-shell"><header className="app-header"><button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="breadcrumb"><span>Private space</span><ChevronRight size={15} /><strong>{screen === 'home' ? 'Home' : screen[0].toUpperCase() + screen.slice(1)}</strong></div><div className="header-actions"><span className="private-pill"><LockKeyhole size={13} /> Private session</span><button className="icon-button" onClick={() => setScreen('help')} aria-label="Help"><CircleHelp size={19} /></button></div></header><div className="page-content">{renderScreen()}</div></main>
    <button className="human-float" onClick={() => protectedNavigate('help')}><HeartHandshake size={19} /><span>Talk to a human</span></button>
    <nav className="mobile-tabs">{navItems.map(({ label, screen: itemScreen, icon: Icon }) => <button key={label} className={screen === itemScreen ? 'mobile-tab active' : 'mobile-tab'} onClick={() => protectedNavigate(itemScreen)}><Icon size={19} /><span>{label}</span></button>)}</nav>
  </div>;
}

function Landing({ onAuth }: { onAuth: (mode: AuthMode) => void }) {
  return <main className="landing"><div className="landing-copy"><div className="eyebrow"><span className="eyebrow-line" /> A calmer way forward</div><h1>Guidance that keeps <em>you</em> in control.</h1><p className="landing-lede">MoralMate is your private campus support assistant for academic, wellbeing and financial concerns.</p><div className="landing-actions"><button className="button button-primary" onClick={() => onAuth('signup')}>Create your space <ArrowRight size={18} /></button><button className="button button-secondary" onClick={() => onAuth('login')}><LogIn size={17} /> Log in</button></div><div className="privacy-note"><span><LockKeyhole size={16} /></span><div><strong>Your privacy comes first</strong><p>We only ask what we need, explain how we reached a response, and never decide for you.</p></div></div></div><div className="landing-visual"><div className="orb orb-one" /><div className="orb orb-two" /><div className="hero-card"><div className="hero-card-top"><span className="status-dot" /> MoralMate <span>Private assistant</span></div><div className="hero-chat"><Mascot /><div className="hero-bubble">A space to explore<br /><strong>what feels right for you.</strong></div></div><div className="hero-lines"><span /><span /><span /></div><div className="hero-card-footer"><ShieldCheck size={15} /> Ethical by design <span>•</span> Always your choice</div></div><div className="floating-note note-top"><span className="note-icon note-blue"><LockKeyhole size={15} /></span><div><strong>Private by default</strong><small>Your space, your pace</small></div></div><div className="floating-note note-bottom"><span className="note-icon note-green"><HeartHandshake size={15} /></span><div><strong>Human support</strong><small>When you need it</small></div></div></div></main>;
}

function AuthScreen({ mode, onModeChange, onSubmit, error, showPassword, setShowPassword }: { mode: AuthMode; onModeChange: (mode: AuthMode) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; error: string; showPassword: boolean; setShowPassword: (value: boolean) => void }) {
  const signup = mode === 'signup';
  return <main className="auth-page"><div className="auth-intro"><div className="auth-mascot"><Mascot /></div><div className="eyebrow"><span className="eyebrow-line" /> Your private campus space</div><h1>{signup ? 'Make space for what’s on your mind.' : 'Welcome back to your space.'}</h1><p>{signup ? 'Set up your private MoralMate space. You stay in control, always.' : 'Continue exploring your options at your own pace.'}</p><div className="auth-quote"><span><LockKeyhole size={18} /></span><p>Your private space for exploring what feels important to you.</p></div></div><div className="auth-card"><div className="auth-card-head"><div><span className="overline">{signup ? 'Get started' : 'Good to see you'}</span><h2>{signup ? 'Create your account' : 'Log in'}</h2></div><span className="step-count">{signup ? '01 / 01' : 'Welcome'}</span></div><form onSubmit={onSubmit} className="auth-form">{signup && <><Field label="Full name" name="name" placeholder="Your full name" /><div className="form-row"><Field label="Student number" name="studentNumber" placeholder="Your student number" /><Field label="Faculty" name="faculty" placeholder="Select faculty" /></div></> }<Field label={signup ? 'University email' : 'Email or student number'} name="email" type={signup ? 'email' : 'text'} placeholder={signup ? 'you@university.edu' : 'Enter your email or student number'} /><div className="field"><label htmlFor="password">Password</label><div className="password-wrap"><input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder={signup ? 'At least 8 characters' : 'Enter your password'} /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></div>{signup && <><Field label="Confirm password" name="confirmPassword" type="password" placeholder="Re-enter your password" /><label className="check-label"><input type="checkbox" required /><span>I agree to the <button type="button">privacy and terms</button>. I understand MoralMate offers guidance, not decisions.</span></label></>}{error && <div className="form-error"><Info size={16} /> {error}</div>}<button className="button button-primary full-button" type="submit">{signup ? 'Create my space' : 'Log in'} <ArrowRight size={17} /></button></form>{!signup && <button className="forgot-button">Forgot password?</button>}<div className="auth-switch"><span>{signup ? 'Already have an account?' : 'New to MoralMate?'}</span><button onClick={() => onModeChange(signup ? 'login' : 'signup')}>{signup ? 'Log in' : 'Create an account'}</button></div></div></main>;
}

function Field({ label, name, placeholder, type = 'text' }: { label: string; name: string; placeholder: string; type?: string }) { return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} placeholder={placeholder} required /></div>; }

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) { return <div className="page-heading"><div><span className="overline">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>; }

function HomeScreen({ onStart, onNavigate }: { onStart: () => void; onNavigate: (screen: Screen) => void }) {
  return <div className="home-screen"><div className="welcome-strip"><div><span className="overline">A private place to begin</span><h1>What’s on your mind?</h1><p>Choose a starting point. You can change direction at any time.</p></div><Mascot small /></div><section className="section-block"><div className="section-heading"><div><span className="overline">Start a conversation</span><h2>How can MoralMate support you?</h2></div><span className="step-badge"><span>1</span> of 4</span></div><div className="category-grid">{categories.map(({ label, description, icon: Icon, tint }) => <button className="category-card" key={label} onClick={onStart}><span className={`category-icon ${tint}`}><Icon size={22} /></span><span className="category-text"><strong>{label}</strong><small>{description}</small></span><ChevronRight className="category-arrow" size={19} /></button>)}</div></section><section className="privacy-banner"><span className="banner-icon"><LockKeyhole size={19} /></span><div><strong>Private session</strong><p>Your conversation is designed around your privacy. You can skip any question.</p></div><button onClick={() => onNavigate('privacy')}>How it works <ArrowRight size={15} /></button></section><div className="home-lower"><div className="quiet-card"><span className="quiet-icon"><HeartHandshake size={20} /></span><div><strong>Prefer to speak with someone?</strong><p>Human support is always an option when you need it.</p></div><button onClick={() => onNavigate('help')} aria-label="Open human support"><ArrowRight size={18} /></button></div><div className="quiet-card"><span className="quiet-icon"><FileText size={20} /></span><div><strong>Your past conversations</strong><p>Review your private session history.</p></div><button onClick={() => onNavigate('history')} aria-label="Open conversation history"><ArrowRight size={18} /></button></div></div></div>;
}

function Progress({ current = 1 }: { current?: number }) { const labels = ['Understand', 'Check', 'Options', 'Human support']; return <div className="progress"><div className="progress-line" />{labels.map((label, index) => <div className={index + 1 <= current ? 'progress-step done' : 'progress-step'} key={label}><span>{index + 1 <= current ? <Check size={13} /> : index + 1}</span><small>{label}</small></div>)}</div>; }

function ChatScreen({ input, setInput, messages, onSend, showEthical, setShowEthical, onHuman }: { input: string; setInput: (value: string) => void; messages: string[]; onSend: (event: FormEvent<HTMLFormElement>) => void; showEthical: boolean; setShowEthical: (value: boolean) => void; onHuman: () => void }) {
  return <div className="chat-screen"><div className="chat-top"><div><span className="overline">Your conversation</span><h1>Let’s take this one step at a time.</h1></div><button className="human-button" onClick={onHuman}><HeartHandshake size={17} /> Talk to a human</button></div><Progress current={messages.length ? 2 : 1} /><div className="chat-layout"><section className="chat-card"><div className="chat-card-head"><div className="chat-title"><Mascot small /><div><strong>MoralMate</strong><span><i className="online-dot" /> Ready when you are</span></div></div><button className="icon-button"><MoreHorizontal size={20} /></button></div><div className="chat-body"><div className="chat-welcome"><span className="chat-avatar"><Mascot small /></span><div><span className="chat-label">MoralMate</span><div className="message assistant-message">Your private session will appear here.</div></div></div>{messages.map((message, index) => <div className="chat-welcome student-row" key={`${message}-${index}`}><div><span className="chat-label right-label">You</span><div className="message student-message">{message}</div></div></div>)}{messages.length === 0 && <div className="chat-prompt"><span className="prompt-icon"><MessageCircle size={16} /></span><p>What would you like support with today?</p><div className="quick-replies"><button onClick={() => setInput('I need help with an academic concern.')}>Academic concern</button><button onClick={() => setInput('I would like to talk about my wellbeing.')}>Wellbeing</button><button onClick={() => setInput('I have a financial concern.')}>Financial concern</button></div></div>}<div className="skip-row"><button>Skip this question <ArrowRight size={14} /></button></div></div><form className="chat-input" onSubmit={onSend}><input aria-label="Your message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Write what feels important..." /><button type="submit" aria-label="Send message" className={input.trim() ? 'send-button ready' : 'send-button'}><Send size={18} /></button></form><div className="chat-note"><LockKeyhole size={13} /> I only ask what I need to help you.</div></section><aside className="ethical-side"><button className="ethical-toggle" onClick={() => setShowEthical(!showEthical)}><span className="side-icon"><ShieldCheck size={18} /></span><span><strong>How MoralMate checks</strong><small>Privacy, fairness, autonomy and safety</small></span><ChevronDown size={18} className={showEthical ? 'rotate' : ''} /></button>{showEthical && <div className="ethical-panel"><div className="flow-row"><span>01</span><strong>Categorize</strong><ArrowRight size={14} /><span>02</span><strong>Check rules</strong><ArrowRight size={14} /><span>03</span><strong>Choose response</strong></div><div className="rule-list"><Rule icon={LockKeyhole} title="Privacy" text="Only ask what is needed." /><Rule icon={UsersRound} title="Fairness" text="Keep guidance unbiased." /><Rule icon={HandHeart} title="Autonomy" text="You remain the decision-maker." /><Rule icon={ShieldCheck} title="Safety" text="Escalate when human support matters." /></div></div>}<div className="ethical-foot"><Info size={15} /> You can ask why a question is being asked.</div></aside></div></div>;
}

function Rule({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) { return <div className="rule"><span><Icon size={16} /></span><div><strong>{title}</strong><small>{text}</small></div><Check size={15} /></div>; }

function HistoryScreen() { return <div className="empty-screen"><PageHeading eyebrow="Your space" title="Past sessions" description="Your completed conversations will appear here." action={<button className="button button-secondary" onClick={() => {}}><Plus size={17} /> New session</button>} /><div className="empty-card"><span className="empty-icon"><Clock3 size={24} /></span><h2>No past sessions yet</h2><p>When you finish a conversation, you’ll be able to return to it here.</p><button className="button button-primary">Start a conversation <ArrowRight size={17} /></button></div></div>; }

function ProfileScreen({ saved, onSave, onLogout, onNavigate }: { saved: boolean; onSave: () => void; onLogout: () => void; onNavigate: (screen: Screen) => void }) { return <div className="profile-screen"><PageHeading eyebrow="Your space" title="Profile & settings" description="Keep your details and preferences up to date." /><div className="settings-grid"><section className="settings-card"><div className="settings-card-head"><span className="settings-icon"><UserRound size={19} /></span><div><h2>Your details</h2><p>Used to personalise your private space.</p></div></div><div className="settings-form"><Field label="Full name" name="profileName" placeholder="Your full name" /><Field label="University email" name="profileEmail" type="email" placeholder="you@university.edu" /><Field label="Faculty" name="profileFaculty" placeholder="Select faculty" /><button className="button button-primary" onClick={onSave}>{saved ? <><Check size={17} /> Saved</> : <>Save changes <ArrowRight size={17} /></>}</button></div></section><section className="settings-card"><div className="settings-card-head"><span className="settings-icon"><Settings size={19} /></span><div><h2>Preferences</h2><p>Choose how MoralMate keeps in touch.</p></div></div><label className="toggle-row"><span><strong>Helpful reminders</strong><small>Receive occasional session reminders</small></span><span className="toggle"><input type="checkbox" /><i /></span></label><button className="settings-link" onClick={() => onNavigate('privacy')}><ShieldCheck size={17} /> Privacy & data <ChevronRight size={17} /></button><button className="settings-link danger" onClick={onLogout}><LogIn size={17} /> Log out <ChevronRight size={17} /></button></section></div></div>; }

function PrivacyScreen() { return <div className="text-page"><PageHeading eyebrow="Your privacy" title="Privacy & data" description="Plain-language information about how your MoralMate space works." /><div className="text-page-grid"><article className="prose-card"><span className="large-page-icon"><LockKeyhole size={24} /></span><h2>You’re in control of your information.</h2><p>MoralMate is designed to give you a private place to think through a concern. You choose what to share, which questions to answer, and whether to speak with a person.</p><div className="info-points"><InfoPoint icon={ClipboardCheck} title="Only what is needed" text="Questions should stay relevant to the support you are exploring." /><InfoPoint icon={ShieldCheck} title="Clear ethical checks" text="You can see the principles used to shape a response." /><InfoPoint icon={UserRound} title="Your choice matters" text="MoralMate offers options. It never makes the decision for you." /></div></article><aside className="privacy-aside"><h3>In this space</h3><button>What we collect <ChevronRight size={16} /></button><button>How your data is used <ChevronRight size={16} /></button><button>Your choices <ChevronRight size={16} /></button><button>Delete my data <ChevronRight size={16} /></button></aside></div></div>; }
function InfoPoint({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) { return <div className="info-point"><span><Icon size={17} /></span><div><strong>{title}</strong><p>{text}</p></div></div>; }
function HelpScreen() { return <div className="help-screen"><PageHeading eyebrow="Support" title="You don’t have to figure it out alone." description="Choose the kind of support that feels right for you." /><div className="support-grid"><div className="support-card support-primary"><span className="support-card-icon"><HeartHandshake size={22} /></span><h2>Talk to a human</h2><p>Connect with a campus advisor when you would like a person involved.</p><button className="button button-light">Find human support <ArrowRight size={17} /></button></div><div className="support-card"><span className="support-card-icon blue-icon"><CircleHelp size={22} /></span><h2>Help with MoralMate</h2><p>Find simple answers about private sessions, ethical checks and your choices.</p><button className="support-link">Browse help topics <ArrowRight size={16} /></button></div><div className="support-card"><span className="support-card-icon gold-icon"><Mail size={22} /></span><h2>Contact support</h2><p>Send a message about using this space or ask for more information.</p><button className="support-link">Open contact form <ArrowRight size={16} /></button></div></div><div className="emergency-note"><Phone size={18} /><p>If you feel in immediate danger, contact your local emergency service or a trusted person now.</p></div></div>; }
function NotFound({ onHome }: { onHome: () => void }) { return <main className="not-found"><div className="not-found-mark"><span>404</span><Mascot small /></div><h1>This page took a wrong turn.</h1><p>The page you’re looking for isn’t available in this space.</p><button className="button button-primary" onClick={onHome}>Back to home <ArrowLeft size={17} /></button></main>; }

export default App;
