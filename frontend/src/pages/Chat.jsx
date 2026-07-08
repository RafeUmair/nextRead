import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import BookCard from '../components/BookCard'
import { useMyBooks } from '../context/MyBooksContext'
import { useAuth } from '../context/AuthContext'

const SUGGESTED = [
  "I loved Dune, what should I read next?",
  "Recommend me a short thriller I can finish in a weekend",
  "What's a good book for someone who doesn't read much?",
  "I want something like Harry Potter but for adults",
]

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const BookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z"/>
  </svg>
)

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-[--navy] flex items-center justify-center flex-shrink-0 text-white">
        <BookIcon />
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function Message({ msg, onAddToLibrary }) {
  const isUser = msg.role === 'user'
  const { isInMyBooks } = useMyBooks()

  return (
    <div className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[--navy] flex items-center justify-center flex-shrink-0 text-white">
          <BookIcon />
        </div>
      )}
      <div className={`flex flex-col gap-3 ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-[--orange] text-white rounded-tr-sm'
              : 'bg-white text-[--navy] rounded-tl-sm'
          }`}
        >
          {msg.content}
        </div>
        {msg.books && msg.books.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-xs sm:max-w-sm">
            {msg.books.map((book, i) => (
              <BookCard
                key={i}
                book={book}
                showBadge={false}
                onClick={() => {}}
                showAddToLibrary={true}
                isInLibrary={isInMyBooks(book.key)}
                onAddToLibrary={onAddToLibrary}
                showPlaylistBtn={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Chat() {
  const { addBook } = useMyBooks()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('nextreads_chat')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    try { sessionStorage.setItem('nextreads_chat', JSON.stringify(messages)) } catch {}
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleAddToLibrary = (book) => {
    if (!user) { navigate('/login?redirect=/chat'); return }
    addBook(book)
  }

  const send = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg = { role: 'user', content }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content }] }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, books: data.books || [] }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.', books: [] }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const clearChat = () => {
    setMessages([])
    sessionStorage.removeItem('nextreads_chat')
  }

  return (
    <div className="min-h-screen bg-[--cream] flex flex-col">
      <NavBar />

      <main className="flex-1 container-main py-8 flex flex-col max-w-3xl">
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <button onClick={clearChat} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
              Clear chat
            </button>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[--navy] flex items-center justify-center text-white">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[--navy] mb-1">AI Reading Assistant</h1>
              <p style={{ color: 'var(--text-gray)' }}>Ask me anything — I'll help you find your next great read</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTED.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="text-left text-sm px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-orange transition-all text-[--navy]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 pb-4">
            {messages.map((msg, i) => <Message key={i} msg={msg} onAddToLibrary={handleAddToLibrary} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="sticky bottom-0 pt-4">
          <div className="flex gap-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me for a book recommendation..."
              className="flex-1 resize-none px-3 py-2 text-sm outline-none bg-transparent text-[--navy] placeholder-gray-400"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-[--orange] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#d4622a] transition-colors"
            >
              <SendIcon />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2">Powered by Groq · LLaMA 3.1</p>
        </div>
      </main>
    </div>
  )
}

export default Chat
