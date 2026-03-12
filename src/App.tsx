import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Keyboard, Globe, Settings, X, RotateCcw, Clock, Bell, Volume2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { sentences } from './data/sentences';
import './App.css';

function App() {
  const [lang, setLang] = useState<'en' | 'fr'>(() => (localStorage.getItem('tt_lang') as 'en' | 'fr') || 'en');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(() => parseInt(localStorage.getItem('tt_score') || '0', 10));
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  
  // Parents Menu State
  const [showParentsMenu, setShowParentsMenu] = useState(false);
  const [totalSecondsPlayed, setTotalSecondsPlayed] = useState(() => parseInt(localStorage.getItem('tt_seconds_played') || '0', 10));
  const [history, setHistory] = useState<{name: string, wpm: number, accuracy: number}[]>(() => {
    const saved = localStorage.getItem('tt_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [targetTrophies, setTargetTrophies] = useState<number | ''>(() => {
    const saved = localStorage.getItem('tt_target_trophies');
    return saved ? parseInt(saved, 10) : 1000;
  });
  const [hasNotifiedThisSession, setHasNotifiedThisSession] = useState(false);
  const [secretPassword, setSecretPassword] = useState('');
  const [splashTrophy, setSplashTrophy] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [showCodewordSplash, setShowCodewordSplash] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSentences = sentences[lang];
  const targetSentence = activeSentences[currentSentenceIndex];

  const kidFriendlyPasswords = [
    'Dinosaurs', 'Spaceship', 'Unicorn', 'Robot', 'Dragon', 
    'Pizza', 'Wizard', 'Monster', 'Rocket', 'Pirate', 'Ninja', 'Marshmallow'
  ];

  useEffect(() => {
    // Determine the secret password: use saved one if exists, otherwise generate random initially
    const savedPassword = localStorage.getItem('tt_secret_password');
    if (savedPassword) {
      setSecretPassword(savedPassword);
    } else {
      const generated = kidFriendlyPasswords[Math.floor(Math.random() * kidFriendlyPasswords.length)];
      setSecretPassword(generated);
      localStorage.setItem('tt_secret_password', generated);
    }
  }, []);

  // Save Config/Stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tt_lang', lang);
    localStorage.setItem('tt_score', score.toString());
    localStorage.setItem('tt_seconds_played', totalSecondsPlayed.toString());
    localStorage.setItem('tt_history', JSON.stringify(history));
    localStorage.setItem('tt_target_trophies', targetTrophies.toString());
  }, [lang, score, totalSecondsPlayed, history, targetTrophies]);

  useEffect(() => {
    // Focus input on load and when language changes
    if (!showParentsMenu) {
      inputRef.current?.focus();
    }
  }, [lang, currentSentenceIndex, showParentsMenu]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSecondsPlayed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // (Removed email alert effect)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Prevent typing if sentence is completed but not updated yet
    if (input === targetSentence) return;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setInput(val);

    // Track mistakes dynamically for accuracy final calculation
    let newMistakes = mistakes;
    if (val.length > input.length) {
      for (let i = input.length; i < val.length; i++) {
        if (val[i] !== targetSentence[i]) {
          newMistakes++;
        }
      }
      if (newMistakes > mistakes) {
        setMistakes(newMistakes);
      }
    }

    // Check completion condition (they matched exactly or typed the max length)
    if (val.length >= targetSentence.length) {
      // If it matches exactly
      if (val === targetSentence) {
        finishSentence(newMistakes);
      } else {
        // Stop typing, wait for them to fix errors by hitting backspace
        setInput(val.slice(0, targetSentence.length));
      }
    }
  };

  const finishSentence = (totalMistakes: number) => {
    let finalWpm = 0;
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 60000; // minutes
      if (timeElapsed > 0) {
        const wordsTyped = targetSentence.length / 5;
        finalWpm = Math.round(wordsTyped / timeElapsed);
      }
    }

    const finalAccuracy = Math.max(0, Math.round(((targetSentence.length - totalMistakes) / targetSentence.length) * 100));

    setWpm(finalWpm);
    setAccuracy(finalAccuracy);

    const maxPossiblePoints = 50 + (targetSentence.length * 5) + 50 + 100;

    let earnedPoints = 50; // base points
    earnedPoints += targetSentence.length * 5; // Points for length
    earnedPoints -= totalMistakes * 10; // Deduct for errors
    
    if (finalWpm > 40) earnedPoints += 50; // Speed bonus
    if (finalAccuracy === 100) earnedPoints += 100; // Accuracy bonus

    const finalPoints = Math.max(0, Math.floor(earnedPoints));
    const nextScore = score + finalPoints;
    setScore(nextScore);
    
    setHistory(prev => [
      ...prev,
      { name: `Sent ${prev.length + 1}`, wpm: finalWpm, accuracy: finalAccuracy }
    ]);

    // Check if goal met this round
    const hitGoal = targetTrophies && nextScore >= targetTrophies && !hasNotifiedThisSession;

    if (hitGoal) {
      setHasNotifiedThisSession(true);
      setShowCodewordSplash(true);
    } else {
      let trophyLevel: 'bronze' | 'silver' | 'gold' = 'bronze';
      const scoreRatio = finalPoints / maxPossiblePoints;
      
      // Top 10% of available points -> Gold
      if (scoreRatio >= 0.90) {
        trophyLevel = 'gold';
      } 
      // Top 50% -> Silver
      else if (scoreRatio >= 0.50) {
        trophyLevel = 'silver';
      }
      
      setSplashTrophy(trophyLevel);

      // Slight pause to show the splash overlay
      setTimeout(() => {
        setSplashTrophy(null);
        advanceSentence();
      }, 1500);
    }
  };

  const advanceSentence = () => {
    setInput('');
    setStartTime(null);
    setMistakes(0);
    setCurrentSentenceIndex(prev => {
      let nextIndex = Math.floor(Math.random() * activeSentences.length);
      while (nextIndex === prev && activeSentences.length > 1) {
        nextIndex = Math.floor(Math.random() * activeSentences.length);
      }
      return nextIndex;
    });
  };

  const toggleLang = (l: 'en' | 'fr') => {
    setLang(l);
    setInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setCurrentSentenceIndex(Math.floor(Math.random() * sentences[l].length));
  };

  const resetProgress = () => {
    setScore(0);
    setHistory([]);
    setTotalSecondsPlayed(0);
    setWpm(0);
    setAccuracy(100);
    setHasNotifiedThisSession(false);

    // Give a new random password on reset
    const newPassword = kidFriendlyPasswords[Math.floor(Math.random() * kidFriendlyPasswords.length)];
    setSecretPassword(newPassword);
    localStorage.setItem('tt_secret_password', newPassword);

    setCurrentSentenceIndex(Math.floor(Math.random() * activeSentences.length));
    setShowParentsMenu(false);
    window.speechSynthesis.cancel();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const playTTS = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(targetSentence);
    // Set appropriate language tag for the voice engine
    utterance.lang = lang === 'en' ? 'en-US' : 'fr-CA';
    utterance.rate = 0.85; // slightly slower for better comprehension
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="app-container" onClick={() => inputRef.current?.focus()}>
      <header className="header">
        <h1><Keyboard size={32} /> Typo Tutor</h1>
        <div className="stats" aria-live="polite">
          <div className="stat-box" title="Words Per Minute">⚡ {wpm} WPM</div>
          <div className="stat-box" title="Accuracy">🎯 {accuracy}%</div>
          <div className="stat-box" title="Total Score"><Trophy size={24}/> {score}</div>
        </div>
        <div className="controls">
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLang('en'); }}>
            <Globe size={18}/> EN (US)
          </button>
          <button className={`lang-btn ${lang === 'fr' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLang('fr'); }}>
            <Globe size={18}/> FR (CA)
          </button>
          <button className="settings-btn" onClick={(e) => { 
            e.stopPropagation(); 
            const pwd = prompt("Enter Parents Password:");
            if (pwd === "ParentsRule") {
              setShowParentsMenu(true);
            } else if (pwd !== null) {
              alert("Incorrect Password!");
            }
          }} title="Parents Menu">
            <Settings size={22}/>
          </button>
        </div>
      </header>
      
      <main className="split-screen" aria-label="Typing interface">
        <section className="target-section">
          <div className="target-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="tts-btn" onClick={(e) => { e.stopPropagation(); playTTS(); }} title="Read Aloud" aria-label="Read sentence aloud">
              <Volume2 size={24} />
            </button>
          </div>
          <div className="sentence-display">
            {targetSentence.split('').map((char, index) => {
              let className = 'char';
              if (index < input.length) {
                className += input[index] === char ? ' correct' : ' incorrect';
              } else if (index === input.length) {
                className += ' current';
              }
              return (
                <span key={index} className={className}>
                  {char}
                </span>
              );
            })}
          </div>
        </section>

        <section className="input-section">
          <input
            ref={inputRef}
            type="text"
            className="typing-input"
            value={input}
            onChange={handleInput}
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            placeholder={lang === 'en' ? "Type here..." : "Tapez ici..."}
            aria-label="Typing input section"
          />
          <div className="keyboard-hint">
            {lang === 'en' 
              ? `Keyboard Layout: US English` 
              : `Type in French! Make sure your keyboard is set to French (Canada).`}
          </div>
        </section>
      </main>

      {splashTrophy && !showCodewordSplash && (
        <div className={`trophy-splash ${splashTrophy}`}>
          <Trophy size={100} className="splash-icon" />
          <div className="splash-text">
            {splashTrophy === 'gold' && 'Amazing!'}
            {splashTrophy === 'silver' && 'Great Job!'}
            {splashTrophy === 'bronze' && 'Good Try!'}
          </div>
        </div>
      )}

      {showCodewordSplash && (
        <div className="modal-overlay codeword-overlay" style={{ zIndex: 3000 }}>
          <div className="modal" style={{ textAlign: 'center', padding: '3rem 2rem', border: '4px solid #f59e0b', background: '#1e293b' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#f59e0b', marginBottom: '1rem' }}>🎉 Congratulations! 🎉</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>You reached your Typing Trophy goal!</p>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '2rem', borderRadius: '12px', border: '2px dashed #f59e0b', margin: '0 2rem 2rem 2rem' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fbbf24' }}>Tell your parents this secret password:</p>
              <h1 style={{ fontSize: '3rem', color: 'white', letterSpacing: '4px', textTransform: 'uppercase' }}>{secretPassword}</h1>
            </div>
            <button className="reset-btn" style={{ margin: '0 auto', background: '#f59e0b', color: '#1e293b', border: 'none' }} onClick={() => {
              setShowCodewordSplash(false);
              advanceSentence();
            }}>
              Keep Playing
            </button>
          </div>
        </div>
      )}

      {showParentsMenu && (
        <div className="modal-overlay" onClick={() => setShowParentsMenu(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Parents & Teachers Dashboard</h2>
              <button className="close-btn" onClick={() => setShowParentsMenu(false)}><X size={24} /></button>
            </div>
            
            <div className="modal-body">
              <div className="dashboard-stats">
                <div className="dash-stat">
                  <Clock size={28} className="dash-icon" />
                  <div>
                    <span className="dash-label">Time Played</span>
                    <strong className="dash-value">{formatTime(totalSecondsPlayed)}</strong>
                  </div>
                </div>
                <div className="dash-stat">
                  <Trophy size={28} className="dash-icon trophy-icon" />
                  <div>
                    <span className="dash-label">Total Trophies</span>
                    <strong className="dash-value">{score}</strong>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <h3>Performance History (WPM & Accuracy)</h3>
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis yAxisId="left" stroke="#4ade80" domain={[0, 'dataMax + 10']} />
                      <YAxis yAxisId="right" orientation="right" stroke="#60a5fa" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="wpm" name="WPM" stroke="#4ade80" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">Complete a sentence to see progress!</div>
                )}
              </div>

              <div className="notification-settings">
                <h3><Bell size={20} className="bell-icon" /> Notification Goal</h3>
                <div className="settings-row" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="input-group">
                    <label>When trophies reach:</label>
                    <input 
                      type="number" 
                      min="10" 
                      step="10" 
                      value={targetTrophies} 
                      onChange={e => setTargetTrophies(e.target.value ? parseInt(e.target.value) : '')} 
                      placeholder="e.g. 1000" 
                    />
                  </div>
                </div>
                <div className="secret-password-display" style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd', fontSize: '0.95rem' }}>
                  <strong style={{ color: '#fff' }}>Secret Password:</strong> {secretPassword} <br/>
                  <small style={{ opacity: 0.8 }}>When goals are met, the alert will tell your child to give you this word!</small>
                </div>
              </div>

              <div className="modal-actions">
                <button className="reset-btn" onClick={resetProgress}>
                  <RotateCcw size={20} /> Reset All Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
