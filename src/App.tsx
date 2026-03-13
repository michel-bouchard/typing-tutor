import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Keyboard, Globe, Settings, X, RotateCcw, Clock, Bell, Volume2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { sentences } from './data/sentences';
import './App.css';

function App() {
  const [lang, setLang] = useState<'en' | 'fr' | 'es' | 'it'>(() => (localStorage.getItem('tt_lang') as 'en' | 'fr' | 'es' | 'it') || 'en');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(() => parseInt(localStorage.getItem('tt_score') || '0', 10));
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  
  // Parents Menu State
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showParentsMenu, setShowParentsMenu] = useState(false);
  const [totalSecondsPlayed, setTotalSecondsPlayed] = useState(() => parseInt(localStorage.getItem('tt_seconds_played') || '0', 10));
  const [history, setHistory] = useState<{name: string, wpm: number, accuracy: number}[]>(() => {
    const saved = localStorage.getItem('tt_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [personalBestWpm, setPersonalBestWpm] = useState(() => parseInt(localStorage.getItem('tt_personal_best') || '0', 10));
  const [newPersonalBest, setNewPersonalBest] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [targetTrophies, setTargetTrophies] = useState<number | ''>(() => {
    const saved = localStorage.getItem('tt_target_trophies');
    return saved ? parseInt(saved, 10) : 1000;
  });
  const [showEndError, setShowEndError] = useState(false);
  const [secretPassword, setSecretPassword] = useState('');
  const [splashTrophy, setSplashTrophy] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [showCodewordSplash, setShowCodewordSplash] = useState(false);
  
  // Custom Sentences State
  const [customSentences, setCustomSentences] = useState<{en: string[], fr: string[], es: string[], it: string[]}>(() => {
    const saved = localStorage.getItem('tt_custom_sentences');
    return saved ? JSON.parse(saved) : { en: [], fr: [], es: [], it: [] };
  });
  const [newSentenceText, setNewSentenceText] = useState('');
  const [newSentenceLang, setNewSentenceLang] = useState<'en' | 'fr' | 'es' | 'it'>('en');
  
  const [dyslexicFont, setDyslexicFont] = useState<'default' | 'lexend' | 'comic'>(() => (localStorage.getItem('tt_font') as 'default' | 'lexend' | 'comic') || 'default');
  const [zenMode, setZenMode] = useState(() => localStorage.getItem('tt_zen_mode') === 'true');
  const [focusMode, setFocusMode] = useState(() => localStorage.getItem('tt_focus_mode') === 'true');
  const [softErrors, setSoftErrors] = useState(() => localStorage.getItem('tt_soft_errors') === 'true');
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>(() => (localStorage.getItem('tt_layout') as 'vertical' | 'horizontal') || 'horizontal');
  const [spaceMode, setSpaceMode] = useState<'always' | 'jit' | 'hidden'>(() => (localStorage.getItem('tt_space_mode') as 'always' | 'jit' | 'hidden') || 'jit');
  const [sentenceLengthMode, setSentenceLengthMode] = useState<'full' | 'short'>(() => (localStorage.getItem('tt_sentence_length') as 'full' | 'short') || 'full');
  const [appTheme, setAppTheme] = useState<'dark' | 'hacker' | 'ocean' | 'cotton-candy' | 'sepia'>(() => (localStorage.getItem('tt_theme') as 'dark' | 'hacker' | 'ocean' | 'cotton-candy' | 'sepia') || 'dark');
  const [enableStreakShield, setEnableStreakShield] = useState(() => localStorage.getItem('tt_enable_shield') !== 'false');
  const [enablePersonalBest, setEnablePersonalBest] = useState(() => localStorage.getItem('tt_enable_pb') !== 'false');
  
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSentences = [...sentences[lang], ...(customSentences[lang] || [])];
  const fullSentence = activeSentences[currentSentenceIndex] || activeSentences[0];
  const targetSentence = sentenceLengthMode === 'short' 
    ? fullSentence.split(' ').slice(0, 4).join(' ') 
    : fullSentence;

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
    localStorage.setItem('tt_space_mode', spaceMode);
    localStorage.setItem('tt_sentence_length', sentenceLengthMode);
    localStorage.setItem('tt_theme', appTheme);
    localStorage.setItem('tt_personal_best', personalBestWpm.toString());
    localStorage.setItem('tt_enable_shield', enableStreakShield.toString());
    localStorage.setItem('tt_enable_pb', enablePersonalBest.toString());
  }, [lang, score, totalSecondsPlayed, history, targetTrophies, customSentences, dyslexicFont, zenMode, focusMode, softErrors, layoutMode, spaceMode, sentenceLengthMode, appTheme, personalBestWpm, enableStreakShield, enablePersonalBest]);

  useEffect(() => {
    // Focus input on load and when language changes
    if (!showParentsMenu) {
      inputRef.current?.focus();
    }
  }, [lang, currentSentenceIndex, showParentsMenu]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);

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

    // Track mistakes dynamically for accuracy final calculation
    let newMistakes = mistakes;
    let madeMistakeThisKeystroke = false;
    if (val.length > input.length) {
      for (let i = input.length; i < val.length; i++) {
        if (val[i] !== targetSentence[i]) {
          madeMistakeThisKeystroke = true;
          newMistakes++;
        }
      }
    }

    if (madeMistakeThisKeystroke) {
      if (enableStreakShield && hasShield) {
        // Shield absorbs the mistake!
        setHasShield(false);
        setComboCount(0);
        return; // Ignore the keystroke completely
      } else {
        setComboCount(0);
        setHasShield(false);
        if (newMistakes > mistakes) {
          setMistakes(newMistakes);
        }
      }
    } else {
      // Correct keystroke
      if (val.length > input.length) {
        if (enableStreakShield) {
          const newCombo = comboCount + 1;
          setComboCount(newCombo);
          if (newCombo >= 20 && !hasShield) {
            setHasShield(true);
          }
        } else {
          setComboCount(0);
          setHasShield(false);
        }
      }
    }

    setInput(val);

    // Check completion condition (they matched exactly or typed the max length)
    if (val.length >= targetSentence.length) {
      // If it matches exactly
      if (val === targetSentence) {
        setShowEndError(false);
        finishSentence(newMistakes);
      } else {
        // Stop typing, wait for them to fix errors by hitting backspace
        setShowEndError(true);
        setInput(val.slice(0, targetSentence.length));
      }
    } else {
      setShowEndError(false); // They hit backspace and fixed it
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

    // Personal Best Logic
    if (enablePersonalBest && finalWpm > personalBestWpm && finalWpm > 0) {
      setPersonalBestWpm(finalWpm);
      setNewPersonalBest(true);
    } else {
      setNewPersonalBest(false);
    }

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
    setShowEndError(false);
    setNewPersonalBest(false);
    setCurrentSentenceIndex(prev => {
      let nextIndex = Math.floor(Math.random() * activeSentences.length);
      while (nextIndex === prev && activeSentences.length > 1) {
        nextIndex = Math.floor(Math.random() * activeSentences.length);
      }
      return nextIndex;
    });
  };

  const toggleLang = (l: 'en' | 'fr' | 'es' | 'it') => {
    setLang(l);
    setInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setShowEndError(false);
    setNewPersonalBest(false);
    setCurrentSentenceIndex(Math.floor(Math.random() * ([...sentences[l], ...(customSentences[l] || [])].length)));
  };

  const resetProgress = () => {
    setScore(0);
    setHistory([]);
    setTotalSecondsPlayed(0);
    setWpm(0);
    setAccuracy(100);
    setPersonalBestWpm(0);
    setNewPersonalBest(false);
    setShowEndError(false);
    setComboCount(0);
    setHasShield(false);

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
    if (lang === 'en') utterance.lang = 'en-US';
    else if (lang === 'fr') utterance.lang = 'fr-CA';
    else if (lang === 'es') utterance.lang = 'es-ES';
    else if (lang === 'it') utterance.lang = 'it-IT';
    
    utterance.rate = 0.85; // slightly slower for better comprehension
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`app-container font-${dyslexicFont} theme-${appTheme}`} onClick={() => inputRef.current?.focus()}>
      <header className="header">
        <h1><Keyboard size={32} /> Typo Tutor</h1>
        <div className="stats" aria-live="polite">
          {!zenMode ? (
            <>
              <div className="stat-box" title="Words Per Minute" style={{ display: 'flex', alignItems: 'center' }}>
                <span>⚡ {wpm} WPM</span>
                {enablePersonalBest && newPersonalBest && <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: '#fbbf24', color: '#1a1a1a', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>New Best!</span>}
              </div>
              <div className="stat-box" title="Accuracy">🎯 {accuracy}%</div>
              {enablePersonalBest && personalBestWpm > 0 && <div className="stat-box" title="Personal Best WPM" style={{ color: '#fbbf24', borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>🏆 {personalBestWpm}</div>}
              {enableStreakShield && hasShield && <div className="stat-box" title="Streak Shield Active!" style={{ color: '#93c5fd', borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.2)' }}>🛡️</div>}
            </>
          ) : (
            <div className="stat-box" title="Effort Mode Active">🌱 Growing Brain</div>
          )}
          <div className="stat-box" title="Total Score"><Trophy size={24}/> {score}</div>
        </div>
        <div className="controls">
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLang('en'); }}>
            <Globe size={18}/> EN
          </button>
          <button className={`lang-btn ${lang === 'fr' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLang('fr'); }}>
            <Globe size={18}/> FR
          </button>
          <button className={`lang-btn ${lang === 'es' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLang('es'); }}>
            <Globe size={18}/> ES
          </button>
          <button className={`lang-btn ${lang === 'it' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLang('it'); }}>
            <Globe size={18}/> IT
          </button>
          <button className="settings-btn" onClick={(e) => { 
            e.stopPropagation(); 
            setShowPasswordPrompt(true);
            setPasswordInput('');
            setPasswordError(false);
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
            <div className={`sentence-display ${focusMode ? 'focus-enabled' : ''} space-mode-${spaceMode}`}>
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
                if (char === ' ') {
                  className += ' space-char';
                }

                if (focusMode) {
                  let lastSpaceIdx = targetSentence.lastIndexOf(' ', input.length);
                  let nextSpaceIdx = targetSentence.indexOf(' ', input.length);
                  // Treat punctuation as word boundaries if attached to words, but simpler: just spaces
                  const wordStart = lastSpaceIdx === -1 ? 0 : lastSpaceIdx + 1;
                  const wordEnd = nextSpaceIdx === -1 ? targetSentence.length : nextSpaceIdx;
                  
                  if (index >= wordStart && index < wordEnd) {
                    className += ' focus-active';
                  } else if (index === input.length && char === ' ') {
                    className += ' focus-active';
                  } else {
                    className += ' focus-dimmed';
                  }
                }

                return (
                <span key={index} className={className}>
                  {char === ' ' ? '␣' : char}
                </span>
              );
            })}
          </div>
        </section>

        <section className="input-section" style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            className={`typing-input ${showEndError ? 'shake-animation' : ''}`}
            value={input}
            onChange={handleInput}
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            placeholder={
              lang === 'en' ? "Type here..." : 
              lang === 'fr' ? "Tapez ici..." :
              lang === 'es' ? "Escribe aquí..." : "Digita qui..."
            }
            aria-label="Typing input section"
          />
          {showEndError && (
            <div className="error-tooltip" style={{
              marginTop: '1rem',
              color: 'var(--error)',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px dashed rgba(239, 68, 68, 0.5)',
              textAlign: 'center',
              fontWeight: 'bold',
              animation: 'fadeIn 0.3s ease-in'
            }}>
              Oops! You have a typo. Use Backspace (⌫) to slide back and fix it!
            </div>
          )}
          <div className="keyboard-hint" style={{ marginTop: showEndError ? '1rem' : '0' }}>
            {lang === 'en' && `Keyboard Layout: US English`}
            {lang === 'fr' && `Type in French! Make sure your keyboard is set to French.`}
            {lang === 'es' && `Type in Spanish! Make sure your keyboard is set to Spanish.`}
            {lang === 'it' && `Type in Italian! Make sure your keyboard is set to Italian.`}
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

      {showPasswordPrompt && (
        <div className="modal-overlay codeword-overlay" style={{ zIndex: 4000 }} onClick={() => setShowPasswordPrompt(false)}>
          <div className="modal" style={{ maxWidth: '400px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>-TopSecret-</h2>
              <button className="close-btn" onClick={() => setShowPasswordPrompt(false)}><X size={24} /></button>
            </div>
            
            <div className="input-group">
              <label style={{ marginBottom: '0.5rem' }}>Enter Parents Password:</label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={e => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (passwordInput === "ParentsRule") {
                      setShowPasswordPrompt(false);
                      setShowParentsMenu(true);
                    } else {
                      setPasswordError(true);
                    }
                  }
                }}
                autoFocus
                style={{ borderColor: passwordError ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
              />
              {passwordError && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>Incorrect Password!</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '1rem' }}>
              <button 
                onClick={() => setShowPasswordPrompt(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (passwordInput === "ParentsRule") {
                    setShowPasswordPrompt(false);
                    setShowParentsMenu(true);
                  } else {
                    setPasswordError(true);
                  }
                }}
                style={{ background: 'var(--primary)', color: '#1a1a1a', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Enter
              </button>
            </div>
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
                        onChange={e => setNewSentenceLang(e.target.value as 'en' | 'fr' | 'es' | 'it')}
                        style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--card-bg)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                      >
                        <option value="en" style={{color: 'black'}}>EN</option>
                        <option value="fr" style={{color: 'black'}}>FR</option>
                        <option value="es" style={{color: 'black'}}>ES</option>
                        <option value="it" style={{color: 'black'}}>IT</option>
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
                    <span>Custom Sentences ({lang.toUpperCase()})</span>
                    <span style={{ fontSize: '0.8rem', background: 'var(--primary)', color: '#1a1a1a', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold' }}>{customSentences[lang].length}</span>
                  </h4>
                  {customSentences[lang].length === 0 ? (
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>No custom sentences added yet for {lang.toUpperCase()}. The app will use the {sentences[lang].length} built-in default sentences.</div>
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
                    <label>App Color Theme:</label>
                    <select 
                      value={appTheme} 
                      onChange={e => setAppTheme(e.target.value as any)}
                    >
                      <option value="dark" style={{color: 'black'}}>Default Dark</option>
                      <option value="hacker" style={{color: 'black'}}>Hacker Green</option>
                      <option value="ocean" style={{color: 'black'}}>Deep Ocean</option>
                      <option value="cotton-candy" style={{color: 'black'}}>Cotton Candy</option>
                      <option value="sepia" style={{color: 'black'}}>Paper Sepia</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Lesson Length (Micro-sessions):</label>
                    <select 
                      value={sentenceLengthMode} 
                      onChange={e => setSentenceLengthMode(e.target.value as 'full' | 'short')}
                    >
                      <option value="full" style={{color: 'black'}}>Full Sentences</option>
                      <option value="short" style={{color: 'black'}}>Short Bursts (First 4 words)</option>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={enableStreakShield} onChange={e => setEnableStreakShield(e.target.checked)} style={{ width: 'auto' }}/>
                      Enable Streak Shield (Forgiveness mechanic)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={enablePersonalBest} onChange={e => setEnablePersonalBest(e.target.checked)} style={{ width: 'auto' }}/>
                      Enable Personal Best Tracking
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

                  <div className="input-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <label>Spacebar Visual Hint:</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="spaceMode" 
                          value="jit" 
                          checked={spaceMode === 'jit'} 
                          onChange={(e) => setSpaceMode(e.target.value as 'jit')} 
                          style={{ width: 'auto' }}
                        /> 
                        Just-In-Time
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="spaceMode" 
                          value="always" 
                          checked={spaceMode === 'always'} 
                          onChange={(e) => setSpaceMode(e.target.value as 'always')} 
                          style={{ width: 'auto' }}
                        /> 
                        Always Show
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="spaceMode" 
                          value="hidden" 
                          checked={spaceMode === 'hidden'} 
                          onChange={(e) => setSpaceMode(e.target.value as 'hidden')} 
                          style={{ width: 'auto' }}
                        /> 
                        Hidden
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
