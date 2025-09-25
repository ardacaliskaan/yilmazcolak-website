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
    X
} from 'lucide-react';

// Font options
const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Courier New, monospace', label: 'Courier New' }
];

// Font sizes
const FONT_SIZES = [
  { value: '12px', label: '12px' },
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '32px', label: '32px' },
  { value: '48px', label: '48px' }
];

// Text colors
const TEXT_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
  '#00FFFF', '#FFA500', '#800080', '#008000', '#000080'
];

// Heading levels
const HEADING_LEVELS = [
  { value: 'p', label: 'Paragraf', tag: 'P' },
  { value: 'h1', label: 'Başlık 1', tag: 'H1' },
  { value: 'h2', label: 'Başlık 2', tag: 'H2' },
  { value: 'h3', label: 'Başlık 3', tag: 'H3' },
  { value: 'h4', label: 'Başlık 4', tag: 'H4' },
  { value: 'h5', label: 'Başlık 5', tag: 'H5' },
  { value: 'h6', label: 'Başlık 6', tag: 'H6' }
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
  const [currentFormat, setCurrentFormat] = useState({
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    textColor: '#000000',
    heading: 'p'
  });

  const editorRef = useRef(null);
  const sourceRef = useRef(null);

  // Prevent cursor jumping by using proper event handling
  const handleContentChange = useCallback((e) => {
    const newContent = e.target.innerHTML;
    setEditorContent(newContent);
    
    // Debounce onChange to prevent excessive calls
    if (onChange) {
      clearTimeout(window.editorChangeTimeout);
      window.editorChangeTimeout = setTimeout(() => {
        onChange(newContent);
      }, 300);
    }
  }, [onChange]);

  // Execute formatting commands
  const execCommand = useCallback((command, value = null) => {
    // Save current selection
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // Execute command
    document.execCommand(command, false, value);
    
    // Restore focus and selection
    if (editorRef.current) {
      editorRef.current.focus();
      
      if (range && selection.rangeCount === 0) {
        selection.addRange(range);
      }
    }
  }, []);

  // Format text with specific style
  const applyFormat = useCallback((property, value) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText) {
      // Wrap selected text with span
      const span = document.createElement('span');
      span.style[property] = value;
      
      try {
        range.surroundContents(span);
        setCurrentFormat(prev => ({ ...prev, [property]: value }));
      } catch (error) {
        // Fallback for complex selections
        execCommand('styleWithCSS', true);
        execCommand(property, value);
      }
    }

    editorRef.current?.focus();
  }, [execCommand]);

  // Insert custom content
  const insertContent = useCallback((content) => {
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
  }, [handleContentChange]);

  // Insert image
  const handleImageInsert = useCallback((imageUrl, altText = '') => {
    const imgHtml = `<figure class="image-figure my-4">
      <img src="${imageUrl}" alt="${altText}" class="max-w-full h-auto rounded-lg shadow-sm" />
      ${altText ? `<figcaption class="text-sm text-gray-600 mt-2 text-center">${altText}</figcaption>` : ''}
    </figure>`;
    
    insertContent(imgHtml);
  }, [insertContent]);

  // Insert table
  const insertTable = useCallback(() => {
    const tableHtml = `
      <table class="table-auto w-full border-collapse border border-gray-300 my-4">
        <thead>
          <tr class="bg-gray-50">
            <th class="border border-gray-300 px-4 py-2">Başlık 1</th>
            <th class="border border-gray-300 px-4 py-2">Başlık 2</th>
            <th class="border border-gray-300 px-4 py-2">Başlık 3</th>
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

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Toggle source code view
  const toggleSourceCode = useCallback(() => {
    if (showSourceCode) {
      // Switch back to visual editor
      if (sourceRef.current) {
        setEditorContent(sourceRef.current.value);
        if (onChange) onChange(sourceRef.current.value);
      }
    }
    setShowSourceCode(prev => !prev);
  }, [showSourceCode, onChange]);

  // Update content from props
  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content);
    }
  }, [content, editorContent]);

  const editorClasses = `
    ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}
    ${className}
  `;

  const contentAreaClasses = `
    min-h-[500px] p-6 bg-white border-0 outline-none resize-none
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
  `;

  return (
    <div className={editorClasses}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 sticky top-0 z-10">
        {/* First Row - Basic Formatting */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {/* Font Family */}
          <select
            value={currentFormat.fontFamily}
            onChange={(e) => {
              setCurrentFormat(prev => ({ ...prev, fontFamily: e.target.value }));
              applyFormat('fontFamily', e.target.value);
            }}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
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
              applyFormat('fontSize', e.target.value);
            }}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
          >
            {FONT_SIZES.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>

          {/* Heading Level */}
          <select
            value={currentFormat.heading}
            onChange={(e) => {
              setCurrentFormat(prev => ({ ...prev, heading: e.target.value }));
              execCommand('formatBlock', e.target.value);
            }}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
          >
            {HEADING_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
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

          <button
            onClick={() => {
              const code = prompt('Kod girin:');
              if (code) insertContent(`<code class="bg-purple-50 text-purple-600 px-1 rounded">${code}</code>`);
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Kod"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Text Color */}
          <div className="relative">
            <input
              type="color"
              value={currentFormat.textColor}
              onChange={(e) => {
                setCurrentFormat(prev => ({ ...prev, textColor: e.target.value }));
                applyFormat('color', e.target.value);
              }}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              title="Metin rengi"
            />
          </div>
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
            title="Ortaya hizala"
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

          {/* Lists */}
          <button
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Madde listesi"
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

          <button
            onClick={() => execCommand('formatBlock', 'blockquote')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Alıntı"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Media & Advanced */}
          <button
            onClick={() => onImageInsert && onImageInsert()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Görsel ekle"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            onClick={insertTable}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Tablo ekle"
          >
            <Table className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const url = prompt('Link URL girin:');
              if (url) {
                const text = window.getSelection().toString() || prompt('Link metni:') || url;
                insertContent(`<a href="${url}" class="text-blue-600 underline">${text}</a>`);
              }
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Link ekle"
          >
            <Link2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => insertContent('<hr class="my-6 border-gray-300">')}
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
            <span>Kelimeler: {editorContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length}</span>
            <span>Karakterler: {editorContent.replace(/<[^>]*>/g, '').length}</span>
          </div>
          
          {isFullscreen && (
            <div className="text-xs text-gray-500">
              ESC tuşuna basarak tam ekrandan çık
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen ESC handler */}
      {isFullscreen && (
        <div
          className="absolute inset-0 bg-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsFullscreen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default UltraProfessionalEditor;