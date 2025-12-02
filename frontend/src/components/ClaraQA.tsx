import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Send, 
  Loader2,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { askClara, type AIQuestionResponse } from '@/services/claraAiApi';

interface Message {
  id: string;
  type: 'user' | 'clara';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: 'high' | 'medium' | 'low';
    next_steps?: string[];
    related_topics?: string[];
  };
}

interface ClaraQAProps {
  profileId: string;
  context?: Record<string, any>;
  className?: string;
  suggestedQuestions?: string[];
}

export const ClaraQA: React.FC<ClaraQAProps> = ({ 
  profileId, 
  context = {},
  className = '',
  suggestedQuestions = [
    "Should I pay off my credit card or student loan first?",
    "How can I reduce my monthly payments?",
    "What's the difference between snowball and avalanche methods?",
    "How much should I be paying each month?"
  ]
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'clara',
        content: "Hi! I'm Clara, your AI money advisor. Ask me anything about debt management, payoff strategies, or your specific situation. I'm here to help! 😊",
        timestamp: new Date()
      }]);
    }
  }, []);

  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    setError(null);
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: questionText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');

    try {
      setIsLoading(true);

      const response = await askClara({
        profile_id: profileId,
        question: questionText,
        context
      });

      // Add Clara's response
      const claraMessage: Message = {
        id: `clara-${Date.now()}`,
        type: 'clara',
        content: response.response.answer,
        timestamp: new Date(),
        metadata: {
          confidence: response.response.confidence,
          next_steps: response.response.next_steps,
          related_topics: response.response.related_topics
        }
      };
      setMessages(prev => [...prev, claraMessage]);

    } catch (err) {
      console.error('Error asking Clara:', err);
      setError(err instanceof Error ? err.message : 'Failed to get answer');
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'clara',
        content: "I'm having trouble answering that right now. Could you try rephrasing your question or ask something else?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestedQuestion = (suggestedQuestion: string) => {
    handleAskQuestion(suggestedQuestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion(question);
    }
  };

  const getConfidenceBadge = (confidence?: 'high' | 'medium' | 'low') => {
    if (!confidence) return null;

    const config = {
      high: { color: 'bg-green-100 text-green-800', label: 'High Confidence' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Confidence' },
      low: { color: 'bg-orange-100 text-orange-800', label: 'Lower Confidence' }
    };

    const { color, label } = config[confidence];

    return (
      <Badge className={`${color} text-xs`}>
        {label}
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <img
            src="/clara-avatar.png"
            alt="Clara"
            className="w-6 h-6 rounded-full object-cover"
          />
          <CardTitle>Ask Clara</CardTitle>
        </div>
        <p className="text-sm text-[#4F6A7A] mt-1">
          Your AI money advisor is here to answer questions about debt management
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-[#009A8C] text-white'
                    : 'bg-white text-[#002B45] shadow-sm'
                }`}
              >
                {message.type === 'clara' && (
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src="/clara-avatar.png"
                      alt="Clara"
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-[#009A8C]">Clara</span>
                    {message.metadata?.confidence && getConfidenceBadge(message.metadata.confidence)}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Next Steps */}
                {message.metadata?.next_steps && message.metadata.next_steps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-[#009A8C] mb-2">Next Steps:</p>
                    <ul className="space-y-1">
                      {message.metadata.next_steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-[#3A4F61]">
                          <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#009A8C]" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related Topics */}
                {message.metadata?.related_topics && message.metadata.related_topics.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-[#009A8C] mb-2">Related Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.metadata.related_topics.map((topic, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-[#E7F7F4]"
                          onClick={() => handleAskQuestion(`Tell me more about ${topic}`)}
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="/clara-avatar.png"
                    alt="Clara"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-[#009A8C]">Clara</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Suggested Questions */}
        {messages.length === 1 && suggestedQuestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#4F6A7A]">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((suggested, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs border-[#D4DFE4] hover:border-[#009A8C] hover:bg-[#E7F7F4]"
                  onClick={() => handleSuggestedQuestion(suggested)}
                  disabled={isLoading}
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {suggested}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Clara a question..."
            disabled={isLoading}
            className="flex-1 border-[#D4DFE4]"
          />
          <Button
            onClick={() => handleAskQuestion(question)}
            disabled={!question.trim() || isLoading}
            className="bg-[#009A8C] hover:bg-[#007F74]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-[#4F6A7A] text-center">
          Clara provides educational information. For personalized financial advice, consult a professional.
        </p>
      </CardContent>
    </Card>
  );
};