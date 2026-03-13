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
  const [secretPassword, setSecretPassword] = useState('');
  const [splashTrophy, setSplashTrophy] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [showCodewordSplash, setShowCodewordSplash] = useState(false);
  
  // Custom Sentences State
  const [customSentences, setCustomSentences] = useState<{en: string[], fr: string[]}>(() => {
    const saved = localStorage.getItem('tt_custom_sentences');
    return saved ? JSON.parse(saved) : { en: [], fr: [] };
  });
  const [newSentenceText, setNewSentenceText] = useState('');
  const [newSentenceLang, setNewSentenceLang] = useState<'en' | 'fr'>('en');
  
  const [dyslexicFont, setDyslexicFont] = useState<'default' | 'lexend' | 'comic'>(() => (localStorage.getItem('tt_font') as 'default' | 'lexend' | 'comic') || 'default');
  const [zenMode, setZenMode] = useState(() => localStorage.getItem('tt_zen_mode') === 'true');
  const [focusMode, setFocusMode] = useState(() => localStorage.getItem('tt_focus_mode') === 'true');
  const [softErrors, setSoftErrors] = useState(() => localStorage.getItem('tt_soft_errors') === 'true');
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>(() => (localStorage.getItem('tt_layout') as 'vertical' | 'horizontal') || 'vertical');
  
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSentences = [...sentences[lang], ...(customSentences[lang] || [])];
  const targetSentence = activeSentences[currentSentenceIndex] || activeSentences[0];

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
    localStorage.setItem('tt_custom_sentences', JSON.stringify(customSentences));
    localStorage.setItem('tt_font', dyslexicFont);
    localStorage.setItem('tt_zen_mode', zenMode.toString());
    localStorage.setItem('tt_focus_mode', focusMode.toString());
    localStorage.setItem('tt_soft_errors', softErrors.toString());
    localStorage.setItem('tt_layout', layoutMode);
  }, [lang, score, totalSecondsPlayed, history, targetTrophies, customSentences, dyslexicFont, zenMode, focusMode, softErrors, layoutMode]);

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

    // Check if goal met this round (interval check)
    const hitGoal = typeof targetTrophies === 'number' && targetTrophies > 0 && Math.floor(nextScore / targetTrophies) > Math.floor(score / targetTrophies);

    if (hitGoal) {
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
    setCurrentSentenceIndex(Math.floor(Math.random() * ([...sentences[l], ...(customSentences[l] || [])].length)));
  };

  const resetProgress = () => {
    setScore(0);
    setHistory([]);
    setTotalSecondsPlayed(0);
    setWpm(0);
    setAccuracy(100);

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
    <div className={`app-container font-${dyslexicFont}`} onClick={() => inputRef.current?.focus()}>
      <header className="header">
        <h1><Keyboard size={32} /> Typo Tutor</h1>
        <div className="stats" aria-live="polite">
          {!zenMode ? (
            <>
              <div className="stat-box" title="Words Per Minute">⚡ {wpm} WPM</div>
              <div className="stat-box" title="Accuracy">🎯 {accuracy}%</div>
            </>
          ) : (
            <div className="stat-box" title="Effort Mode Active">🌱 Growing Brain</div>
          )}
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
      
      <main className={`split-screen layout-${layoutMode}`} aria-label="Typing interface">
        <section className="target-section">
          <div className="target-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="tts-btn" onClick={(e) => { e.stopPropagation(); playTTS(); }} title="Read Aloud" aria-label="Read sentence aloud">
              <Volume2 size={24} />
            </button>
          </div>
            <div className={`sentence-display ${focusMode ? 'focus-enabled' : ''}`}>
              {targetSentence.split('').map((char, index) => {
                let className = 'char';
                if (index < input.length) {
                  className += input[index] === char ? ' correct' : ' incorrect';
                  if (softErrors && input[index] !== char) {
                    className += ' soft-error';
                  }
                } else if (index === input.length) {
                  className += ' current';
                }

                if (focusMode) {
                  let lastSpaceIdx = targetSentence.lastIndexOf(' ', input.length);
                  let nextSpaceIdx = targetSentence.indexOf(' ', input.length);
                  // Treat punctuation as word boundaries if attached to words, but simpler: just spaces
                  const wordStart = lastSpaceIdx === -1 ? 0 : lastSpaceIdx + 1;
                  const wordEnd = nextSpaceIdx === -1 ? targetSentence.length : nextSpaceIdx;
                  
                  if (index >= wordStart && index < wordEnd) {
                    className += ' focus-active';
                  } else {
                    className += ' focus-dimmed';
                  }
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
              const newPassword = kidFriendlyPasswords[Math.floor(Math.random() * kidFriendlyPasswords.length)];
              setSecretPassword(newPassword);
              localStorage.setItem('tt_secret_password', newPassword);
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

              <div className="sentences-manager" style={{ marginTop: '2rem' }}>
                <h3>Sentence Manager</h3>
                <div className="settings-row" style={{ gridTemplateColumns: '3fr 1fr' }}>
                  <div className="input-group">
                    <label>Add New Custom Sentence:</label>
                    <input 
                      type="text" 
                      value={newSentenceText} 
                      onChange={e => setNewSentenceText(e.target.value)} 
                      placeholder="e.g. A legendary chest appeared in the forest." 
                    />
                  </div>
                  <div className="input-group" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <label style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '0.65rem' }}>Lang</label>
                      <select 
                        value={newSentenceLang} 
                        onChange={e => setNewSentenceLang(e.target.value as 'en' | 'fr')}
                        style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--card-bg)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                      >
                        <option value="en" style={{color: 'black'}}>EN</option>
                        <option value="fr" style={{color: 'black'}}>FR</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => {
                        if (newSentenceText.trim().length > 5) {
                          setCustomSentences(prev => ({
                            ...prev,
                            [newSentenceLang]: [...prev[newSentenceLang], newSentenceText.trim()]
                          }));
                          setNewSentenceText('');
                        }
                      }}
                      style={{ padding: '0.75rem 1rem', height: '45px', background: 'var(--primary)', color: '#1a1a1a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Add
                    </button>
                  </div>
                </div>

                <div className="sentence-list" style={{ marginTop: '1rem', maxHeight: '180px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ marginBottom: '1rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Custom Sentences ({lang === 'en' ? 'English' : 'French'})</span>
                    <span style={{ fontSize: '0.8rem', background: 'var(--primary)', color: '#1a1a1a', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold' }}>{customSentences[lang].length}</span>
                  </h4>
                  {customSentences[lang].length === 0 ? (
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>No custom sentences added yet for {lang === 'en' ? 'English' : 'French'}. The app will use the {sentences[lang].length} built-in default sentences.</div>
                  ) : (
                    customSentences[lang].map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.95rem', color: '#e5e7eb', paddingRight: '1rem', lineHeight: '1.4' }}>{s}</span>
                        <button 
                          onClick={() => {
                            const updated = customSentences[lang].filter((_, i) => i !== idx);
                            setCustomSentences(prev => ({ ...prev, [lang]: updated }));
                            // Adjust if deleting pushes index out of bounds
                            if (currentSentenceIndex >= sentences[lang].length + updated.length) {
                              setCurrentSentenceIndex(0);
                            }
                          }}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '4px', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Delete custom sentence">
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="notification-settings" style={{ marginTop: '2rem' }}>
                <h3><Bell size={20} className="bell-icon" /> Notification Goal</h3>
                <div className="settings-row" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="input-group">
                    <label>Show word every X trophies (Interval):</label>
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
                  <small style={{ opacity: 0.8 }}>When score goals are met, the alert will tell your child to give you this word!</small>
                </div>
              </div>

              <div className="accessibility-settings" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Accessibility & Mindset Settings</h3>
                <div className="settings-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="input-group">
                    <label>Dyslexia-Friendly Font:</label>
                    <select 
                      value={dyslexicFont} 
                      onChange={e => setDyslexicFont(e.target.value as any)}
                    >
                      <option value="default" style={{color: 'black'}}>Default (System Sans)</option>
                      <option value="lexend" style={{color: 'black'}}>Lexend</option>
                      <option value="comic" style={{color: 'black'}}>Comic Sans</option>
                      <option value="opendyslexic" style={{color: 'black'}}>OpenDyslexic</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={zenMode} onChange={e => setZenMode(e.target.checked)} style={{ width: 'auto' }}/>
                      Zen Mode (Hide WPM & Accuracy)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={focusMode} onChange={e => setFocusMode(e.target.checked)} style={{ width: 'auto' }}/>
                      Focus Mode (Word Highlight)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={softErrors} onChange={e => setSoftErrors(e.target.checked)} style={{ width: 'auto' }}/>
                      Soft Errors (Gentle colors & wobble)
                    </label>
                  </div>
                  <div className="input-group">
                    <label>Screen Layout:</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="layout" 
                          value="vertical" 
                          checked={layoutMode === 'vertical'} 
                          onChange={(e) => setLayoutMode(e.target.value as 'vertical')} 
                          style={{ width: 'auto' }}
                        /> 
                        Side-by-Side
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="layout" 
                          value="horizontal" 
                          checked={layoutMode === 'horizontal'} 
                          onChange={(e) => setLayoutMode(e.target.value as 'horizontal')} 
                          style={{ width: 'auto' }}
                        /> 
                        Top & Bottom
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="reset-btn" onClick={resetProgress}>
                  <RotateCcw size={20} /> Reset All Progress
                </button>
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                <p>The font used in this page can be downloaded for use on your PC or Mac at <a href="https://opendyslexic.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }}>https://opendyslexic.org/</a></p>
                <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>I have no connection to them but really enjoy their font, so shout out!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
