import type { Block } from "@/content/treatments";

/** Renders extracted page content: headings, paragraphs and lists. Splits "•" runs into lists. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: string) => {
    if (list.length) {
      out.push(
        <ul key={key}>
          {list.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  blocks.forEach((b, i) => {
    if (!b.text) return;
    if (b.type === "li") return list.push(b.text);
    if (b.type === "p" && b.text.includes("•")) {
      const [lead, ...items] = b.text.split("•").map((s) => s.trim());
      flush(`l${i}`);
      if (lead) out.push(<p key={`p${i}`}>{lead}</p>);
      const last = items[items.length - 1] ?? "";
      const tailMatch = last.match(/^(.*?\.)([A-Z].*)$/);
      if (tailMatch) items[items.length - 1] = tailMatch[1];
      list.push(...items.filter(Boolean));
      flush(`b${i}`);
      if (tailMatch) out.push(<p key={`t${i}`}>{tailMatch[2]}</p>);
      return;
    }
    flush(`l${i}`);
    if (b.type === "h") out.push(<h3 key={i}>{b.text}</h3>);
    else out.push(<p key={i}>{b.text}</p>);
  });
  flush("end");
  return <div className="prose-nea">{out}</div>;
}
