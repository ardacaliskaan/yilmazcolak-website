// components/admin/articles/UltraProfessionalEditor.js - CURSOR JUMPING FİXED! + GÖRSEL EKLEME COMPLETE!
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Code, Link2, List, ListOrdered,
  Quote, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Video, Table,
  Minus, Type, Palette, Undo, Redo, Eye, Code2, Maximize, Minimize,
  ChevronDown, Plus
} from 'lucide-react';

// SABITLER
const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'system-ui, sans-serif', label: 'System UI' }
];

const FONT_SIZES = [
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '32px', label: '32px' }
];

const HEADING_LEVELS = [
  { value: 'div', label: 'Normal Metin' },
  { value: 'h1', label: 'Başlık 1' },
  { value: 'h2', label: 'Başlık 2' },
  { value: 'h3', label: 'Başlık 3' },
  { value: 'h4', label: 'Başlık 4' },
  { value: 'h5', label: 'Başlık 5' },
  { value: 'h6', label: 'Başlık 6' }
];

const TEXT_COLORS = [
  '#000000', '#333333', '#666666', '#999999',
  '#FF0000', '#FF6B6B', '#FFA500', '#FFD93D', 
  '#6BCF7F', '#4ECDC4', '#45B7D1', '#96CEB4'
];

// UTILITY FUNCTIONS
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const UltraProfessionalEditor = React.forwardRef(({ 
  content = '', 
  onChange, 
  onImageInsert,
  placeholder = 'İçeriğinizi buraya yazın...',
  className = '',
  autoSave = false
}, ref) => {
  // STATES
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [currentFormat, setCurrentFormat] = useState({
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    heading: 'div'
  });

  // REFS
  const editorRef = useRef(null);
  const sourceRef = useRef(null);
  const colorPaletteRef = useRef(null);
  const initializedRef = useRef(false);
  const lastContentRef = useRef(content);

  // DEBOUNCED CHANGE HANDLER - Performance için
  const debouncedOnChange = useMemo(
    () => debounce((newContent) => {
      if (onChange && newContent !== lastContentRef.current) {
        onChange(newContent);
        lastContentRef.current = newContent;
      }
    }, 300),
    [onChange]
  );

  // CURSOR POSİTİON KORUMA FONKSİYONU
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange();
    }
    return null;
  }, []);

  const restoreSelection = useCallback((range) => {
    if (range) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      try {
        selection.addRange(range);
      } catch (e) {
        // Fallback: Focus editöre
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }
    }
  }, []);

  // CONTENT CHANGE HANDLER - CURSOR JUMPING FİXED!
  const handleContentChange = useCallback((e) => {
    if (!editorRef.current) return;
    
    const newContent = editorRef.current.innerHTML;
    
    // Debounced parent component update
    debouncedOnChange(newContent);
    
    // Bu state update'i YAPMA - cursor jumping'e sebep olur!
    // setEditorContent(newContent); // ❌ BU CURSOR'U BOZUYOR!
  }, [debouncedOnChange]);

  // COMMAND EXECUTION - Selection korumalı
  const execCommand = useCallback((command, value = null) => {
    if (!editorRef.current) return;

    // Selection'ı kaydet
    const savedRange = saveSelection();
    
    // Focus et
    editorRef.current.focus();
    
    // Command'i çalıştır
    document.execCommand(command, false, value);
    
    // Selection'ı restore et
    if (savedRange) {
      restoreSelection(savedRange);
    }
    
    // Content'i güncelle
    const newContent = editorRef.current.innerHTML;
    debouncedOnChange(newContent);
  }, [saveSelection, restoreSelection, debouncedOnChange]);

  // İÇERİK EKLEME FONKSİYONU
  const insertContent = useCallback((htmlContent) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // HTML'i DOM node'a çevir
      const template = document.createElement('template');
      template.innerHTML = htmlContent;
      const fragment = template.content;
      
      range.insertNode(fragment);
      range.collapse(false);
      
      // Selection'ı güncelle
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Content change'i trigger et
      handleContentChange({ target: editorRef.current });
    }
  }, [handleContentChange]);

  // ✅ GÖRSEL EKLEME FONKSİYONU - EXTERNAL CALLS İÇİN
  const insertImageToEditor = useCallback((imageUrl, altText = '') => {
    const imgHtml = `
      <figure class="my-4 text-center">
        <img src="${imageUrl}" alt="${altText}" class="max-w-full h-auto rounded-lg shadow-sm mx-auto" style="max-width: 100%; height: auto;" />
        ${altText ? `<figcaption class="text-sm text-gray-600 mt-2">${altText}</figcaption>` : ''}
      </figure>
    `;
    insertContent(imgHtml);
    console.log('✅ Image inserted to editor via ref:', imageUrl);
  }, [insertContent]);

  // ✅ REF EXPOSE - External methods
  React.useImperativeHandle(ref, () => ({
    insertImageToEditor,
    getContent: () => editorRef.current?.innerHTML || '',
    setContent: (content) => {
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        debouncedOnChange(content);
      }
    },
    focus: () => editorRef.current?.focus(),
    insertContent
  }), [insertImageToEditor, debouncedOnChange, insertContent]);

  // GÖRSEL EKLEME BUTTON HANDLER
  const handleImageInsert = useCallback(() => {
    if (onImageInsert) {
      onImageInsert(); // Bu parent component'teki modal'ı açacak
    } else {
      // Fallback: URL ile
      const imageUrl = prompt('Görsel URL\'si girin:');
      if (imageUrl) {
        insertImageToEditor(imageUrl, 'Görsel');
      }
    }
  }, [onImageInsert, insertImageToEditor]);

  // LINK EKLEME
  const insertLink = useCallback(() => {
    const url = prompt('Link URL\'si girin:');
    if (url) {
      const text = prompt('Link metni girin:', url);
      if (text) {
        const linkHtml = `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
        insertContent(linkHtml);
      }
    }
  }, [insertContent]);

  // TABLO EKLEME
  const insertTable = useCallback(() => {
    const tableHtml = `
      <table class="w-full border-collapse border border-gray-300 my-4">
        <thead>
          <tr class="bg-gray-50">
            <th class="border border-gray-300 px-3 py-2 text-left">Başlık 1</th>
            <th class="border border-gray-300 px-3 py-2 text-left">Başlık 2</th>
            <th class="border border-gray-300 px-3 py-2 text-left">Başlık 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 px-3 py-2">Hücre 1</td>
            <td class="border border-gray-300 px-3 py-2">Hücre 2</td>
            <td class="border border-gray-300 px-3 py-2">Hücre 3</td>
          </tr>
        </tbody>
      </table>
    `;
    insertContent(tableHtml);
  }, [insertContent]);

  // BLOCKQUOTE EKLEME
  const insertBlockquote = useCallback(() => {
    const quote = prompt('Alıntı metnini girin:');
    if (quote) {
      const blockquoteHtml = `
        <blockquote class="border-l-4 border-blue-500 bg-blue-50 py-3 px-4 my-4 italic text-gray-700 rounded-r-lg">
          "${quote}"
        </blockquote>
      `;
      insertContent(blockquoteHtml);
    }
  }, [insertContent]);

  // INITIAL CONTENT AYARLAMA - Sadece bir kere
  useEffect(() => {
    if (editorRef.current && content && !initializedRef.current) {
      editorRef.current.innerHTML = content;
      initializedRef.current = true;
      lastContentRef.current = content;
    }
  }, [content]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Color palette outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPaletteRef.current && !colorPaletteRef.current.contains(event.target)) {
        setShowColorPalette(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // WORD COUNT CALCULATION
  const getWordCount = useCallback(() => {
    if (!editorRef.current) return { words: 0, chars: 0, reading: 0 };
    
    const plainText = editorRef.current.textContent || '';
    const words = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = plainText.length;
    const reading = Math.ceil(words / 200);
    
    return { words, chars, reading };
  }, []);

  const { words, chars, reading } = getWordCount();

  // CSS CLASSES
  const editorClasses = `
    ${isFullscreen ? 'fixed inset-0 z-50 bg-white flex flex-col' : 'border border-gray-300 rounded-lg bg-white flex flex-col'}
    ${className}
  `;

  const contentAreaClasses = `
    min-h-[400px] p-4 bg-white border-0 outline-none resize-none flex-1 overflow-y-auto
    prose prose-lg max-w-none
    prose-headings:text-gray-900 prose-headings:font-bold
    prose-p:text-gray-800 prose-p:leading-relaxed prose-p:mb-4
    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
    prose-strong:text-gray-900 prose-strong:font-semibold
    prose-ul:my-4 prose-ol:my-4 prose-li:my-1
    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-4
    [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-6
    [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-5
    [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-4
    [&>h4]:text-base [&>h4]:font-semibold [&>h4]:mb-2 [&>h4]:mt-3
    [&>h5]:text-sm [&>h5]:font-semibold [&>h5]:mb-1 [&>h5]:mt-2
    [&>h6]:text-xs [&>h6]:font-semibold [&>h6]:mb-1 [&>h6]:mt-2
    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-sm
    [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
    [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2
    [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:font-semibold
    focus:outline-none
    [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&:empty]:before:pointer-events-none
  `;

  return (
    <div className={editorClasses}>
      {/* TOOLBAR */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap items-center gap-2">
        
        {/* Row 1 - Format Controls */}
        <div className="flex items-center gap-2 w-full mb-2">
          
          {/* Heading Select */}
          <select
            value={currentFormat.heading}
            onChange={(e) => {
              setCurrentFormat(prev => ({ ...prev, heading: e.target.value }));
              execCommand('formatBlock', `<${e.target.value}>`);
            }}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white min-w-[120px]"
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
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white min-w-[100px]"
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
              if (editorRef.current) {
                editorRef.current.style.fontSize = e.target.value;
              }
            }}
            className="px-3 py-1 border border-gray-300 rounded text-sm bg-white"
          >
            {FONT_SIZES.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>

          {/* Right Side - Stats */}
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-600">
            <span>{words} kelime</span>
            <span>{reading} dk okuma</span>
          </div>
        </div>

        {/* Row 2 - Action Buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          
          {/* Text Formatting */}
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

          <div className="w-px h-6 bg-gray-300"></div>

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

          <div className="w-px h-6 bg-gray-300"></div>

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

          <button
            onClick={insertBlockquote}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Alıntı"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Insert Tools */}
          <button
            onClick={handleImageInsert}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Görsel ekle"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            onClick={insertLink}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Link ekle"
          >
            <Link2 className="w-4 h-4" />
          </button>

          <button
            onClick={insertTable}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Tablo ekle"
          >
            <Table className="w-4 h-4" />
          </button>

          <button
            onClick={() => insertContent('<hr class="my-6 border-gray-300">')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Yatay çizgi"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Color Picker */}
          <div className="relative" ref={colorPaletteRef}>
            <button
              onClick={() => setShowColorPalette(!showColorPalette)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
              title="Metin rengi"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showColorPalette && (
              <div className="absolute top-10 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-20">
                <div className="grid grid-cols-4 gap-1">
                  {TEXT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        execCommand('foreColor', color);
                        setShowColorPalette(false);
                      }}
                      className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

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

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Code & Fullscreen */}
          <button
            onClick={() => setShowSourceCode(!showSourceCode)}
            className={`p-2 rounded transition-colors ${
              showSourceCode 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
            title="Kaynak kodu"
          >
            <Code2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
            title="Tam ekran"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* EDITOR CONTENT AREA */}
      <div className="flex-1 relative">
        {showSourceCode ? (
          <textarea
            ref={sourceRef}
            defaultValue={editorRef.current?.innerHTML || content}
            onChange={(e) => {
              if (editorRef.current) {
                editorRef.current.innerHTML = e.target.value;
                debouncedOnChange(e.target.value);
              }
            }}
            className="w-full h-full min-h-[400px] p-4 font-mono text-sm border-0 outline-none resize-none bg-gray-900 text-gray-100"
            placeholder="HTML kaynak kodu..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            onBlur={handleContentChange}
            className={contentAreaClasses}
            style={{ 
              fontFamily: currentFormat.fontFamily,
              fontSize: currentFormat.fontSize,
              lineHeight: '1.6'
            }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}
      </div>

      {/* STATUS BAR */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>{words} kelime</span>
            <span>{chars} karakter</span>
            <span>{reading} dakika okuma süresi</span>
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
});

UltraProfessionalEditor.displayName = 'UltraProfessionalEditor';

export default UltraProfessionalEditor;