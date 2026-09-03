export function generateStaticParams() {
  return [{ boardId: "a" }, { boardId: "b" }];
}

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
