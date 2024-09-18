import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Button, Typography, ThemeProvider, createTheme, CircularProgress, Paper } from '@mui/material';
import { VolumeUp as VolumeUpIcon, VolumeOff as VolumeOffIcon } from '@mui/icons-material';
import './App.css';

// Import audio files
import audio1 from './assets/audio/question_1.wav';
import audio2 from './assets/audio/question_2.wav';
import audio3 from './assets/audio/question_3.wav';
import audio4 from './assets/audio/question_4.wav';
import audio5 from './assets/audio/question_5.wav';
import audio6 from './assets/audio/question_6.wav';
import audio7 from './assets/audio/question_7.wav';
import audio8 from './assets/audio/question_8.wav';
import audio9 from './assets/audio/question_9.wav';
import audio10 from './assets/audio/question_10.wav';
import audio11 from './assets/audio/question_11.wav';
import audio12 from './assets/audio/question_12.wav';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF9800',
    },
    secondary: {
      main: '#4CAF50',
    },
    background: {
      default: '#FFF9C4',
    },
  },
  typography: {
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
  },
});

interface FlashCard {
  id: number;
  audioPath: string;
  answer: string;
  weight: number;
  reactionTimes: number[];
}

const initialFlashcardData: FlashCard[] = [
  {
    id: 1,
    audioPath: audio1,
    answer: "3",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 2,
    audioPath: audio2,
    answer: "4",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 3,
    audioPath: audio3,
    answer: "5",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 4,
    audioPath: audio4,
    answer: "6",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 5,
    audioPath: audio5,
    answer: "7",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 6,
    audioPath: audio6,
    answer: "8",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 7,
    audioPath: audio7,
    answer: "9",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 8,
    audioPath: audio8,
    answer: "10",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 9,
    audioPath: audio9,
    answer: "11",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 10,
    audioPath: audio10,
    answer: "12",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 11,
    audioPath: audio11,
    answer: "13",
    weight: 5,
    reactionTimes: []
  },
  {
    id: 12,
    audioPath: audio12,
    answer: "14",
    weight: 5,
    reactionTimes: []
  }
];

const App: React.FC = () => {
  const [flashcardData, setFlashcardData] = useState<FlashCard[]>(initialFlashcardData);
  const [currentCard, setCurrentCard] = useState<FlashCard | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [recentCards, setRecentCards] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [audioEndTime, setAudioEndTime] = useState<number | null>(null);
  const [totalReactionTimes, setTotalReactionTimes] = useState<number>(0);
  const [overallMeanReactionTime, setOverallMeanReactionTime] = useState<number | null>(null);

  useEffect(() => {
    console.log('Current flashcard data:');
    flashcardData.forEach(card => {
      const meanReactionTime = card.reactionTimes.length > 0
        ? card.reactionTimes.reduce((sum, time) => sum + time, 0) / card.reactionTimes.length
        : 0;
      console.log(`Card ${card.id}:`);
      console.log(`  Answer: ${card.answer}`);
      console.log(`  Weight: ${card.weight}`);
      console.log(`  Reaction time history: [${card.reactionTimes.join(', ')}]`);
      console.log(`  Mean reaction time: ${meanReactionTime.toFixed(2)} seconds`);
    });
  }, [flashcardData]);

  const selectNextCard = useCallback(() => {
    const availableCards = flashcardData.filter((card) => !recentCards.includes(card.id));

    if (availableCards.length === 0) {
      // Reset recent cards if all cards have been shown
      setRecentCards([]);
      return;
    }

    const totalWeight = availableCards.reduce((sum, card) => sum + card.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (let card of availableCards) {
      randomWeight -= card.weight;
      if (randomWeight <= 0) {
        setCurrentCard(card);
        setRecentCards(prev => {
          const newRecent = [...prev, card.id];
          return newRecent.slice(-2);  // Keep only the last 2 cards
        });
        break;
      }
    }
  }, [recentCards, flashcardData]);

  useEffect(() => {
    if (!currentCard) {
      selectNextCard();
    }
  }, [currentCard, selectNextCard]);

  // Play audio when component mounts or when currentCard changes
  useEffect(() => {
    if (currentCard) {
      handlePlayAudio();
      setAudioPlayed(false);
      setAudioEndTime(null);
      calculateOverallMeanReactionTime();
    }
  }, [currentCard]);

  useEffect(() => {
    if (currentCard) {
      setIsAudioLoading(true);
      setAudioError(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(currentCard.audioPath);
      audioRef.current.addEventListener('canplaythrough', () => setIsAudioLoading(false));
      audioRef.current.addEventListener('error', () => {
        setIsAudioLoading(false);
        setAudioError('Failed to load audio');
      });
      audioRef.current.addEventListener('ended', () => {
        setIsAudioPlaying(false);
        setAudioEndTime(Date.now());
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('canplaythrough', () => setIsAudioLoading(false));
        audioRef.current.removeEventListener('error', () => {
          setIsAudioLoading(false);
          setAudioError('Failed to load audio');
        });
        audioRef.current.removeEventListener('ended', () => {
          setIsAudioPlaying(false);
          setAudioEndTime(Date.now());
        });
        audioRef.current = null;
      }
    };
  }, [currentCard]);

  const handlePlayAudio = () => {
    if (audioRef.current && !isAudioLoading) {
      audioRef.current.play()
        .then(() => setIsAudioPlaying(true))
        .catch(error => {
          console.error('Error playing audio:', error);
          setIsAudioPlaying(false);
          setAudioError('Failed to play audio');
        });
    }
    setAudioPlayed(true);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    if (audioEndTime !== null && currentCard) {
      const responseTime = (Date.now() - audioEndTime) / 1000; // Convert to seconds
      updateCardWeight(currentCard.id, responseTime);
    }
  };

  const updateCardWeight = useCallback((cardId: number, responseTime: number) => {
    setFlashcardData((prevData) =>
      prevData.map((card) => {
        if (card.id === cardId) {
          const newReactionTimes = [...card.reactionTimes, responseTime].slice(-3);
          const newWeight = newReactionTimes.reduce((sum, time) => sum + time, 0) / newReactionTimes.length;
          return {
            ...card,
            weight: newWeight,
            reactionTimes: newReactionTimes
          };
        } else {
          return card;
        }
      })
    );
    setTotalReactionTimes(prev => prev + 1);
    calculateOverallMeanReactionTime();
  }, []);

  const calculateOverallMeanReactionTime = useCallback(() => {
    const allReactionTimes = flashcardData.flatMap(card => card.reactionTimes);
    if (allReactionTimes.length > 0) {
      const mean = allReactionTimes.reduce((sum, time) => sum + time, 0) / allReactionTimes.length;
      setOverallMeanReactionTime(parseFloat(mean.toFixed(2)));
    } else {
      setOverallMeanReactionTime(null);
    }
  }, [flashcardData]);

  useEffect(() => {
    calculateOverallMeanReactionTime();
  }, []);

  const handleNextCard = () => {
    setShowAnswer(false);
    setAudioPlayed(false);
    if (currentCard) {
      const updatedCard = flashcardData.find(card => card.id === currentCard.id);
      if (updatedCard) calculateOverallMeanReactionTime();
    }
    setAudioEndTime(null);
    selectNextCard();
  };

  const handlePlayOrShowAnswer = () => {
    if (!audioPlayed) {
      handlePlayAudio();
    } else {
      handleShowAnswer();
    }
  };

  const handleAudioPlayback = () => {
    handlePlayAudio();
    setAudioPlayed(true);
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (!audioPlayed) {
          handlePlayAudio();
          setAudioPlayed(true);
        } else {
          if (!showAnswer) {
            handleShowAnswer();
          } else {
            handleNextCard();
          }
        }
      }
    },
    [audioPlayed, showAnswer, handlePlayAudio, handleShowAnswer, handleNextCard]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  if (!currentCard) return null;

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
          padding: 2,
        }}
      >
        <Box 
          sx={{
            width: '100%',
            maxWidth: 350,
            height: 200,
            backgroundColor: 'primary.main',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 2,
            boxShadow: 3,
          }}
        >
          <Button
            onClick={handlePlayAudio}
            disabled={isAudioLoading || !!audioError}
            sx={{ color: 'white', fontSize: '2rem' }}
          >
            {isAudioLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isAudioPlaying ? (
              <VolumeUpIcon sx={{ fontSize: '3rem' }} />
            ) : (
              <VolumeOffIcon sx={{ fontSize: '3rem' }} />
            )}
          </Button>
          {audioError && (
            <Typography color="error" variant="caption">
              {audioError}
            </Typography>
          )}
          {showAnswer && (
            <Typography variant="h4" sx={{ color: 'white', marginTop: 2 }}>
              {currentCard.answer}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={showAnswer ? handleNextCard : handlePlayOrShowAnswer}
          sx={{
            fontSize: '1.5rem', 
            borderRadius: 8,
            padding: '10px 20px',
          }}
        >
          {showAnswer ? 'Carte Suivante' : (audioPlayed ? 'Montrer la Réponse' : 'Jouer l\'Audio')}
        </Button>
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            padding: '4px 8px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }}
          >
            {totalReactionTimes >= 5 && overallMeanReactionTime !== null
              ? (overallMeanReactionTime !== null
                  ? `Temps de réaction moyen : ${overallMeanReactionTime}s`
                  : 'Calcul en cours...')
              : `${Math.max(5 - totalReactionTimes, 0)} réponses de plus pour voir la moyenne`}
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default App;