"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AIAssistantInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistantInterface({ isOpen, onClose }: AIAssistantInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recent commands data - exactly as shown in image
  const recentCommands = [
    "How I can get salary",
    "How I can get salary", 
    "How I can get salary",
    "How I can get salary",
    "How I can get salary",
    "How I can get salary"
  ];

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleMicToggle = () => {
    setIsListening(!isListening);
    // Here you would integrate with speech recognition API
    if (!isListening) {
      // Start listening
      console.log("Starting voice recognition...");
    } else {
      // Stop listening
      console.log("Stopping voice recognition...");
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      setIsProcessing(true);
      // Here you would send the message to your AI backend
      console.log("Sending message:", inputText);
      
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        setInputText("");
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRecentCommandClick = (command: string) => {
    setInputText(command);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - invisible, just for closing */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* AI Assistant Dropdown - Positioned under robot icon */}
      <div className="fixed top-20 left-60 z-50 w-[1000px] max-w-[90vw] h-[400px] animate-in slide-in-from-top-4 duration-300">
        <div 
          className="w-full h-full rounded-2xl border border-emerald-400/20 shadow-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 50, 30, 0.2) 30%, rgba(0, 100, 60, 0.1) 70%, rgba(0, 0, 0, 0.4) 100%)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Main Content - Split Layout */}
          <div className="flex h-full">
            {/* Left Side - Robot Avatar and You Said */}
            <div className="w-1/2 p-8 flex flex-col">
              {/* Robot Avatar and Status */}
              <div className="flex items-center gap-4 mb-8">
                {/* Robot Avatar - Exact from image */}
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-400/30 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                </div>
                
                {/* Status Text */}
                <div>
                  <h2 className="text-white font-semibold text-xl mb-1">Listing to Active</h2>
                  <p className="text-emerald-300 text-sm">Click below to Upload</p>
                </div>
              </div>

              {/* You Said Section */}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">You Said</h3>
                <p className="text-emerald-300 text-sm mb-6">Speak Now!</p>
                
                {/* Input area placeholder - matches image layout */}
                <div className="bg-black/20 rounded-lg p-4 border border-emerald-400/20 backdrop-blur-sm">
                  <div className="text-gray-400 text-sm">
                    {isListening ? "Listening..." : "Ready to listen..."}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Recent Commands */}
            <div className="w-1/2 p-8 border-l border-emerald-400/20">
              <h3 className="text-emerald-300 font-semibold text-lg mb-6">Recent Commands</h3>
              
              {/* Commands Grid - 3x2 layout exactly as in image */}
              <div className="grid grid-cols-3 gap-4 h-[280px]">
                {recentCommands.map((command, index) => (
                  <div
                    key={index}
                    onClick={() => handleRecentCommandClick(command)}
                    className="relative group cursor-pointer"
                  >
                    {/* Glass card background */}
                    <div 
                      className="w-full h-full rounded-lg border border-emerald-400/20 p-4 transition-all duration-300 hover:border-emerald-400/40 hover:bg-emerald-500/10"
                      style={{
                        background: "rgba(0, 50, 30, 0.2)",
                        backdropFilter: "blur(15px)",
                        WebkitBackdropFilter: "blur(15px)",
                      }}
                    >
                      {/* Edit icon in top right */}
                      <div className="absolute top-2 right-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Edit className="w-3 h-3 text-emerald-400" />
                      </div>
                      
                      {/* Command text */}
                      <div className="flex flex-col justify-center h-full">
                        <p className="text-white text-sm font-medium leading-relaxed">
                          {command}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 z-10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  );
}