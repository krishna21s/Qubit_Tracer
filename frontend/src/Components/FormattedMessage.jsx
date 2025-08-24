import React from 'react';

// Import Markdown and Math rendering libraries
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Import KaTeX stylesheet for math formatting.
import 'katex/dist/katex.min.css';

/**
 * A reusable component to render text content with Markdown and LaTeX support.
 * @param {{content: string}} props The component props.
 * @param {string} props.content The raw string content from the backend.
 */
function FormattedMessage({ content }) {
  if (!content) {
    return null;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // These custom components ensure consistent styling for rendered HTML elements.
        p: ({ node, ...props }) => <p style={{ margin: '0 0 10px 0', padding: 0, textAlign: 'start', fontSize: 13, lineHeight: '1.6' }} {...props} />,
        ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', margin: '10px 0' }} {...props} />,
        li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default FormattedMessage;