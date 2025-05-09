"use client"

import { ChatInput } from "@/app/components/chat-input/chat-input"
import { Conversation } from "@/app/components/chat/conversation"
import { useUser } from "@/app/providers/user-provider"
import { toast } from "@/components/ui/toast"
import { checkRateLimits, createGuestUser, updateChatModel } from "@/lib/api"
import { useChatHistory } from "@/lib/chat/chat-history-provider"
import {
  MESSAGE_MAX_LENGTH,
  MODEL_DEFAULT,
  MODELS_OPTIONS,
  SYSTEM_PROMPT_DEFAULT,
} from "@/lib/models/config"
import {
  Attachment,
  checkFileUploadLimit,
  processFiles,
} from "@/lib/chat/file-handling"
import { FIFTY_REMAINING_QUERY_ALERT_THRESHOLD, TEN_REMAINING_QUERY_ALERT_THRESHOLD } from "@/lib/config"
import { syncMessages, deleteMessage, updateMessage, ExtendedMessage } from "@/lib/chat/message"
import { API_ROUTE_CHAT } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { Message, useChat } from "@ai-sdk/react"
import { AnimatePresence, motion } from "motion/react"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useMemo, useState } from "react"
import { AudioAttachment } from "@/lib/chat/message"

const FeedbackWidget = dynamic(
  () => import("./feedback-widget").then((mod) => mod.FeedbackWidget),
  { ssr: false }
)

type ChatProps = {
  initialMessages?: Message[]
  chatId?: string
  preferredModel?: string
  systemPrompt?: string
}

export default function Chat({
  initialMessages,
  chatId: propChatId,
  preferredModel,
  systemPrompt: propSystemPrompt,
}: ChatProps) {
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chatId, setChatId] = useState<string | null>(propChatId || null)
  const [files, setFiles] = useState<File[]>([])
  const [selectedModel, setSelectedModel] = useState(
    preferredModel || user?.preferred_model || MODEL_DEFAULT
  )
  const [systemPrompt, setSystemPrompt] = useState(propSystemPrompt)
  const { createNewChat } = useChatHistory()

  const {
    messages,
    input,
    handleSubmit,
    status,
    error,
    reload,
    stop,
    setMessages,
    setInput,
    append,
  } = useChat({
    api: API_ROUTE_CHAT,
    initialMessages,
  })

  const isFirstMessage = useMemo(() => {
    return messages.length === 0
  }, [messages])

  useEffect(() => {
    if (error) {
      let errorMsg = "Something went wrong."
      try {
        const parsed = JSON.parse(error.message)
        errorMsg = parsed.error || errorMsg
      } catch {
        errorMsg = error.message || errorMsg
      }
      toast({
        title: errorMsg,
        status: "error",
      })
    }
  }, [error])

  const getOrCreateGuestUserId = async (): Promise<string | null> => {
    if (user?.id) return user.id

    const stored = localStorage.getItem("guestId")
    if (stored) return stored

    const guestId = crypto.randomUUID()
    localStorage.setItem("guestId", guestId)
    await createGuestUser(guestId)
    return guestId
  }

  const checkLimitsAndNotify = async (uid: string): Promise<boolean> => {
    try {
      const rateData = await checkRateLimits(uid)

      if (rateData.remaining === 0) {
        return false
      }

      if (rateData.remaining === TEN_REMAINING_QUERY_ALERT_THRESHOLD) {
        toast({
          title: `Only ${rateData.remaining} query${rateData.remaining.toString() === "1" ? "" : "ies"} remaining today.`,
          status: "info",
        })
      }

      if (rateData.remaining === FIFTY_REMAINING_QUERY_ALERT_THRESHOLD) {
        toast({
          title: `Only ${rateData.remaining} query${rateData.remaining.toString() === "1" ? "" : "ies"} remaining today.`,
          status: "info",
        })
      }

      return true
    } catch (err) {
      console.error("Rate limit check failed:", err)
      return false
    }
  }

  const ensureChatExists = async (userId: string) => {
    if (isFirstMessage) {
      try {
        const newChat = await createNewChat(
          userId,
          input,
          selectedModel,
          systemPrompt
        )
        if (!newChat) return null
        setChatId(newChat.id)
        return newChat.id
      } catch (err: any) {
        let errorMessage = "Something went wrong."
        try {
          const parsed = JSON.parse(err.message)
          errorMessage = parsed.error || errorMessage
        } catch {
          errorMessage = err.message || errorMessage
        }
        toast({
          title: errorMessage,
          status: "error",
        })
        return null
      }
    }
    return chatId
  }

  const handleModelChange = useCallback(
    async (model: string) => {
      // Update local state immediately for UI responsiveness
      setSelectedModel(model);
      
      // If there's no active chat yet, just update the local state
      if (!chatId) return;
      
      const oldModel = selectedModel;

      try {
        // Update the model in the database
        await updateChatModel(chatId, model);
        
        // If there are messages, we need to notify the user that model changes will apply to new messages
        if (messages.length > 0) {
          toast({
            title: "Model updated for new messages",
            status: "info",
          });
        }
      } catch (err) {
        console.error("Failed to update chat model:", err);
        setSelectedModel(oldModel);
        toast({
          title: "Failed to update chat model",
          status: "error",
        });
      }
    },
    [chatId, selectedModel, messages.length]
  )

  const handleFileUploads = async (
    uid: string,
    chatId: string
  ): Promise<Attachment[] | null> => {
    if (files.length === 0) return []

    try {
      await checkFileUploadLimit(uid)
    } catch (err: any) {
      if (err.code === "DAILY_FILE_LIMIT_REACHED") {
        toast({ title: err.message, status: "error" })
        return null
      }
    }

    try {
      const processed = await processFiles(files, chatId, uid)
      setFiles([])
      return processed
    } catch (err) {
      toast({ title: "Failed to process files", status: "error" })
      return null
    }
  }

  const createOptimisticAttachments = (files: File[]) => {
    return files.map((file) => ({
      name: file.name,
      contentType: file.type,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }))
  }

  const cleanupOptimisticAttachments = (attachments?: any[]) => {
    if (!attachments) return
    attachments.forEach((attachment) => {
      if (attachment.url?.startsWith("blob:")) {
        URL.revokeObjectURL(attachment.url)
      }
    })
  }

  const submit = async () => {
    setIsSubmitting(true)

    const uid = await getOrCreateGuestUserId()
    if (!uid) return

    const optimisticId = `optimistic-${Date.now().toString()}`
    const optimisticAttachments =
      files.length > 0 ? createOptimisticAttachments(files) : []

    const optimisticMessage = {
      id: optimisticId,
      content: input,
      role: "user" as const,
      createdAt: new Date(),
      experimental_attachments:
        optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setInput("")

    const submittedFiles = [...files]
    setFiles([])

    const allowed = await checkLimitsAndNotify(uid)
    if (!allowed) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      setIsSubmitting(false)
      return
    }

    const currentChatId = await ensureChatExists(uid)
    if (!currentChatId) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      setIsSubmitting(false)
      return
    }

    if (input.length > MESSAGE_MAX_LENGTH) {
      toast({
        title: `The message you submitted was too long, please submit something shorter. (Max ${MESSAGE_MAX_LENGTH} characters)`,
        status: "error",
      })
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      setIsSubmitting(false)
      return
    }

    let attachments: Attachment[] | null = []
    if (submittedFiles.length > 0) {
      attachments = await handleFileUploads(uid, currentChatId)
      if (attachments === null) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        setIsSubmitting(false)
        return
      }
    }
    
    // Check if the message is requesting audio generation
    const isAudioRequest = MODELS_OPTIONS.find(m => m.id === selectedModel)?.type === "audio"
      
    if (isAudioRequest) {
      try {
        // Use a simple loading message to show progress
        toast({
          title: "Generating audio...",
          status: "info",
        });
        
        // Instead of duplicating agent logic, use the /api/audio/ endpoint
        const response = await fetch("/api/audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: input,
            userId: uid,
            selectedModel,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate audio");
        }
        
        const data = await response.json();
        
        // Check if the API returned audio data
        if (data.audio && data.audio.success !== false) {
          // Create the response message with audio
          const assistantMessage = {
            id: `audio-${Date.now()}`,
            role: "assistant" as const,
            content: data.response || `I've generated audio from the text.`,
            audio: {
              base64Audio: data.audio.audio,
              model: data.audio.model,
              text: data.audio.text
            },
            modelType: "audio" as const
          };
          
          // Add the message to the chat
          setMessages(prev => [...prev.filter(m => m.id !== optimisticId), assistantMessage as any]);
          
          setIsSubmitting(false);
          return;
        } else if (data.audio && data.audio.success === false) {
          // Handle error from audio generation
          throw new Error(data.audio.error || "Failed to generate audio");
        }
      } catch (error: any) {
        console.error("Error processing audio request:", error);
        toast({
          title: error.message || "Error generating audio",
          status: "error",
        });
        setIsSubmitting(false);
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
        return;
      }
    }
    
    // Regular chat processing
    const options = {
      body: {
        chatId: currentChatId,
        userId: uid,
        model: selectedModel,
        systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
      },
      experimental_attachments: attachments || undefined,
    }

    try {
      // Logging to help debug model selection
      console.log(`Submitting message with model: ${selectedModel}`);
      
      handleSubmit(undefined, options)
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      toast({ title: "Failed to send message", status: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setMessages(messages.filter((message) => message.id !== id))
  }

  const handleEdit = async (id: string, newText: string) => {
    setMessages(
      messages.map((message) =>
        message.id === id ? { ...message, content: newText } : message
      )
    )
  }

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value)
    },
    [setInput]
  )

  const handleFileUpload = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleFileRemove = useCallback((file: File) => {
    setFiles((prev) => prev.filter((f) => f !== file))
  }, [])

  const handleSuggestion = useCallback(
    async (suggestion: string) => {
      setIsSubmitting(true)
      const optimisticId = `optimistic-${Date.now().toString()}`
      const optimisticMessage = {
        id: optimisticId,
        content: suggestion,
        role: "user" as const,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      const uid = await getOrCreateGuestUserId()

      if (!uid) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        setIsSubmitting(false)
        return
      }

      const allowed = await checkLimitsAndNotify(uid)
      if (!allowed) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        setIsSubmitting(false)
        return
      }

      const currentChatId = await ensureChatExists(uid)

      if (!currentChatId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        setIsSubmitting(false)
        return
      }

      const options = {
        body: {
          chatId: currentChatId,
          userId: uid,
          model: selectedModel,
          systemPrompt: SYSTEM_PROMPT_DEFAULT,
        },
      }

      append(
        {
          role: "user",
          content: suggestion,
        },
        options
      )
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      setIsSubmitting(false)
    },
    [ensureChatExists, selectedModel, user?.id, append]
  )

  const handleSelectSystemPrompt = useCallback((newSystemPrompt: string) => {
    setSystemPrompt(newSystemPrompt)
  }, [])

  const handleReload = async () => {
    const uid = await getOrCreateGuestUserId()
    if (!uid) {
      return
    }

    const options = {
      body: {
        chatId,
        userId: uid,
        model: selectedModel,
        systemPrompt: systemPrompt || "You are a helpful assistant.",
      },
    }

    reload(options)
  }

  return (
    <div
      className={cn(
        "@container/main relative flex h-full flex-col items-center justify-end md:justify-center"
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {isFirstMessage ? (
          <motion.div
            key="onboarding"
            className="absolute bottom-[60%] mx-auto max-w-[50rem] md:relative md:bottom-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout="position"
            layoutId="onboarding"
            transition={{
              layout: {
                duration: 0,
              },
            }}
          >
            <h1 className="mb-6 text-3xl font-medium tracking-tight">
              What you want to sell?
            </h1>
          </motion.div>
        ) : (
          <Conversation
            key="conversation"
            messages={messages}
            status={status}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReload={handleReload}
          />
        )}
      </AnimatePresence>
      <motion.div
        className={cn(
          "relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl"
        )}
        layout="position"
        layoutId="chat-input-container"
        transition={{
          layout: {
            duration: messages.length === 1 ? 0.3 : 0,
          },
        }}
      >
        <ChatInput
          value={input}
          onSuggestion={handleSuggestion}
          onValueChange={handleInputChange}
          onSend={submit}
          isSubmitting={isSubmitting}
          files={files}
          onFileUpload={handleFileUpload}
          onFileRemove={handleFileRemove}
          hasSuggestions={isFirstMessage}
          onSelectModel={handleModelChange}
          onSelectSystemPrompt={handleSelectSystemPrompt}
          selectedModel={selectedModel}
          systemPrompt={systemPrompt}
          stop={stop}
          status={status}
        />
      </motion.div>
      <FeedbackWidget />
    </div>
  )
}
