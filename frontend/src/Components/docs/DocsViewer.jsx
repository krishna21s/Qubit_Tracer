import { useParams, Link } from 'react-router-dom';
import documentationData from './documentationData.json';

function DocsViewer() {
  const { slug } = useParams();
  const doc = documentationData.find(d => d.slug === slug);

  if (!doc) {
    return (
      <div className="docs-root">
        <div className="doc-viewer-container">
          <h2>Topic Not Found</h2>
          <Link to="/" className="answer-link">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="docs-root">
      <div className="doc-viewer-container">
        <h1>{doc.question}</h1>
        <div className="doc-content">
          {doc.content.map((item, index) => {
            switch (item.type) {
              case 'paragraph':
                return <p key={index}>{item.value}</p>;
              case 'image':
                return (
                  <figure key={index}>
                    <img src={item.url} alt={item.caption} />
                    <figcaption>{item.caption}</figcaption>
                  </figure>
                );
              case 'subtitle':
                return <h2 key={index}>{item.value}</h2>;
              case 'list':
                return (
                  <ul key={index}>
                    {item.items.map((li, i) => <li key={i}>{li}</li>)}
                  </ul>
                );
              default:
                return null;
            }
          })}
        </div>
        <Link to="/" className="answer-link back-link">← Back to Home</Link>
      </div>
    </div>
  );
}

export default DocsViewer;