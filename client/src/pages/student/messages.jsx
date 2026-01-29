import Layout from "@/components/layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Search, Loader2, MessageSquare, User, Paperclip, Smile, X, File, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useConnections, useMessages, useSendMessage, useAlumniNetwork, useSearchAlumni } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const [location] = useLocation();
  const role = location.split("/")[1];
  const isAlumniRole = role === "alumni";
  const currentUserId = sessionStorage.getItem("userId");
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [recentContacts, setRecentContacts] = useState(() => {
    try {
      const saved = sessionStorage.getItem("messages:recentContacts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [hasManualSelection, setHasManualSelection] = useState(false);
  const LAST_PEER_KEY = "messages:lastPeerId";
  const { data: connections = [], isLoading: connectionsLoading } = useConnections(role);
  const { data: alumniNetwork = [] } = useAlumniNetwork({ enabled: isAlumniRole });
  const { data: searchedAlumni = [] } = useSearchAlumni(searchQuery);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const peerId = selectedContact ? (selectedContact.user_id || selectedContact.id) : null;
  
  const { data: messages = [], isLoading: messagesLoading } = useMessages(peerId, {
    enabled: !!peerId,
    role,
  });
  
  const sendMessage = useSendMessage(role);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Persist recent contacts to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem("messages:recentContacts", JSON.stringify(recentContacts));
  }, [recentContacts]);

  // Preselect contact when arriving with ?peer=<id> or last saved peer
  useEffect(() => {
    const queryString = typeof window !== "undefined" ? window.location.search : "";
    if (hasManualSelection) return;

    let peerId = null;
    if (queryString) {
      const params = new URLSearchParams(queryString);
      peerId = params.get("peer");
    }

    if (!peerId) {
      peerId = sessionStorage.getItem(LAST_PEER_KEY);
    }

    if (!peerId) return;

    let target = connections.find(
      (contact) => String(contact.user_id || contact.id) === peerId
    );

    if (!target && isAlumniRole) {
      target = alumniNetwork.find((contact) => String(contact.id || contact.user_id) === peerId);
    }

    if (!target && searchedAlumni?.length) {
      target = searchedAlumni.find((contact) => String(contact.id || contact.user_id) === peerId);
    }

    if (!target) {
      target = { id: peerId, user_id: peerId, name: "Contact" };
    }

    const normalizedTarget = target
      ? {
          ...target,
          user_id: target.user_id || target.id,
          id: target.id || target.user_id,
        }
      : null;

    if (normalizedTarget && String(normalizedTarget.user_id) !== String(selectedContact?.user_id)) {
      setSelectedContact(normalizedTarget);
      setRecentContacts((prev) => {
        const exists = prev.some((c) => String(c.user_id || c.id) === String(normalizedTarget.user_id));
        return exists ? prev : [...prev, normalizedTarget];
      });
      sessionStorage.setItem(LAST_PEER_KEY, String(normalizedTarget.user_id));
    }
  }, [location, connections, alumniNetwork, searchedAlumni, isAlumniRole, hasManualSelection, selectedContact]);

  // Common emojis
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '👍', '👎', '👏', '🙌', '👌', '✌️', '🤞', '🤝', '🙏', '💪',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '🗨️', '🗯️',
    '💭', '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👋', '🤙', '💅'
  ];

  const dedupeById = (list) => {
    const seen = new Set();
    return list.filter((item) => {
      const id = String(item.user_id || item.id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  const baseContacts = dedupeById([...connections, ...recentContacts]);

  const filteredConnections = baseContacts.filter(conn =>
    conn.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchMatches = (() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    if (isAlumniRole) {
      return alumniNetwork.filter((alum) => {
        const haystack = `${alum.name || ""} ${alum.email || ""} ${alum.company || ""}`.toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
      });
    }
    return searchedAlumni || [];
  })();

  const displayedContacts = searchQuery && searchQuery.length >= 2
    ? dedupeById([...searchMatches, ...baseContacts]).filter((contact) => {
        const haystack = `${contact.name || ""} ${contact.email || ""} ${contact.info || ""}`.toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
      })
    : filteredConnections;

  const handleEmojiSelect = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setAttachedFile(file);
      toast({
        title: "File attached",
        description: file.name,
      });
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = () => {
    if ((!messageText.trim() && !attachedFile) || !selectedContact) return;

    let finalContent = messageText.trim();
    
    // If file is attached, add file info to message
    if (attachedFile) {
      finalContent = finalContent 
        ? `${finalContent} [File: ${attachedFile.name}]`
        : `[File: ${attachedFile.name}]`;
    }

    sendMessage.mutate(
      {
        receiver_id: peerId,
        content: finalContent,
      },
      {
        onSuccess: () => {
          setMessageText("");
          handleRemoveFile();
          // Ensure the contact appears in the sidebar even if not an existing connection
          setRecentContacts((prev) => {
            const exists = prev.some((c) => String(c.user_id || c.id) === String(peerId)) ||
              connections.some((c) => String(c.user_id || c.id) === String(peerId));
            return exists ? prev : [...prev, selectedContact];
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to send message",
            variant: "destructive",
          });
        },
      }
    );
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (connectionsLoading) {
    return (
      <Layout role={role}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role={role}>
      <Card className="h-[calc(100vh-80px)] -m-6 shadow-xl border-0 overflow-hidden rounded-none">
        <div className="h-full flex overflow-hidden">
            
          {/* Left Sidebar: Contacts */}
          <div className="w-80 border-r flex flex-col bg-white">
            <div className="p-4 border-b bg-white/80 backdrop-blur-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                    className="pl-9 bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-[#800000]/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {displayedContacts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-[#800000]" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">No connections found</p>
                  <p className="text-xs text-gray-400 mt-1">Connect with people to start messaging</p>
                </div>
              ) : (
                <div className="py-2">
                  {displayedContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => {
                        const normalized = {
                          ...contact,
                          user_id: contact.user_id || contact.id,
                          id: contact.id || contact.user_id,
                        };
                        setHasManualSelection(true);
                        setSelectedContact(normalized);
                        sessionStorage.setItem(LAST_PEER_KEY, String(normalized.user_id));
                        setRecentContacts((prev) => {
                          const exists = prev.some((c) => String(c.user_id || c.id) === String(normalized.user_id));
                          return exists ? prev : [...prev, normalized];
                        });
                      }}
                      className={cn(
                        "mx-2 mb-1 p-3 rounded-xl flex gap-3 cursor-pointer transition-all duration-200",
                        String(selectedContact?.user_id || selectedContact?.id) === String(contact.user_id || contact.id)
                            ? "bg-[#800000] shadow-lg scale-[1.02]"
                          : "hover:bg-white hover:shadow-md"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow">
                          <AvatarFallback className={cn(
                            "font-semibold text-sm",
                            String(selectedContact?.user_id || selectedContact?.id) === String(contact.user_id || contact.id)
                                ? "bg-white text-[#800000]"
                                : "bg-[#800000] text-white"
                          )}>
                            {contact.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline">
                          <h4 className={cn(
                            "text-sm font-semibold truncate",
                            String(selectedContact?.user_id || selectedContact?.id) === String(contact.user_id || contact.id) ? "text-white" : "text-gray-900"
                          )}>
                            {contact.name || "User"}
                          </h4>
                        </div>
                        <p className={cn(
                          "text-xs truncate mt-0.5",
                          String(selectedContact?.user_id || selectedContact?.id) === String(contact.user_id || contact.id) ? "text-white/90" : "text-gray-500"
                        )}>
                          {contact.info || contact.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Area: Chat Window */}
          {!selectedContact ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-[#800000] rounded-full blur-2xl opacity-10"></div>
                  <div className="relative bg-[#800000] rounded-full p-6">
                    <MessageSquare className="h-16 w-16 text-white" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-[#800000] mb-2">
                  Select a connection to start chatting
                </p>
                <p className="text-sm text-gray-500">Your conversations will appear here</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-white">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3 bg-white">
                <div className="relative">
                  <Avatar className="h-11 w-11 ring-2 ring-[#800000]/20 shadow">
                    <AvatarFallback className="bg-[#800000] text-white font-semibold">
                      {selectedContact.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedContact.name || "User"}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-normal bg-green-100 text-green-700 hover:bg-green-100">
                      Active
                    </Badge>
                    <span className="text-xs text-gray-500">{selectedContact.info || selectedContact.role}</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 bg-gray-50 overflow-y-auto" ref={scrollRef}>
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#800000] mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-10 w-10 text-[#800000]" />
                      </div>
                      <p className="font-medium text-gray-700">No messages yet</p>
                      <p className="text-xs text-gray-400 mt-1">Send a message to start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((message, index) => {
                      const isOwn = currentUserId
                        ? String(message.sender_id) === String(currentUserId)
                        : message.sender_id !== selectedContact?.user_id;
                      const showTime = index === 0 || 
                        new Date(messages[index - 1].created_at).getTime() < new Date(message.created_at).getTime() - 60000;

                      return (
                        <div key={message.id}>
                          {showTime && (
                            <div className="text-center mb-4">
                              <span className="text-xs font-medium text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                          )}
                          <div className={cn("flex gap-3 items-end", isOwn ? "justify-end" : "justify-start")}>
                            {!isOwn && (
                              <Avatar className="h-8 w-8 ring-2 ring-white shadow">
                                <AvatarFallback className="bg-[#800000] text-white text-xs font-semibold">
                                  {selectedContact.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                "rounded-2xl p-3.5 max-w-[70%] shadow-lg transition-all hover:scale-[1.02]",
                                isOwn
                                  ? "bg-[#800000] text-white rounded-br-md"
                                  : "bg-white border border-gray-100 text-gray-800 rounded-bl-md"
                              )}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-white">
                {/* File Preview */}
                {attachedFile && (
                  <div className="mb-3 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      {attachedFile.type.startsWith('image/') ? (
                        <Image className="h-5 w-5 text-blue-500" />
                      ) : (
                        <File className="h-5 w-5 text-gray-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{attachedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(attachedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                  {/* File Attachment Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full hover:bg-gray-100 shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sendMessage.isPending}
                  >
                    <Paperclip className="h-5 w-5 text-gray-600" />
                  </Button>

                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type your message..."
                      className="pr-10 bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-[#800000]/20 rounded-full py-5"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sendMessage.isPending}
                    />
                    
                    {/* Emoji Picker */}
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100"
                          disabled={sendMessage.isPending}
                        >
                          <Smile className="h-4 w-4 text-gray-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-2" align="end">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-700 px-2">Pick an emoji</h4>
                          <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
                            {commonEmojis.map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => handleEmojiSelect(emoji)}
                                className="p-2 hover:bg-gray-100 rounded text-xl transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button
                    size="icon"
                    className="h-10 w-10 bg-[#800000] hover:bg-[#600000] shadow-lg rounded-full shrink-0 transition-all hover:scale-105"
                    onClick={handleSendMessage}
                    disabled={(!messageText.trim() && !attachedFile) || sendMessage.isPending}
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
}
