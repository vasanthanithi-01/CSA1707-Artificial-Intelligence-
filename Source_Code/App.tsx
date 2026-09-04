import React, { useState, useEffect } from 'react';
import { THEME_REGISTRY, ChatTheme, ChatLayoutMode } from './types/theme';
import { MENTORS, MentorPersona } from './types/mentor';
import { ChatMessage, FloatingWindowState } from './types/chat';
import { FloatingChatWindow } from './components/FloatingChatWindow';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { sendMentorMessage } from './services/gemini';
import { invoke } from '@tauri-apps/api/core';

export default function App() {
  // Theme & Layout State
  const [currentTheme, setCurrentTheme] = useState<ChatTheme>(THEME_REGISTRY[0]);
  const [layoutMode, setLayoutMode] = useState<ChatLayoutMode>('bubbles');

  // Mentor Persona State
  const [currentMentor, setCurrentMentor] = useState<MentorPersona>(MENTORS[0]);

  // Window Positioning & Resizing State (Centered nicely on load)
  const [windowState, setWindowState] = useState<FloatingWindowState>(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const width = isMobile ? Math.min(window.innerWidth - 24, 400) : 420;
    const height = isMobile ? Math.min(window.innerHeight - 30, 680) : 660;
    const x = isMobile ? 12 : Math.max(20, Math.floor((window.innerWidth - width) / 2));
    const y = isMobile ? 15 : Math.max(20, Math.floor((window.innerHeight - height) / 2));

    return {
      isMinimized: false,
      isMaximized: false,
      x,
      y,
      width,
      height,
      unreadCount: 0,
    };
  });

  // Chat Messages State
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isTyping, setIsTyping] = useState(false);
  

  // Synchronize window size on browser resize
  useEffect(() => {
    const handleResize = () => {
      setWindowState((prev) => {
        const maxX = Math.max(10, window.innerWidth - prev.width - 20);
        const maxY = Math.max(10, window.innerHeight - prev.height - 20);
        return {
          ...prev,
          x: Math.min(prev.x, maxX),
          y: Math.min(prev.y, maxY),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme change
  const handleThemeSelect = (theme: ChatTheme) => {
    setCurrentTheme(theme);
  };

  // Layout mode change
  const handleLayoutModeSelect = (mode: ChatLayoutMode) => {
    setLayoutMode(mode);
  };

  // Switch Mentor Persona
  const handleMentorSelect = (mentor: MentorPersona) => {
  setCurrentMentor(mentor);
};

  // Clear conversation
  const handleClearChat = () => {
  setMessages([]);
};

  // Send User Message
  const handleSendMessage = async (text: string) => {
  if (!text.trim()) return;

  const userMsg: ChatMessage = {
    id: `user_${Date.now()}`,
    sender: 'user',
    text,
    timestamp: Date.now(),
    reactions: [],
    isBookmarked: false,
  };

  setMessages((prev) => [...prev, userMsg]);
  setIsTyping(true);

  if (windowState.isMinimized) {
    setWindowState((prev) => ({
      ...prev,
      unreadCount: prev.unreadCount + 1,
    }));
  }

  try {
    let screenshotBase64: string | undefined;

try {
  screenshotBase64 = await invoke<string>('capture_screen');
} catch (captureError) {
  console.error('Screen capture failed:', captureError);
}



try {
  screenshotBase64 = await invoke<string>('capture_screen');
} catch (captureError) {
  console.error('Screen capture failed:', captureError);
}

const replyText = await sendMentorMessage(
  text,
  screenshotBase64
);

    const mentorMsg: ChatMessage = {
      id: `mentor_${Date.now()}`,
      sender: 'mentor',
      mentorId: currentMentor.id,
      text: replyText,
      timestamp: Date.now(),
      reactions: [],
      isBookmarked: false,
    };

    setMessages((prev) => [...prev, mentorMsg]);
  } catch (error) {
    console.error('Gemini error:', error);

    const errorMsg: ChatMessage = {
      id: `error_${Date.now()}`,
      sender: 'mentor',
      mentorId: currentMentor.id,
      text: 'I couldn’t connect to Gemini. Check your API key and try again.',
      timestamp: Date.now(),
      reactions: [],
      isBookmarked: false,
    };

    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsTyping(false);
  }
};

  // Reactions & Bookmarks
  const handleReactionToggle = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;
        const exists = msg.reactions.includes(emoji);
        return {
          ...msg,
          reactions: exists
            ? msg.reactions.filter((r) => r !== emoji)
            : [...msg.reactions, emoji],
        };
      })
    );
  };

  const handleBookmarkToggle = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, isBookmarked: !msg.isBookmarked } : msg))
    );
  };

  const handleActionItemToggle = (msgId: string, actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId || !msg.actionItems) return msg;
        return {
          ...msg,
          actionItems: msg.actionItems.map((item) =>
            item.id === actionId ? { ...item, isCompleted: !item.isCompleted } : item
          ),
        };
      })
    );
  };
  
  return (
    <div className="relative w-screen h-screen overflow-hidden">
        
     
      {/* Primary Floating Chat Theme Switcher Window */}
      <FloatingChatWindow
        windowState={windowState}
        currentTheme={currentTheme}
        currentMentor={currentMentor}
        layoutMode={layoutMode}
        messages={messages}
        isTyping={isTyping}
                onToggleMinimize={async () => {
  const appWindow = getCurrentWindow();

  if (windowState.isMinimized) {
    await appWindow.setSize(new LogicalSize(420, 660));

    setWindowState((prev) => ({
      ...prev,
      isMinimized: false,
      unreadCount: 0,
    }));
  } else {
    await appWindow.setSize(new LogicalSize(280, 80));

    setWindowState((prev) => ({
      ...prev,
      isMinimized: true,
      unreadCount: 0,
    }));
  }
}}
        
        onToggleMaximize={() =>
          setWindowState((prev) => ({ ...prev, isMaximized: !prev.isMaximized }))
        }
        onThemeSelect={handleThemeSelect}
        onLayoutModeSelect={handleLayoutModeSelect}
        onMentorSelect={handleMentorSelect}
        onClearChat={handleClearChat}
        onSendMessage={handleSendMessage}
        onReactionToggle={handleReactionToggle}
        onBookmarkToggle={handleBookmarkToggle}
        onActionItemToggle={handleActionItemToggle}
        onFollowUpClick={handleSendMessage}
      />
    </div>
  );
}


