import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sun, 
  Moon, 
  ZoomIn, 
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  BookOpenCheck,
  Menu,
  Bookmark,
  List,
  X,
  Settings,
  Library,
  Search,
  ArrowLeft
} from 'lucide-react';
import { books } from './data/books.ts';
import type { Book, Bookmark as BookmarkType } from './types.ts';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? JSON.parse(saved) : 18;
  });
  const [currentBook, setCurrentBook] = useState<Book | null>(() => {
    const saved = localStorage.getItem('currentBook');
    if (!saved) return null;
    try {
      const bookId = JSON.parse(saved);
      return books.find(b => b.id === bookId) || null;
    } catch {
      return null;
    }
  });
  const [currentChapter, setCurrentChapter] = useState(() => {
    const saved = localStorage.getItem('currentChapter');
    return saved ? JSON.parse(saved) : 0;
  });
  const [showTOC, setShowTOC] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showBookshelf, setShowBookshelf] = useState(!currentBook);
  const [lineHeight, setLineHeight] = useState(() => {
    const saved = localStorage.getItem('lineHeight');
    return saved ? JSON.parse(saved) : 1.8;
  });
  const [searchQuery, setSearchQuery] = useState('');

  // 保存设置到本地存储
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    localStorage.setItem('fontSize', JSON.stringify(fontSize));
    localStorage.setItem('currentBook', JSON.stringify(currentBook?.id));
    localStorage.setItem('currentChapter', JSON.stringify(currentChapter));
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('lineHeight', JSON.stringify(lineHeight));
  }, [darkMode, fontSize, currentBook, currentChapter, bookmarks, lineHeight]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 14));

  const nextChapter = () => {
    if (currentBook && currentChapter < currentBook.chapters.length - 1) {
      setCurrentChapter(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const previousChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const addBookmark = () => {
    if (!currentBook) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const newBookmark: BookmarkType = {
        bookId: currentBook.id,
        chapterId: currentChapter,
        position: window.scrollY,
        text: selection.toString().slice(0, 100),
        timestamp: Date.now()
      };
      setBookmarks(prev => [...prev, newBookmark]);
    }
  };

  const removeBookmark = (timestamp: number) => {
    setBookmarks(prev => prev.filter(b => b.timestamp !== timestamp));
  };

  const goToBookmark = (bookmark: BookmarkType) => {
    const book = books.find(b => b.id === bookmark.bookId);
    if (book) {
      setCurrentBook(book);
      setCurrentChapter(bookmark.chapterId);
      setShowBookmarks(false);
      setShowBookshelf(false);
      setTimeout(() => {
        window.scrollTo(0, bookmark.position);
      }, 100);
    }
  };

  const openBook = (book: Book) => {
    setCurrentBook(book);
    setCurrentChapter(0);
    setShowBookshelf(false);
    window.scrollTo(0, 0);
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showBookshelf) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <header className={`fixed top-0 w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md z-10`}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Library className="w-6 h-6" />
                我的书架
              </h1>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="搜索书籍或作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 pt-32 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map(book => (
              <div
                key={book.id}
                className={`${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                } rounded-lg shadow-lg overflow-hidden transition-transform duration-200 hover:scale-105 cursor-pointer`}
                onClick={() => openBook(book)}
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">{book.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">作者：{book.author}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {book.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!currentBook) return null;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`fixed top-0 w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md z-10`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBookshelf(true)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="返回书架"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowTOC(true)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="目录"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold">{currentBook.title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBookmarks(true)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="书签"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="设置"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-16">
        <div className={`max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          <h2 className="text-2xl font-bold mb-6">{currentBook.chapters[currentChapter].title}</h2>
          <div
            className="prose dark:prose-invert max-w-none relative"
            style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              letterSpacing: '0.05em'
            }}
          >
            {currentBook.chapters[currentChapter].content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className={`fixed bottom-0 w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button
              onClick={previousChapter}
              disabled={currentChapter === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentChapter === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>上一章</span>
            </button>
            <span className="text-sm">第 {currentChapter + 1} / {currentBook.chapters.length} 章</span>
            <button
              onClick={nextChapter}
              disabled={currentChapter === currentBook.chapters.length - 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentChapter === currentBook.chapters.length - 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>下一章</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>

      {/* 目录侧边栏 */}
      {showTOC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className={`fixed inset-y-0 left-0 w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 shadow-lg transform transition-transform duration-200 ease-in-out`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">目录</h2>
              <button
                onClick={() => setShowTOC(false)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {currentBook.chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    setCurrentChapter(index);
                    setShowTOC(false);
                    window.scrollTo(0, 0);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    currentChapter === index
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {chapter.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">设置</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">字体大小</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={decreaseFontSize}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span>{fontSize}px</span>
                  <button
                    onClick={increaseFontSize}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">行高</label>
                <input
                  type="range"
                  min="1.2"
                  max="2.4"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm">{lineHeight.toFixed(1)}</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">夜间模式</label>
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>{darkMode ? '关闭夜间模式' : '开启夜间模式'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 书签面板 */}
      {showBookmarks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">书签</h2>
              <button
                onClick={() => setShowBookmarks(false)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={addBookmark}
              className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Bookmark className="w-5 h-5" />
              <span>添加书签</span>
            </button>
            <div className="space-y-2">
              {bookmarks.length === 0 ? (
                <p className="text-center text-gray-500">暂无书签</p>
              ) : (
                bookmarks.map((bookmark) => {
                  const book = books.find(b => b.id === bookmark.bookId);
                  if (!book) return null;
                  
                  return (
                    <div
                      key={bookmark.timestamp}
                      className="p-4 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{book.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {book.chapters[bookmark.chapterId].title}
                          </p>
                        </div>
                        <button
                          onClick={() => removeBookmark(bookmark.timestamp)}
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{bookmark.text}...</p>
                      <button
                        onClick={() => goToBookmark(bookmark)}
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        跳转到书签
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;