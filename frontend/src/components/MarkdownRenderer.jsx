/**
 * Markdown 内容渲染器 - 统一处理markdown样式
 * 特性:
 * - 支持代码高亮
 * - 支持表格、列表、标题等格式
 * - 响应式设计，适配深色主题
 * - 可复制的代码块
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import './markdown-renderer.css';

// 代码块组件 - 带复制功能
const CodeBlock = ({ inline, className, children }) => {
  const [copied, setCopied] = React.useState(false);
  const language = className?.replace(/language-/, '') || 'plaintext';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="inline-code">
        {children}
      </code>
    );
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{language}</span>
        <button
          onClick={handleCopy}
          className="copy-button"
          title={copied ? '已复制' : '复制代码'}
        >
          {copied ? (
            <Check size={16} />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0 0 8px 8px',
          fontSize: '13px',
          lineHeight: '1.6',
        }}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// 链接组件
const LinkComponent = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="markdown-link"
  >
    {children}
  </a>
);

// 标题组件
const HeadingComponent = ({ level, children }) => {
  const headingClass = `heading heading-h${level}`;
  return React.createElement(`h${level}`, { className: headingClass }, children);
};

// 列表项组件
const ListItemComponent = ({ children, ordered, index }) => (
  <li className={`list-item ${ordered ? 'ordered-item' : 'unordered-item'}`}>
    {children}
  </li>
);

// 有序列表组件
const OrderedListComponent = ({ children }) => (
  <ol className="markdown-list ordered-list">{children}</ol>
);

// 无序列表组件
const UnorderedListComponent = ({ children }) => (
  <ul className="markdown-list unordered-list">{children}</ul>
);

// 表格组件
const TableComponent = ({ children }) => (
  <div className="table-wrapper">
    <table className="markdown-table">{children}</table>
  </div>
);

// 表格行组件
const TableRowComponent = ({ children, isHeader }) => (
  <tr className={isHeader ? 'table-header-row' : 'table-body-row'}>
    {children}
  </tr>
);

// 表格单元格组件
const TableCellComponent = ({ children, isHeader, align }) => (
  React.createElement(
    isHeader ? 'th' : 'td',
    {
      className: `table-cell ${isHeader ? 'table-header-cell' : 'table-body-cell'}`,
      style: align ? { textAlign: align } : {},
    },
    children
  )
);

// 引用块组件
const BlockquoteComponent = ({ children }) => (
  <blockquote className="markdown-blockquote">
    {children}
  </blockquote>
);

// 分割线组件
const HorizontalRuleComponent = () => (
  <hr className="markdown-hr" />
);

// 段落组件
const ParagraphComponent = ({ children }) => (
  <p className="markdown-paragraph">
    {children}
  </p>
);

// 主渲染器组件
export default function MarkdownRenderer({ content, className = '' }) {
  // 如果内容为空，返回占位符
  if (!content || !content.trim()) {
    return <div className={`markdown-message ${className}`}></div>;
  }

  return (
    <div className={`markdown-message ${className}`}>
      <ReactMarkdown
        components={{
          code: CodeBlock,
          a: LinkComponent,
          h1: ({ children }) => <HeadingComponent level={1}>{children}</HeadingComponent>,
          h2: ({ children }) => <HeadingComponent level={2}>{children}</HeadingComponent>,
          h3: ({ children }) => <HeadingComponent level={3}>{children}</HeadingComponent>,
          h4: ({ children }) => <HeadingComponent level={4}>{children}</HeadingComponent>,
          h5: ({ children }) => <HeadingComponent level={5}>{children}</HeadingComponent>,
          h6: ({ children }) => <HeadingComponent level={6}>{children}</HeadingComponent>,
          ul: UnorderedListComponent,
          ol: OrderedListComponent,
          li: ListItemComponent,
          table: TableComponent,
          tr: TableRowComponent,
          th: ({ children, align }) => (
            <TableCellComponent isHeader={true} align={align}>
              {children}
            </TableCellComponent>
          ),
          td: ({ children, align }) => (
            <TableCellComponent isHeader={false} align={align}>
              {children}
            </TableCellComponent>
          ),
          blockquote: BlockquoteComponent,
          hr: HorizontalRuleComponent,
          p: ParagraphComponent,
        }}
        allowedElements={[
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'em', 'u', 'del',
          'code', 'pre',
          'ul', 'ol', 'li',
          'blockquote', 'hr',
          'a', 'img',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'input', 'label', // 用于任务列表
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
