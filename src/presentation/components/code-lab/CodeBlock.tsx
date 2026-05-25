/**
 * @module CodeBlock
 * @description コードブロック表示コンポーネント。シンタックスハイライト風のスタイルでコードを表示する。
 */

interface CodeBlockProps {
  code: string;
  highlightLines?: number[];
}

export function CodeBlock({ code, highlightLines = [] }: CodeBlockProps) {
  const lines = code.split("\n");

  return (
    <div className="rounded-xl bg-slate-950 border border-slate-700 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 border-b border-slate-700">
        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        <span className="ml-2 text-xs text-slate-500">TypeScript</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code>
          {lines.map((line, i) => (
            <div
              key={i}
              className={`${highlightLines.includes(i + 1) ? "bg-blue-500/15 -mx-4 px-4 border-l-2 border-blue-400" : ""}`}
            >
              <span className="inline-block w-8 text-right mr-4 text-slate-600 select-none text-xs">
                {i + 1}
              </span>
              <span className="text-slate-300">{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
