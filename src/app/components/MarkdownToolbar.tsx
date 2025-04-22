'use client';

import React from 'react';

type Props = {
  onFormat: (syntax: 'bold' | 'italic' | 'code' | 'heading' | 'link') => void;
};

export default function MarkdownToolbar({ onFormat }: Props) {
  return (
    <div className="toolbar flex gap-2 mb-2">
      <button type="button" onClick={() => onFormat('bold')} className="toolbar-btn">bold</button>
      <button type="button" onClick={() => onFormat('italic')} className="toolbar-btn">italic</button>
      <button type="button" onClick={() => onFormat('code')} className="toolbar-btn">code</button>
      <button type="button" onClick={() => onFormat('heading')} className="toolbar-btn">heading</button>
      <button type="button" onClick={() => onFormat('link')} className="toolbar-btn">link</button>
    </div>
  );
}
