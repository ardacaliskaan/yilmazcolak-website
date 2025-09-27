//======================================================================
// 1. UltraProfessionalEditor.js - Tam Tamamlanmış WordPress Benzeri Editör
//======================================================================

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline,
  Strikethrough,
  Code,
  Link2,
  List, 
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Video,
  Table,
  Minus,
  Type,
  Palette,
  Undo,
  Redo,
  Eye,
  Code2,
  Maximize,
  Minimize,
  X,
  Plus,
  ChevronDown
} from 'lucide-react';

// Font options
const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'system-ui, sans-serif', label: 'System UI' }
];

const FONT_SIZES = [
  { value: '12px', label: '12px' },
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '28px', label: '28px' },
  { value: '32px', label: '32px' },
  { value: '36px', label: '36px' },
  { value: '48px', label: '48px' }
];

const HEADING_LEVELS = [
  { value: 'div', label: 'Normal Metin', tag: 'DIV' },
  { value: 'h1', label: 'Başlık 1', tag: 'H1' },
  { value: 'h2', label: 'Başlık 2', tag: 'H2' },
  { value: 'h3', label: 'Başlık 3', tag: 'H3' },
  { value: 'h4', label: 'Başlık 4', tag: 'H4' },
  { value: 'h5', label: 'Başlık 5', tag: 'H5' },
  { value: 'h6', label: 'Başlık 6', tag: 'H6' }
];

const TEXT_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#FF6B6B', '#FFA500', '#FFD93D', '#6BCF7F', '#4ECDC4',
  '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

const UltraProfessionalEditor = ({ 
  content = '', 
  onChange, 
  onImageInsert,
  placeholder = 'İçeriğinizi buraya yazın...',
  className = ''
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [currentFormat, setCurrentFormat] = useState({
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    textColor: '#000000',
    heading: 'div'
  });

  const editorRef = useRef(null);
  const sourceRef = useRef(null);
  const colorPaletteRef = useRef(null);

  // Content change handler
  const handleContentChange = useCallback((e) => {
    const newContent = e.target.innerHTML;
    setEditorContent(newContent);
    
    // Debounced onChange
    if (onChange) {
      clearTimeout(window.editorChangeTimeout);
      window.editorChangeTimeout = setTimeout(() => {
        onChange(newContent);
      }, 300);
    }
  }, [onChange]);

  // Execute formatting commands
  const execCommand = useCallback((command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
    }
  }, []);

  // Insert custom content
  const insertContent = useCallback((content) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const div = document.createElement('div');
        div.innerHTML = content;
        
        const fragment = document.createDocumentFragment();
        while (div.firstChild) {
          fragment.appendChild(div.firstChild);
        }
        
        range.deleteContents();
        range.insertNode(fragment);
        range.collapse(false);
        
        handleContentChange({ target: editorRef.current });
      }
    }
  }, [handleContentChange]);

  // Insert image
  const handleImageInsert = useCallback((imageUrl, altText = '') => {
    const imgHtml = `
      <figure class="my-6 text-center">
        <img src="${imageUrl}" alt="${altText}" class="max-w-full h-auto rounded-lg shadow-md mx-auto" />
        ${altText ? `<figcaption class="text-sm text-gray-600 mt-2">${altText}</figcaption>` : ''}
      </figure>
    `;
    insertContent(imgHtml);
  }, [insertContent]);

  // Insert table
  const insertTable = useCallback(() => {
    const tableHtml = `
      <table class="w-full border-collapse border border-gray-300 my-6">
        <thead>
          <tr class="bg-gray-50">
            <th class="border border-gray-300 px-4 py-2 text-left">Başlık 1</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Başlık 2</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Başlık 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 px-4 py-2">Hücre 1</td>
            <td class="border border-gray-300 px-4 py-2">Hücre 2</td>
            <td class="border border-gray-300 px-4 py-2">Hücre 3</td>
          </tr>
          <tr>
            <td class="border border-gray-300 px-4 py-2">Hücre 4</td>
            <td class="border border-gray-300 px-4 py-2">Hücre 5</td>
            <td class="border border-gray-300 px-4 py-2">Hücre 6</td>
          </tr>
        </tbody>
      </table>
    `;
    insertContent(tableHtml);
  }, [insertContent]);

  // Insert blockquote
  const insertBlockquote = useCallback(() => {
    const quote = prompt('Alıntı metnini girin:');
    if (quote) {
      const blockquoteHtml = `
        <blockquote class="border-l-4 border-blue-500 bg-blue-50 py-4 px-6 my-6 italic text-gray-700">
          "${quote}"
        </blockquote>
      `;
      insertContent(blockquoteHtml);
    }
  }, [insertContent]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Toggle source code
  const toggleSourceCode = useCallback(() => {
    if (showSourceCode) {
      if (sourceRef.current) {
        setEditorContent(sourceRef.current.value);
        if (onChange) onChange(sourceRef.current.value);
      }
    }
    setShowSourceCode(prev => !prev);
  }, [showSourceCode, onChange]);

  // Handle color selection
  const handleColorSelect = useCallback((color) => {
    setCurrentFormat(prev => ({ ...prev, textColor: color }));
    execCommand('foreColor', color);
    setShowColorPalette(false);
    editorRef.current?.focus();
  }, [execCommand]);

  // Update content from props
  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content);
    }
  }, [content, editorContent]);

  // Close color palette on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPaletteRef.current && !colorPaletteRef.current.contains(event.target)) {
        setShowColorPalette(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC key handler for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const editorClasses = `
    ${isFullscreen ? 'fixed inset-0 z-50 bg-white flex flex-col' : 'border border-gray-300 rounded-lg bg-white flex flex-col'}
    ${className}
  `;

  const contentAreaClasses = `
    min-h-[500px] p-6 bg-white border-0 outline-none resize-none flex-1
    prose prose-lg max-w-none
    prose-headings:text-gray-900 prose-headings:font-bold
    prose-p:text-gray-800 prose-p:leading-relaxed
    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
    prose-strong:text-gray-900 prose-strong:font-semibold
    prose-ul:text-gray-800 prose-ol:text-gray-800
    prose-li:text-gray-800 prose-li:my-1
    prose-blockquote:text-gray-700 prose-blockquote:border-l-blue-500
    prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4
    prose-blockquote:rounded-r-lg prose-blockquote:my-4
    prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded
    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
    [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mb-4 [&>h1]:mt-6
    [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mb-3 [&>h2]:mt-5
    [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mb-3 [&>h3]:mt-4
    [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:text-gray-900 [&>h4]:mb-2 [&>h4]:mt-3
    [&>h5]:text-base [&>h5]:font-semibold [&>h5]:text-gray-900 [&>h5]:mb-2 [&>h5]:mt-3
    [&>h6]:text-sm [&>h6]:font-semibold [&>h6]:text-gray-900 [&>h6]:mb-2 [&>h6]:mt-3
    ${showSourceCode ? 'hidden' : ''}
  `;

  // Word and character count
  const plainText = editorContent.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = plainText.length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={editorClasses}>
      {/* Enhanced Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 sticky top-0 z-10">
        {/* First Row - Text Formatting */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {/* Heading Level */}
          <select
            value={currentFormat.heading}
            onChange={(e) => {
              setCurrentFormat(prev => ({ ...prev, heading: e.target.value }));
              execCommand('formatBlock', `<${e.target.value}>`);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900 min-w-[120px]"
          >
            {HEADING_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>

          {/* Font Family */}
          <select
            value={currentFormat.fontFamily}
            onChange={(e) => {
              setCurrentFormat(prev => ({ ...prev, fontFamily: e.target.value }));
              execCommand('fontName', e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900 min-w-[120px]"
          >
            {FONT_FAMILIES.map(font => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>

          {/* Font Size */}
          <select
            value={currentFormat.fontSize}
            onChange={(e) => {
              setCurrentFormat(prev => ({ ...prev, fontSize: e.target.value }));
              execCommand('fontSize', '7'); // Browser default, then override with style
              document.execCommand('styleWithCSS', false, true);
              execCommand('fontSize', e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900"
          >
            {FONT_SIZES.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Basic Formatting */}
          <button
            onClick={() => execCommand('bold')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Kalın (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            onClick={() => execCommand('italic')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="İtalik (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            onClick={() => execCommand('underline')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Altı çizili (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <button
            onClick={() => execCommand('strikeThrough')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Üstü çizili"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Text Color Picker */}
          <div className="relative" ref={colorPaletteRef}>
            <button
              onClick={() => setShowColorPalette(!showColorPalette)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
              title="Metin rengi"
            >
              <div className="relative">
                <Type className="w-4 h-4" />
                <div 
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded"
                  style={{ backgroundColor: currentFormat.textColor }}
                ></div>
              </div>
            </button>

            {/* Color Palette */}
            {showColorPalette && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-20">
                <div className="grid grid-cols-6 gap-1">
                  {TEXT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className="w-8 h-8 rounded border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <input
                    type="color"
                    value={currentFormat.textColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Lists */}
          <button
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Madde işaretli liste"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => execCommand('insertOrderedList')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Numaralı liste"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Second Row - Advanced Tools */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Alignment */}
          <button
            onClick={() => execCommand('justifyLeft')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Sola hizala"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => execCommand('justifyCenter')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Ortala"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          <button
            onClick={() => execCommand('justifyRight')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Sağa hizala"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => execCommand('justifyFull')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="İki yana yasla"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Block Quote */}
          <button
            onClick={insertBlockquote}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Alıntı"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Insert Image */}
          <button
            onClick={() => onImageInsert && onImageInsert()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Görsel ekle"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Insert Table */}
          <button
            onClick={insertTable}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Tablo ekle"
          >
            <Table className="w-4 h-4" />
          </button>

          {/* Insert Link */}
          <button
            onClick={() => {
              const url = prompt('Link URL girin:');
              if (url) {
                const text = window.getSelection().toString() || prompt('Link metni:') || url;
                insertContent(`<a href="${url}" class="text-blue-600 underline hover:text-blue-800">${text}</a>`);
              }
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Link ekle"
          >
            <Link2 className="w-4 h-4" />
          </button>

          {/* Code */}
          <button
            onClick={() => {
              const code = prompt('Kod girin:');
              if (code) {
                insertContent(`<code class="bg-purple-50 text-purple-600 px-2 py-1 rounded font-mono text-sm">${code}</code>`);
              }
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Kod"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* Horizontal Rule */}
          <button
            onClick={() => insertContent('<hr class="my-8 border-gray-300">')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Yatay çizgi"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Undo/Redo */}
          <button
            onClick={() => execCommand('undo')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Geri al (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={() => execCommand('redo')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Yinele (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            {/* Stats */}
            <div className="text-sm text-gray-600 flex items-center gap-4">
              <span>{wordCount} kelime</span>
              <span>{readingTime} dk okuma</span>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Source Code Toggle */}
            <button
              onClick={toggleSourceCode}
              className={`p-2 rounded transition-colors ${
                showSourceCode 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
              title="Kaynak kodunu göster/gizle"
            >
              <Code2 className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
              title="Tam ekran"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 relative">
        {showSourceCode ? (
          <textarea
            ref={sourceRef}
            defaultValue={editorContent}
            onChange={(e) => {
              setEditorContent(e.target.value);
              if (onChange) onChange(e.target.value);
            }}
            className="w-full h-full min-h-[500px] p-6 font-mono text-sm border-0 outline-none resize-none bg-gray-900 text-gray-100"
            placeholder="HTML kaynak kodu..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: editorContent }}
            onInput={handleContentChange}
            onBlur={handleContentChange}
            className={contentAreaClasses}
            style={{ 
              fontFamily: currentFormat.fontFamily,
              fontSize: currentFormat.fontSize,
              lineHeight: '1.7'
            }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>{wordCount} kelime</span>
            <span>{charCount} karakter</span>
            <span>{readingTime} dakika okuma süresi</span>
          </div>
          
          {isFullscreen && (
            <div className="text-xs text-gray-500">
              ESC tuşuna basarak tam ekrandan çık
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UltraProfessionalEditor;

