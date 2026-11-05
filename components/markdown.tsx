import ReactMarkdown from "react-markdown";

// Shows Markdown text as a formatted article.
// Raw HTML in the text is NOT run (react-markdown shows it as plain text),
// so a writer cannot sneak scripts into a post.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}