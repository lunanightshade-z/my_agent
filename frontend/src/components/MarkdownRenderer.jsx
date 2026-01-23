/**
 * Markdown 内容渲染器 - 统一处理markdown样式
 * 特性:
 * - 支持代码高亮
 * - 支持数学公式（KaTeX）
 * - 支持 GitHub Flavored Markdown（任务列表、删除线等）
 * - 支持表格、列表、标题等格式
 * - 响应式设计，适配深色主题
 * - 可复制的代码块
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import 'katex/dist/katex.min.css';
import './markdown-renderer.css';

// 代码块组件 - 带复制功能
const CodeBlock = ({ inline, className, children }) => {
  const [copied, setCopied] = React.useState(false);
  const classNameStr = className ? String(className) : '';
  const match = /language-(\w+)/.exec(classNameStr);
  const language = match ? match[1] : 'plaintext';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 只有明确是多行代码块且有语言标识才使用 SyntaxHighlighter
  if (!inline && match) {
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
  }

  // 其他情况都作为行内代码处理
  return (
    <code className="inline-code">
      {children}
    </code>
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

// 标题组件 - 支持主题
const HeadingComponent = ({ level, children, theme = 'light' }) => {
  const headingClass = `heading heading-h${level} ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`;
  return React.createElement(`h${level}`, { className: headingClass }, children);
};

// 列表项组件
const ListItemComponent = ({ children, className, checked }) => {
  // 处理任务列表
  if (className && className.includes('task-list-item')) {
    return (
      <li className={`list-item task-list-item ${className}`}>
        <input
          type="checkbox"
          checked={checked}
          disabled
          className="task-checkbox"
          readOnly
        />
        <span>{children}</span>
      </li>
    );
  }
  return (
    <li className={`list-item ${className || ''}`}>
      {children}
    </li>
  );
};

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
export default function MarkdownRenderer({ content, className = '', theme = 'light' }) {
  // 如果内容为空，返回占位符
  if (!content || !content.trim()) {
    return <div className={`markdown-message ${className} ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}></div>;
  }

  return (
    <div className={`markdown-message ${className} ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: CodeBlock,
          a: LinkComponent,
          h1: ({ children }) => <HeadingComponent level={1} theme={theme}>{children}</HeadingComponent>,
          h2: ({ children }) => <HeadingComponent level={2} theme={theme}>{children}</HeadingComponent>,
          h3: ({ children }) => <HeadingComponent level={3} theme={theme}>{children}</HeadingComponent>,
          h4: ({ children }) => <HeadingComponent level={4} theme={theme}>{children}</HeadingComponent>,
          h5: ({ children }) => <HeadingComponent level={5} theme={theme}>{children}</HeadingComponent>,
          h6: ({ children }) => <HeadingComponent level={6} theme={theme}>{children}</HeadingComponent>,
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
          del: ({ children }) => <del className="markdown-del">{children}</del>,
          s: ({ children }) => <s className="markdown-strikethrough">{children}</s>,
          em: ({ children }) => <em>{children}</em>,
        }}
        allowedElements={[
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'em', 'u', 'del', 's',
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
