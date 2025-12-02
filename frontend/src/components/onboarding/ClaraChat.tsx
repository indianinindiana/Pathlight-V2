import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ClaraMessage {
  id: string;
  type: 'clara' | 'user';
  content: string;
  timestamp: Date;
}

export interface ClaraQuestion {
  id: string;
  question: string;
  type: 'choice' | 'slider' | 'text';
  options?: Array<{
    value: string;
    label: string;
  }>;
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    labels: string[];
    emojis?: string[];
  };
}

interface ClaraChatProps {
  onComplete: (collectedData: Record<string, any>) => void;
  initialData?: Record<string, any>;
}

// ============================================================================
// Component
// ============================================================================

export const ClaraChat: React.FC<ClaraChatProps> = ({ 
  onComplete, 
  initialData = {} 
}) => {
  const [messages, setMessages] = useState<ClaraMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<ClaraQuestion | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, any>>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initialize conversation
  useEffect(() => {
    startConversation();
  }, []);

  const startConversation = () => {
    // Welcome message
    addClaraMessage(
      "Hi! I'm Clara 😊 I'm here to get to know you a bit so I can personalize your Pathlight experience. No pressure — just a few quick questions."
    );

    setTimeout(() => {
      addClaraMessage("So first — what brings you to Pathlight today?");
      setCurrentQuestion({
        id: 'primary_goal',
        question: 'What brings you to Pathlight today?',
        type: 'choice',
        options: [
          { value: 'improve-confidence', label: 'Improve confidence' },
          { value: 'build-habits', label: 'Build habits' },
          { value: 'reduce-overwhelm', label: 'Reduce overwhelm' },
          { value: 'get-organized', label: 'Get organized' }
        ]
      });
    }, 1500);
  };

  const addClaraMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `clara-${Date.now()}`,
        type: 'clara',
        content,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 800);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const handleChoice = (value: string, label: string) => {
    addUserMessage(label);
    
    // Update collected data
    const updatedData = { ...collectedData, [currentQuestion!.id]: value };
    setCollectedData(updatedData);

    // Clara's reaction and next question
    setTimeout(() => {
      const reactions = getReactionForStep(currentStep, value);
      addClaraMessage(reactions.acknowledgment);

      setTimeout(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        if (nextStep < conversationFlow.length) {
          const next = conversationFlow[nextStep];
          addClaraMessage(next.question);
          setCurrentQuestion(next);
        } else {
          // Conversation complete
          addClaraMessage("Thanks! That gives me everything I need. I'm excited to walk alongside you. Ready to get started?");
          setTimeout(() => {
            onComplete(updatedData);
          }, 2000);
        }
      }, 1500);
    }, 500);
  };

  const handleSliderChange = (value: number, label: string) => {
    addUserMessage(label);
    
    const updatedData = { ...collectedData, [currentQuestion!.id]: value };
    setCollectedData(updatedData);

    setTimeout(() => {
      const reactions = getReactionForStep(currentStep, value.toString());
      addClaraMessage(reactions.acknowledgment);

      setTimeout(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        if (nextStep < conversationFlow.length) {
          const next = conversationFlow[nextStep];
          addClaraMessage(next.question);
          setCurrentQuestion(next);
        } else {
          addClaraMessage("Thanks! That gives me everything I need. I'm excited to walk alongside you. Ready to get started?");
          setTimeout(() => {
            onComplete(updatedData);
          }, 2000);
        }
      }, 1500);
    }, 500);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-[#009A8C] text-white'
                  : 'bg-gray-100 text-[#002B45]'
              }`}
            >
              {message.type === 'clara' && (
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="/clara-avatar.png"
                    alt="Clara"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-[#009A8C]">Clara</span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <img
                  src="/clara-avatar.png"
                  alt="Clara"
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-[#009A8C]">Clara</span>
              </div>
              <div className="flex gap-1 mt-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Answer Options */}
      {currentQuestion && !isTyping && (
        <Card className="border-t-2 border-[#D4DFE4] rounded-t-none">
          <CardContent className="p-4">
            {currentQuestion.type === 'choice' && (
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options?.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    className="border-[#D4DFE4] hover:border-[#009A8C] hover:bg-[#E7F7F4]"
                    onClick={() => handleChoice(option.value, option.label)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'slider' && currentQuestion.sliderConfig && (
              <div className="space-y-4">
                {currentQuestion.sliderConfig.emojis && (
                  <div className="flex justify-center">
                    <div className="text-6xl">
                      {currentQuestion.sliderConfig.emojis[
                        (collectedData[currentQuestion.id] || currentQuestion.sliderConfig.min) - 1
                      ]}
                    </div>
                  </div>
                )}
                <Slider
                  value={[collectedData[currentQuestion.id] || currentQuestion.sliderConfig.min]}
                  onValueChange={(value) => {
                    setCollectedData({ ...collectedData, [currentQuestion.id]: value[0] });
                  }}
                  min={currentQuestion.sliderConfig.min}
                  max={currentQuestion.sliderConfig.max}
                  step={currentQuestion.sliderConfig.step}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[#4F6A7A]">
                  {Array.from(
                    { length: currentQuestion.sliderConfig.max - currentQuestion.sliderConfig.min + 1 },
                    (_, i) => i + currentQuestion.sliderConfig.min
                  ).map((num) => (
                    <span key={num}>{num}</span>
                  ))}
                </div>
                <Button
                  className="w-full bg-[#009A8C] hover:bg-[#007F74]"
                  onClick={() => {
                    const value = collectedData[currentQuestion.id] || currentQuestion.sliderConfig!.min;
                    const label = currentQuestion.sliderConfig!.labels[value - 1];
                    handleSliderChange(value, label);
                  }}
                >
                  Continue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ============================================================================
// Conversation Flow
// ============================================================================

const conversationFlow: ClaraQuestion[] = [
  {
    id: 'primary_reason',
    question: 'What brings you to Pathlight today?',
    type: 'choice',
    options: [
      { value: 'improve-confidence', label: 'Improve confidence' },
      { value: 'build-habits', label: 'Build habits' },
      { value: 'reduce-overwhelm', label: 'Reduce overwhelm' },
      { value: 'get-organized', label: 'Get organized' }
    ]
  },
  {
    id: 'short_term_goal',
    question: 'And what are you hoping Pathlight helps you achieve over the next few weeks?',
    type: 'choice',
    options: [
      { value: 'stay-consistent', label: 'Stay consistent' },
      { value: 'feel-less-stressed', label: 'Feel less stressed' },
      { value: 'get-organized', label: 'Get organized' },
      { value: 'build-momentum', label: 'Build momentum' }
    ]
  },
  {
    id: 'current_feeling',
    question: 'How are you feeling about things right now?',
    type: 'choice',
    options: [
      { value: 'overwhelmed', label: 'Overwhelmed' },
      { value: 'motivated', label: 'Motivated' },
      { value: 'curious', label: 'Curious' },
      { value: 'anxious', label: 'Anxious' }
    ]
  },
  {
    id: 'support_style',
    question: 'Everyone likes support a little differently — which style feels right for you?',
    type: 'choice',
    options: [
      { value: 'gentle-nudges', label: 'Gentle nudges' },
      { value: 'more-structure', label: 'More structure' },
      { value: 'motivational', label: 'Motivational' },
      { value: 'data-driven', label: 'Data-driven' }
    ]
  },
  {
    id: 'time_commitment',
    question: 'And how much time would you like to invest each week?',
    type: 'slider',
    sliderConfig: {
      min: 1,
      max: 10,
      step: 1,
      labels: Array.from({length: 10}, (_, i) => `${i + 1} hour${i > 0 ? 's' : ''}`),
      emojis: undefined
    }
  }
];

// ============================================================================
// Reaction Logic
// ============================================================================

function getReactionForStep(step: number, value: string): { acknowledgment: string } {
  const reactions: Record<number, Record<string, string>> = {
    0: {
      'improve-confidence': "That makes total sense — thanks for sharing.",
      'build-habits': "Love that. You're in the right place.",
      'reduce-overwhelm': "Got it! Let's shape Pathlight to support you there.",
      'get-organized': "Perfect. Organization is the first step to clarity."
    },
    1: {
      'stay-consistent': "Perfect. I'll keep that in mind as we set things up.",
      'feel-less-stressed': "Great — we can definitely support that.",
      'get-organized': "Nice. Let's build that foundation together.",
      'build-momentum': "Excellent. Momentum is everything."
    },
    2: {
      'overwhelmed': "Thanks for being honest — that really helps.",
      'motivated': "Love that energy! Let's channel it.",
      'curious': "Appreciate you sharing that. Let's build from here.",
      'anxious': "I hear you. We'll take this one step at a time."
    },
    3: {
      'gentle-nudges': "Perfect — I'll match that vibe.",
      'more-structure': "Got it. I'll keep my tone and pace aligned with that.",
      'motivational': "Love it. Let's keep the energy positive.",
      'data-driven': "Understood. I'll focus on the numbers and insights."
    },
    4: {
      // For slider values 1-10 hours
      '1': "Totally doable. We'll work with your rhythm.",
      '2': "Nice — quality over quantity, always.",
      '3': "Great. That gives us good time to make progress.",
      '4': "Perfect. We'll make the most of that time.",
      '5': "Excellent. That's a solid commitment.",
      '6': "Wonderful. We can accomplish a lot together.",
      '7': "That's fantastic. You're really investing in yourself.",
      '8': "Amazing commitment. Let's make it count.",
      '9': "Wow, that's dedication. We'll use it wisely.",
      '10': "Incredible. With that time, we'll see real progress."
    }
  };

  return {
    acknowledgment: reactions[step]?.[value] || "Thanks for sharing that."
  };
}